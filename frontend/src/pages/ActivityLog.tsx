import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { activityAPI } from '../services/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  FaChartPie,
  FaCalendarDay,
  FaUsers,
  FaTicketAlt,
  FaSearch,
  FaSyncAlt,
  FaFire,
  FaClock,
  FaLayerGroup,
} from 'react-icons/fa';
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

interface ActionMeta {
  icon: string;
  label: string;
  color: string;
  gradient: string;
}

const ACTION_META: Record<string, ActionMeta> = {
  booking_created: {
    icon: '🎫',
    label: 'Booking',
    color: '#48bb78',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
  },
  booking_cancelled: {
    icon: '❌',
    label: 'Cancellation',
    color: '#f56565',
    gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
  },
  event_created: {
    icon: '✨',
    label: 'Event Created',
    color: '#667eea',
    gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
  },
  event_updated: {
    icon: '📝',
    label: 'Event Updated',
    color: '#00c8ff',
    gradient: 'linear-gradient(135deg,#22d3ee,#0891b2)',
  },
  event_deleted: {
    icon: '🗑️',
    label: 'Event Deleted',
    color: '#ed8936',
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
  },
  user_registered: {
    icon: '👤',
    label: 'User Registered',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg,#818cf8,#6d28d9)',
  },
  user_login: {
    icon: '🔐',
    label: 'Login',
    color: '#22d3ee',
    gradient: 'linear-gradient(135deg,#06b6d4,#0e7490)',
  },
  google_login: {
    icon: '🌐',
    label: 'Google Login',
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg,#f59e0b,#b45309)',
  },
};

const FALLBACK_META: ActionMeta = {
  icon: '📌',
  label: 'Activity',
  color: '#718096',
  gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
};

const getMeta = (action: string): ActionMeta => ACTION_META[action] || FALLBACK_META;

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  actions?: string[];
}

const ALL_ACTION_KEYS = Object.keys(ACTION_META);

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All Activity', icon: <FaLayerGroup /> },
  { id: 'bookings', label: 'Bookings', icon: <FaTicketAlt />, actions: ['booking_created', 'booking_cancelled'] },
  { id: 'events', label: 'Events', icon: <FaCalendarDay />, actions: ['event_created', 'event_updated', 'event_deleted'] },
  { id: 'users', label: 'Users', icon: <FaUsers />, actions: ['user_registered', 'user_login', 'google_login'] },
];

const GROUP_KEYS = ['Today', 'Yesterday', 'This Week', 'Earlier'];

const getGroupLabel = (createdAt: string) => {
  const d = new Date(createdAt);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startToday.getDate() - 1);
  const startWeek = new Date(startToday);
  startWeek.setDate(startToday.getDate() - 7);
  if (d >= startToday) return 'Today';
  if (d >= startYesterday) return 'Yesterday';
  if (d >= startWeek) return 'This Week';
  return 'Earlier';
};

