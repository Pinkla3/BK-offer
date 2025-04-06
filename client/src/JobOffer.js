import React from 'react';

const JobOffers = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe 
        src="https://berlin-opiekunki.pl/pl/oferty-pracy"
        title="Oferty pracy"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};

export default JobOffers;