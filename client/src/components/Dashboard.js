import React, { Component } from 'react';
import Card from './Card';

export default class Dashboard extends Component {
  state = {
    documents: null,
  };

  componentDidMount = () => {
    this.fetchDocuments();
    this.props.contract.events.DocumentIssued(
      { owner: this.props.user },
      (err, result) => {
        if (err) {
          return console.error(err);
        }
        this.fetchDocuments();
      }
    );
  };

  createCards() {
    const docs = [];
    if (this.state.documents != null) {
      const { 0: issuer, 1: name, 2: data } = this.state.documents;
      for (let index = 0; index < issuer.length; index++) {
        let ele = [issuer[index], name[index], data[index]];
        docs.push(ele);
      }
    }
    return docs;
  }

  fetchDocuments = async () => {
    // Get documents from contract.
    await this.props.contract.methods
      .getDocuments()
      .call({ from: this.props.user })
      .then((documents) => {
        this.setState({ documents });
      });
  };

  render() {
    return (
      <div className='mt-6 flex flex-wrap max-w-7xl mx-auto'>
        {this.createCards().map((ele) => {
          return (
            <Card key={ele[1]} issuer={ele[0]} name={ele[1]} data={ele[2]} />
          );
        })}
      </div>
    );
  }
}