const formatRelativeTime = (date: string) => {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const PAGE_SIZE = 25;
const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalActivities, setTotalActivities] = useState(0);
  const [stats, setStats] = useState<{ totalActivities: number; todayActivities: number; distribution: { _id: string; count: number }[] }>({
    totalActivities: 0,
    todayActivities: 0,
    distribution: [],
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeAction, setActiveAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActions, setShowActions] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    try {
      const res = await activityAPI.getAll(pageNum, PAGE_SIZE);
      const items = res.data.activities;
      setActivities((prev) => (append ? [...prev, ...items] : items));
      setPage(pageNum);
      setHasMore(pageNum < res.data.totalPages);
      setTotalActivities(res.data.totalActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await activityAPI.getStats();
      setStats({
        totalActivities: res.data.totalActivities,
        todayActivities: res.data.todayActivities,
        distribution: res.data.stats || [],
      });
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPage(1, false);
  }, [fetchPage, fetchStats]);

  const loadMore = () => {
    setLoadingMore(true);
    fetchPage(page + 1, true);
  };

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    setActiveAction('');
    setShowActions(false);
  };

  const distributionData = useMemo(
    () =>
      (stats.distribution || []).map((s) => ({
        name: getMeta(s._id).label,
        value: s.count,
        fill: getMeta(s._id).color,
      })),
    [stats]
  );

  const topAction = distributionData.length ? distributionData.reduce((a, b) => (a.value > b.value ? a : b)) : null;

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    return activities.filter((a) => {
      if (cat && cat.id !== 'all' && cat.actions && !cat.actions.includes(a.action)) return false;
      if (activeAction && activeAction !== a.action) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          a.userName.toLowerCase().includes(q) ||
          a.userEmail.toLowerCase().includes(q) ||
          (a.eventTitle || '').toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activities, activeCategory, activeAction, searchTerm]);


  const grouped = useMemo(() => {
    const groups: Record<string, Activity[]> = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    filtered.forEach((a) => groups[getGroupLabel(a.createdAt)].push(a));
    return GROUP_KEYS.filter((k) => groups[k].length).map((k) => ({ key: k, items: groups[k] }));
  }, [filtered]);

  const topUsers = useMemo(() => {
    const map: Record<string, { name: string; email: string; count: number }> = {};
    activities.forEach((a) => {
      if (!map[a.userEmail]) map[a.userEmail] = { name: a.userName, email: a.userEmail, count: 0 };
      map[a.userEmail].count++;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [activities]);

  const activeCategoryActions = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    return cat && cat.actions ? cat.actions : ALL_ACTION_KEYS;
  }, [activeCategory]);

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
      ease: 'power2.out',
    });
  }, []);

  const handleItemLeave = useCallback((e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    });
  }, []);


  useEffect(() => {
    if (loading || activities.length === 0) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (titleRef.current) {
        const text = titleRef.current.textContent || '';
        titleRef.current.innerHTML = '';
        text.split(' ').forEach((word, wi) => {
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.style.marginRight = '0.4em';
          span.style.opacity = '0';
          span.style.transform = 'translateY(50px) rotateX(60deg)';
          span.style.transformStyle = 'preserve-3d';
          span.style.background = 'linear-gradient(135deg, #ffffff 0%, #ffd166 50%, #f093fb 100%)';
          span.style.webkitBackgroundClip = 'text';
          span.style.webkitTextFillColor = 'transparent';
          span.style.backgroundClip = 'text';
          span.style.filter = 'drop-shadow(0 4px 20px rgba(255, 209, 102, 0.35))';
          span.textContent = word;
          titleRef.current?.appendChild(span);
          tl.to(span, { opacity: 1, y: 0, rotationX: 0, duration: 0.7, ease: 'back.out(1.8)' }, wi * 0.12);
        });
      }
      tl.fromTo('.activity-header p', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }, '-=0.4');
      gsap.fromTo('.overview-card, .donut-card', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.activity-overview', start: 'top 90%' },
      });
      gsap.fromTo('.filter-bar', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.filter-bar', start: 'top 92%' },
      });
      gsap.fromTo('.day-group', { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.timeline', start: 'top 85%' },
      });
      gsap.fromTo('.activity-item', { opacity: 0, x: -70, scale: 0.94, rotationY: -12 }, {
        opacity: 1, x: 0, scale: 1, rotationY: 0, duration: 0.7, stagger: 0.06, ease: 'back.out(1.6)',
        transformPerspective: 900, scrollTrigger: { trigger: '.timeline', start: 'top 85%' },
      });
    }, pageRef);
    return () => ctx.revert();
  }, [loading]);

  const getActionIcon = (action: string) => getMeta(action).icon;
  const getActionGradient = (action: string) => getMeta(action).gradient;
  const getActionColor = (action: string) => getMeta(action).color;


  if (loading) {
    return (
      <div className="activity-log">
        <div className="loading">Loading activity…</div>
      </div>
    );
  }

  return (
    <div className="activity-log" ref={pageRef}>
      <div className="activity-bg-orb orb-1"></div>
      <div className="activity-bg-orb orb-2"></div>
      <div className="activity-bg-orb orb-3"></div>

      <div className="container">
        <div className="activity-header">
          <h1 ref={titleRef}>User Activity</h1>
          <p>Live feed of bookings, cancellations, events &amp; user actions</p>
        </div>

        <div className="activity-overview">
          <div className="overview-grid">
            <div className="overview-card">
              <span className="overview-icon"><FaLayerGroup /></span>
              <div className="overview-num">
                <h3>{totalActivities.toLocaleString()}</h3>
                <p>Total Activities</p>
              </div>
            </div>
            <div className="overview-card">
              <span className="overview-icon"><FaClock /></span>
              <div className="overview-num">
                <h3>{stats.todayActivities}</h3>
                <p>Today</p>
              </div>
            </div>
            {topAction && (
              <div className="overview-card">
                <span className="overview-icon"><FaFire /></span>
                <div className="overview-num">
                  <h3>{topAction.value}</h3>
                  <p>{topAction.name}</p>
                </div>
              </div>
            )}
            <div className="overview-card">
              <span className="overview-icon"><FaUsers /></span>
              <div className="overview-num">
                <h3>{topUsers.length ? topUsers[0].count : 0}</h3>
                <p>{topUsers.length ? topUsers[0].name : 'Most Active'}</p>
              </div>
            </div>
          </div>

          <div className="donut-card">
            <div className="donut-head">
              <h3><FaChartPie style={{ marginRight: '8px' }} /> Activity Breakdown</h3>
            </div>
            {distributionData.length > 0 ? (
              <div className="donut-body">
                <div className="donut-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {distributionData.map((e, i) => (
                          <Cell key={i} fill={e.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="donut-legend">
                  {distributionData.map((d, i) => (
                    <div key={i} className="donut-legend-row">
                      <span className="donut-dot" style={{ background: d.fill }} />
                      <span>{d.name}</span>
                      <strong>{d.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="donut-empty">No activity data yet</div>
            )}
          </div>
        </div>


        <div className="filter-bar">
          <div className="filter-categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`filter-chip ${activeCategory === c.id ? 'active' : ''}`}
                onClick={() => selectCategory(c.id)}
              >
                {c.icon}
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          <div className="filter-search">
            <FaSearch className="filter-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, email or event..."
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>
        </div>

        <div className="action-row">
          <button className="action-filter-toggle" onClick={() => setShowActions((s) => !s)}>
            <FaLayerGroup style={{ marginRight: '6px' }} /> Filter by action
          </button>
          {showActions && (
            <div className="action-chips">
              <button
                className={`action-chip ${activeAction === '' ? 'active' : ''}`}
                onClick={() => setActiveAction('')}
              >
                All
              </button>
              {activeCategoryActions.map((a) => (
                <button
                  key={a}
                  className={`action-chip ${activeAction === a ? 'active' : ''}`}
                  onClick={() => setActiveAction(a)}
                >
                  <span className="action-chip-dot" style={{ background: getMeta(a).color }} />
                  {getMeta(a).label}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="no-activities">
            <h2>No matching activity</h2>
            <p>Try adjusting the filters or search to find what you're looking for.</p>
          </div>
        ) : (
          <div className="timeline">
            {grouped.map((g) => (
              <div key={g.key} className="day-group">
                <div className="day-group-header">
                  <span className="day-badge">{g.key}</span>
                  <span className="day-count">{g.items.length} {g.items.length === 1 ? 'event' : 'events'}</span>
                </div>
                <div className="activities-list">
                  {g.items.map((a) => (
                    <div
                      key={a._id}
                      className="activity-item"
                      style={{ borderLeftColor: getActionColor(a.action) }}
                      onMouseMove={handleItemMove}
                      onMouseLeave={handleItemLeave}
                    >
                      <div className="activity-icon" style={{ background: getActionGradient(a.action) }}>
                        <span className="activity-icon-inner">{getActionIcon(a.action)}</span>
                      </div>
                      <div className="activity-content">
                        <div className="activity-main">
                          <div className="activity-text">
                            <span
                              className="activity-type-badge"
                              style={{ color: getActionColor(a.action), borderColor: getActionColor(a.action) }}
                            >
                              {getMeta(a.action).label}
                            </span>
                            <h3>{a.description}</h3>
                          </div>
                          <span className="activity-time" style={{ background: getActionColor(a.action) }}>
                            {formatRelativeTime(a.createdAt)}
                          </span>
                        </div>
                        <div className="activity-meta">
                          <span className="activity-user">👤 {a.userName}</span>
                          <span className="activity-email">📧 {a.userEmail}</span>
                          {a.eventTitle && <span className="activity-event">🎉 {a.eventTitle}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="load-more-wrap">
                <button className="load-more" onClick={loadMore} disabled={loadingMore}>
                  <FaSyncAlt style={{ marginRight: '8px' }} />
                  {loadingMore ? 'Loading more...' : 'Load More Activity'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const DonutTip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="donut-tooltip">
      <div className="donut-tooltip-label">{payload[0].name}</div>
      <div className="donut-tooltip-row">
        <span className="donut-tooltip-dot" style={{ background: payload[0].payload?.fill || '#667eea' }} />
        <span>{payload[0].name}:</span>
        <strong>{payload[0].value}</strong>
      </div>
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export default ActivityLog;

