import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, typingSpeed = 40, pauseDuration = 3000 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timeout;

    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, typingSpeed);
    } else {
      timeout = setTimeout(() => {
        setCurrentText('');
        setCurrentIndex(0);
      }, pauseDuration);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, text, typingSpeed, pauseDuration]);

  return (
    <span>
      <style>
        {`
          .blinking-cursor {
            animation: blink 1s step-end infinite;
            margin-left: 2px;
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
      
      {currentText}
      <span className="blinking-cursor fw-light">|</span> 
    </span>
  );
};

export default Typewriter;