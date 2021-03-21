import { React, useState } from 'react';
import gradient from 'random-gradient';

export default function Card(props) {
  const [decryptedData, setDecryptedData] = useState(null);

  const decryptData = () => {
    window.ethereum
      .request({
        method: 'eth_decrypt',
        params: [props.data, props.user],
      })
      .then((decryptedMessage) => {
        setDecryptedData(JSON.parse(decryptedMessage));
        props.store.addNotification({
          title: 'Decryption successful',
          message: `Document decrypted successfully`,
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
          message: 'Please sign the transaction to decrypt the document',
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
    <div
      style={{
        background: gradient(`${props.issuer + props.name}`),
      }}
      className='w-96 h-56 m-4 rounded-xl text-gray-100 shadow-md transition-transform transform hover:scale-105 hover:shadow-2xl'
    >
      <div className='w-full p-6 absolute'>
        <div className='flex justify-center'>
          <p className='font-medium text-xl'>{props.name}</p>
        </div>
        <div className='flex flex-col'>
          <div className='flex justify-between'>
            <p className='font-normal text-gray-200'>Issued by</p>
            <p className='font-normal'>{props.issuerUname}</p>
          </div>
          <div className='flex justify-between'>
            <p className='font-normal text-gray-200'>Issued on</p>
            <p className='font-normal'>
              {new Date(props.dateOfIssue * 1000).toLocaleString()}
            </p>
          </div>
          {decryptedData ? (
            decryptedData.map((ele, i) => (
              <div key={i} className='flex justify-between'>
                <p className='font-normal text-gray-200'>{ele.fieldLabel}</p>
                <p className='font-normal'>{ele.fieldValue}</p>
              </div>
            ))
          ) : (
            <div className='flex justify-center items-center mt-1 h-24 bg-white bg-opacity-25 rounded-md'>
              <button
                name='decrypt'
                id='decrypt'
                onClick={decryptData}
                className='flex items-center justify-between p-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
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
                <span className='ml-1'>Decrypt document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
