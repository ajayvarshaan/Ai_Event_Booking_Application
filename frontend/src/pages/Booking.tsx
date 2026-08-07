import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, bookingAPI, aiAPI } from '../services/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Toast from '../components/Toast';
import Reviews from '../components/Reviews';
import './Booking.css';

gsap.registerPlugin(ScrollTrigger);

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  availableSeats: number;
  image: string;
}

const Booking: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [aiAssistant, setAiAssistant] = useState<{ message: string; tips: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getOne(eventId!);
        setEvent(response.data);
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

useEffect(() => {
    if (!loading) {
      
      if (titleRef.current) {
        const chars = Array.from(titleRef.current.textContent || '');
        titleRef.current.textContent = '';
        chars.forEach((char, i) => {
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.style.marginRight = char === ' ' ? '0.25em' : '0';
          span.style.opacity = '0';
          span.style.transform = 'translateY(40px) rotateX(60deg)';
          span.style.transformStyle = 'preserve-3d';
          span.textContent = char === ' ' ? '\u00A0' : char;
          titleRef.current?.appendChild(span);
          gsap.to(span, {
            opacity: 1, y: 0, rotationX: 0, duration: 0.6, delay: i * 0.025, ease: 'back.out(1.8)'
          });
        });
      }

      
      if (formRef.current) {
        gsap.fromTo(formRef.current,
          { opacity: 0, y: 60, scale: 0.85, rotationY: -14 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.9, ease: 'back.out(1.7)',
            transformPerspective: 900
          }
        );
      }

      
      const infoEl = document.querySelector('.event-info');
      if (infoEl) {
        gsap.fromTo(infoEl,
          { opacity: 0, x: -80, scale: 0.95 },
          { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
        );
      }
    }
  }, [loading]);

  
  const handleFormMove = useCallback((e: React.MouseEvent) => {
    const el = formRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    gsap.to(el, {
      rotationX: ((y - centerY) / centerY) * -5,
      rotationY: ((x - centerX) / centerX) * 5,
      transformPerspective: 900,
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, []);

  const handleFormLeave = useCallback(() => {
    const el = formRef.current;
    if (!el) return;
    gsap.to(el, {
      rotationX: 0, rotationY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  const handleBooking = async () => {
    if (!event) return;
    setBooking(true);

    try {
      await bookingAPI.create({ eventId: event._id, seats });
      setToast({ message: 'Booking successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/my-bookings'), 1500);
    } catch (error) {
      console.error('Booking failed:', error);
      setToast({ message: 'Booking failed. Please try again.', type: 'error' });
      setBooking(false);
    }
  };

  const handleAiAssistant = async () => {
    if (!event || aiLoading) return;

    setAiLoading(true);
    setAiAssistant(null);
    try {
      const response = await aiAPI.bookingAssistant(event._id, seats);
      setAiAssistant(response.data);
    } catch (error) {
      console.error('AI booking assistant error:', error);
      setToast({ message: 'Failed to generate AI assistant tips.', type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading event...</div>;
  if (!event) return <div className="loading">Event not found</div>;

  const totalPrice = event.price * seats;

  return (
    <div className="booking-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="container">
        <h1 ref={titleRef}>Book Event</h1>
        <div className="booking-content">
          <div className="event-info">
            <img src={event.image} alt={event.title} />
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <div className="info-grid">
              <div>📅 {new Date(event.date).toLocaleDateString()}</div>
              <div>🕐 {event.time}</div>
              <div>📍 {event.location}</div>
              <div>💰 ${event.price} per seat</div>
            </div>
          </div>

<div ref={formRef} className="booking-form card" onMouseMove={handleFormMove} onMouseLeave={handleFormLeave}>
            <h3>Complete Your Booking</h3>
            <div className="form-group">
              <label>Number of Seats</label>
              <input
                type="number"
                min="1"
                max={event.availableSeats}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <small>{event.availableSeats} seats available</small>
            </div>

            <div className="price-summary">
              <div className="summary-row">
                <span>Price per seat:</span>
                <span>${event.price}</span>
              </div>
              <div className="summary-row">
                <span>Number of seats:</span>
                <span>{seats}</span>
              </div>
              <div className="summary-row total">
                <span>Total Price:</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            <button
              className="btn-primary w-full"
              onClick={handleBooking}
              disabled={booking || seats > event.availableSeats}
            >
              {booking ? 'Processing...' : 'Confirm Booking'}
            </button>

            <div className="ai-assistant-section">
              <button
                className="btn-ai-assistant"
                onClick={handleAiAssistant}
                disabled={aiLoading}
              >
                {aiLoading ? '⏳ Gemini is preparing tips...' : '✨ AI Booking Assistant'}
              </button>

              {aiAssistant && (
                <div className="ai-assistant-box">
                  <div className="ai-assistant-header">
                    <span className="ai-assistant-badge">🤖 Gemini Prep Guide</span>
                  </div>
                  <p className="ai-assistant-message">{aiAssistant.message}</p>
                  {aiAssistant.tips.length > 0 && (
                    <div className="ai-assistant-tips">
                      <strong className="ai-assistant-tips-title">📋 Preparation Tips</strong>
                      <ul>
                        {aiAssistant.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Reviews eventId={event._id} />
      </div>
    </div>
  );
};

export default Booking;
