import React from 'react';
import multiavatar from '@multiavatar/multiavatar';

export default function Request(props) {
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
            <div className='text-sm text-gray-500'>jane.cooper@example.com</div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='text-sm text-gray-900'>{props.docName}</div>
        <div className='text-sm text-gray-500'>{props.properties}</div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <span
          className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            props.status == 'Requested'
              ? 'bg-yellow-100 text-yellow-800'
              : props.status == 'Approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {props.status}
        </span>
      </td>

      <td className='pr-6 py-4 float-right whitespace-nowrap text-sm font-medium'>
        {props.status == 'Requested' ? (
          <button
            className='bg-green-100 p-1 rounded-full text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white'
            onClick={() => {
              props.updateStatus('Approved', props.requestor, props.docName);
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
        {props.status == 'Requested' ? (
          <button
            className='ml-3 bg-red-100 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-white'
            onClick={() => {
              props.updateStatus('Declined', props.requestor, props.docName);
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
        {props.status == 'Approved' ? (
          <button
            className='ml-3 bg-red-100 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-white'
            onClick={() => {
              props.updateStatus('Revoked', props.requestor, props.docName);
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
