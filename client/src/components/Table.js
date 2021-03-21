import React, { Component } from 'react';
import ReactNotification, { store } from 'react-notifications-component';
import { bufferToHex } from 'ethereumjs-util';
import { encrypt } from 'eth-sig-util';

import auth from '../utils/auth';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import Request from './Request';
import Navbar from './Navbar';
import noRequests from '../assets/no_requests.svg';

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      contract: null,
      requests: [],
    };
  }

  componentDidMount = () => {
    if (!auth.getContract()) {
      auth.init().then(() => {
        this.initialize();
      });
    } else {
      this.initialize();
    }
  };

  initialize = () => {
    window.ethereum.on('accountsChanged', async function (accounts) {
      auth.logout(() => {
        this.props.history.push('/');
        window.location.reload();
      });
    });

    this.setState(
      { user: auth.getUser(), contract: auth.getContract() },
      () => {
        this.fetchRequests();

        this.state.contract.events.RequestGenerated(
          { filter: { owner: this.state.user } },
          (err, result) => {
            if (err) {
              return console.error(err);
            }
            this.fetchRequests();
          }
        );
      }
    );
  };

  fetchRequests = async () => {
    // Get requests from contract.
    await this.state.contract.methods
      .getOwnerRequests()
      .call({ from: this.state.user })
      .then(
        ({
          0: requestor,
          1: requestorUname,
          2: docName,
          3: properties,
          4: status,
        }) => {
          const requests = [];

          for (let index = 0; index < requestor.length; index++) {
            let ele = [
              requestor[index],
              requestorUname[index],
              docName[index],
              properties[index],
              status[index],
            ];
            requests.push(ele);
          }
          this.setState({ requests });
        }
      );
  };

  updateStatus = async (newStatus, requestor, docName, properties) => {
    try {
      if (newStatus === 'Approved') {
        await this.fetchDocumentData(newStatus, requestor, docName, properties);
      } else {
        this.updateRequest(requestor, docName, newStatus, properties);
      }
    } catch (error) {
      console.log(error);
    }
  };

  verifyProperties(newStatus, requestor, docName, properties, docData) {
    let verifiedProperties = [];
    for (let i = 0; i < properties.length; i++) {
      let label = properties[i].label;
      let expValue = properties[i].expValue;

      for (let index = 0; index < docData.length; index++) {
        if (
          (expValue === '' || expValue === undefined) &&
          label === docData[index].fieldLabel
        ) {
          verifiedProperties.push({
            label,
            expValue,
            value: docData[index].fieldValue,
            verified: true,
          });
          break;
        } else if (label === docData[index].fieldLabel) {
          if (
            expValue.toLowerCase() === docData[index].fieldValue.toLowerCase()
          ) {
            verifiedProperties.push({
              label,
              expValue,
              value: '',
              verified: true,
            });
            break;
          } else {
            verifiedProperties.push({
              label,
              expValue,
              value: '',
              verified: false,
            });
            break;
          }
        }
      }
    }

    this.updateRequest(requestor, docName, newStatus, verifiedProperties);
  }

  fetchDocumentData = async (newStatus, requestor, docName, properties) => {
    await this.state.contract.methods
      .getDocument(docName)
      .call({ from: this.state.user })
      .then(({ 2: data }) => {
        window.ethereum
          .request({
            method: 'eth_decrypt',
            params: [data, this.state.user],
          })
          .then((decryptedMessage) => {
            this.verifyProperties(
              newStatus,
              requestor,
              docName,
              properties,
              JSON.parse(decryptedMessage)
            );
          })
          .catch((error) => console.log(error.message));
      });
  };

  updateRequest = async (requestor, docName, newStatus, verifiedProperties) => {
    try {
      await this.state.contract.methods
        .getEncryptionPublicKey(requestor)
        .call()
        .then((encryptionPublicKey) => {
          const encryptedData = bufferToHex(
            Buffer.from(
              JSON.stringify(
                encrypt(
                  encryptionPublicKey,
                  { data: JSON.stringify(verifiedProperties) },
                  'x25519-xsalsa20-poly1305'
                )
              ),
              'utf8'
            )
          );

          this.state.contract.methods
            .updateRequestStatus(requestor, docName, newStatus, encryptedData)
            .send({ from: this.state.user }, (err, txnHash) => {
              if (err) {
                store.addNotification({
                  title: 'Transaction failed',
                  message: 'Sign the transaction to update request status',
                  type: 'danger', // 'default', 'success', 'info', 'warning'
                  container: 'top-right', // where to position the notifications
                  animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
                  animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
                  dismiss: {
                    duration: 3000,
                    showIcon: true,
                    pauseOnHover: true,
                  },
                });
              }
            });
        });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <div>
        <Navbar user={this.state.user} history={this.props.history} />
        <ReactNotification className='font-Poppins' />
        <div className='flex flex-col mt-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 font-Poppins'>
          <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
              {this.state.requests.length === 0 ? (
                <div className='flex flex-col items-center justify-center'>
                  <img src={noRequests} className='h-96 w-96' />
                  <p className='p-5 text-4xl font-medium'>No requests found!</p>
                  <p className='text-xl'>
                    All your verification requests can be found here
                  </p>
                </div>
              ) : (
                <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {this.state.requests.map((ele, i) => {
                        return (
                          <Request
                            key={i}
                            store={store}
                            user={this.state.user}
                            requestor={ele[0]}
                            requestorUname={ele[1]}
                            docName={ele[2]}
                            properties={ele[3]}
                            status={ele[4]}
                            updateStatus={this.updateStatus}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
