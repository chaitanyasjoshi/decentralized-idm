import React, { useState, useEffect } from 'react';
import ReactNotification, { store } from 'react-notifications-component';

import auth from '../utils/auth';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

export default function Authentication(props) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (auth.isAuthenticated()) {
      props.history.push('/dashboard');
    }
    if (!auth.getContract()) {
      auth.init().then(() => {
        initialize();
      });
    } else {
      initialize();
    }
  }, []);

  const initialize = () => {
    window.ethereum.on('accountsChanged', async function (accounts) {
      auth.logout(() => {
        props.history.push('/');
        window.location.reload();
      });
    });

    auth
      .getContract()
      .events.UserRegistered(
        { filter: { user: auth.getUser() } },
        (err, result) => {
          if (err) {
            return console.error(err);
          }
          store.addNotification({
            title: 'Register',
            message: 'Registered successfully',
            type: 'success', // 'default', 'success', 'info', 'warning'
            container: 'top-right', // where to position the notifications
            animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
            animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
            dismiss: {
              duration: 2000,
              showIcon: true,
              pauseOnHover: true,
            },
          });
        }
      );
  };

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
    if (username === '') {
      store.addNotification({
        title: 'Invalid username',
        message: 'Username cannot be empty',
        type: 'danger', // 'default', 'success', 'info', 'warning'
        container: 'top-right', // where to position the notifications
        animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
        animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
        dismiss: {
          duration: 2000,
          showIcon: true,
          pauseOnHover: true,
        },
      });
    } else {
      auth.login(username).then((message) => {
        if (auth.isAuthenticated()) {
          props.history.push('/dashboard');
        } else {
          store.addNotification({
            title: 'Login failed',
            message: message,
            type: 'danger', // 'default', 'success', 'info', 'warning'
            container: 'top-right', // where to position the notifications
            animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
            animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
            dismiss: {
              duration: 2000,
              showIcon: true,
              pauseOnHover: true,
            },
          });
        }
      });
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-Poppins'>
      <ReactNotification />
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
              Username<span className='text-red-500'>*</span>
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
