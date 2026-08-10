import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { wishlistAPI } from '../services/api';
import './Wishlist.css';

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

const Wishlist: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setEvents(Array.isArray(response.data?.events) ? response.data.events : []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleBook = (eventId: string) => {
    navigate(`/book/${eventId}`);
  };

  const handleWishlistChange = (eventId: string, isInWishlist: boolean) => {
    if (!isInWishlist) {
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    }
  };

  if (loading) {
    return <div className="loading">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <span className="wishlist-header-kicker">❤️ Saved Events</span>
          <h1>My Wishlist</h1>
          <p>Your hand-picked events, saved in one beautiful place.</p>
        </div>

        {events.length === 0 ? (
          <div className="wishlist-empty">
            <span className="wishlist-empty-icon">💫</span>
            <h2>Your Wishlist is Empty</h2>
            <p>Tap the heart icon on any event card to save it here for later. Your favourite events are just a click away.</p>
            <Link to="/home" className="btn-primary">
              ✨ Browse Events
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onBook={handleBook}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;