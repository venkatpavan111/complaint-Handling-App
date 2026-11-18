import React from 'react';
import { useSocket } from '../context/SocketContext';
import { AlertOctagon, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UrgentAlertStrobe = () => {
  const { activeUrgentBanner, dismissUrgentBanner } = useSocket();
  const navigate = useNavigate();

  if (!activeUrgentBanner) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md w-full animate-bounce">
      <div className="relative overflow-hidden bg-rose-950/90 border-2 border-rose-500 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-xl ring-4 ring-rose-500/20">
        
        {/* Pulsing Strobe Background Glow */}
        <div className="absolute inset-0 bg-rose-600/20 animate-pulse pointer-events-none" />

        <div className="relative z-10 flex items-start space-x-3">
          <div className="p-2.5 bg-rose-600/40 rounded-xl border border-rose-400/50 text-rose-200 shrink-0 animate-spin-slow">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white uppercase tracking-wider animate-pulse">
                🚨 High Priority Alert
              </span>
              <span className="text-xs font-mono font-bold text-rose-300">
                Score: {activeUrgentBanner.priorityScore}/100
              </span>
            </div>

            <h4 className="mt-1 text-sm font-bold text-white truncate">
              {activeUrgentBanner.ticketId}: {activeUrgentBanner.title}
            </h4>

            <p className="text-xs text-rose-200/90 line-clamp-2 mt-0.5">
              📍 Location: {activeUrgentBanner.location}
            </p>

            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={() => {
                  navigate(`/complaint/${activeUrgentBanner._id}`);
                  dismissUrgentBanner();
                }}
                className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
              >
                <span>View Ticket Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={dismissUrgentBanner}
                className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-800/50 rounded-xl transition-all"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgentAlertStrobe;
