import React, { useEffect, useState, useRef, useCallback } from 'react';
import { bookingAPI, eventAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FaUsers, FaMoneyBillWave, FaTicketAlt, FaChair, FaChartLine,
  FaTimesCircle, FaMoneyBillAlt, FaSearch, FaMagic, FaGift,
FaCheckCircle, FaExclamationCircle, FaUser, FaBolt,
  FaFire, FaDollarSign, FaBalanceScale
} from 'react-icons/fa';
import './Dashboard.css';

gsap.registerPlugin(ScrollTrigger);

interface UserBookingStat {
  _id: string;
  userName: string;
  userEmail: string;
  totalBookings: number;
  totalSeats: number;
  totalSpent: number;
  events: {
    eventTitle: string;
    seats: number;
    totalPrice: number;
    bookingDate: string;
  }[];
}

interface CanceledBookingStat {
  _id: string;
  userName: string;
  userEmail: string;
  totalCanceled: number;
  totalSeats: number;
  totalRefunded: number;
  events: {
    eventTitle: string;
    seats: number;
    totalPrice: number;
    canceledDate: string;
  }[];
}

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalBookings: number;
  totalSeats: number;
  averageSpentPerUser: number;
  totalCanceledBookings: number;
  totalRefundedAmount: number;
}

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

const Dashboard: React.FC = () => {
  const [userBookingStats, setUserBookingStats] = useState<UserBookingStat[]>([]);
  const [canceledBookingStats, setCanceledBookingStats] = useState<CanceledBookingStat[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalBookings: 0,
    totalSeats: 0,
    averageSpentPerUser: 0,
    totalCanceledBookings: 0,
    totalRefundedAmount: 0
  });
const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'name'>('revenue');
  const [activeTab, setActiveTab] = useState<'active' | 'canceled'>('active');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [compareEvents, setCompareEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const compareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Starting to fetch booking stats...');
        
        const activeRes = await bookingAPI.getUserBookingStats();
        console.log('Active bookings response:', activeRes);
        
        const canceledRes = await bookingAPI.getCanceledBookingStats();
        console.log('Canceled bookings response:', canceledRes);

        const activeStats = Array.isArray(activeRes.data) ? activeRes.data : [];
        const canceledStats = Array.isArray(canceledRes.data) ? canceledRes.data : [];

        console.log('Active stats array:', activeStats);
        console.log('Canceled stats array:', canceledStats);

        setUserBookingStats(activeStats);
        setCanceledBookingStats(canceledStats);

        // Calculate dashboard stats
        const totalUsers = activeStats.length;
        const totalRevenue = activeStats.reduce((sum: number, user: UserBookingStat) => sum + user.totalSpent, 0);
        const totalBookings = activeStats.reduce((sum: number, user: UserBookingStat) => sum + user.totalBookings, 0);
        const totalSeats = activeStats.reduce((sum: number, user: UserBookingStat) => sum + user.totalSeats, 0);
        const averageSpentPerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
        const totalCanceledBookings = canceledStats.reduce((sum: number, user: CanceledBookingStat) => sum + user.totalCanceled, 0);
        const totalRefundedAmount = canceledStats.reduce((sum: number, user: CanceledBookingStat) => sum + user.totalRefunded, 0);

        console.log('Calculated dashboard stats:', {
          totalUsers,
          totalRevenue,
          totalBookings,
          totalSeats,
          averageSpentPerUser,
          totalCanceledBookings,
          totalRefundedAmount
        });

        setDashboardStats({
          totalUsers,
          totalRevenue,
          totalBookings,
          totalSeats,
          averageSpentPerUser,
          totalCanceledBookings,
          totalRefundedAmount
        });
      } catch (error) {
        console.error('Failed to fetch booking stats:', error);
      } finally {
        setLoading(false);
      }
    };

