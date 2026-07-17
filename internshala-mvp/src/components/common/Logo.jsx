import React from 'react';
import logoImg from '../../assets/logo.png';

const Logo = ({ className = "h-9 w-auto", mode = "auto" }) => {
  return (
    <img 
      src={logoImg} 
      alt="IncuXAI Careers" 
      className={`${className} object-contain`} 
    />
  );
};

export default Logo;
