import React, { useState } from 'react';
import auth from '../utils/auth';

export default function Authentication(props) {
  const [username, setUsername] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleRegistration = () => {
    let encryptionPublicKey;

    window.ethereum
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [auth.getUser()], // you must have access to the specified account
      })
      .then((result) => {
        encryptionPublicKey = result;
        auth.register(encryptionPublicKey, username);
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('We can encrypt anything without the key.');
        } else {
          console.error(error);
        }
      });
  };

  const handleLogin = () => {
    auth.login(username).then(() => {
      if (auth.isAuthenticated()) {
        props.history.push('/dashboard');
      }
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-Poppins'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <img
            className='mx-auto h-12 w-auto'
            src='https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg'
            alt='Workflow'
          />
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
        </div>
        <div className='shadow overflow-hidden rounded-md'>
          <div className='px-4 py-5 bg-white sm:p-10'>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700'
            >
              Username
            </label>
            <input
              type='text'
              name='username'
              id='username'
              autoComplete='off'
              value={username}
              autoCorrect='off'
              spellCheck={false}
              onChange={handleUsernameChange}
              className='mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
            />
            <div className='flex items-center justify-between'>
              <button
                name='login'
                id='login'
                onClick={handleLogin}
                className='mr-2 sm:mr-5 mt-8 p-2 w-full border border-transparent shadow-sm text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Login
              </button>
              <button
                name='register'
                id='register'
                onClick={handleRegistration}
                className='ml-2 sm:ml-5 mt-8 p-2 w-full float-right border border-transparent shadow-sm text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
