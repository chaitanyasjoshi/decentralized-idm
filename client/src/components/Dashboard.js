import React from 'react';

import Card from './Card';

function createCards(issuer, name, data) {
  const docs = [];
  for (let index = 0; index < issuer.length; index++) {
    let ele = [issuer[index], name[index], data[index]];
    docs.push(ele);
  }
  return docs;
}

export default function Dashboard(props) {
  const { 0: issuer, 1: name, 2: data } = props.documents;
  return (
    <div className='mt-6 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8'>
      {createCards(issuer, name, data).map((ele) => {
        return (
          <Card key={ele[1]} issuer={ele[0]} name={ele[1]} data={ele[2]} />
        );
      })}
    </div>
  );
}
