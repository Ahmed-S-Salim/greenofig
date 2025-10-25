import React from 'react';

const HeroImage = () => {
  return (
    <div className='flex justify-center items-center'>
      <img
        src='https://imagedelivery.net/LqiWLm-3MGbYHtFuUbcBtA/119580eb-abd9-4191-b93a-f01938786700/public'
        alt='GreenoFig health and wellness platform illustration'
        loading='lazy'
        className='rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105'
      />
    </div>
  );
};

export default HeroImage;