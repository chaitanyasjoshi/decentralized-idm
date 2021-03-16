import React, { Component } from 'react';
import { bufferToHex } from 'ethereumjs-util';
import { encrypt } from 'eth-sig-util';

import auth from '../utils/auth';

import Request from './Request';
import Navbar from './Navbar';

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      contract: null,
      requests: null,
    };
    this.createRequests = this.createRequests.bind(this);
    this.fetchRequests = this.fetchRequests.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.verifyProperties = this.verifyProperties.bind(this);
    this.fetchDocumentData = this.fetchDocumentData.bind(this);
    this.updateRequest = this.updateRequest.bind(this);
  }

  componentDidMount = () => {
    if (!auth.getContract()) {
      auth.init().then(() => {
        this.setState(
          { user: auth.getUser(), contract: auth.getContract() },
          () => {
            this.fetchRequests();

            this.state.contract.events.RequestStatusUpdated(
              { owner: this.state.user },
              (err, result) => {
                if (err) {
                  return console.error(err);
                }
                this.fetchRequests();
              }
            );

            this.state.contract.events.RequestGenerated(
              { owner: this.state.user },
              (err, result) => {
                if (err) {
                  return console.error(err);
                }
                this.fetchRequests();
              }
            );
          }
        );
      });
    } else {
      this.setState(
        { user: auth.getUser(), contract: auth.getContract() },
        () => {
          this.fetchRequests();

          this.state.contract.events.RequestStatusUpdated(
            { owner: this.state.user },
            (err, result) => {
              if (err) {
                return console.error(err);
              }
              this.fetchRequests();
            }
          );

          this.state.contract.events.RequestGenerated(
            { owner: this.state.user },
            (err, result) => {
              if (err) {
                return console.error(err);
              }
              this.fetchRequests();
            }
          );
        }
      );
    }
  };

  createRequests() {
    const req = [];
    if (this.state.requests != null) {
      const {
        0: requestor,
        1: docName,
        2: properties,
        3: status,
      } = this.state.requests;

      for (let index = 0; index < requestor.length; index++) {
        let ele = [
          requestor[index],
          docName[index],
          properties[index],
          status[index],
        ];
        req.push(ele);
      }
    }
    return req;
  }

  fetchRequests = async () => {
    // Get requests from contract.
    await this.state.contract.methods
      .getOwnerRequests()
      .call({ from: this.state.user })
      .then((requests) => {
        this.setState({ requests });
      });
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
                alert(`User denied transaction signature`);
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
        <div className='flex flex-col mt-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 font-Poppins'>
          <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
              <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {this.createRequests().map((ele, i) => {
                      return (
                        <Request
                          key={i}
                          user={this.state.user}
                          requestor={ele[0]}
                          docName={ele[1]}
                          properties={ele[2]}
                          status={ele[3]}
                          updateStatus={this.updateStatus}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
