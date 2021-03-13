import React from 'react';
import gradient from 'random-gradient';

export default function Card(props) {
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
          {JSON.parse(props.data).map((ele, i) => (
            <div key={i} className='flex justify-between'>
              <p className='font-normal'>{ele.fieldLabel}</p>
              <p className='font-light tracking-tighter'>{ele.fieldValue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
