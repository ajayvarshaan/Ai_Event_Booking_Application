import React, { useEffect, useRef, useState, useCallback } from 'react';
import { bookingAPI, aiAPI } from '../services/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import './MyBookings.css';

gsap.registerPlugin(ScrollTrigger);

interface Booking {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    price: number;
  } | null;
  seats: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [aiLoadingFor, setAiLoadingFor] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<{ [bookingId: string]: { message: string; tips: string[] } }>({});
  const bookingsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getMyBookings();
        // Filter out bookings with deleted events
        const validBookings = response.data.filter((b: Booking) => b.event !== null);
        setBookings(validBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

useEffect(() => {
    if (titleRef.current) {
      const dots = Array.from(titleRef.current.textContent || '');
      titleRef.current.textContent = '';
      const row = titleRef.current;
      dots.forEach((char, i) => {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.marginRight = char === ' ' ? '0.25em' : '0';
        span.style.opacity = '0';
        span.style.transform = 'translateY(40px) rotateX(60deg)';
        span.style.transformStyle = 'preserve-3d';
        span.textContent = char === ' ' ? '\u00A0' : char;
        row.appendChild(span);
        gsap.to(span, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          delay: i * 0.03,
          ease: 'back.out(1.8)'
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && bookingsRef.current) {
      const cards = bookingsRef.current.querySelectorAll('.booking-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 80, scale: 0.9, rotationY: -12 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.8, stagger: 0.12,
            ease: 'back.out(1.6)', transformPerspective: 800,
            scrollTrigger: { trigger: bookingsRef.current, start: 'top 85%' }
          }
        );
      }
    }
  }, [loading, bookings]);

  // 3D tilt on booking card hover
  const handleCardMove = useCallback((e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    gsap.to(card, {
      rotationX: ((y - centerY) / centerY) * -5,
      rotationY: ((x - centerX) / centerX) * 5,
      transformPerspective: 900,
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, []);

  const handleCardLeave = useCallback((e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    gsap.to(card, {
      rotationX: 0, rotationY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  const handleCancel = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBookingId) return;
    
    try {
      await bookingAPI.cancel(selectedBookingId);
      setBookings(bookings.filter((b) => b._id !== selectedBookingId));
      setModalOpen(false);
      setSelectedBookingId(null);
      setToast({ message: 'Booking cancelled successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      setModalOpen(false);
      setToast({ message: 'Failed to cancel booking', type: 'error' });
    }
  };

  const handleAiAssistant = async (booking: Booking) => {
    if (!booking.event || aiLoadingFor) return;

    setAiLoadingFor(booking._id);
    setAiResults((prev) => {
      const next = { ...prev };
      delete next[booking._id];
      return next;
    });
    try {
      const response = await aiAPI.bookingAssistant(booking.event._id, booking.seats);
      setAiResults((prev) => ({ ...prev, [booking._id]: response.data }));
    } catch (error) {
      console.error('AI booking assistant error:', error);
      setToast({ message: 'Failed to generate AI assistant tips.', type: 'error' });
    } finally {
      setAiLoadingFor(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="my-bookings">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
      />
      
      <div className="container">
        <h1 ref={titleRef}>My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You haven't booked any events yet.</p>
            <a href="/home" className="btn-primary">
              Browse Events
            </a>
          </div>
        ) : (
          <div ref={bookingsRef} className="bookings-list">
            {bookings.map((booking) => {
              // Safety check for deleted events
              if (!booking.event) {
return (
                  <div key={booking._id} className="booking-card card deleted-event" onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}>
                    <div className="booking-header">
                      <h3>⚠️ Event Deleted</h3>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                    <div className="booking-details">
                      <p className="deleted-message">
                        This event has been deleted by the organizer.
                      </p>
                      <div className="detail-row">
                        <span>🎫 Seats:</span>
                        <span>{booking.seats}</span>
                      </div>
                      <div className="detail-row">
                        <span>💰 Total Price:</span>
                        <span className="price">${booking.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              const aiResult = aiResults[booking._id];
              
return (
                <div key={booking._id} className="booking-card card" onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}>
                  <div className="booking-header">
                    <h3>{booking.event.title}</h3>
                    <span className={`status ${booking.status}`}>{booking.status}</span>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <span>📅 Date:</span>
                      <span>{new Date(booking.event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span>🕐 Time:</span>
                      <span>{booking.event.time}</span>
                    </div>
                    <div className="detail-row">
                      <span>📍 Location:</span>
                      <span>{booking.event.location}</span>
                    </div>
                    <div className="detail-row">
                      <span>🎫 Seats:</span>
                      <span>{booking.seats}</span>
                    </div>
                    <div className="detail-row">
                      <span>💰 Total Price:</span>
                      <span className="price">${booking.totalPrice}</span>
                    </div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <div className="booking-actions">
                      <button
                        className="btn-ai-assistant"
                        onClick={() => handleAiAssistant(booking)}
                        disabled={aiLoadingFor === booking._id}
                      >
                        {aiLoadingFor === booking._id ? '⏳ AI is preparing...' : '✨ AI Assistant'}
                      </button>
                      <button
                        className="btn-secondary w-full"
                        onClick={() => handleCancel(booking._id)}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}

                  {aiResult && (
                    <div className="ai-assistant-box">
                      <div className="ai-assistant-header">
                        <span className="ai-assistant-badge">🤖 Gemini Prep Guide</span>
                      </div>
                      <p className="ai-assistant-message">{aiResult.message}</p>
                      {aiResult.tips.length > 0 && (
                        <div className="ai-assistant-tips">
                          <strong className="ai-assistant-tips-title">📋 Preparation Tips</strong>
                          <ul>
                            {aiResult.tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
