import React from 'react';
import { motion } from 'framer-motion';

const FloatingFruits = () => {
  const fruits = [
    '🥒', '🍓', '🍎', '🥝', '🥦', '🍋', '🍊', '🥑',
    '🍇', '🍌', '🫐', '🍅', '🥕', '🍉', '🍐', '🥬',
    '🌶️', '🫑', '🍒', '🥗'
  ];

  // Generate 20 TINY fruits scattered ALL OVER the page
  const fruitPositions = fruits.map((fruit, index) => {
    return {
      fruit,
      x: Math.random() * 100, // ALL OVER: 0-100% of screen width
      delay: index * 2, // Stagger start times
      duration: 25 + Math.random() * 15, // Duration 25-40s (slower)
      size: 0.8 + Math.random() * 0.7, // TINY size: 0.8-1.5rem
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {fruitPositions.map((item, index) => (
        <motion.div
          key={index}
          initial={{
            x: `${item.x}vw`,
            y: '110vh', // Start below screen
            opacity: 0.4,
          }}
          animate={{
            y: '-10vh', // Float up above screen
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: item.delay,
          }}
          style={{
            position: 'absolute',
            fontSize: `${item.size}rem`,
          }}
        >
          {item.fruit}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingFruits;
