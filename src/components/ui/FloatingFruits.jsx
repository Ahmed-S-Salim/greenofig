import React from 'react';

const FloatingFruits = () => {
  const fruits = [
    { emoji: '🍎', delay: 0, duration: 20, startX: 10, endX: 15 },
    { emoji: '🍊', delay: 2, duration: 22, startX: 20, endX: 25 },
    { emoji: '🍋', delay: 4, duration: 18, startX: 30, endX: 35 },
    { emoji: '🍌', delay: 1, duration: 21, startX: 40, endX: 45 },
    { emoji: '🍉', delay: 3, duration: 19, startX: 50, endX: 55 },
    { emoji: '🍇', delay: 5, duration: 23, startX: 60, endX: 65 },
    { emoji: '🍓', delay: 2.5, duration: 20, startX: 70, endX: 75 },
    { emoji: '🥝', delay: 4.5, duration: 22, startX: 80, endX: 85 },
    { emoji: '🍑', delay: 1.5, duration: 21, startX: 15, endX: 20 },
    { emoji: '🍒', delay: 3.5, duration: 19, startX: 25, endX: 30 },
    { emoji: '🥑', delay: 0.5, duration: 20, startX: 35, endX: 40 },
    { emoji: '🍍', delay: 2.8, duration: 18, startX: 45, endX: 50 },
    { emoji: '🥭', delay: 4.2, duration: 22, startX: 55, endX: 60 },
    { emoji: '🍐', delay: 1.8, duration: 21, startX: 65, endX: 70 },
    { emoji: '🍏', delay: 3.2, duration: 19, startX: 75, endX: 80 },
    { emoji: '🫐', delay: 5.5, duration: 23, startX: 85, endX: 90 },
    { emoji: '🍈', delay: 0.8, duration: 20, startX: 5, endX: 10 },
    { emoji: '🥥', delay: 2.2, duration: 22, startX: 90, endX: 95 },
    { emoji: '🍅', delay: 4.8, duration: 18, startX: 12, endX: 17 },
    { emoji: '🥒', delay: 1.2, duration: 21, startX: 22, endX: 27 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {fruits.map((fruit, index) => (
        <div
          key={index}
          className="absolute text-4xl opacity-30 animate-float"
          style={{
            left: `${fruit.startX}%`,
            bottom: '-50px',
            animationDelay: `${fruit.delay}s`,
            animationDuration: `${fruit.duration}s`,
            '--end-x': `${fruit.endX}%`,
          }}
        >
          {fruit.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingFruits;
