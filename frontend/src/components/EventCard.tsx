import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import Countdown from './Countdown';
import WishlistButton from './WishlistButton';
import { FaMusic, FaFutbol, FaLaptopCode, FaBriefcase, FaGift, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaFire } from 'react-icons/fa';
import './EventCard.css';

interface EventCardProps {
  event: {
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
  };
  onBook: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  onWishlistChange?: (eventId: string, isInWishlist: boolean) => void;
  onToggleCompare?: (event: EventCardProps['event']) => void;
  isCompared?: boolean;
  isAdmin?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onBook,
  onDelete,
  onEdit,
  onWishlistChange,
  onToggleCompare,
  isCompared,
  isAdmin
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 40, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          ease: 'back.out(1.7)'
        }
      );
    }
  }, []);

  // Force re-render when event date changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [event.date]);

  // 3D Tilt effect on card hover
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    const image = imageRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(card, {
      rotationX: rotateX,
      rotationY: rotateY,
      transformPerspective: 1000,
      scale: 1.02,
      duration: 0.5,
      ease: 'power2.out'
    });

    // Parallax effect on image
    if (image) {
      gsap.to(image, {
        x: (x - centerX) * 0.05,
        y: (y - centerY) * 0.05,
        scale: 1.12,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    if (!card) return;

    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    });

    if (image) {
      gsap.to(image, {
        x: 0,
        y: 0,
        scale: 1.1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto'
      });
    }
  }, []);

  // Magnetic button effect
  const handleMagneticMove = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(target, {
      x: x * 0.25,
      y: y * 0.25,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, []);

  const handleMagneticLeave = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  // Button click pulse animation
  const handleClickPulse = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.fromTo(target,
      { scale: 0.95 },
      {
        scale: 1,
        duration: 0.4,
        ease: 'back.out(3)'
      }
    );
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      music: <FaMusic />,
      sports: <FaFutbol />,
      tech: <FaLaptopCode />,
      business: <FaBriefcase />,
      other: <FaGift />
    };
    return icons[category] || <FaGift />;
  };

  const getCapacityPercentage = () => {
    return ((event.capacity - event.availableSeats) / event.capacity) * 100;
  };

  const getCapacityColor = () => {
    const percentage = getCapacityPercentage();
    if (percentage >= 80) return '#f56565'; // Red
    if (percentage >= 50) return '#ed8936'; // Orange
    return '#48bb78'; // Green
  };

  const isAlmostFull = () => {
    return getCapacityPercentage() >= 80;
  };

  return (
    <div 
      ref={cardRef} 
      className="event-card card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="event-image-container">
        <div className="event-category-badge">
          {getCategoryIcon(event.category)} {event.category}
        </div>
        {isAlmostFull() && (
          <div className="almost-full-badge">
            <FaFire style={{ marginRight: '4px' }} /> Almost Full!
          </div>
        )}
        <img 
          ref={imageRef}
          src={event.image} 
          alt={event.title} 
          className="event-image" 
        />
        <div className="event-image-overlay"></div>
        <div className="wishlist-overlay">
          <WishlistButton eventId={event._id} onWishlistChange={onWishlistChange} />
        </div>
      </div>
      
      <h3>{event.title}</h3>
      <p className="description">{event.description}</p>
      
      <Countdown key={`countdown-${event._id}-${key}`} targetDate={event.date} />
      
      <div className="event-details">
        <span><FaCalendarAlt style={{ marginRight: '8px' }} /> {new Date(event.date).toLocaleDateString()}</span>
        <span><FaClock style={{ marginRight: '8px' }} /> {event.time}</span>
        <span><FaMapMarkerAlt style={{ marginRight: '8px' }} /> {event.location}</span>
      </div>
      
      <div className="capacity-section">
        <div className="capacity-info">
          <span className="capacity-label">Capacity</span>
          <span className="capacity-numbers">
            {event.capacity - event.availableSeats}/{event.capacity}
          </span>
        </div>
        <div className="capacity-bar">
          <div 
            className="capacity-fill" 
            style={{ 
              width: `${getCapacityPercentage()}%`,
              background: getCapacityColor()
            }}
          ></div>
        </div>
      </div>
      
      <div className="event-footer">
        <span className="price">${event.price}</span>
        <span className="seats">{event.availableSeats} seats left</span>
      </div>
      
      <div className="event-actions">
        {!isAdmin ? (
          <>
            {onToggleCompare && (
              <button
                className={`btn-secondary compare-btn ${isCompared ? 'active' : ''}`}
                onClick={(e) => {
                  handleClickPulse(e);
                  onToggleCompare(event);
                }}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                {isCompared ? 'Compared' : 'Compare'}
              </button>
            )}
            <button 
              className="btn-primary" 
              onClick={(e) => {
                handleClickPulse(e);
                onBook(event._id);
              }}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              Book Now
            </button>
          </>
        ) : (
          <>
            {onToggleCompare && (
              <button
                className={`btn-secondary compare-btn ${isCompared ? 'active' : ''}`}
                onClick={(e) => {
                  handleClickPulse(e);
                  onToggleCompare(event);
                }}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                {isCompared ? 'Compared' : 'Compare'}
              </button>
            )}
            <button 
              className="btn-primary" 
              onClick={(e) => {
                handleClickPulse(e);
                onBook(event._id);
              }}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              Book Now
            </button>
            {onEdit && (
              <button 
                className="btn-secondary" 
                onClick={(e) => {
                  handleClickPulse(e);
                  onEdit(event._id);
                }}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                className="btn-danger" 
                onClick={(e) => {
                  handleClickPulse(e);
                  onDelete(event._id);
                }}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventCard;