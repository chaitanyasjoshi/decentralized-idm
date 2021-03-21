import IdentityManagerContract from '../abis/IdentityManager.json';
import getWeb3 from './getWeb3';

class auth {
  constructor() {
    this.contract = null;
    this.user = null;

    this.init = this.init.bind(this);
  }

  init = async () => {
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
      this.setContract(instance);
      this.setUser(accounts[0]);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  login = async (username) => {
    return await this.contract.methods
      .login('Owner', username)
      .call({ from: this.user })
      .then(({ 0: status, 1: message, 2: username }) => {
        if (status === 'success') {
          localStorage.setItem('authenticated', true);
          localStorage.setItem('username', username);
        } else {
          localStorage.setItem('authenticated', false);
        }
        return message;
      });
  };

  register = async (encryptionPublicKey, username) => {
    await this.contract.methods
      .register(encryptionPublicKey, 'Owner', username)
      .send({ from: this.user });
  };

  logout(callback) {
    localStorage.setItem('authenticated', false);
    localStorage.removeItem('username');
    callback();
  }

  isAuthenticated() {
    return localStorage.getItem('authenticated') === 'true';
  }

  setContract(contract) {
    this.contract = contract;
  }

  setUser(user) {
    this.user = user;
  }

  getContract() {
    return this.contract;
  }

  getUser() {
    return this.user;
  }

  getUsername() {
    return localStorage.getItem('username');
  }
}

export default new auth();
