import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Bell, X, ArrowRight, ShieldAlert, Sparkles, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RealtimeNotificationToast = () => {
  const { user } = useAuth();
  const { 
    adminToastNotification, 
    dismissAdminToast,
    studentNotification,
    dismissStudentNotification 
  } = useSocket();
  const navigate = useNavigate();

  // Auto dismiss toast after 7 seconds
  useEffect(() => {
    if (adminToastNotification) {
      const timer = setTimeout(() => {
        dismissAdminToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [adminToastNotification]);

  useEffect(() => {
    if (studentNotification) {
      const timer = setTimeout(() => {
        dismissStudentNotification();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [studentNotification]);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  // 1. Admin Real-Time Toast: New Complaint Submitted (Student -> Admin)
  if (isAdmin && adminToastNotification) {
    const { message, complaint } = adminToastNotification;
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce">
        <div className="bg-slate-900 border-2 border-indigo-500 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-xl ring-4 ring-indigo-500/20 relative overflow-hidden">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/40 text-indigo-300 shrink-0">
              <Inbox className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  📩 New Ticket Submitted
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
              </div>

              <p className="mt-1 text-xs font-bold text-white leading-snug">
                {message || `New Complaint Submitted: "${complaint?.title}"`}
              </p>
              
              {complaint?.location && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  📍 {complaint.location}
                </p>
              )}

              <div className="mt-2.5 flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (complaint?._id) navigate(`/complaint/${complaint._id}`);
                    else navigate('/admin');
                    dismissAdminToast();
                  }}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center space-x-1"
                >
                  <span>Review Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={dismissAdminToast}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Student Real-Time Toast: Complaint Resolved / Status Changed (Admin -> Student)
  if (!isAdmin && studentNotification) {
    const { title, message, complaint, status } = studentNotification;
    const isResolved = status === 'Resolved' || studentNotification.type === 'COMPLAINT_RESOLVED';

    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce">
        <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 text-white relative overflow-hidden ${
          isResolved
            ? 'bg-slate-900 border-emerald-500 ring-4 ring-emerald-500/20'
            : 'bg-slate-900 border-blue-500 ring-4 ring-blue-500/20'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              isResolved 
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-blue-500/20 border-blue-400/40 text-blue-300'
            }`}>
              <CheckCircle2 className={`w-5 h-5 ${isResolved ? 'text-emerald-400' : 'text-blue-400'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isResolved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {isResolved ? '🎉 Ticket Resolved' : '🔄 Status Updated'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live</span>
              </div>

              <h4 className="mt-1 text-xs font-bold text-white leading-snug">
                {title || 'Ticket Notification'}
              </h4>

              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {message || `Your complaint has been marked as ${status || 'Resolved'}`}
              </p>

              <div className="mt-2.5 flex items-center space-x-2">
                {complaint?._id && (
                  <button
                    onClick={() => {
                      navigate(`/complaint/${complaint._id}`);
                      dismissStudentNotification();
                    }}
                    className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center space-x-1 ${
                      isResolved 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <span>View Resolution & Rating</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={dismissStudentNotification}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RealtimeNotificationToast;
