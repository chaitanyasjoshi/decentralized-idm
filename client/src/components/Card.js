import React from 'react';

export default function Card() {
  return (
    <div>
      <div className='w-96 h-56 m-auto bg-black rounded-xl text-white shadow-md transition-transform transform hover:scale-105 hover:shadow-2xl'>
        <div className='w-full px-8 absolute top-8'>
          <div className='flex justify-between'>
            <div className=''>
              <p className='font-light'>Name</p>
              <p className='font-bold tracking-widest font-mono'>Karthik P</p>
            </div>
          </div>
          <div className='pt-1'>
            <p className='font-light'>Num.</p>
            <p className='font-medium tracking-more-wider font-mono'>
              <strong>4642</strong> 3489 9867{' '}
              <span className='bg-blue-700  rounded-full px-2 py-1 text-xs absolute'>
                ●●●●
              </span>
            </p>
          </div>
          <div className='pt-6 pr-6'>
            <div className='flex justify-between'>
              <div className=''>
                <p className='font-light text-xs'>Expires At</p>
                <p className='font-medium tracking-wider text-sm font-mono'>
                  03/25
                </p>
              </div>

              <div className=''>
                <p className='font-light text-xs'>CVC</p>
                <p className='font-bold tracking-more-wider text-sm font-mono'>
                  123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
