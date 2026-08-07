import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Compare.css';

gsap.registerPlugin(ScrollTrigger);

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  capacity: number;
  availableSeats: number;
  image: string;
}

const COMPARE_STORAGE_KEY = 'eventhub.compareEvents';

const Compare: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const saveEvents = (nextEvents: Event[]) => {
    setEvents(nextEvents);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(nextEvents));
  };

  const removeEvent = (eventId: string) => {
    saveEvents(events.filter((event) => event._id !== eventId));
  };

  const clearAll = () => {
    saveEvents([]);
  };

  const demandRatio = (event: Event) => {
    if (event.capacity <= 0) {
      return 0;
    }

    return (event.capacity - event.availableSeats) / event.capacity;
  };

  const bestValueEvent = useMemo(() => {
    if (events.length === 0) return null;
    return [...events].sort((a, b) => a.price - b.price)[0];
  }, [events]);

  const mostAvailableEvent = useMemo(() => {
    if (events.length === 0) return null;
    return [...events].sort((a, b) => b.availableSeats - a.availableSeats)[0];
  }, [events]);

  const mostDemandedEvent = useMemo(() => {
    if (events.length === 0) return null;
    return [...events].sort((a, b) => demandRatio(b) - demandRatio(a))[0];
  }, [events]);

  // 3D tilt on compare cards
  const handleCardMove = useCallback((e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    gsap.to(card, {
      rotationX: ((y - centerY) / centerY) * -6,
      rotationY: ((x - centerX) / centerX) * 6,
      transformPerspective: 900,
      scale: 1.03,
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

  // Master GSAP animations
  useEffect(() => {
    if (events.length === 0) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Header kicker
      if (headerRef.current) {
        const kicker = headerRef.current.querySelector('.compare-page-kicker');
        if (kicker) {
          tl.fromTo(kicker, { opacity: 0, scale: 0.8, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' });
        }
      }

      // Header title word-by-word
      if (headerRef.current) {
        const h1 = headerRef.current.querySelector('h1');
        if (h1) {
          const words = h1.textContent?.split(' ') || [];
          h1.textContent = '';
          words.forEach((word, wi) => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.marginRight = '0.3em';
            span.style.opacity = '0';
            span.style.transform = 'translateY(50px) rotateX(55deg)';
            span.style.transformStyle = 'preserve-3d';
            span.textContent = word;
            h1.appendChild(span);
            tl.to(span, { opacity: 1, y: 0, rotationX: 0, duration: 0.7, ease: 'back.out(1.8)' }, 0.1 + wi * 0.1);
          });
        }
        const p = headerRef.current.querySelector('p');
        if (p) {
          tl.fromTo(p, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power4.out' }, '-=0.3');
        }
      }

      // Highlight cards 3D stagger entrance
      if (highlightsRef.current) {
        tl.fromTo(highlightsRef.current.querySelectorAll('.highlight-card'),
          { opacity: 0, y: 60, scale: 0.85, rotationY: -14 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.8, stagger: 0.12,
            ease: 'back.out(1.7)', transformPerspective: 800
          },
          '-=0.3'
        );
      }

      // Compare cards flip entrance with ScrollTrigger
      if (gridRef.current) {
        gsap.fromTo(gridRef.current.querySelectorAll('.compare-page-card'),
          { opacity: 0, y: 100, scale: 0.88, rotationY: -20 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.9, stagger: 0.15,
            ease: 'back.out(1.6)', transformPerspective: 900,
            scrollTrigger: { trigger: gridRef.current, start: 'top 85%' }
          }
        );

        // Animated demand bars
        gsap.fromTo(gridRef.current.querySelectorAll('.compare-demand-bar-fill'),
          { width: '0%' },
          {
            width: (_i, el) => `${el.getAttribute('data-width') || '0%'}`,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%' }
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [events.length]);

  // Re-animate on events change
  useEffect(() => {
    if (events.length > 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.compare-page-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 60, scale: 0.9, rotationY: -12 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.7, stagger: 0.12,
            ease: 'back.out(1.6)', transformPerspective: 800
          }
        );
      }
    }
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="compare-page" ref={pageRef}>
        <div className="container">
          <div className="compare-empty">
            <h1>No Events To Compare</h1>
            <p>Add events from Home using Compare, then come back here for side-by-side analysis.</p>
            <Link to="/home" className="btn-primary">Back To Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page" ref={pageRef}>
      <div className="container">
        <div className="compare-page-header" ref={headerRef}>
          <div>
            <span className="compare-page-kicker">Compare Center</span>
            <h1>Compare Events Side By Side</h1>
            <p>Choose the event that best fits your budget, timing, and seat availability.</p>
          </div>
          <button className="compare-clear" onClick={clearAll}>Clear All</button>
        </div>

        <div className="compare-highlights" ref={highlightsRef}>
          <div className="highlight-card">
            <span>Best Value</span>
            <strong>{bestValueEvent?.title || 'N/A'}</strong>
          </div>
          <div className="highlight-card">
            <span>Most Seats Left</span>
            <strong>{mostAvailableEvent?.title || 'N/A'}</strong>
          </div>
          <div className="highlight-card">
            <span>Highest Demand</span>
            <strong>{mostDemandedEvent?.title || 'N/A'}</strong>
          </div>
        </div>

        <div className="compare-page-grid" ref={gridRef}>
          {events.map((event) => (
            <div
              key={event._id}
              className="compare-page-card"
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
            >
              <img src={event.image} alt={event.title} className="compare-image" />
              <div className="compare-card-body">
                <div className="compare-card-header">
                  <span className="compare-tag">{event.category}</span>
                  <button className="compare-remove" onClick={() => removeEvent(event._id)}>Remove</button>
                </div>

                <h3>{event.title}</h3>
                <p>{event.description}</p>

                <div className="compare-rows">
                  <div className="compare-row"><span>Date</span><strong>{new Date(event.date).toLocaleDateString()}</strong></div>
                  <div className="compare-row"><span>Time</span><strong>{event.time}</strong></div>
                  <div className="compare-row"><span>Location</span><strong>{event.location}</strong></div>
                  <div className="compare-row"><span>Price</span><strong>${event.price}</strong></div>
                  <div className="compare-row"><span>Seats Left</span><strong>{event.availableSeats}</strong></div>
                  <div className="compare-row"><span>Demand</span><strong>{Math.round(demandRatio(event) * 100)}%</strong></div>
                </div>

                <div className="compare-demand">
                  <span className="compare-demand-label">Demand Meter</span>
                  <div className="compare-demand-track">
                    <div
                      className="compare-demand-bar-fill"
                      data-width={`${Math.min(Math.round(demandRatio(event) * 100), 100)}%`}
                      style={{ width: `${Math.min(Math.round(demandRatio(event) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <button className="btn-primary compare-book" onClick={() => navigate(`/book/${event._id}`)}>
                  Book This Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compare;
