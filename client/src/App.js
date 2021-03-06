import React, { Component } from 'react';
import IdentityManagerContract from './abis/IdentityManager.json';
import getWeb3 from './getWeb3';

import Navbar from './components/Navbar';
import Card from './components/Card';

import './App.css';

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    issuer: [],
    name: [],
    data: [],
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = IdentityManagerContract.networks[networkId];
      const instance = new web3.eth.Contract(
        IdentityManagerContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        { web3, accounts, contract: instance },
        this.fetchDocuments
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  fetchDocuments = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const { 0: issuer, 1: name, 2: data } = await contract.methods
      .getDocuments()
      .call({ from: accounts[0] })
      .then((result) => result);

    // Update state with the result.
    this.setState({ issuer, name, data });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className='App'>
        <Navbar />
        <div>Issuer: {this.state.issuer[0]} </div>
        <div>Name: {this.state.name[0]} </div>
        <div>Data: {this.state.data[0]} </div>
        <Card />
      </div>
    );
  }
}

export default App;
