import { React, useState } from 'react';
import multiavatar from '@multiavatar/multiavatar';

import 'react-notifications-component/dist/theme.css';
import 'animate.css';

export default function Request(props) {
  const [decryptedData, setDecryptedData] = useState(null);

  const decryptData = () => {
    window.ethereum
      .request({
        method: 'eth_decrypt',
        params: [props.properties, props.user],
      })
      .then((decryptedMessage) => {
        setDecryptedData(JSON.parse(decryptedMessage));
        props.store.addNotification({
          title: 'Decryption successful',
          message: `Request decrypted successfully`,
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
      })
      .catch((error) => {
        props.store.addNotification({
          title: 'Decryption failed',
          message: 'Please sign the transaction to decrypt the request',
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
      });
  };

  return (
    <tr>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-10 w-10'>
            <span
              className='h-10 w-10 rounded-full'
              dangerouslySetInnerHTML={{
                __html: multiavatar(props.requestor),
              }}
            />
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>
              {props.requestor}
            </div>
            <div className='text-sm text-gray-500'>{props.requestorUname}</div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='text-sm font-medium text-gray-900'>{props.docName}</div>
      </td>
      {decryptedData ? (
        <td className='px-6 py-4 whitespace-nowrap'>
          {decryptedData.map((ele, i) => (
            <div key={i} className='grid grid-cols-2 gap-6'>
              <p className='text-sm text-gray-600 col-span-1'>{ele.label}</p>
              <p className='text-sm text-gray-600 text-right col-span-1'>
                {ele.expValue ? 'Verify' : 'Access'}
              </p>
            </div>
          ))}
        </td>
      ) : (
        <td className='px-6 py-4 whitespace-nowrap'>
          <button
            name='decrypt'
            id='decrypt'
            onClick={decryptData}
            className='flex items-center justify-between py-1 px-2 m-auto border border-transparent shadow-sm text-sm rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            <svg
              className='h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
            <span className='ml-1'>Decrypt request</span>
          </button>
        </td>
      )}
      <td className='px-6 py-4 whitespace-nowrap text-center'>
        <span
          className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            props.status === 'Requested'
              ? 'bg-yellow-100 text-yellow-800'
              : props.status === 'Approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {props.status}
        </span>
      </td>

      <td className='pr-6 py-4 text-right whitespace-nowrap'>
        {props.status === 'Requested' ? (
          <button
            className='bg-green-100 p-1 rounded-full text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white'
            onClick={() => {
              decryptedData
                ? props.updateStatus(
                    'Approved',
                    props.requestor,
                    props.docName,
                    decryptedData
                  )
                : props.store.addNotification({
                    title: 'Status updation failed',
                    message: 'Decrypt request data to update request status',
                    type: 'danger', // 'default', 'success', 'info', 'warning'
                    container: 'top-right', // where to position the notifications
                    animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
                    animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
                    dismiss: {
                      duration: 3000,
                      showIcon: true,
                      pauseOnHover: true,
                    },
                  });
            }}
          >
            <span className='sr-only'>Approve</span>
            {/* Heroicon name: outline/check */}
            <svg
              className='h-6 w-6'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>
        ) : (
          ''
        )}
        {props.status === 'Requested' ? (
          <button
            className='ml-3 bg-red-100 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-white'
            onClick={() => {
              decryptedData
                ? props.updateStatus(
                    'Declined',
                    props.requestor,
                    props.docName,
                    decryptedData
                  )
                : props.store.addNotification({
                    title: 'Status updation failed',
                    message: 'Decrypt request data to update request status',
                    type: 'danger', // 'default', 'success', 'info', 'warning'
                    container: 'top-right', // where to position the notifications
                    animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
                    animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
                    dismiss: {
                      duration: 3000,
                      showIcon: true,
                      pauseOnHover: true,
                    },
                  });
            }}
          >
            <span className='sr-only'>Decline</span>
            {/* Heroicon name: outline/x-circle */}
            <svg
              className='h-6 w-6'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>
        ) : (
          ''
        )}
        {props.status === 'Approved' ? (
          <button
            className='ml-3 bg-red-100 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-white'
            onClick={() => {
              decryptedData
                ? props.updateStatus(
                    'Revoked',
                    props.requestor,
                    props.docName,
                    decryptedData
                  )
                : props.store.addNotification({
                    title: 'Status updation failed',
                    message: 'Decrypt request data to update request status',
                    type: 'danger', // 'default', 'success', 'info', 'warning'
                    container: 'top-right', // where to position the notifications
                    animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
                    animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
                    dismiss: {
                      duration: 3000,
                      showIcon: true,
                      pauseOnHover: true,
                    },
                  });
            }}
          >
            <span className='sr-only'>Revoke</span>
            {/* Heroicon name: outline/exclamation-circle */}
            <svg
              className='h-6 w-6'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>
        ) : (
          ''
        )}
      </td>
    </tr>
  );
}
