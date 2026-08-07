import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { FaCalendarAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const COMPARE_STORAGE_KEY = 'eventhub.compareEvents';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar entrance
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Logo entrance with bounce
      if (logoRef.current) {
        gsap.fromTo(logoRef.current,
          { scale: 0, rotation: -180, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'back.out(2)', delay: 0.2 }
        );

        // Continuous subtle float
        gsap.to(logoRef.current, {
          y: -3,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // Nav links staggered entrance
      if (linksRef.current) {
        const links = linksRef.current.querySelectorAll('a');
        gsap.fromTo(links,
          { opacity: 0, y: -20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)', delay: 0.3 }
        );
      }

      // Auth section entrance
      if (authRef.current) {
        gsap.fromTo(authRef.current,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.5 }
        );
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Animate mobile menu open/close
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (menuOpen) {
        gsap.fromTo(mobileMenuRef.current,
          { opacity: 0, y: -20, scaleX: 0.95 },
          {
            opacity: 1, y: 0, scaleX: 1,
            duration: 0.35, ease: 'power3.out',
            transformOrigin: 'top center'
          }
        );
        const items = mobileMenuRef.current.querySelectorAll('.mobile-menu-link');
        gsap.fromTo(items,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.1 }
        );
      }
    }
  }, [menuOpen]);

  // Magnetic effect for nav links
  const handleLinkMove = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(target, {
      x: x * 0.15,
      y: y * 0.15,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, []);

  const handleLinkLeave = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  // Magnetic effect for auth buttons
  const handleAuthMove = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(target, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, []);

  const handleAuthLeave = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    gsap.to(target, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const compareCount = useMemo(() => {
    try {
      const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, [location.pathname]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav ref={navRef} className="navbar">
      <div className="container flex justify-center items-center">
        <Link to="/home" className="logo" ref={logoRef}>
          <FaCalendarAlt style={{ marginRight: '8px' }} /> EventHub
        </Link>

        {/* Hamburger toggle - mobile only */}
        <button
          ref={hamburgerRef}
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="nav-links" ref={linksRef}>
          <Link to="/home" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>Events</Link>
          {isAuthenticated && <Link to="/my-bookings" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>My Bookings</Link>}
          {isAuthenticated && (
            <Link to="/compare" className="compare-link" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>
              Compare
              {compareCount > 0 && <span className="nav-count-badge">{compareCount}</span>}
            </Link>
          )}
          {isAuthenticated && <Link to="/plan-evening" className="plan-link" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>Plan Evening</Link>}
          {isAuthenticated && <Link to="/wishlist" className="wishlist-link" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>Wishlist</Link>}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link to="/dashboard" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>Dashboard</Link>
              <Link to="/activity-log" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>User Activity</Link>
              <Link to="/create-event" onMouseMove={handleLinkMove} onMouseLeave={handleLinkLeave}>Create Event</Link>
            </>
          )}
        </div>
        <div className="nav-auth" ref={authRef}>
          {isAuthenticated ? (
            <>
              <div className="user-avatar">
                {getInitials(user?.name || 'U')}
              </div>
              <span className="user-name">{user?.name}</span>
              <button className="btn-secondary" onClick={handleLogout} onMouseMove={handleAuthMove} onMouseLeave={handleAuthLeave}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" onMouseMove={handleAuthMove} onMouseLeave={handleAuthLeave}>
                Login
              </Link>
              <Link to="/register" className="btn-primary" onMouseMove={handleAuthMove} onMouseLeave={handleAuthLeave}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
        <Link to="/home" className="mobile-menu-link" onClick={closeMenu}>Events</Link>
        {isAuthenticated && (
          <Link to="/my-bookings" className="mobile-menu-link" onClick={closeMenu}>My Bookings</Link>
        )}
        {isAuthenticated && (
          <Link to="/compare" className="mobile-menu-link" onClick={closeMenu}>
            Compare {compareCount > 0 && <span className="nav-count-badge">{compareCount}</span>}
          </Link>
        )}
        {isAuthenticated && (
          <Link to="/plan-evening" className="mobile-menu-link" onClick={closeMenu}>Plan Evening</Link>
        )}
        {isAuthenticated && (
          <Link to="/wishlist" className="mobile-menu-link" onClick={closeMenu}>Wishlist</Link>
        )}
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Link to="/dashboard" className="mobile-menu-link" onClick={closeMenu}>Dashboard</Link>
            <Link to="/activity-log" className="mobile-menu-link" onClick={closeMenu}>User Activity</Link>
            <Link to="/create-event" className="mobile-menu-link" onClick={closeMenu}>Create Event</Link>
          </>
        )}
        <div className="mobile-menu-auth">
          {isAuthenticated ? (
            <>
              <span className="mobile-menu-user">
                <span className="user-avatar">{getInitials(user?.name || 'U')}</span>
                {user?.name}
              </span>
              <button className="btn-secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn-primary" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
