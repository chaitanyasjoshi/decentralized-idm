import React from 'react';
import gradient from 'random-gradient';

export default function Card(props) {
  return (
    <div
      style={{
        background: gradient(`${props.issuer + props.name + props.data}`),
      }}
      className='w-96 h-56 font-Poppins rounded-xl text-white shadow-md transition-transform transform hover:scale-105 hover:shadow-2xl'
    >
      <div className='w-full p-6 absolute'>
        <div className='flex justify-center'>
          <p className='font-medium text-xl'>{props.name}</p>
        </div>
        <div className='flex-wrap'>
          <p className='font-normal'>Issuer</p>
          <p className='font-light tracking-tighter'>{props.issuer}</p>
          <p className='font-normal'>Data</p>
          <p className='font-light tracking-tighter'>{props.data}</p>
        </div>
      </div>
    </div>
  );
}
