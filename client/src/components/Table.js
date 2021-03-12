import React, { Component } from 'react';

import Request from './Request';

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: null,
      docData: [],
      verifiedProperties: [],
    };
    this.createRequests = this.createRequests.bind(this);
    this.fetchRequests = this.fetchRequests.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.verifyProperties = this.verifyProperties.bind(this);
    this.fetchDocumentData = this.fetchDocumentData.bind(this);
    this.updateRequest = this.updateRequest.bind(this);
  }

  componentDidMount = () => {
    this.fetchRequests();

    this.props.contract.events.RequestStatusUpdated(
      { owner: this.props.user },
      (err, result) => {
        if (err) {
          return console.error(err);
        }
        this.fetchRequests();
      }
    );

    this.props.contract.events.RequestGenerated(
      { owner: this.props.user },
      (err, result) => {
        if (err) {
          return console.error(err);
        }
        this.fetchRequests();
      }
    );
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
    await this.props.contract.methods
      .getOwnerRequests()
      .call({ from: this.props.user })
      .then((requests) => {
        this.setState({ requests });
      });
  };

  updateStatus = async (newStatus, requestor, docName, properties) => {
    try {
      if (newStatus === 'Approved') {
        await this.fetchDocumentData(docName).then(() => {
          this.verifyProperties(properties);
        });

        this.updateRequest(requestor, docName, newStatus);
      } else {
        this.setState({ verifiedProperties: properties });
        this.updateRequest(requestor, docName, newStatus);
      }
    } catch (error) {
      console.log(error);
    }
  };

  verifyProperties(properties) {
    let verifiedProperties = [];
    for (let i = 0; i < properties.length; i++) {
      let label = properties[i].label;
      let expValue = properties[i].expValue;

      for (let index = 0; index < this.state.docData.length; index++) {
        if (
          (expValue === '' || expValue === undefined) &&
          label === this.state.docData[index].fieldLabel
        ) {
          verifiedProperties.push({
            label,
            expValue,
            value: this.state.docData[index].fieldValue,
            verified: true,
          });
          break;
        } else if (label === this.state.docData[index].fieldLabel) {
          if (
            expValue.toLowerCase() ===
            this.state.docData[index].fieldValue.toLowerCase()
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

    console.log(verifiedProperties);
    this.setState({ verifiedProperties });
  }

  fetchDocumentData = async (docName) => {
    let { 2: data } = await this.props.contract.methods
      .getDocument(docName)
      .call({ from: this.props.user });

    this.setState({ docData: JSON.parse(data) });
  };

  updateRequest = async (requestor, docName, newStatus) => {
    try {
      await this.props.contract.methods
        .updateRequestStatus(
          requestor,
          docName,
          newStatus,
          JSON.stringify(this.state.verifiedProperties)
        )
        .send({ from: this.props.user }, (err, txnHash) => {
          if (err) {
            alert(`User denied transaction signature`);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
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
    );
  }
}
