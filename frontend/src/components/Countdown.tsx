import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Countdown.css';

interface CountdownProps {
  targetDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const daysRef = useRef<HTMLSpanElement>(null);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const minutesRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef<HTMLSpanElement>(null);
  const prevTimeRef = useRef({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  
  const flipNumber = (element: HTMLElement) => {
    gsap.fromTo(element,
      { rotationX: -90, opacity: 0.3, y: -8, scale: 0.9 },
      { rotationX: 0, opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)', transformPerspective: 500, overwrite: 'auto' }
    );

    const parent = element.closest('.countdown-item');
    if (parent) {
      gsap.fromTo(parent,
        { boxShadow: '0 0 20px rgba(255, 0, 150, 0.4), inset 0 2px 8px rgba(255, 0, 150, 0.2)' },
        { boxShadow: 'inset 0 2px 8px rgba(102, 126, 234, 0.1), inset 0 -1px 0 rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.08)', duration: 0.8, ease: 'power2.out' }
      );
    }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      
      const targetDateTime = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = targetDateTime - now;
      
      if (difference > 0) {
        const nextTime = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
        
        setTimeLeft(nextTime);
        setIsExpired(false);

        // Trigger GSAP animation when values change
        const prev = prevTimeRef.current;
        if (nextTime.days !== prev.days && daysRef.current) flipNumber(daysRef.current);
        if (nextTime.hours !== prev.hours && hoursRef.current) flipNumber(hoursRef.current);
        if (nextTime.minutes !== prev.minutes && minutesRef.current) flipNumber(minutesRef.current);
        if (nextTime.seconds !== prev.seconds && secondsRef.current) flipNumber(secondsRef.current);
        prevTimeRef.current = nextTime;
      } else {
        setIsExpired(true);
      }
    };

    // Entrance animation for countdown items
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.countdown-item');
      gsap.fromTo(items,
        { opacity: 0, y: 20, scale: 0.8, rotationX: -30 },
        { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', transformPerspective: 500 }
      );

      gsap.to(containerRef.current, {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="countdown expired">
        <span className="expired-text">Event Started</span>
      </div>
    );
  }

  return (
    <div className="countdown" ref={containerRef}>
      <div className="countdown-item">
        <span className="countdown-value" ref={daysRef}>{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="countdown-label">Days</span>
      </div>
      <div className="countdown-item">
        <span className="countdown-value" ref={hoursRef}>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="countdown-label">Hours</span>
      </div>
      <div className="countdown-item">
        <span className="countdown-value" ref={minutesRef}>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="countdown-label">Mins</span>
      </div>
      <div className="countdown-item">
        <span className="countdown-value" ref={secondsRef}>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="countdown-label">Secs</span>
      </div>
    </div>
  );
};

export default Countdown;
