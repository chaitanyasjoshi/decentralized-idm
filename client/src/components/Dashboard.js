import React, { Component } from 'react';

import auth from '../utils/auth';

import Navbar from './Navbar';
import Card from './Card';

export default class Dashboard extends Component {
  state = {
    user: null,
    contract: null,
    documents: [],
  };

  componentDidMount() {
    if (!auth.getContract()) {
      auth.init().then(() => {
        this.setState(
          { user: auth.getUser(), contract: auth.getContract() },
          () => {
            this.fetchDocuments();
            this.state.contract.events.DocumentIssued(
              { owner: this.state.user },
              (err, result) => {
                if (err) {
                  return console.error(err);
                }
                this.fetchDocuments();
              }
            );
          }
        );
      });
    } else {
      this.setState(
        { user: auth.getUser(), contract: auth.getContract() },
        () => {
          this.fetchDocuments();
          this.state.contract.events.DocumentIssued(
            { owner: this.state.user },
            (err, result) => {
              if (err) {
                return console.error(err);
              }
              this.fetchDocuments();
            }
          );
        }
      );
    }
  }

  createCards() {}

  fetchDocuments = async () => {
    // Get documents from contract.
    await this.state.contract.methods
      .getDocuments()
      .call({ from: this.state.user })
      .then((documents) => {
        const docs = [];
        const { 0: issuer, 1: name, 2: data } = documents;
        for (let index = 0; index < issuer.length; index++) {
          let ele = [issuer[index], name[index], data[index]];
          docs.push(ele);
        }
        this.setState({ documents: docs });
      });
  };

  render() {
    return (
      <div>
        <Navbar user={this.state.user} history={this.props.history} />
        <div className='mt-6 flex flex-wrap max-w-7xl mx-auto'>
          {this.state.documents.map((ele) => {
            return (
              <Card
                key={ele[1]}
                issuer={ele[0]}
                name={ele[1]}
                data={ele[2]}
                user={this.state.user}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
