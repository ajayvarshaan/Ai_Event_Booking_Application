import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  BarChart,
} from 'recharts';
import {
  FaChartLine,
  FaChartPie,
  FaTrophy,
  FaCrown,
  FaFire,
  FaChair,
  FaTicketAlt,
} from 'react-icons/fa';
import './DashboardCharts.css';

interface UserBookingStat {
  _id: string;
  userName: string;
  userEmail: string;
  totalBookings: number;
  totalSeats: number;
  totalSpent: number;
  events: { eventTitle: string; seats: number; totalPrice: number; bookingDate: string }[];
}

interface CanceledBookingStat {
  _id: string;
  userName: string;
  userEmail: string;
  totalCanceled: number;
  totalSeats: number;
  totalRefunded: number;
  events: { eventTitle: string; seats: number; totalPrice: number; canceledDate: string }[];
}

interface Event {
  _id: string;
  title: string;
  category: string;
  capacity: number;
  availableSeats: number;
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

interface Props {
  userBookingStats: UserBookingStat[];
  canceledBookingStats: CanceledBookingStat[];
  allEvents: Event[];
  stats: DashboardStats;
  loading: boolean;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#00c8ff', '#ffd166', '#48bb78', '#f56565', '#ed8936'];

const MONEY_KEYS = ['Revenue', 'Refunds', 'Spent'];

const monthKey = (d: string) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
};

const truncate = (str: string, n: number) => (str.length > n ? `${str.slice(0, n)}…` : str);

/* eslint-disable @typescript-eslint/no-explicit-any */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      {label != null && <div className="chart-tooltip-label">{label}</div>}
      {payload.map((p: any, i: number) => {
        const isMoney = MONEY_KEYS.includes(String(p.name));
        const val = typeof p.value === 'number' ? p.value.toLocaleString() : String(p.value);
        return (
          <div key={i} className="chart-tooltip-row">
            <span className="chart-tooltip-dot" style={{ background: p.color || p.payload?.fill || '#667eea' }} />
            <span>{p.name}:</span>
            <strong>{isMoney ? `$${val}` : val}</strong>
          </div>
        );
      })}
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const CHART_AXIS = { fill: 'rgba(255,255,255,0.55)', fontSize: 12 };
const CHART_GRID = 'rgba(255,255,255,0.08)';

const DashboardCharts: React.FC<Props> = ({
  userBookingStats,
  canceledBookingStats,
  allEvents,
  stats,
  loading,
}) => {
  const trendData = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const map: Record<string, { revenue: number; bookings: number; refunds: number }> = {};
    months.forEach((m) => {
      map[m] = { revenue: 0, bookings: 0, refunds: 0 };
    });
    userBookingStats.forEach((u) =>
      u.events.forEach((e) => {
        const k = monthKey(e.bookingDate);
        if (map[k]) {
          map[k].revenue += e.totalPrice;
          map[k].bookings += 1;
        }
      })
    );
    canceledBookingStats.forEach((u) =>
      u.events.forEach((e) => {
        const k = monthKey(e.canceledDate);
        if (map[k]) map[k].refunds += e.totalPrice;
      })
    );
    return months.map((m) => ({
      name: monthLabel(m),
      Revenue: Math.round(map[m].revenue),
      Refunds: Math.round(map[m].refunds),
      Bookings: map[m].bookings,
    }));
  }, [userBookingStats, canceledBookingStats]);

  const categoryRevenue = useMemo(() => {
    const titleToCategory: Record<string, string> = {};
    allEvents.forEach((ev) => {
      titleToCategory[ev.title] = ev.category;
    });
    const map: Record<string, number> = {};
    userBookingStats.forEach((u) =>
      u.events.forEach((e) => {
        const cat = titleToCategory[e.eventTitle] || 'Other';
        map[cat] = (map[cat] || 0) + e.totalPrice;
      })
    );
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [userBookingStats, allEvents]);

  const topEvents = useMemo(() => {
    const map: Record<string, number> = {};
    userBookingStats.forEach((u) =>
      u.events.forEach((e) => {
        map[e.eventTitle] = (map[e.eventTitle] || 0) + e.totalPrice;
      })
    );
    return Object.entries(map)
      .map(([name, value]) => ({ name: truncate(name, 16), Revenue: Math.round(value) }))
      .sort((a, b) => b.Revenue - a.Revenue)
      .slice(0, 6);
  }, [userBookingStats]);

  const topCustomers = useMemo(
    () =>
      [...userBookingStats]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 6)
        .map((u) => ({ name: truncate(u.userName, 15), Spent: Math.round(u.totalSpent), Bookings: u.totalBookings })),
    [userBookingStats]
  );

  const occupancy = useMemo(() => {
    let capacity = 0;
    let booked = 0;
    allEvents.forEach((ev) => {
      capacity += ev.capacity;
      booked += ev.capacity - ev.availableSeats;
    });
    const pct = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
    return { capacity, booked, pct };
  }, [allEvents]);

  const seatUtilization = useMemo(
    () =>
      [...allEvents]
        .sort((a, b) => b.capacity - b.availableSeats - (a.capacity - a.availableSeats))
        .slice(0, 6)
        .map((ev) => ({
          name: truncate(ev.title, 13),
          Booked: ev.capacity - ev.availableSeats,
          Available: ev.availableSeats,
        })),
    [allEvents]
  );

  const bookingSplit = useMemo(
    () => [
      { name: 'Active', value: stats.totalBookings },
      { name: 'Canceled', value: stats.totalCanceledBookings },
    ],
    [stats]
  );

  const hasChartData =
    userBookingStats.length > 0 || categoryRevenue.length > 0 || allEvents.length > 0;

  if (loading) {
    return (
      <div className="charts-section">
        <div className="charts-header">
          <h2><FaChartLine style={{ marginRight: '8px' }} /> Analytics &amp; Insights</h2>
          <p>Visualizing your booking performance in real time.</p>
        </div>
        <div className="charts-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="chart-card chart-card-skeleton">
              <div className="skeleton-title" />
              <div className="skeleton-body" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasChartData) {
    return (
      <div className="charts-section">
        <div className="charts-header">
          <h2><FaChartLine style={{ marginRight: '8px' }} /> Analytics &amp; Insights</h2>
          <p>Visualizing your booking performance in real time.</p>
        </div>
        <div className="charts-empty">
          <FaChartPie />
          <p>No booking data available yet. Charts will appear here once bookings are created.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-section">
      <div className="charts-header">
        <h2><FaChartLine style={{ marginRight: '8px' }} /> Analytics &amp; Insights</h2>
        <p>Visualizing your booking performance in real time.</p>
      </div>

      <div className="charts-grid">
        {/* Revenue & Bookings Trend */}
        <div className="chart-card chart-card-wide">
          <div className="chart-card-head">
            <span className="chart-kicker"><FaTicketAlt style={{ marginRight: '6px' }} /> Trends</span>
            <h3>Revenue &amp; Bookings</h3>
            <p>Monthly revenue and booking volume (last 6 months)</p>
          </div>
          {trendData.every((d) => d.Revenue === 0 && d.Bookings === 0) ? (
            <div className="chart-empty-inline">No booking activity in recent months.</div>
          ) : (
            <div className="chart-canvas chart-canvas-lg">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#764ba2" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={CHART_AXIS} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={CHART_AXIS} axisLine={false} tickLine={false} width={44} />
                  <YAxis yAxisId="right" orientation="right" tick={CHART_AXIS} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <Bar yAxisId="right" dataKey="Bookings" fill="#f093fb" radius={[4, 4, 0, 0]} barSize={18} />
                  <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="#00c8ff" strokeWidth={2.5} fill="url(#revGrad)" />
                  <Area yAxisId="left" type="monotone" dataKey="Refunds" stroke="#f56565" strokeWidth={2} fill="transparent" strokeDasharray="5 4" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

{/* Revenue by Category */}
        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-kicker"><FaChartPie style={{ marginRight: '6px' }} /> Breakdown</span>
            <h3>Revenue by Category</h3>
            <p>Where your revenue comes from</p>
          </div>
          {categoryRevenue.length === 0 ? (
            <div className="chart-empty-inline">No revenue data.</div>
          ) : (
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="chart-legend-stats">
            {categoryRevenue.slice(0, 4).map((c, i) => (
              <div key={c.name} className="chart-legend-stat">
                <span className="chart-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                <span>{c.name}</span>
                <strong>${c.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events by Revenue */}
        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-kicker"><FaTrophy style={{ marginRight: '6px' }} /> Leaders</span>
            <h3>Top Events by Revenue</h3>
            <p>Highest grossing events</p>
          </div>
          {topEvents.length === 0 ? (
            <div className="chart-empty-inline">No revenue data.</div>
          ) : (
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEvents} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tick={CHART_AXIS} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ ...CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="Revenue" radius={[0, 6, 6, 0]} barSize={16}>
                    {topEvents.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-kicker"><FaCrown style={{ marginRight: '6px' }} /> Customers</span>
            <h3>Top Customers by Spend</h3>
            <p>Most valuable users</p>
          </div>
          {topCustomers.length === 0 ? (
            <div className="chart-empty-inline">No customer data.</div>
          ) : (
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomers} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tick={CHART_AXIS} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ ...CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="Spent" radius={[0, 6, 6, 0]} barSize={16}>
                    {topCustomers.map((_, i) => (
                      <Cell key={i} fill={['#00c8ff', '#f093fb', '#ffd166', '#48bb78', '#667eea', '#764ba2'][i % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>


        {/* Seat Occupancy */}
        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-kicker"><FaChair style={{ marginRight: '6px' }} /> Capacity</span>
            <h3>Seat Occupancy</h3>
            <p>Overall seat utilization across all events</p>
          </div>
          <div className="occupancy-wrap">
            <div className="occupancy-gauge">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={14}
                  data={[{ name: 'Occupancy', value: occupancy.pct }]}
                  startAngle={210}
                  endAngle={-30}
                >
                  <defs>
                    <linearGradient id="occGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#f093fb" />
                    </linearGradient>
                  </defs>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: 'rgba(255,255,255,0.08)' }}
                    fill="url(#occGrad)"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="occupancy-center">
                <div className="occupancy-value">{occupancy.pct}%</div>
                <div className="occupancy-label">Occupied</div>
              </div>
            </div>
            <div className="occupancy-stats">
              <div className="occupancy-row">
                <span>Total Capacity</span>
                <strong>{occupancy.capacity.toLocaleString()}</strong>
              </div>
              <div className="occupancy-row">
                <span>Booked Seats</span>
                <strong>{occupancy.booked.toLocaleString()}</strong>
              </div>
              <div className="occupancy-row">
                <span>Available</span>
                <strong>{(occupancy.capacity - occupancy.booked).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Split */}
        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-kicker"><FaFire style={{ marginRight: '6px' }} /> Performance</span>
            <h3>Booking Split</h3>
            <p>Active vs. canceled bookings</p>
          </div>
          <div className="split-wrap">
            <div className="chart-canvas chart-canvas-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingSplit}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    stroke="none"
                  >
                    <Cell fill="#48bb78" />
                    <Cell fill="#f56565" />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="split-stats">
              <div className="split-row">
                <span className="split-dot" style={{ background: '#48bb78' }} />
                <span>Active</span>
                <strong>{stats.totalBookings}</strong>
              </div>
              <div className="split-row">
                <span className="split-dot" style={{ background: '#f56565' }} />
                <span>Canceled</span>
                <strong>{stats.totalCanceledBookings}</strong>
              </div>
              <div className="split-row">
                <span className="split-dot" style={{ background: '#ffd166' }} />
                <span>Refunded</span>
                <strong>${stats.totalRefundedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>
        </div>


        {/* Seat Utilization */}
        <div className="chart-card chart-card-wide">
          <div className="chart-card-head">
            <span className="chart-kicker"><FaTicketAlt style={{ marginRight: '6px' }} /> Utilization</span>
            <h3>Seat Utilization per Event</h3>
            <p>Booked vs. available seats for top events</p>
          </div>
          {seatUtilization.length === 0 ? (
            <div className="chart-empty-inline">No events available.</div>
          ) : (
            <div className="chart-canvas chart-canvas-lg">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={seatUtilization} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={CHART_AXIS} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={CHART_AXIS} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <Bar dataKey="Booked" stackId="a" fill="#667eea" barSize={22} />
                  <Bar dataKey="Available" stackId="a" fill="rgba(255,255,255,0.12)" radius={[4, 4, 0, 0]} barSize={22} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
