import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Shield, AlertTriangle, CheckCircle2, Clock, Filter, Search, UserCheck, RefreshCw, BarChart2, PieChart, Edit3, X, Save, MessageSquare, ChevronRight, Zap } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { urgentAlerts, adminToastNotification } = useSocket();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected complaint for Status & Department assignment drawer/modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('In Progress');
  const [modalResolutionNotes, setModalResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system analytics
      const analyticsRes = await API.get('/complaints/analytics');
      setAnalytics(analyticsRes.data);

      // 2. Fetch all complaints with filters
      let url = '/complaints?';
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const complaintsRes = await API.get(url);
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [priorityFilter, categoryFilter, statusFilter]);

  // Real-time table update when a new complaint is submitted by any student
  useEffect(() => {
    if (adminToastNotification?.complaint) {
      const newTicket = adminToastNotification.complaint;
      setComplaints((prev) => {
        const exists = prev.some((c) => c._id === newTicket._id);
        if (exists) return prev;
        return [newTicket, ...prev];
      });

      // Update total metrics count dynamically
      setAnalytics((prev) => {
        if (!prev) return prev;
        const metrics = prev.metrics || {};
        return {
          ...prev,
          metrics: {
            ...metrics,
            totalComplaints: (metrics.totalComplaints || 0) + 1,
            submittedCount: (metrics.submittedCount || 0) + 1,
            highPriorityCount: newTicket.priority === 'HIGH' ? (metrics.highPriorityCount || 0) + 1 : metrics.highPriorityCount
          }
        };
      });
    }
  }, [adminToastNotification]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalResolutionNotes(complaint.resolutionNotes || '');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      await API.put(`/complaints/${selectedComplaint._id}/status`, {
        status: modalStatus,
        assignedAdminId: user._id,
        resolutionNotes: modalResolutionNotes,
        adminRemarks: modalResolutionNotes,
        note: `Updated to ${modalStatus} by Admin ${user.name}`
      });

      setSelectedComplaint(null);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Chart data setup
  const categoryLabels = analytics?.categoryBreakdown?.map(c => c._id) || ['Academic', 'Maintenance', 'Facilities'];
  const categoryCounts = analytics?.categoryBreakdown?.map(c => c.count) || [0, 0, 0];

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'],
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  const statusData = {
    labels: ['Submitted', 'In Progress', 'Resolved', 'Closed'],
    datasets: [
      {
        label: 'Complaint Count',
        data: [
          analytics?.metrics?.submittedCount || 0,
          analytics?.metrics?.inProgressCount || 0,
          analytics?.metrics?.resolvedCount || 0,
          analytics?.metrics?.closedCount || 0
        ],
        backgroundColor: ['#3b82f6', '#6366f1', '#10b981', '#64748b'],
        borderRadius: 8
      }
    ]
  };

  const highPriorityTickets = complaints.filter(c => c.priority === 'HIGH');

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      
      {/* Admin Command Header */}
      <div className="bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border-b border-slate-800 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin Control Center</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Department: {user?.department || 'Administration'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
                Grievance Command & Control
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Monitor live complaints, dispatch high-priority urgent cases, and update resolution statuses.
              </p>
            </div>

            <button
              onClick={fetchAdminData}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-md shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="glass-card p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400">Total System Complaints</span>
              <div className="text-2xl font-black text-white mt-1">{analytics?.metrics?.totalComplaints || 0}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border-rose-500/30 bg-rose-950/20">
              <span className="text-xs font-semibold text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>High Priority Alerts</span>
              </span>
              <div className="text-2xl font-black text-rose-400 mt-1">{analytics?.metrics?.highPriorityCount || 0}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <span className="text-xs font-semibold text-amber-400">Pending Action</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{analytics?.metrics?.submittedCount || 0}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <span className="text-xs font-semibold text-indigo-400">In Progress</span>
              <div className="text-2xl font-black text-indigo-300 mt-1">{analytics?.metrics?.inProgressCount || 0}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <span className="text-xs font-semibold text-emerald-400">Resolution Rate</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{analytics?.metrics?.resolutionRate || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Urgent Alert Center Section */}
        {highPriorityTickets.length > 0 && (
          <div className="glass-card p-6 rounded-3xl border-2 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900">
            <div className="flex items-center space-x-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>🚨 Urgent High Priority Action Required ({highPriorityTickets.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highPriorityTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 space-y-2 hover:border-rose-500/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-400">{ticket.ticketId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300">
                      Score: {ticket.priorityScore}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{ticket.title}</h4>
                  <p className="text-[11px] text-slate-400">📍 {ticket.location}</p>

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      onClick={() => openStatusModal(ticket)}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Manage Status</span>
                    </button>
                    <button
                      onClick={() => navigate(`/complaint/${ticket._id}`)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                      title="Open Live Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Breakdown Chart */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-extrabold text-white mb-4 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Category Volume Breakdown</span>
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#94a3b8', font: { size: 12 } } }
                  }
                }}
              />
            </div>
          </div>

          {/* Status Distribution Chart */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-extrabold text-white mb-4 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <span>Resolution Pipeline Status</span>
            </h3>
            <div className="h-64">
              <Bar
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </div>

        </div>

        {/* Complaints List Management Table */}
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>All Complaints Management</span>
              </h3>
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets..."
                  className="glass-input pl-9 w-full py-2 text-xs"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="glass-input px-3 py-2 text-xs bg-slate-900 text-slate-200"
              >
                <option value="">All Priorities</option>
                <option value="HIGH">🚨 High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-input px-3 py-2 text-xs bg-slate-900 text-slate-200"
              >
                <option value="">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Facilities">Facilities</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="glass-input px-3 py-2 text-xs bg-slate-900 text-slate-200"
              >
                <option value="">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </form>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium">Fetching complaint list...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-6">Ticket ID</th>
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Title & Category</th>
                    <th className="py-3.5 px-6">Urgency Score</th>
                    <th className="py-3.5 px-6">Current Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {complaints.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-purple-400">
                        {item.ticketId}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{item.student?.name}</div>
                        <div className="text-[10px] text-slate-400">{item.student?.email}</div>
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-bold text-slate-200 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Category: {item.category}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          item.priority === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : item.priority === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {item.priority} ({item.priorityScore})
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openStatusModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold transition-all border border-purple-500/30 inline-flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Status</span>
                        </button>
                        <button
                          onClick={() => navigate(`/complaint/${item._id}`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all border border-slate-700 inline-flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* Status & Department Assignment Drawer / Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Update Ticket Status: <span className="text-purple-400">{selectedComplaint.ticketId}</span>
                </h3>
                <p className="text-xs text-slate-400">{selectedComplaint.title}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Lifecycle Status Stage
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="glass-input w-full p-3 text-xs bg-slate-900 text-slate-100"
                >
                  <option value="Pending">Pending (Awaiting Review)</option>
                  <option value="In Progress">In Progress (Under Action)</option>
                  <option value="Resolved">Resolved (Fixed)</option>
                  <option value="Closed">Closed (Completed & Archived)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Resolution Notes / Progress Log
                </label>
                <textarea
                  rows={4}
                  value={modalResolutionNotes}
                  onChange={(e) => setModalResolutionNotes(e.target.value)}
                  placeholder="Provide detailed action taken by maintenance or staff..."
                  className="glass-input w-full p-3 text-xs resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? 'Saving...' : 'Update Ticket'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
