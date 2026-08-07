import React, { useEffect, useState, useRef, useCallback } from 'react';
import { activityAPI } from '../services/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ActivityLog.css';

gsap.registerPlugin(ScrollTrigger);

interface Activity {
  _id: string;
  userName: string;
  userEmail: string;
  action: string;
  description: string;
  eventTitle?: string;
  createdAt: string;
}

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activityAPI.getRecent(50);
      
      const bookingActivities = response.data.filter((activity: Activity) => 
        activity.action === 'booking_created' || activity.action === 'booking_cancelled'
      );
      setActivities(bookingActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      
      if (titleRef.current) {
        const text = titleRef.current.textContent || '';
        titleRef.current.innerHTML = '';
        text.split(' ').forEach((word, wi) => {
          const wordSpan = document.createElement('span');
          wordSpan.style.display = 'inline-block';
          wordSpan.style.marginRight = '0.4em';
          wordSpan.style.opacity = '0';
          wordSpan.style.transform = 'translateY(50px) rotateX(60deg)';
          wordSpan.style.transformStyle = 'preserve-3d';
          wordSpan.style.background = 'linear-gradient(135deg, #ffffff 0%, #ffd166 50%, #f093fb 100%)';
          wordSpan.style.webkitBackgroundClip = 'text';
          wordSpan.style.webkitTextFillColor = 'transparent';
          wordSpan.style.backgroundClip = 'text';
          wordSpan.style.filter = 'drop-shadow(0 4px 20px rgba(255, 209, 102, 0.35))';
          wordSpan.textContent = word;
          titleRef.current?.appendChild(wordSpan);
          tl.to(wordSpan, {
            opacity: 1, y: 0, rotationX: 0, duration: 0.7, ease: 'back.out(1.8)'
          }, wi * 0.12);
        });
      }

      
      tl.fromTo('.activity-header p',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power4.out' },
        '-=0.4'
      );

      
      gsap.fromTo('.activity-item',
        {
          opacity: 0, x: -80, scale: 0.9, rotationY: -15
        },
        {
          opacity: 1, x: 0, scale: 1, rotationY: 0,
          duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)',
          transformPerspective: 900,
          scrollTrigger: {
            trigger: '.activities-list',
            start: 'top 85%'
          },
          onComplete: () => {
            
            document.querySelectorAll('.activity-icon').forEach((icon) => {
              gsap.to(icon, {
                scale: 1.08,
                boxShadow: '0 0 24px rgba(102, 126, 234, 0.5)',
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
              });
            });
          }
        }
      );

      
      gsap.fromTo('.activity-content',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.activities-list',
            start: 'top 85%'
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [loading, activities]);

  
  const handleItemMove = useCallback((e: React.MouseEvent) => {
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
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, []);

  const handleItemLeave = useCallback((e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    gsap.to(card, {
      rotationX: 0, rotationY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  const getActionIcon = (action: string) => {
    const icons: { [key: string]: string } = {
      booking_created: '🎫',
      booking_cancelled: '❌'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      booking_created: '#48bb78',
      booking_cancelled: '#f56565'
    };
    return colors[action] || '#718096';
  };

  const getActionGradient = (action: string) => {
    const gradients: { [key: string]: string } = {
      booking_created: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      booking_cancelled: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    };
    return gradients[action] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading activities...</div>;
  }

  return (
    <div className="activity-log" ref={pageRef}>
      <div className="activity-bg-orb orb-1"></div>
      <div className="activity-bg-orb orb-2"></div>
      <div className="activity-bg-orb orb-3"></div>
      <div className="container">
        <div className="activity-header">
          <h1 ref={titleRef}>🎫 User Bookings Activity</h1>
          <p>Track all user bookings and cancellations in real-time</p>
        </div>

        {activities.length === 0 ? (
          <div className="no-activities">
            <h2>No Booking Activities Yet</h2>
            <p>User bookings and cancellations will appear here</p>
          </div>
        ) : (
          <div className="activities-list">
            {activities.map((activity) => (
              <div 
                key={activity._id} 
                className="activity-item"
                style={{ borderLeftColor: getActionColor(activity.action) }}
                onMouseMove={handleItemMove}
                onMouseLeave={handleItemLeave}
              >
                <div className="activity-icon" style={{ background: getActionGradient(activity.action) }}>
                  <span className="activity-icon-inner">{getActionIcon(activity.action)}</span>
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <h3>{activity.description}</h3>
                    <span className="activity-time" style={{ background: getActionColor(activity.action) }}>
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-user">
                      👤 {activity.userName}
                    </span>
                    <span className="activity-email">
                      📧 {activity.userEmail}
                    </span>
                    {activity.eventTitle && (
                      <span className="activity-event">
                        🎉 {activity.eventTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
