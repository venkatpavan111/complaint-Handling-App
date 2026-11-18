import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from './api';

let socket = null;

export const initSocketConnection = (userId) => {
  if (!socket) {
    socket = io(BASE_BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Mobile connected:', socket.id);
      if (userId) {
        socket.emit('join_user_room', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Mobile disconnected');
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const joinComplaintRoom = (complaintId) => {
  if (socket) {
    socket.emit('join_complaint_room', complaintId);
  }
};

export const leaveComplaintRoom = (complaintId) => {
  if (socket) {
    socket.emit('leave_complaint_room', complaintId);
  }
};

export const sendTypingStart = (complaintId, userName) => {
  if (socket) {
    socket.emit('typing_start', { complaintId, userName });
  }
};

export const sendTypingStop = (complaintId) => {
  if (socket) {
    socket.emit('typing_stop', { complaintId });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
