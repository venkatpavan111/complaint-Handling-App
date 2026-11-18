import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Shield, PlusCircle, LayoutDashboard, LogOut, Bell, User, AlertTriangle, Inbox } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { urgentAlerts, adminUnreadCount, clearAdminUnreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isStudent = user.role === 'STUDENT';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={isStudent ? '/dashboard' : '/admin'} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ResolveQ
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                System
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">College Complaint Resolution</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          {isStudent ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">My Complaints</span>
              </Link>
              <Link
                to="/new-complaint"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/new-complaint'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Complaint</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin"
                onClick={clearAdminUnreadCount}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative ${
                  location.pathname === '/admin'
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Command Center</span>

                {/* Real-time Unread Complaint Badge Counter for Admin */}
                {adminUnreadCount > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black rounded-full bg-indigo-500 text-white shadow-md shadow-indigo-500/50 animate-bounce">
                    +{adminUnreadCount} New
                  </span>
                )}
              </Link>

              {urgentAlerts.length > 0 && (
                <div className="relative">
                  <span className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{urgentAlerts.length} Urgent</span>
                  </span>
                </div>
              )}
            </>
          )}

          {/* User Profile Pill & Logout */}
          <div className="pl-3 border-l border-slate-800 flex items-center space-x-3">
            <Link
              to="/profile"
              title="View & Edit Profile"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${
                location.pathname === '/profile'
                  ? 'bg-indigo-600/20 text-white border-indigo-500/50 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800/50 text-slate-200 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  {user.role} • Profile
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
