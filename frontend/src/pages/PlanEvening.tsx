import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, aiAPI } from '../services/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PlanEvening.css';

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

type EveningVibe = 'any' | 'high-energy' | 'networking' | 'chill' | 'after-work';
type PlanMode = 'flexible' | 'single-night';

const PlanEvening: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [vibe, setVibe] = useState<EveningVibe>('any');
  const [mode, setMode] = useState<PlanMode>('flexible');
  const [maxBudget, setMaxBudget] = useState(120);
  const [startHour, setStartHour] = useState(8);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [aiItinerary, setAiItinerary] = useState<string>('');
  const [aiItineraryLoading, setAiItineraryLoading] = useState(false);
const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const aiBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventAPI.getAll();
        const eventData = response.data;
        console.log('=== PLAN EVENING DEBUG ===');
        console.log('API Response:', response);
        console.log('Fetched events count:', eventData.length);
        console.log('Fetched events:', eventData);
        if (eventData.length > 0) {
          console.log('First event sample:', eventData[0]);
          console.log('Event date:', eventData[0].date);
          console.log('Event time:', eventData[0].time);
          console.log('Event price:', eventData[0].price);
        }
        setEvents(eventData);
      } catch (error) {
        console.error('Failed to fetch events for evening planner:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  useEffect(() => {
    const ctx = gsap.context(() => {
      
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: 120, y: 80, scale: 1.4, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }
      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: -100, y: -60, scale: 1.3, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }
      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          x: 80, y: -70, scale: 1.5, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      
      if (titleRef.current) {
        const words = titleRef.current.textContent?.split(' ') || [];
        titleRef.current.textContent = '';
        words.forEach((word, wi) => {
          const wordSpan = document.createElement('span');
          wordSpan.style.display = 'inline-block';
          wordSpan.style.marginRight = '0.35em';
          wordSpan.style.opacity = '0';
          wordSpan.style.transform = 'translateY(60px) rotateX(60deg)';
          wordSpan.style.transformStyle = 'preserve-3d';
          wordSpan.textContent = word;
          titleRef.current?.appendChild(wordSpan);
          tl.to(wordSpan, {
            opacity: 1, y: 0, rotationX: 0, duration: 0.7, ease: 'back.out(1.8)'
          }, wi * 0.12);
        });
      }

      
      if (headerRef.current) {
        const p = headerRef.current.querySelector('p');
        if (p) {
          tl.fromTo(p, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power4.out' }, '-=0.4');
        }
      }

      
      if (controlsRef.current) {
        tl.fromTo(controlsRef.current.querySelectorAll('.planner-control'),
          { opacity: 0, y: 60, scale: 0.9, rotationY: -12 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.7, stagger: 0.1,
            ease: 'back.out(1.7)', transformPerspective: 800
          },
          '-=0.3'
        );
      }

      
      if (summaryRef.current) {
        tl.fromTo(summaryRef.current.querySelectorAll('.summary-item'),
          { opacity: 0, y: 40, scale: 0.85 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'back.out(1.7)',
            onComplete: () => {
              summaryRef.current?.querySelectorAll('.summary-item strong').forEach((el) => {
                const target = el as HTMLElement;
                const text = target.textContent || '0';
                const match = text.match(/[\d,]+(?:\.\d+)?/);
                if (match) {
                  const prefix = text.includes('$') ? '$' : '';
                  const finalValue = parseFloat(match[0].replace(/,/g, ''));
                  const obj = { val: 0 };
                  gsap.to(obj, {
                    val: finalValue, duration: 1.2, ease: 'power2.out',
                    onUpdate: () => {
                      target.textContent = prefix + (finalValue % 1 !== 0 ? obj.val.toFixed(2) : Math.round(obj.val).toString());
                    }
                  });
                }
              });
            }
          },
          '-=0.4'
        );
      }

      
      if (actionsRef.current) {
        tl.fromTo(actionsRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        );
      }

      
      if (aiBtnRef.current) {
        gsap.to(aiBtnRef.current, {
          boxShadow: '0 0 30px rgba(240,147,251,0.9), 0 0 60px rgba(102,126,234,0.6)',
          duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }

      
      if (planRef.current) {
        gsap.fromTo(planRef.current.querySelectorAll('.plan-event-card'),
          { opacity: 0, y: 100, scale: 0.9, rotationY: -18 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.9, stagger: 0.15,
            ease: 'back.out(1.6)', transformPerspective: 900,
            scrollTrigger: { trigger: planRef.current, start: 'top 85%' }
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  
  useEffect(() => {
    if (!loading && planRef.current) {
      const cards = planRef.current.querySelectorAll('.plan-event-card');
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
  }, [vibe, maxBudget, startHour, events, loading]);

  
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
      scale: 1.04,
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

  
  useEffect(() => {
    if (aiItinerary && planRef.current) {
      const cards = planRef.current.querySelectorAll('.plan-event-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 60, scale: 0.92, rotationY: -12 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.7, stagger: 0.12,
            ease: 'back.out(1.6)', transformPerspective: 800
          }
        );
      }
    }
  }, [aiItinerary]);

  const parseEventDateTime = (event: Event) => {
    
    const date = new Date(event.date);
    const [hoursStr, minutesStr] = event.time.split(':');
    const hours = Number(hoursStr) || 0;
    const minutes = Number(minutesStr) || 0;
    
    
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
    return localDate;
  };

  const getDemandRatio = (event: Event) => {
    if (event.capacity <= 0) return 0;
    return (event.capacity - event.availableSeats) / event.capacity;
  };

  const vibeMatch = (event: Event) => {
    if (vibe === 'any') return true;
    if (vibe === 'high-energy') return event.category === 'music' || event.category === 'sports';
    if (vibe === 'networking') return event.category === 'business' || event.category === 'tech';
    if (vibe === 'chill') return event.category === 'other' || event.price <= 40;
    if (vibe === 'after-work') {
      const dt = parseEventDateTime(event);
      return dt.getHours() >= 17;
    }
    return true;
  };

  const plannedEvents = useMemo(() => {
    if (!events || events.length === 0) {
      console.log('No events in state');
      return [];
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    console.log('Current date (midnight):', now);

    const upcoming = events
      .filter((event) => {
        try {
          const dt = parseEventDateTime(event);
          const eventHour = dt.getHours();
          const afterStartHour = eventHour >= startHour;
          
          console.log(`Event: ${event.title}`);
          console.log(`  Parsed DateTime: ${dt}`);
          console.log(`  Event Hour: ${eventHour}, Start Hour: ${startHour}, After Start: ${afterStartHour}`);
          console.log(`  Price: $${event.price}, Max Budget: $${maxBudget}, Within Budget: ${event.price <= maxBudget}`);
          console.log(`  Vibe Match: ${vibeMatch(event)}`);
          
          return afterStartHour;
        } catch (e) {
          console.warn('Error parsing event:', event, e);
          return false;
        }
      })
      .filter((event) => {
        const pass = event.price <= maxBudget;
        console.log(`Budget filter for ${event.title}: ${pass}`);
        return pass;
      })
      .filter((event) => {
        const pass = vibeMatch(event);
        console.log(`Vibe filter for ${event.title}: ${pass}`);
        return pass;
      });
    
    console.log('=== FILTER RESULTS ===');
    console.log('Total events:', events.length);
    console.log('Upcoming events after all filters:', upcoming.length);
    console.log('Upcoming events:', upcoming);

    const scored = upcoming
      .map((event) => {
        const dt = parseEventDateTime(event);
        const eventDate = new Date(dt);
        eventDate.setHours(0, 0, 0, 0);
        const daysAway = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        
        const normalizedDays = Math.min(daysAway, 365);
        const soonScore = Math.max(0, 1 - normalizedDays / 365);
        const valueScore = Math.max(0, 1 - Math.min(event.price, maxBudget) / Math.max(maxBudget, 1));
        const demandScore = getDemandRatio(event);
        const totalScore = (soonScore * 45 + valueScore * 35 + demandScore * 20) / 100;
        
        return { event, score: Math.round(totalScore * 100), dateTime: dt };
      })
      .sort((a, b) => b.score - a.score);
    
    console.log('Scored events count:', scored.length);
    console.log('Scored events:', scored);

    console.log('Mode:', mode);
    if (mode === 'single-night') {
      const byDay = new Map<string, typeof scored>();

      for (const item of scored) {
        const dayKey = item.dateTime.toDateString();
        const bucket = byDay.get(dayKey);
        if (bucket) {
          bucket.push(item);
        } else {
          byDay.set(dayKey, [item]);
        }
      }

      let bestDayPlan: typeof scored = [];
      let bestDayScore = -1;

      for (const [, dayItems] of byDay) {
        const topForDay = [...dayItems]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

        const total = topForDay.reduce((sum, item) => sum + item.score, 0);
        if (topForDay.length > 0 && total > bestDayScore) {
          bestDayScore = total;
          bestDayPlan = topForDay;
        }
      }

      return bestDayPlan;
    }

    const itinerary: typeof scored = [];
    const occupiedDays = new Set<string>();

    for (const item of scored) {
      const dayKey = item.dateTime.toDateString();
      if (occupiedDays.has(dayKey)) continue;
      itinerary.push(item);
      occupiedDays.add(dayKey);
      if (itinerary.length >= 3) break;
    }

    return itinerary;
  }, [events, maxBudget, startHour, vibe, mode]);

  const handleGenerateAIItinerary = async () => {
    if (aiItineraryLoading) return;

    setAiItineraryLoading(true);
    setAiItinerary('');

    try {
      const response = await aiAPI.itinerary({
        vibe,
        maxBudget,
        startHour,
        mode
      });
      setAiItinerary(response.data.itinerary);

// Trigger animation on AI cards
      setTimeout(() => {
        if (planRef.current) {
          const cards = planRef.current.querySelectorAll('.plan-event-card');
          if (cards.length > 0) {
            gsap.fromTo(cards,
              { opacity: 0, y: 60, scale: 0.92, rotationY: -12 },
              {
                opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.7, stagger: 0.12,
                ease: 'back.out(1.6)', transformPerspective: 800
              }
            );
          }
        }
      }, 100);
    } catch (error) {
      console.error('AI itinerary error:', error);
      setAiItinerary('⚠️ Failed to generate AI itinerary. Please try again.');
    } finally {
      setAiItineraryLoading(false);
    }
  };

  const handleSharePlan = async () => {
    if (plannedEvents.length === 0) {
      setShareState('failed');
      return;
    }

    const headline =
      mode === 'single-night' ? 'My EventHub single-night plan' : 'My EventHub evening plan';
    const lines = plannedEvents.map(
      ({ event }) =>
        `- ${event.title} | ${new Date(event.date).toLocaleDateString()} ${event.time} | ${event.location} | $${event.price}`
    );
    const summary = `${headline}\nBudget cap: $${maxBudget} | Start after: ${String(startHour).padStart(2, '0')}:00 | Vibe: ${vibe}\n\n${lines.join('\n')}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setShareState('copied');
    } catch {
      setShareState('failed');
    }

    window.setTimeout(() => setShareState('idle'), 1800);
  };

  const estimatedSpend = plannedEvents.reduce((sum, item) => sum + item.event.price, 0);

  if (loading) {
    return <div className="loading">Building your evening planner...</div>;
  }

return (
    <div className="plan-evening-page" ref={pageRef}>
      <div className="plan-orb plan-orb-1" ref={orb1Ref}></div>
      <div className="plan-orb plan-orb-2" ref={orb2Ref}></div>
      <div className="plan-orb plan-orb-3" ref={orb3Ref}></div>
      <div className="container plan-evening-content">
        <div className="plan-header" ref={headerRef}>
          <h1 ref={titleRef}>Plan My Evening</h1>
          <p>Generate a smart event itinerary by vibe, budget, and preferred start time.</p>
        </div>

        <div className="planner-controls" ref={controlsRef}>
          <div className="planner-control planner-mode">
            <span>Itinerary Mode</span>
            <div className="mode-toggle">
              <button
                type="button"
                className={mode === 'flexible' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('flexible')}
              >
                Flexible
              </button>
              <button
                type="button"
                className={mode === 'single-night' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('single-night')}
              >
                One Night
              </button>
            </div>
          </div>

          <label className="planner-control">
            <span>Vibe</span>
            <select value={vibe} onChange={(e) => setVibe(e.target.value as EveningVibe)}>
              <option value="any">Any</option>
              <option value="high-energy">High Energy</option>
              <option value="networking">Networking</option>
              <option value="chill">Chill</option>
              <option value="after-work">After Work</option>
            </select>
          </label>

          <label className="planner-control">
            <span>Max Budget (${maxBudget})</span>
            <input
              type="range"
              min={20}
              max={250}
              step={5}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
            />
          </label>

          <label className="planner-control">
            <span>Start After ({String(startHour).padStart(2, '0')}:00)</span>
            <input
              type="range"
              min={8}
              max={22}
              step={1}
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
            />
          </label>
        </div>

<div className="planner-summary" ref={summaryRef}>
          <div className="summary-item">
            <span>Selected Events</span>
            <strong>{plannedEvents.length}</strong>
          </div>
          <div className="summary-item">
            <span>Estimated Spend</span>
            <strong>${estimatedSpend.toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Vibe</span>
            <strong>{vibe === 'any' ? 'Any' : vibe.replace('-', ' ')}</strong>
          </div>
          <div className="summary-item">
            <span>Mode</span>
            <strong>{mode === 'single-night' ? 'One Night' : 'Flexible'}</strong>
          </div>
        </div>

        <div className="planner-actions" ref={actionsRef}>
          <button
            ref={aiBtnRef}
            type="button"
            className="btn-ai"
            onClick={handleGenerateAIItinerary}
            disabled={aiItineraryLoading}
          >
            {aiItineraryLoading ? '⏳ Gemini is planning...' : '✨ Generate AI Itinerary'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleSharePlan}
            disabled={plannedEvents.length === 0}
          >
            Share This Plan
          </button>
          {shareState === 'copied' && <span className="share-status success">Plan copied</span>}
          {shareState === 'failed' && (
            <span className="share-status error">Unable to copy right now</span>
          )}
        </div>

        {aiItinerary && (
          <div className="ai-itinerary-box">
            <div className="ai-itinerary-header">
              <span className="ai-itinerary-badge">🤖 Gemini Smart Plan</span>
            </div>
            <p className="ai-itinerary-content" style={{ whiteSpace: 'pre-wrap' }}>
              {aiItinerary}
            </p>
          </div>
        )}

        {plannedEvents.length === 0 ? (
          <div className="plan-empty">
            <h2>No matching evening plan right now</h2>
            <p>Try a higher budget or a broader vibe to discover more options.</p>
          </div>
        ) : (
          <div ref={planRef} className="plan-grid">
{plannedEvents.map(({ event, score }) => (
              <article
                key={event._id}
                className="plan-event-card"
                onMouseMove={handleCardMove}
                onMouseLeave={handleCardLeave}
              >
                <img src={event.image} alt={event.title} className="plan-event-image" />
                <div className="plan-event-body">
                  <div className="plan-event-top">
                    <span className="plan-chip">{event.category}</span>
                    <span className="plan-score">Fit {score}%</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="plan-event-meta">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>🕐 {event.time}</span>
                    <span>📍 {event.location}</span>
                    <span>💰 ${event.price}</span>
                  </div>
                  <button className="btn-primary" onClick={() => navigate(`/book/${event._id}`)}>
                    Book This Plan
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanEvening;
