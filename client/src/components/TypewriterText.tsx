import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  handwriting?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  onComplete,
  className = '',
  showCursor = true,
  handwriting = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed + Math.random() * 20); // Add randomness for realistic typing

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(false);
  }, [text]);

  const fontClass = handwriting ? 'font-["Kalam"]' : 'font-mono';
  const animationClass = handwriting ? 'handwriting-text' : '';

  return (
    <span className={`${fontClass} ${animationClass} ${className}`}>
      {displayedText}
      {showCursor && isTyping && (
        <span className="writing-cursor">|</span>
      )}
    </span>
  );
};

export default TypewriterText;
