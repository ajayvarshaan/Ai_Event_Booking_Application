import React, { useEffect, useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './WishlistButton.css';

interface WishlistButtonProps {
  eventId: string;
  onWishlistChange?: (eventId: string, isInWishlist: boolean) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ eventId, onWishlistChange }) => {
  const { isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlist();
    }
  }, [eventId, isAuthenticated]);

  // Heart pop animation when wishlist state changes
  useEffect(() => {
    if (buttonRef.current) {
      gsap.fromTo(buttonRef.current,
        { scale: 0.6, rotation: -15 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto'
        }
      );

      // Glow effect when active
      if (isInWishlist) {
        gsap.to(buttonRef.current, {
          boxShadow: '0 0 20px rgba(245, 87, 108, 0.6), 0 4px 15px rgba(245, 87, 108, 0.4)',
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      } else {
        gsap.to(buttonRef.current, {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          duration: 0.5
        });
      }
    }
  }, [isInWishlist]);

  // Magnetic hover effect
  const handleMagneticMove = useCallback((e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, []);

  const handleMagneticLeave = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  const checkWishlist = async () => {
    try {
      const response = await wishlistAPI.check(eventId);
      const nextState = response.data.isInWishlist;
      setIsInWishlist(nextState);
      onWishlistChange?.(eventId, nextState);
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    // Quick pulse on click
    if (buttonRef.current) {
      gsap.fromTo(buttonRef.current,
        { scale: 0.7 },
        { scale: 1, duration: 0.4, ease: 'back.out(3)' }
      );
    }

    try {
      let nextState = isInWishlist;
      if (isInWishlist) {
        await wishlistAPI.remove(eventId);
        nextState = false;
      } else {
        await wishlistAPI.add(eventId);
        nextState = true;
      }
      setIsInWishlist(nextState);
      onWishlistChange?.(eventId, nextState);
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
      onClick={handleToggleWishlist}
      disabled={loading}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      onMouseMove={handleMagneticMove}
      onMouseLeave={handleMagneticLeave}
    >
      {isInWishlist ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default WishlistButton;
