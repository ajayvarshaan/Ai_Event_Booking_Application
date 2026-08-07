import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { eventAPI, wishlistAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FaMagic, FaCalendarWeek, FaMoneyBillWave, FaFire, FaClock,
  FaGlobe, FaSun, FaBolt, FaUsers, FaCrown, FaHandshake,
  FaSearch, FaRobot, FaSync, FaHeart, FaRegHeart, FaMusic,
  FaFutbol, FaLaptopCode, FaBriefcase, FaGift
} from 'react-icons/fa';
import './Home.css';

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

type DiscoveryMode = 'all' | 'smart' | 'weekend' | 'budget' | 'almost-full' | 'soon';
type SortMode = 'smart' | 'date' | 'price-low' | 'price-high';
type VibeMode = 'all' | 'after-work' | 'high-energy' | 'family' | 'premium' | 'networking';
const COMPARE_STORAGE_KEY = 'eventhub.compareEvents';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [comparedEvents, setComparedEvents] = useState<Event[]>(() => {
    try {
      const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('smart');
  const [sortMode, setSortMode] = useState<SortMode>('smart');
  const [vibeMode, setVibeMode] = useState<VibeMode>('all');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [wishlistEventIds, setWishlistEventIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchExplanation, setAiSearchExplanation] = useState('');
  const [aiSearchEventIds, setAiSearchEventIds] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<{ text: string; events: Event[] } | null>(null);
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const eventsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const discoveryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const dealRadarRef = useRef<HTMLElement>(null);
  const statsAnimatedRef = useRef<HTMLDivElement>(null);

  // Hero floating orbs with parallax
  const heroOrb1Ref = useRef<HTMLDivElement>(null);
  const heroOrb2Ref = useRef<HTMLDivElement>(null);
  const heroOrb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventAPI.getAll();
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setToast({ message: 'Failed to load events', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(comparedEvents));
  }, [comparedEvents]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        setWishlistEventIds(new Set());
        setShowWishlistOnly(false);
        return;
      }

      try {
        const response = await wishlistAPI.get();
        const eventIds = Array.isArray(response.data?.events)
          ? response.data.events.map((event: Event) => event._id)
          : [];
        setWishlistEventIds(new Set(eventIds));
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  // ===== MASTER GSAP ANIMATIONS =====
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animations
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (titleRef.current) {
        const text = titleRef.current.textContent || '';
        titleRef.current.innerHTML = '';
        
        text.split(' ').forEach((word, wi) => {
          const wordSpan = document.createElement('span');
          wordSpan.style.display = 'inline-block';
          wordSpan.style.marginRight = '20px';
          wordSpan.style.opacity = '0';
          wordSpan.style.transform = 'translateY(60px) rotateX(60deg)';
          wordSpan.style.transformStyle = 'preserve-3d';
          
          word.split('').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.background = 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)';
            span.style.webkitBackgroundClip = 'text';
            span.style.webkitTextFillColor = 'transparent';
            span.style.backgroundClip = 'text';
            span.style.filter = 'drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3))';
            wordSpan.appendChild(span);
          });
          
          titleRef.current?.appendChild(wordSpan);
          const chars = wordSpan.querySelectorAll('span');
          
          heroTl.to(chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: 'back.out(2)'
          }, wi * 0.15);
        });

        // Word-level rise animation
        heroTl.to(titleRef.current.querySelectorAll('span'), {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          ease: 'back.out(1.8)'
        }, '-=0.4');
      }

      if (subtitleRef.current) {
        heroTl.fromTo(subtitleRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power4.out' },
          '-=0.6'
        );
      }

      // Hero background orbs floating
      if (heroOrb1Ref.current) {
        gsap.to(heroOrb1Ref.current, {
          x: 100,
          y: 50,
          scale: 1.3,
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
      if (heroOrb2Ref.current) {
        gsap.to(heroOrb2Ref.current, {
          x: -80,
          y: -60,
          scale: 1.2,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
      if (heroOrb3Ref.current) {
        gsap.to(heroOrb3Ref.current, {
          x: 60,
          y: -40,
          scale: 1.4,
          duration: 12,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // Hero parallax on scroll
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          y: -80,
          opacity: 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        });
      }

      // Discovery section reveal
      if (discoveryRef.current) {
        gsap.fromTo(discoveryRef.current,
          { opacity: 0, y: 80 },
          {
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
              trigger: discoveryRef.current,
              start: 'top 85%'
            }
          }
        );
      }

      // Discovery chips staggered entrance
      if (discoveryRef.current) {
        gsap.fromTo(discoveryRef.current.querySelectorAll('.discovery-chip'),
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: discoveryRef.current,
              start: 'top 80%'
            }
          }
        );
      }

      // Discovery metrics animated numbers
      if (statsAnimatedRef.current) {
        const metrics = Array.from(statsAnimatedRef.current.querySelectorAll('.discovery-metric strong')) as HTMLElement[];
        const numericMetrics: { el: HTMLElement; finalValue: number; prefix: string }[] = [];

        metrics.forEach((el) => {
          const text = el.textContent || '';
          const match = text.match(/(\d+)/);
          const prefix = text.includes('$') ? '$' : '';
          
          // Only animate metrics that are purely numeric (with optional $ prefix)
          if (match && /^[\$\d]+$/.test(text.replace(/\d+/, match[0]).trim())) {
            const finalValue = parseInt(match[0]);
            numericMetrics.push({ el, finalValue, prefix });
            el.textContent = '0';
            el.style.display = 'inline-block';
          }
        });

        gsap.fromTo(statsAnimatedRef.current.querySelectorAll('.discovery-metric'),
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: {
              trigger: statsAnimatedRef.current,
              start: 'top 85%'
            },
            onComplete: () => {
              numericMetrics.forEach(({ el, finalValue, prefix }) => {
                // Animate number counting
                const obj = { val: 0 };
                gsap.to(obj, {
                  val: finalValue,
                  duration: 1.2,
                  ease: 'power2.out',
                  onUpdate: () => {
                    el.textContent = prefix + Math.round(obj.val).toString();
                  }
                });
              });
            }
          }
        );
      }

      // Search & filter section reveal
      if (searchRef.current) {
        gsap.fromTo(searchRef.current,
          { opacity: 0, y: 80 },
          {
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
              trigger: searchRef.current,
              start: 'top 85%'
            }
          }
        );
      }

      // Vibe chips staggered
      if (searchRef.current) {
        gsap.fromTo(searchRef.current.querySelectorAll('.vibe-chip'),
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.07, ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: searchRef.current,
              start: 'top 80%'
            }
          }
        );
      }

      // Filter buttons staggered
      if (searchRef.current) {
        gsap.fromTo(searchRef.current.querySelectorAll('.filter-btn'),
          { opacity: 0, y: 25, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(1.6)',
            scrollTrigger: {
              trigger: searchRef.current.querySelector('.filter-buttons'),
              start: 'top 90%'
            }
          }
        );
      }

      // AI for you section
      if (aiSectionRef.current) {
        gsap.fromTo(aiSectionRef.current,
          { opacity: 0, y: 100, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
              trigger: aiSectionRef.current,
              start: 'top 85%'
            }
          }
        );
      }

      // Compare launchpad
      if (compareRef.current) {
        gsap.fromTo(compareRef.current,
          { opacity: 0, y: 80, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: {
              trigger: compareRef.current,
              start: 'top 85%'
            }
          }
        );
      }

      // Deal radar section
      if (dealRadarRef.current) {
        gsap.fromTo(dealRadarRef.current,
          { opacity: 0, y: 100 },
          {
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
              trigger: dealRadarRef.current,
              start: 'top 85%'
            }
          }
        );

        gsap.fromTo(dealRadarRef.current.querySelectorAll('.deal-radar-card'),
          { opacity: 0, y: 60, scale: 0.92 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.6)',
            scrollTrigger: {
              trigger: dealRadarRef.current,
              start: 'top 80%'
            }
          }
        );
      }

      // Event cards entrance
      if (eventsRef.current) {
        gsap.fromTo(eventsRef.current.querySelectorAll('.event-card'),
          { 
            opacity: 0, 
            y: 100, 
            scale: 0.9,
            rotationY: -12,
            transformPerspective: 800
          },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotationY: 0,
            duration: 1, 
            stagger: {
              amount: 0.8,
              from: 'start',
              ease: 'power2.out'
            },
            ease: 'power4.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: eventsRef.current,
              start: 'top 85%'
            }
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Re-trigger event cards animation when filteredEvents changes
  useEffect(() => {
    if (!loading && eventsRef.current) {
      const cards = eventsRef.current.querySelectorAll('.event-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { 
            opacity: 0, 
            y: 60, 
            scale: 0.9,
            rotationX: -10
          },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotationX: 0,
            duration: 0.8, 
            stagger: {
              amount: 0.5,
              from: 'start',
              ease: 'power2.out'
            },
            ease: 'power4.out',
            clearProps: 'transform'
          }
        );
      }
    }
  }, [loading, filteredEvents]);

  // Animate AI recommendation cards when they load
  useEffect(() => {
    if (aiRecommendations && aiRecommendations.events.length > 0) {
      const cards = document.querySelectorAll('.ai-recs-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 60, scale: 0.9, rotationY: -15 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.7)',
            transformPerspective: 800,
            clearProps: 'transform'
          }
        );
      }
    }
  }, [aiRecommendations]);

  // Handle chip clicks with GSAP feedback
  const handleDiscoveryClick = useCallback((mode: DiscoveryMode) => {
    gsap.fromTo('.discovery-chip.active',
      { scale: 1 },
      { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.in' }
    );
    setDiscoveryMode(mode);
  }, []);

  const handleVibeClick = useCallback((mode: VibeMode) => {
    gsap.fromTo('.vibe-chip.active',
      { scale: 1 },
      { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.in' }
    );
    setVibeMode(mode);
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    gsap.fromTo('.filter-btn.active',
      { scale: 1 },
      { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.in' }
    );
    setSelectedCategory(category);
  }, []);

  const getEventDate = (event: Event) => {
    const parsedDate = new Date(event.date);
    const [rawHours, rawMinutes] = event.time.split(':');

    if (!Number.isNaN(Number(rawHours)) && !Number.isNaN(Number(rawMinutes))) {
      parsedDate.setHours(Number(rawHours), Number(rawMinutes), 0, 0);
    }

    return parsedDate;
  };

  const getDaysUntilEvent = (event: Event) => {
    const diff = getEventDate(event).getTime() - Date.now();
    return diff / (1000 * 60 * 60 * 24);
  };

  const getDemandRatio = (event: Event) => {
    if (event.capacity <= 0) {
      return 0;
    }

    return (event.capacity - event.availableSeats) / event.capacity;
  };

  const isWeekendEvent = (event: Event) => {
    const day = getEventDate(event).getDay();
    return day === 0 || day === 6;
  };

  const isUpcomingSoon = (event: Event, maxDays: number) => {
    const daysUntil = getDaysUntilEvent(event);
    return daysUntil >= 0 && daysUntil <= maxDays;
  };

  const getEventHour = (event: Event) => {
    const [rawHours] = event.time.split(':');
    return Number(rawHours) || 0;
  };

  const matchesVibe = (event: Event, vibe: VibeMode) => {
    if (vibe === 'all') return true;
    if (vibe === 'after-work') return getEventHour(event) >= 17;
    if (vibe === 'high-energy') return event.category === 'music' || event.category === 'sports';
    if (vibe === 'family') return event.price <= 60 && event.availableSeats >= 20;
    if (vibe === 'premium') return event.price >= 80 || event.category === 'business';
    if (vibe === 'networking') return event.category === 'business' || event.category === 'tech';
    return true;
  };

  const getSmartScore = (event: Event) => {
    const urgencyScore = Math.max(0, 1 - Math.min(Math.max(getDaysUntilEvent(event), 0), 30) / 30);
    const demandScore = getDemandRatio(event);
    const priceScore = event.price <= 0 ? 1 : Math.max(0, 1 - Math.min(event.price, 150) / 150);

    return urgencyScore * 45 + demandScore * 40 + priceScore * 15;
  };

  useEffect(() => {
    let filtered = [...events];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by wishlist
    if (showWishlistOnly) {
      filtered = filtered.filter(event => wishlistEventIds.has(event._id));
    }

    if (vibeMode !== 'all') {
      filtered = filtered.filter(event => matchesVibe(event, vibeMode));
    }

    // Discovery lenses
    if (discoveryMode === 'weekend') {
      filtered = filtered.filter(event => isWeekendEvent(event) && getDaysUntilEvent(event) >= 0);
    }

    if (discoveryMode === 'budget') {
      filtered = filtered.filter(event => event.price <= 50);
    }

    if (discoveryMode === 'almost-full') {
      filtered = filtered.filter(event => getDemandRatio(event) >= 0.75);
    }

    if (discoveryMode === 'soon') {
      filtered = filtered.filter(event => isUpcomingSoon(event, 7));
    }

    // Sorting
    if (sortMode === 'smart') {
      filtered.sort((a, b) => getSmartScore(b) - getSmartScore(a));
    }

    if (sortMode === 'date') {
      filtered.sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());
    }

    if (sortMode === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (sortMode === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, discoveryMode, sortMode, vibeMode, showWishlistOnly, wishlistEventIds, events]);

  const handleBook = (eventId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/book/${eventId}`);
  };

  const handleDelete = (eventId: string) => {
    setSelectedEventId(eventId);
    setModalOpen(true);
  };

  const handleEdit = (eventId: string) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleWishlistChange = (eventId: string, isInWishlist: boolean) => {
    setWishlistEventIds((prev) => {
      const next = new Set(prev);
      if (isInWishlist) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  };

  const handleToggleCompare = (event: Event) => {
    setComparedEvents((prev) => {
      const alreadyCompared = prev.some((item) => item._id === event._id);

      if (alreadyCompared) {
        return prev.filter((item) => item._id !== event._id);
      }

      if (prev.length >= 3) {
        setToast({ message: 'You can compare up to 3 events at a time.', type: 'info' });
        return prev;
      }

      return [...prev, event];
    });
  };

  const clearComparedEvents = () => {
    setComparedEvents([]);
  };

  const openComparePage = () => {
    navigate('/compare');
  };

  const handleAiSearch = async () => {
    if (!searchQuery.trim() || !isAuthenticated) return;

    setAiSearchLoading(true);
    setAiSearchExplanation('');
    setAiSearchEventIds([]);

    try {
      const response = await aiAPI.search(searchQuery.trim());
      setAiSearchExplanation(response.data.explanation);
      setAiSearchEventIds(response.data.eventIds);
    } catch (error) {
      console.error('AI search error:', error);
      setToast({ message: 'AI search failed. Please try again.', type: 'error' });
    } finally {
      setAiSearchLoading(false);
    }
  };

  const loadAiRecommendations = async () => {
    if (!isAuthenticated) return;

    setAiRecsLoading(true);
    setAiRecommendations(null);

    try {
      const response = await aiAPI.personalized(3);
      const { recommendations, eventIds } = response.data;

      // Map recommended event IDs to full event objects
      const recEvents = events.filter((event) => eventIds.includes(event._id));

      // If Gemini didn't return proper IDs, fall back to smart picks based on user
      if (recEvents.length === 0 && eventIds.length === 0) {
        const fallbackEvents = [...events]
          .sort((a, b) => getSmartScore(b) - getSmartScore(a))
          .slice(0, 3);
        setAiRecommendations({
          text: recommendations,
          events: fallbackEvents
        });
      } else {
        setAiRecommendations({
          text: recommendations,
          events: recEvents
        });
      }
    } catch (error) {
      console.error('AI recommendations error:', error);
      setToast({ message: 'Failed to load AI recommendations.', type: 'error' });
    } finally {
      setAiRecsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEventId) return;
    
    try {
      await eventAPI.delete(selectedEventId);
      setEvents(events.filter((e) => e._id !== selectedEventId));
      setModalOpen(false);
      setSelectedEventId(null);
      setToast({ message: 'Event deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to delete event:', error);
      setModalOpen(false);
      setToast({ message: 'Failed to delete event', type: 'error' });
    }
  };

  const refreshEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data);
      setFilteredEvents(response.data);
      setToast({ message: 'Events refreshed!', type: 'info' });
    } catch (error) {
      console.error('Failed to refresh events:', error);
    }
  };

  // Refresh events when component mounts or when returning from edit
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshEvents();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const dealRadarEvents = useMemo(() => {
    const upcoming = events.filter((event) => {
      const days = getDaysUntilEvent(event);
      return days >= 0 && days <= 21;
    });

    if (upcoming.length === 0) {
      return [] as Event[];
    }

    const prices = upcoming.map((event) => event.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = Math.max(maxPrice - minPrice, 1);

    return [...upcoming]
      .map((event) => {
        const normalizedPrice = (event.price - minPrice) / priceRange;
        const valueScore = 1 - normalizedPrice;
        const urgencyScore = Math.max(0, 1 - Math.min(getDaysUntilEvent(event), 21) / 21);
        const demandScore = getDemandRatio(event);
        const radarScore = valueScore * 0.55 + urgencyScore * 0.3 + demandScore * 0.15;

        return {
          event,
          radarScore
        };
      })
      .sort((a, b) => b.radarScore - a.radarScore)
      .slice(0, 3)
      .map((item) => item.event);
  }, [events]);

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  const highDemandCount = filteredEvents.filter((event) => getDemandRatio(event) >= 0.75).length;
  const averagePrice = filteredEvents.length > 0
    ? Math.round(filteredEvents.reduce((total, event) => total + event.price, 0) / filteredEvents.length)
    : 0;

  const activeDiscoveryLabel = {
    all: 'All events',
    smart: 'Smart Picks',
    weekend: 'Weekend Plans',
    budget: 'Budget Friendly',
    'almost-full': 'Almost Gone',
    soon: 'Happening Soon'
  }[discoveryMode];
  const activeVibeLabel = {
    all: 'Any Vibe',
    'after-work': 'After Work',
    'high-energy': 'High Energy',
    family: 'Family Friendly',
    premium: 'Premium',
    networking: 'Networking'
  }[vibeMode];

  return (
    <div className="home" ref={pageRef}>
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
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone and all bookings will be affected."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
      
      {/* ===== Enhanced Hero Section ===== */}
      <div className="hero" ref={heroRef}>
        <div className="hero-bg-shape shape-1"></div>
        <div className="hero-bg-shape shape-2"></div>
        <div className="hero-bg-shape shape-3"></div>
        <div className="hero-orb hero-orb-1" ref={heroOrb1Ref}></div>
        <div className="hero-orb hero-orb-2" ref={heroOrb2Ref}></div>
        <div className="hero-orb hero-orb-3" ref={heroOrb3Ref}></div>
        <div className="hero-grid-overlay"></div>
        
        <h1 ref={titleRef}>Discover Amazing Events</h1>
        <p ref={subtitleRef}>Book your favorite events and create unforgettable memories</p>
        
        <div className="hero-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-line">
            <div className="scroll-dot"></div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ===== Discovery Studio ===== */}
        <div className="discovery-studio" ref={discoveryRef}>
          <div className="discovery-copy">
            <span className="discovery-kicker">Discovery Studio</span>
            <h2>Find events by momentum, urgency, and value</h2>
            <p>Use quick-pick lenses to surface the events people are most likely to book next.</p>
          </div>

          <div className="discovery-controls">
            <div className="discovery-chips">
              <button
                className={`discovery-chip ${discoveryMode === 'smart' ? 'active' : ''}`}
                onClick={() => handleDiscoveryClick('smart')}
              >
                <FaMagic style={{ marginRight: '6px' }} /> Smart Picks
              </button>
              <button
                className={`discovery-chip ${discoveryMode === 'weekend' ? 'active' : ''}`}
                onClick={() => handleDiscoveryClick('weekend')}
              >
                <FaCalendarWeek style={{ marginRight: '6px' }} /> Weekend Plans
              </button>
              <button
                className={`discovery-chip ${discoveryMode === 'budget' ? 'active' : ''}`}
                onClick={() => handleDiscoveryClick('budget')}
              >
                <FaMoneyBillWave style={{ marginRight: '6px' }} /> Budget Friendly
              </button>
              <button
                className={`discovery-chip ${discoveryMode === 'almost-full' ? 'active' : ''}`}
                onClick={() => handleDiscoveryClick('almost-full')}
              >
                <FaFire style={{ marginRight: '6px' }} /> Almost Gone
              </button>
              <button
                className={`discovery-chip ${discoveryMode === 'soon' ? 'active' : ''}`}
                onClick={() => handleDiscoveryClick('soon')}
              >
                <FaClock style={{ marginRight: '6px' }} /> Happening Soon
              </button>
              <button
                className={`discovery-chip ${discoveryMode === 'all' ? 'active' : ''}`}
                onClick={() => handleDiscoveryClick('all')}
              >
                <FaGlobe style={{ marginRight: '6px' }} /> View All
              </button>
            </div>

            <label className="sort-control">
              <span>Sort</span>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
                <option value="smart">Smart Match</option>
                <option value="date">Soonest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
          </div>

          <div className="discovery-metrics" ref={statsAnimatedRef}>
            <div className="discovery-metric">
              <span className="metric-label">Active Lens</span>
              <strong data-original={activeDiscoveryLabel}>{activeDiscoveryLabel}</strong>
            </div>
            <div className="discovery-metric">
              <span className="metric-label">Active Vibe</span>
              <strong data-original={activeVibeLabel}>{activeVibeLabel}</strong>
            </div>
            <div className="discovery-metric">
              <span className="metric-label">Matching Events</span>
              <strong data-original={filteredEvents.length.toString()}>{filteredEvents.length}</strong>
            </div>
            <div className="discovery-metric">
              <span className="metric-label">High Demand</span>
              <strong data-original={highDemandCount.toString()}>{highDemandCount}</strong>
            </div>
            <div className="discovery-metric">
              <span className="metric-label">Average Price</span>
              <strong data-original={`$${averagePrice}`}>{`$${averagePrice}`}</strong>
            </div>
          </div>
        </div>

        {/* ===== Search & Filter Section ===== */}
        <div className="search-filter-section" ref={searchRef}>
          <div className="vibe-studio">
            <div className="vibe-copy">
              <span className="vibe-kicker">Vibe Match</span>
              <h3>Browse by mood, not only by category</h3>
              <p>Switch between intent-based vibes to discover the right event for the moment.</p>
            </div>
            <div className="vibe-chips">
              <button className={`vibe-chip ${vibeMode === 'all' ? 'active' : ''}`} onClick={() => handleVibeClick('all')}>Any Vibe</button>
              <button className={`vibe-chip ${vibeMode === 'after-work' ? 'active' : ''}`} onClick={() => handleVibeClick('after-work')}><FaSun style={{ marginRight: '6px' }} /> After Work</button>
              <button className={`vibe-chip ${vibeMode === 'high-energy' ? 'active' : ''}`} onClick={() => handleVibeClick('high-energy')}><FaBolt style={{ marginRight: '6px' }} /> High Energy</button>
              <button className={`vibe-chip ${vibeMode === 'family' ? 'active' : ''}`} onClick={() => handleVibeClick('family')}><FaUsers style={{ marginRight: '6px' }} /> Family</button>
              <button className={`vibe-chip ${vibeMode === 'premium' ? 'active' : ''}`} onClick={() => handleVibeClick('premium')}><FaCrown style={{ marginRight: '6px' }} /> Premium</button>
              <button className={`vibe-chip ${vibeMode === 'networking' ? 'active' : ''}`} onClick={() => handleVibeClick('networking')}><FaHandshake style={{ marginRight: '6px' }} /> Networking</button>
            </div>
          </div>

          <div className="search-box">
            <span className="search-icon"><FaSearch /></span>
            <input
              type="text"
              placeholder={
                isAiSearch
                  ? 'Ask AI: e.g. "jazz concerts under $50 this weekend"'
                  : 'Search events by title, description, or location...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isAiSearch) {
                  handleAiSearch();
                }
              }}
              className="search-input"
            />
            {isAuthenticated && (
              <button
                className={`ai-search-toggle ${isAiSearch ? 'active' : ''}`}
                onClick={() => {
                  setIsAiSearch((prev) => !prev);
                  setAiSearchExplanation('');
                  setAiSearchEventIds([]);
                }}
                title={isAiSearch ? 'Switch to keyword search' : 'Try AI-powered search'}
              >
                <FaRobot style={{ marginRight: '4px' }} /> AI
              </button>
            )}
            <button 
              className="refresh-btn" 
              onClick={isAiSearch ? handleAiSearch : refreshEvents}
              title={isAiSearch ? 'Run AI search' : 'Refresh events'}
            >
              {isAiSearch ? (aiSearchLoading ? <FaClock /> : <FaMagic />) : <FaSync />}
            </button>
          </div>
          
          {aiSearchExplanation && (
            <div className="ai-search-result">
              <p className="ai-search-explanation"><FaRobot style={{ marginRight: '8px' }} /> {aiSearchExplanation}</p>
            </div>
          )}
          
          {isAiSearch && aiSearchEventIds.length === 0 && aiSearchExplanation && !aiSearchLoading && (
            <div className="ai-search-empty">
              <p>Try a different query like "music events" or "events under $50".</p>
            </div>
          )}
          
          <div className="filter-buttons">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('all')}
            >
              All Events
            </button>
            {isAuthenticated && (
              <button
                className={`filter-btn wishlist-filter-btn ${showWishlistOnly ? 'active' : ''}`}
                onClick={() => setShowWishlistOnly((prev) => !prev)}
              >
                {showWishlistOnly ? <><FaHeart style={{ marginRight: '6px' }} /> Wishlist Only</> : <><FaRegHeart style={{ marginRight: '6px' }} /> Wishlist</>}
              </button>
            )}
            <button
              className={`filter-btn ${selectedCategory === 'music' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('music')}
            >
              <FaMusic style={{ marginRight: '6px' }} /> Music
            </button>
            <button
              className={`filter-btn ${selectedCategory === 'sports' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('sports')}
            >
              <FaFutbol style={{ marginRight: '6px' }} /> Sports
            </button>
            <button
              className={`filter-btn ${selectedCategory === 'tech' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('tech')}
            >
              <FaLaptopCode style={{ marginRight: '6px' }} /> Tech
            </button>
            <button
              className={`filter-btn ${selectedCategory === 'business' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('business')}
            >
              <FaBriefcase style={{ marginRight: '6px' }} /> Business
            </button>
            <button
              className={`filter-btn ${selectedCategory === 'other' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('other')}
            >
              <FaGift style={{ marginRight: '6px' }} /> Other
            </button>
          </div>
        </div>

        {isAuthenticated && (
          <section className="ai-for-you-section" ref={aiSectionRef}>
            <div className="ai-for-you-header">
              <div>
                <span className="ai-for-you-kicker"><FaMagic style={{ marginRight: '4px' }} /> AI For You</span>
                <h3>Personalized recommendations based on your activity</h3>
                <p>Gemini analyzes your bookings and wishlist to suggest events you'll love.</p>
              </div>
              <button
                className="ai-recs-btn"
                onClick={loadAiRecommendations}
                disabled={aiRecsLoading}
              >
                {aiRecsLoading ? <><FaClock style={{ marginRight: '6px' }} /> Analyzing...</> : <><FaMagic style={{ marginRight: '6px' }} /> Get My Recommendations</>}
              </button>
            </div>

            {aiRecsLoading && (
              <div className="ai-recs-loading"><FaMagic style={{ marginRight: '8px' }} /> Gemini is analyzing your preferences...</div>
            )}

            {aiRecommendations && !aiRecsLoading && (
              <div className="ai-recs-content">
                <div className="ai-recs-explanation">
                  <p className="ai-recs-text" style={{ whiteSpace: 'pre-wrap' }}>{aiRecommendations.text}</p>
                </div>
                {aiRecommendations.events.length > 0 && (
                  <div className="ai-recs-grid">
                    {aiRecommendations.events.map((event) => (
                      <article key={event._id} className="ai-recs-card">
                        <img src={event.image} alt={event.title} />
                        <div className="ai-recs-card-body">
                          <div className="ai-recs-top">
                            <span className="ai-recs-tag">{event.category}</span>
                            <strong>${event.price}</strong>
                          </div>
                          <h4>{event.title}</h4>
                          <p>{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                          <p>{event.location}</p>
                          <div className="ai-recs-actions">
                            <button className="btn-primary" onClick={() => handleBook(event._id)}>
                              Book Now
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => handleToggleCompare(event)}
                            >
                              {comparedEvents.some((item) => item._id === event._id) ? 'Compared' : 'Compare'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {comparedEvents.length > 0 && (
          <div className="compare-launchpad" ref={compareRef}>
            <div>
              <span className="compare-launch-kicker">Compare Ready</span>
              <h3>{comparedEvents.length} event{comparedEvents.length > 1 ? 's' : ''} selected</h3>
              <p>Open the Compare page for a full side-by-side breakdown.</p>
            </div>
            <div className="compare-launch-actions">
              <button className="btn-secondary" onClick={clearComparedEvents}>Clear</button>
              <button className="btn-primary" onClick={openComparePage}>Open Compare Page</button>
            </div>
          </div>
        )}

        {dealRadarEvents.length > 0 && (
          <section className="deal-radar-section" ref={dealRadarRef}>
            <div className="deal-radar-header">
              <span className="deal-radar-kicker">Deal Radar</span>
              <h3>Best value events this week</h3>
              <p>Ranked by price value, urgency, and demand so you can book smarter.</p>
            </div>

            <div className="deal-radar-grid">
              {dealRadarEvents.map((event) => (
                <article key={event._id} className="deal-radar-card">
                  <img src={event.image} alt={event.title} />
                  <div className="deal-radar-body">
                    <div className="deal-radar-top">
                      <strong>{event.title}</strong>
                      <span>{event.category}</span>
                    </div>
                    <p>{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                    <div className="deal-radar-meta">
                      <span>Price: ${event.price}</span>
                      <span>Seats left: {event.availableSeats}</span>
                    </div>
                    <button className="btn-primary" onClick={() => handleBook(event._id)}>
                      Book Deal
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <h2>No Events Available</h2>
            <p>There are currently no events to display. Check back later!</p>
            {isAuthenticated && (
              <p className="admin-hint">Are you an admin? <a href="/create-event">Create an event</a></p>
            )}
          </div>
        ) : (
          <div ref={eventsRef} className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onBook={handleBook}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onWishlistChange={handleWishlistChange}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedEvents.some((item) => item._id === event._id)}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;