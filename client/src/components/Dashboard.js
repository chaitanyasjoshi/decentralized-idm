import React, { Component } from 'react';
import ReactNotification, { store } from 'react-notifications-component';

import auth from '../utils/auth';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

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
        this.initialize();
      });
    } else {
      this.initialize();
    }
  }

  initialize = () => {
    this.setState(
      { user: auth.getUser(), contract: auth.getContract() },
      () => {
        this.fetchDocuments();
        this.state.contract.events.DocumentIssued(
          { filter: { owner: this.state.user } },
          (err, result) => {
            if (err) {
              return console.error(err);
            }
            this.fetchDocuments();
          }
        );
      }
    );
  };

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
        <ReactNotification className='font-Poppins' />
        <div className='mt-6 flex flex-wrap max-w-7xl mx-auto'>
          {this.state.documents.map((ele, i) => {
            return (
              <Card
                key={i}
                store={store}
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
