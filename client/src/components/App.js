import React, { Component } from 'react';
import IdentityManagerContract from '../abis/IdentityManager.json';
import getWeb3 from '../utils/getWeb3';

import Navbar from './Navbar';
import Spinner from './Spinner';

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
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

      // Set web3, accounts, and contract to the state
      this.setState({ web3, accounts, contract: instance });
      window.ethereum.on(
        'accountsChanged',
        async function (accounts) {
          // Not using returned accounts as it returns lowercase address
          const newAccounts = await web3.eth.getAccounts();
          this.setState({ accounts: newAccounts });
        }.bind(this)
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <Spinner />;
    }
    return (
      <div className='App'>
        <Navbar user={this.state.accounts[0]} contract={this.state.contract} />
      </div>
    );
  }
}

export default App;
