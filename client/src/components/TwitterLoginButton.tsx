// client/src/components/TwitterLoginButton.js
import React from 'react';

const TwitterLoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/api/twitter/login';
  };

  return (
    <button onClick={handleLogin}>Connect Twitter</button>
  );
};

export default TwitterLoginButton;
