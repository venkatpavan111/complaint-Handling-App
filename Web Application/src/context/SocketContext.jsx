import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  
  // Admin Real-Time States
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const [activeUrgentBanner, setActiveUrgentBanner] = useState(null);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [adminToastNotification, setAdminToastNotification] = useState(null);

  // Student Real-Time States
  const [studentNotification, setStudentNotification] = useState(null);
  const [lastUpdatedComplaint, setLastUpdatedComplaint] = useState(null);

  // Play audio chime when a real-time event occurs
  const playChimeSound = (freq = 880, duration = 0.4) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio chime warning:', e.message);
    }
  };

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server:', newSocket.id);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    // 1. Join personal user room (e.g. user_usr_student_001)
    socket.emit('join_user_room', user._id);

    // 2. Student Notification Listener
    const handleStudentNotification = (data) => {
      console.log('🔔 Student received real-time notification:', data);
      playChimeSound(987, 0.5); // High B5 note for student
      setStudentNotification(data);
      if (data.complaint) {
        setLastUpdatedComplaint(data.complaint);
      }
    };

    socket.on('NOTIFICATION_RECEIVED', handleStudentNotification);
    socket.on('complaint_updated', handleStudentNotification);

    // 3. Admin Room & Events
    if (user.role === 'ADMIN') {
      socket.emit('join_admin_room');
      console.log('🚨 Admin joined admin_room on socket');

      // Admin Listener: New Complaint Submitted by Student
      const handleNewComplaintSubmitted = (data) => {
        console.log('📩 Admin received real-time complaint alert:', data);
        playChimeSound(659, 0.45); // E5 note for new ticket
        setAdminNotifications((prev) => [data, ...prev]);
        setAdminUnreadCount((prev) => prev + 1);
        setAdminToastNotification(data);
      };

      // Admin Listener: High Priority Urgent Strobe Alert
      const handleUrgentAlert = (data) => {
        console.warn('🚨 Admin received URGENT_COMPLAINT_ALERT:', data);
        playChimeSound(880, 0.6);
        setUrgentAlerts((prev) => [data.complaint, ...prev]);
        setActiveUrgentBanner(data.complaint);
      };

      socket.on('NEW_COMPLAINT_SUBMITTED', handleNewComplaintSubmitted);
      socket.on('new_complaint', handleNewComplaintSubmitted);
      socket.on('URGENT_COMPLAINT_ALERT', handleUrgentAlert);

      return () => {
        socket.off('NEW_COMPLAINT_SUBMITTED', handleNewComplaintSubmitted);
        socket.off('new_complaint', handleNewComplaintSubmitted);
        socket.off('URGENT_COMPLAINT_ALERT', handleUrgentAlert);
        socket.off('NOTIFICATION_RECEIVED', handleStudentNotification);
        socket.off('complaint_updated', handleStudentNotification);
      };
    }

    return () => {
      socket.off('NOTIFICATION_RECEIVED', handleStudentNotification);
      socket.off('complaint_updated', handleStudentNotification);
    };
  }, [socket, user]);

  const dismissAdminToast = () => setAdminToastNotification(null);
  const dismissStudentNotification = () => setStudentNotification(null);
  const clearAdminUnreadCount = () => setAdminUnreadCount(0);

  return (
    <SocketContext.Provider
      value={{
        socket,
        urgentAlerts,
        activeUrgentBanner,
        dismissUrgentBanner: () => setActiveUrgentBanner(null),
        adminNotifications,
        adminUnreadCount,
        adminToastNotification,
        dismissAdminToast,
        clearAdminUnreadCount,
        studentNotification,
        dismissStudentNotification,
        lastUpdatedComplaint,
        clearAlerts: () => setUrgentAlerts([])
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
