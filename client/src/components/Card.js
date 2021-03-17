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
      })
      .catch((error) => console.log(error.message));
  };

  return (
    <div
      style={{
        background: gradient(`${props.issuer + props.name}`),
      }}
      className='w-96 h-56 m-4 font-Poppins rounded-xl text-gray-100 shadow-md transition-transform transform hover:scale-105 hover:shadow-2xl'
    >
      <div className='w-full p-6 absolute'>
        <div className='flex justify-center'>
          <p className='font-medium text-xl'>{props.name}</p>
        </div>
        <div className='flex-wrap'>
          <p className='font-normal'>Issued by</p>
          <p className='font-light text-base tracking-tighter'>
            {props.issuer}
          </p>
          {decryptedData ? (
            decryptedData.map((ele, i) => (
              <div key={i} className='flex justify-between'>
                <p className='font-normal'>{ele.fieldLabel}</p>
                <p className='font-light tracking-tighter'>{ele.fieldValue}</p>
              </div>
            ))
          ) : (
            <div className='flex justify-center items-center h-24 bg-white bg-opacity-25 rounded-md'>
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
