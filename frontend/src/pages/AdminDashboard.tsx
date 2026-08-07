import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, eventAPI, activityAPI, aiAPI } from '../services/api';
import './AdminDashboard.css';

interface Activity {
  _id: string;
  userName: string;
  userEmail: string;
  action: string;
  description: string;
  eventTitle?: string;
  createdAt: string;
}

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

interface Stats {
  totalBookings: number;
  totalEvents: number;
  totalUsers: number;
  recentActivities: Activity[];
  userBookingStats: UserBookingStat[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalEvents: 0,
    totalUsers: 0,
    recentActivities: [],
    userBookingStats: []
  });
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<{
    forecast: string;
    sellOutRisks: { eventId: string; title: string; risk: string }[];
  } | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  const loadForecast = async () => {
    setForecastLoading(true);
    setForecast(null);
    try {
      const response = await aiAPI.demandForecast();
      setForecast(response.data);
    } catch (error) {
      console.error('Demand forecast error:', error);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/home');
      return;
    }

    fetchDashboardData();
    
    
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, eventsRes, activitiesRes, userStatsRes] = await Promise.all([
        bookingAPI.getAllBookings(),
        eventAPI.getAll(),
        activityAPI.getRecent(10),
        bookingAPI.getUserBookingStats()
      ]);

      setStats({
        totalBookings: bookingsRes.data.length || 0,
        totalEvents: eventsRes.data.length || 0,
        totalUsers: 0,
        recentActivities: activitiesRes.data || [],
        userBookingStats: userStatsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'booking_created': return '🎫';
      case 'booking_cancelled': return '❌';
      case 'event_created': return '✨';
      case 'event_updated': return '📝';
      case 'event_deleted': return '🗑️';
      case 'user_registered': return '👤';
      case 'user_login': return '🔐';
      default: return '📌';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'booking_created': return '#10b981';
      case 'booking_cancelled': return '#ef4444';
      case 'event_created': return '#8b5cf6';
      case 'event_updated': return '#3b82f6';
      case 'event_deleted': return '#f59e0b';
      case 'user_registered': return '#06b6d4';
      case 'user_login': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>📊 Admin Dashboard</h1>
          <p>Overview of your event booking system</p>
        </div>

        <div className="ai-forecast-section">
          <div className="ai-forecast-header">
            <div>
              <span className="ai-forecast-kicker">📈 AI Demand Forecast</span>
              <h2>Predictive Analytics</h2>
              <p>Gemini analyzes booking momentum, capacity, and time-to-event to predict sell-out risks.</p>
            </div>
            <button
              className="btn-ai-forecast"
              onClick={loadForecast}
              disabled={forecastLoading}
            >
              {forecastLoading ? '⏳ Analyzing...' : '✨ Generate Forecast'}
            </button>
          </div>

          {forecastLoading && (
            <div className="ai-forecast-loading">
              Gemini is analyzing booking momentum across all events...
            </div>
          )}

          {forecast && !forecastLoading && (
            <div className="ai-forecast-content">
              <div className="ai-forecast-text">
                <span className="ai-forecast-badge">🤖 Gemini Analysis</span>
                <p style={{ whiteSpace: 'pre-wrap' }}>{forecast.forecast}</p>
              </div>

              {forecast.sellOutRisks.length > 0 && (
                <div className="sellout-risk-list">
                  <h3>🔥 Sell-Out Risk Events</h3>
                  {forecast.sellOutRisks.map((risk) => (
                    <div key={risk.eventId} className="sellout-risk-card">
                      <strong>{risk.title}</strong>
                      <p>{risk.risk}</p>
                    </div>
                  ))}
                </div>
              )}

              {forecast.sellOutRisks.length === 0 && (
                <div className="sellout-none">
                  <p>✅ No immediate sell-out risks detected.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {}
        <div className="user-booking-details-section">
          <h2>📋 User Booking Details</h2>
          
          {stats.userBookingStats.length === 0 ? (
            <div className="no-data">
              <p>No booking data available</p>
            </div>
          ) : (
            <div className="booking-details-list">
              {stats.userBookingStats.map((userStat) => (
                <div key={userStat._id} className="booking-details-card">
                  <div className="user-header">
                    <div className="user-avatar">{userStat.userName.charAt(0).toUpperCase()}</div>
                    <div className="user-basic-info">
                      <h3>{userStat.userName}</h3>
                      <p className="user-email">{userStat.userEmail}</p>
                    </div>
                  </div>

                  {}
                  <div className="events-section">
                    {userStat.events.map((event, idx) => (
                      <div key={idx} className="event-booking-card">
                        <div className="event-header">
                          <h4>🎉 {event.eventTitle}</h4>
                          <span className="booking-date">{new Date(event.bookingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="event-details">
                          <div className="detail-item">
                            <span className="detail-label">Seats Booked:</span>
                            <span className="detail-value">{event.seats}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Total Price:</span>
                            <span className="detail-value">${event.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {}
                  <div className="user-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Bookings:</span>
                      <span className="summary-value">{userStat.totalBookings}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Seats:</span>
                      <span className="summary-value">{userStat.totalSeats}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Spent:</span>
                      <span className="summary-value">${userStat.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="activities-section">
          <h2>🕐 Recent Activities</h2>
          
          {stats.recentActivities.length === 0 ? (
            <div className="no-activities">
              <p>No recent activities</p>
            </div>
          ) : (
            <div className="activities-list">
              {stats.recentActivities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div 
                    className="activity-icon"
                    style={{ background: getActionColor(activity.action) }}
                  >
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <strong>{activity.userName}</strong>
                      <span className="activity-email">({activity.userEmail})</span>
                    </div>
                    <p className="activity-description">{activity.description}</p>
                    {activity.eventTitle && (
                      <span className="activity-event">Event: {activity.eventTitle}</span>
                    )}
                  </div>
                  <div className="activity-time">
                    {formatDate(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => navigate('/create-event')}
            >
              <span>✨</span>
              Create Event
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/home')}
            >
              <span>🎉</span>
              View Events
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/my-bookings')}
            >
              <span>🎫</span>
              View Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
