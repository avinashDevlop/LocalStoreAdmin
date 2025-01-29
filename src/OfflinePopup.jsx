import React from 'react';

const popupStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'red',
  color: 'white',
  padding: '10px',
  borderRadius: '5px',
  zIndex: 1000,
};

const OfflinePopup = ({ isOnline }) => {
  return (
    !isOnline && (
      <div style={popupStyle}>
        <p>Network connection failed. Please check your internet connection.</p>
      </div>
    )
  );
};

export default OfflinePopup;
