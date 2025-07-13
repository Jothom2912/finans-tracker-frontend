import React from 'react';

function MessageDisplay({ message, type }) {
  if (!message) return null;

  const style = {
    color: type === 'error' ? 'red' : 'green',
    fontWeight: 'bold',
    marginTop: '10px',
    marginBottom: '10px',
  };

  return <p style={style}>{message}</p>;
}

export default MessageDisplay;