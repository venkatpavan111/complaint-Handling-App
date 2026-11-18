import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Filter, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, FileText, ChevronRight, RefreshCw, MessageSquare } from 'lucide-react';

import { useSocket } from '../context/SocketContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { lastUpdatedComplaint } = useSocket();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = '/complaints?';
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const { data } = await API.get(url);
      setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, statusFilter, priorityFilter]);

  // Real-time table status update when Socket receives status change
  useEffect(() => {
    if (lastUpdatedComplaint) {
      setComplaints((prev) =>
        prev.map((c) => (c._id === lastUpdatedComplaint._id ? { ...c, ...lastUpdatedComplaint } : c))
      );
    }
  }, [lastUpdatedComplaint]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  // Metric summaries
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Submitted').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  const getPriorityBadge = (priority, score) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>HIGH ({score})</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span>MEDIUM ({score})</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span>LOW ({score})</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Submitted</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">In Progress</span>;
      case 'Resolved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Resolved</span>;
      case 'Closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Closed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/60 to-slate-950 border-b border-slate-800/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                  Student Portal
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {user?.identifier || 'STD-2026'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Track your active complaint tickets and get real-time resolution updates powered by ResolveQ.
              </p>
            </div>

            <Link
              to="/new-complaint"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Raise New Complaint</span>
            </Link>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Tickets</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{totalCount}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">{pendingCount}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">In Progress</span>
                <RefreshCw className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300 mt-2">{inProgressCount}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">{resolvedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Search & Filters */}
        <div className="glass-card p-4 rounded-2xl mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket ID, title, location, or description..."
                className="glass-input pl-10 w-full py-2.5 text-xs sm:text-sm"
              />
            </div>

            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="glass-input px-3 py-2.5 text-xs text-slate-200 bg-slate-900 border-slate-800"
            >
              <option value="">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Facilities">Facilities</option>
            </select>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="glass-input px-3 py-2.5 text-xs text-slate-200 bg-slate-900 border-slate-800"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-3 py-2.5 text-xs text-slate-200 bg-slate-900 border-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-700 flex items-center justify-center space-x-1"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </form>
        </div>

        {/* Complaints History Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Complaint History ({complaints.length})</span>
            </h3>

            <button
              onClick={fetchComplaints}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium">Fetching complaint history...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">No Complaints Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't filed any complaints matching the filter criteria yet. Click below to file a new issue.
              </p>
              <Link
                to="/new-complaint"
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Complaint</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-6">Ticket ID</th>
                    <th className="py-3.5 px-6">Subject & Category</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">AI Priority Score</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created Date</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {complaints.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-900/60 transition-colors group">
                      <td className="py-4 px-6 font-mono font-bold text-blue-400">
                        {item.ticketId}
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-bold text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                          {item.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-300 truncate max-w-[150px]">
                        📍 {item.location}
                      </td>

                      <td className="py-4 px-6">
                        {getPriorityBadge(item.priority, item.priorityScore)}
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </td>

                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/complaint/${item._id}`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/40 text-slate-200 hover:text-blue-300 font-semibold transition-all border border-slate-700/80 inline-flex items-center space-x-1"
                        >
                          <span>View & Chat</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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
    </div>
  );
};

export default StudentDashboard;