fetchStats();

    // Fetch all events for comparison
    const fetchEvents = async () => {
      try {
        const eventsRes = await eventAPI.getAll();
        setAllEvents(eventsRes.data);
      } catch (error) {
        console.error('Failed to fetch events for comparison:', error);
      }
    };
    fetchEvents();
  }, []);

  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 3D Tilt for stat cards
  const handleStatMove = useCallback((e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    gsap.to(card, {
      rotationX: ((y - centerY) / centerY) * -6,
      rotationY: ((x - centerX) / centerX) * 6,
      transformPerspective: 800,
      scale: 1.03,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, []);

  const handleStatLeave = useCallback((e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  // Magnetic buttons
  const handleMagneticMove = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(target, {
      x: x * 0.25,
      y: y * 0.25,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, []);

  const handleMagneticLeave = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

// Click pulse
  const handleClickPulse = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.fromTo(target,
      { scale: 0.95 },
      { scale: 1, duration: 0.4, ease: 'back.out(3)' }
    );
  }, []);

  const getDemandRatio = (event: Event) => {
    if (event.capacity <= 0) return 0;
    return (event.capacity - event.availableSeats) / event.capacity;
  };

  const toggleCompareEvent = useCallback((event: Event) => {
    setCompareEvents((prev) => {
      const exists = prev.some((e) => e._id === event._id);
      if (exists) {
        return prev.filter((e) => e._id !== event._id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, event];
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Title entrance
        if (titleRef.current) {
          tl.fromTo(titleRef.current,
            { opacity: 0, y: 40, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
          );
        }

        // Stat cards stagger entrance with rotation
        tl.fromTo('.stat-card',
          { opacity: 0, y: 50, scale: 0.85, rotationX: -15 },
          {
            opacity: 1, y: 0, scale: 1, rotationX: 0,
            duration: 0.7, stagger: 0.1, ease: 'back.out(1.7)',
            transformPerspective: 800,
            onComplete: () => {
              // Animate stat numbers counting up
              document.querySelectorAll('.stat-content h3').forEach((el: Element) => {
                const target = el as HTMLElement;
                const text = target.textContent || '0';
                const match = text.match(/[\d,]+(?:\.\d+)?/);
                if (match) {
                  const prefix = text.includes('$') ? '$' : '';
                  const finalValue = parseFloat(match[0].replace(/,/g, ''));
                  const obj = { val: 0 };
                  gsap.to(obj, {
                    val: finalValue,
                    duration: 1.5,
                    ease: 'power2.out',
                    onUpdate: () => {
                      const formatted = obj.val >= 1000
                        ? Math.round(obj.val).toLocaleString()
                        : (finalValue % 1 !== 0 ? obj.val.toFixed(2) : Math.round(obj.val).toString());
                      target.textContent = prefix + formatted;
                    }
                  });
                }
              });
            }
          }
        );

        // Search & filter section
        gsap.fromTo('.search-filter-section',
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.search-filter-section', start: 'top 90%' }
          }
        );

        // Tab navigation
        gsap.fromTo('.tab-navigation',
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: '.tab-navigation', start: 'top 90%' }
          }
        );

        // Booking cards stagger reveal
        gsap.fromTo('.booking-card',
          { opacity: 0, y: 60, scale: 0.92, rotationY: -8 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0,
            duration: 0.7, stagger: 0.1, ease: 'back.out(1.6)',
            transformPerspective: 800,
            scrollTrigger: { trigger: '.booking-details-list', start: 'top 85%' }
          }
        );

// Quick actions stagger
        gsap.fromTo('.action-btn',
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.6, stagger: 0.12, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: '.quick-actions', start: 'top 85%' }
          }
        );

        // Event comparison section reveal
        gsap.fromTo('.event-compare-section',
          { opacity: 0, y: 80 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '.event-compare-section', start: 'top 85%' }
          }
        );

        // Compare picker chips
        gsap.fromTo('.event-picker-chip',
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(1.6)',
            scrollTrigger: { trigger: '.event-picker', start: 'top 85%' }
          }
        );

        // Compare cards flip entrance
        gsap.fromTo('.event-compare-card',
          { opacity: 0, y: 80, scale: 0.88, rotationY: -18 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 0.8, stagger: 0.12,
            ease: 'back.out(1.6)', transformPerspective: 900,
            scrollTrigger: { trigger: '.compare-cards-grid', start: 'top 85%' }
          }
        );
      }, pageRef);

      return () => ctx.revert();
    }
  }, [loading, userBookingStats, canceledBookingStats, activeTab]);

  const getFilteredAndSortedData = () => {
    const data = activeTab === 'active' ? userBookingStats : canceledBookingStats;
    let filtered = data.filter(user =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (activeTab === 'active') {
        const aActive = a as UserBookingStat;
        const bActive = b as UserBookingStat;
        if (sortBy === 'revenue') return bActive.totalSpent - aActive.totalSpent;
        if (sortBy === 'bookings') return bActive.totalBookings - aActive.totalBookings;
        return aActive.userName.localeCompare(bActive.userName);
      } else {
        const aCanceled = a as CanceledBookingStat;
        const bCanceled = b as CanceledBookingStat;
        if (sortBy === 'revenue') return bCanceled.totalRefunded - aCanceled.totalRefunded;
        if (sortBy === 'bookings') return bCanceled.totalCanceled - aCanceled.totalCanceled;
        return aCanceled.userName.localeCompare(bCanceled.userName);
      }
    });
  };

  const filteredData = getFilteredAndSortedData();

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard" ref={pageRef}>
      <div className="container">
        <h1 className="dashboard-title" ref={titleRef}><FaChartLine style={{ marginRight: '12px' }} /> Admin Dashboard</h1>
        
        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card" onMouseMove={handleStatMove} onMouseLeave={handleStatLeave} style={{ transformStyle: 'preserve-3d' }}>
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-content">
              <h3 data-value={dashboardStats.totalUsers}>{dashboardStats.totalUsers}</h3>
              <p>Total Users Booked</p>
            </div>
          </div>

          <div className="stat-card" onMouseMove={handleStatMove} onMouseLeave={handleStatLeave} style={{ transformStyle: 'preserve-3d' }}>
            <div className="stat-icon"><FaMoneyBillWave /></div>
            <div className="stat-content">
              <h3 data-value={dashboardStats.totalRevenue}>${dashboardStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card" onMouseMove={handleStatMove} onMouseLeave={handleStatLeave} style={{ transformStyle: 'preserve-3d' }}>
            <div className="stat-icon"><FaTicketAlt /></div>
            <div className="stat-content">
              <h3 data-value={dashboardStats.totalBookings}>{dashboardStats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>

          <div className="stat-card" onMouseMove={handleStatMove} onMouseLeave={handleStatLeave} style={{ transformStyle: 'preserve-3d' }}>
            <div className="stat-icon"><FaChair /></div>
            <div className="stat-content">
              <h3 data-value={dashboardStats.totalSeats}>{dashboardStats.totalSeats}</h3>
              <p>Total Seats Booked</p>
            </div>
          </div>

          <div className="stat-card" onMouseMove={handleStatMove} onMouseLeave={handleStatLeave} style={{ transformStyle: 'preserve-3d' }}>
            <div className="stat-icon"><FaChartLine /></div>
            <div className="stat-content">
              <h3 data-value={dashboardStats.averageSpentPerUser}>${dashboardStats.averageSpentPerUser.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p>Avg. Per User</p>
            </div>
          </div>

          <div className="stat-card stat-card-canceled" onMouseMove={handleStatMove} onMouseLeave={handleStatLeave} style={{ transformStyle: 'preserve-3d' }}>
            <div className="stat-icon"><FaTimesCircle /></div>
            <div className="stat-content">
              <h3 data-value={dashboardStats.totalCanceledBookings}>{dashboardStats.totalCanceledBookings}</h3>
              <p>Canceled Bookings</p>
            </div>
          </div>

          <div className="stat-card stat-card-refund" onMouseMove={handleStatMove} onMouseLeave={handleStatLeave} style={{ transformStyle: 'preserve-3d' }}>
            <div className="stat-icon"><FaMoneyBillAlt /></div>
            <div className="stat-content">
              <h3 data-value={dashboardStats.totalRefundedAmount}>${dashboardStats.totalRefundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p>Total Refunded</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch className="dashboard-search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${sortBy === 'revenue' ? 'active' : ''}`}
              onClick={(e) => { handleClickPulse(e); setSortBy('revenue'); }}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <FaMoneyBillWave style={{ marginRight: '6px' }} /> By Revenue
            </button>
            <button
              className={`filter-btn ${sortBy === 'bookings' ? 'active' : ''}`}
              onClick={(e) => { handleClickPulse(e); setSortBy('bookings'); }}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <FaTicketAlt style={{ marginRight: '6px' }} /> By Bookings
            </button>
            <button
              className={`filter-btn ${sortBy === 'name' ? 'active' : ''}`}
              onClick={(e) => { handleClickPulse(e); setSortBy('name'); }}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <FaUser style={{ marginRight: '6px' }} /> By Name
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={(e) => { handleClickPulse(e); setActiveTab('active'); }}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            <FaCheckCircle style={{ marginRight: '6px' }} /> Active Bookings ({userBookingStats.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'canceled' ? 'active' : ''}`}
            onClick={(e) => { handleClickPulse(e); setActiveTab('canceled'); }}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            <FaExclamationCircle style={{ marginRight: '6px' }} /> Canceled Bookings ({canceledBookingStats.length})
          </button>
        </div>

        {/* User Booking Details with Event Information */}
        <div className="user-booking-details-section">
          <h2>{activeTab === 'active' ? <><FaCheckCircle style={{ marginRight: '8px' }} /> Active Bookings</> : <><FaExclamationCircle style={{ marginRight: '8px' }} /> Canceled Bookings</>} ({filteredData.length})</h2>
          
          {filteredData.length === 0 ? (
            <div className="no-bookings">
              <p>No {activeTab === 'active' ? 'active' : 'canceled'} bookings available</p>
            </div>
          ) : (
            <div className="booking-details-list">
              {filteredData.map((userStat) => (
                <div key={userStat._id} className={`booking-card ${activeTab === 'canceled' ? 'canceled' : ''}`}>
                  {/* User Information Header */}
                  <div className="user-header">
                    <div className={`user-avatar ${activeTab === 'canceled' ? 'canceled' : ''}`}>
                      {userStat.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-basic-info">
                      <h3>{userStat.userName}</h3>
                      <p className="user-email"><FaUser style={{ marginRight: '6px' }} /> {userStat.userEmail}</p>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="events-section">
                    <h4 className="events-title">
                      {activeTab === 'active' ? <><FaGift style={{ marginRight: '6px' }} /> Booked Events</> : <><FaExclamationCircle style={{ marginRight: '6px' }} /> Canceled Events</>}
                    </h4>
                    {userStat.events.map((event, idx) => (
                      <div key={idx} className={`event-booking-card ${activeTab === 'canceled' ? 'canceled' : ''}`}>
                        <div className="event-header">
                          <h5>{event.eventTitle}</h5>
                          <span className="booking-date">
                            {new Date('bookingDate' in event ? event.bookingDate : event.canceledDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="event-details">
                          <div className="detail-item">
                            <span className="detail-label">Seats:</span>
                            <span className="detail-value">{event.seats}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{activeTab === 'active' ? 'Price' : 'Refunded'}:</span>
                            <span className="detail-value">${event.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* User Summary */}
                  <div className={`user-summary ${activeTab === 'canceled' ? 'canceled' : ''}`}>
                    <div className="summary-item">
                      <span className="summary-label">
                        {activeTab === 'active' ? 'Total Bookings' : 'Total Canceled'}
                      </span>
                      <span className="summary-value">
                        {activeTab === 'active' 
                          ? (userStat as UserBookingStat).totalBookings 
                          : (userStat as CanceledBookingStat).totalCanceled}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Seats</span>
                      <span className="summary-value">{userStat.totalSeats}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">
                        {activeTab === 'active' ? 'Total Spent' : 'Total Refunded'}
                      </span>
                      <span className="summary-value">
                        ${activeTab === 'active' 
                          ? (userStat as UserBookingStat).totalSpent.toFixed(2)
                          : (userStat as CanceledBookingStat).totalRefunded.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

{/* Event Comparison Section */}
        <div className="event-compare-section" ref={compareRef}>
          <div className="edit-compare-header">
<span className="edit-compare-kicker"><FaBalanceScale style={{ marginRight: '6px' }} /> Event Comparison</span>
            <h2><FaBalanceScale style={{ marginRight: '8px' }} /> Compare Events Side By Side</h2>
            <p>Select up to 3 events to compare price, capacity, demand, and seat availability.</p>
          </div>

          {/* Event selector */}
          <div className="event-picker">
            {allEvents.length === 0 ? (
              <p className="compare-no-events">No events available to compare.</p>
            ) : (
              allEvents.map((event) => {
                const isSelected = compareEvents.some((e) => e._id === event._id);
                return (
                  <button
                    key={event._id}
                    className={`event-picker-chip ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => { handleClickPulse(e); toggleCompareEvent(event); }}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                  >
                    {isSelected ? '✓ ' : '+ '}{event.title}
                  </button>
                );
              })
            )}
          </div>

          {/* Comparison cards */}
          {compareEvents.length > 0 && (
            <div className="compare-cards-grid">
              {compareEvents.map((event) => (
                <div key={event._id} className="event-compare-card">
                  <div className="event-compare-card-head">
                    <span className="event-compare-cat">{event.category}</span>
                    <button
                      className="event-compare-remove"
                      onClick={(e) => { handleClickPulse(e); toggleCompareEvent(event); }}
                    >
                      Remove
                    </button>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{new Date(event.date).toLocaleDateString()} • {event.time}</p>

                  <div className="event-compare-rows">
                    <div className="event-compare-row">
                      <span><FaDollarSign /> Price</span>
                      <strong>${event.price}</strong>
                    </div>
                    <div className="event-compare-row">
                      <span><FaChair /> Seats Left</span>
                      <strong>{event.availableSeats} / {event.capacity}</strong>
                    </div>
                    <div className="event-compare-row">
                      <span><FaFire /> Demand</span>
                      <strong>{Math.round(getDemandRatio(event) * 100)}%</strong>
                    </div>
                  </div>

                  <div className="event-demand-meter">
                    <div
                      className="event-demand-fill"
                      style={{ width: `${Math.min(Math.round(getDemandRatio(event) * 100), 100)}%` }}
                    ></div>
                  </div>

                  <button className="btn-primary" onClick={() => navigate(`/edit-event/${event._id}`)}>
                    Manage Event
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2><FaBolt style={{ marginRight: '8px' }} /> Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/create-event" className="action-btn" onMouseMove={handleMagneticMove} onMouseLeave={handleMagneticLeave}>
              <span className="action-icon"><FaMagic /></span>
              <span>Create Event</span>
            </Link>
            <Link to="/home" className="action-btn" onMouseMove={handleMagneticMove} onMouseLeave={handleMagneticLeave}>
              <span className="action-icon"><FaGift /></span>
              <span>View Events</span>
            </Link>
            <Link to="/activity-log" className="action-btn" onMouseMove={handleMagneticMove} onMouseLeave={handleMagneticLeave}>
              <span className="action-icon"><FaChartLine /></span>
              <span>Activity Log</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
