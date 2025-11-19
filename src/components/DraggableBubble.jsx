import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DraggableBubble = ({ onClick, unreadCount = 0, children, className = '', onPositionChange }) => {
  const [buttonPosition, setButtonPosition] = useState(() => {
    // Load saved position from localStorage, default to 'right'
    return localStorage.getItem('chatButtonPosition') || 'right';
  });

  // Notify parent when position changes
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(buttonPosition);
    }
  }, [buttonPosition, onPositionChange]);

  const handleDragEnd = (event, info) => {
    // Get the button's current position relative to viewport
    const screenWidth = window.innerWidth;
    const buttonElement = event.target.getBoundingClientRect();
    const buttonCenterX = buttonElement.left + buttonElement.width / 2;

    // Determine which side the button is closer to
    const newPosition = buttonCenterX < screenWidth / 2 ? 'left' : 'right';

    // Save position to state and localStorage
    setButtonPosition(newPosition);
    localStorage.setItem('chatButtonPosition', newPosition);
  };

  const getConstraints = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      return {
        left: -(screenWidth - 96),
        right: screenWidth - 96
      };
    }
    return { left: -300, right: 300 };
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={getConstraints()}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`h-16 w-16 rounded-full shadow-2xl cursor-grab active:cursor-grabbing relative bg-gradient-to-br from-primary to-green-400 touch-none select-none ${className}`}
      style={{
        position: 'fixed',
        bottom: '5rem',
        [buttonPosition]: '1rem',
        zIndex: 9999,
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      {/* Unread badge */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.div>
      )}
      {/* Content */}
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
};

export default DraggableBubble;
