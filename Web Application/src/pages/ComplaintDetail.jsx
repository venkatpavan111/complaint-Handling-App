import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ArrowLeft, MessageSquare, Send, Star, ShieldCheck, Clock, CheckCircle2, User, MapPin, Tag, AlertTriangle, FileText, Check } from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);

  // Feedback state
  const [feedback, setFeedback] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchComplaintDetails = async () => {
    try {
      const { data } = await API.get(`/complaints/${id}`);
      setComplaint(data);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/messages/${id}`);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const { data } = await API.get(`/feedback/${id}`);
      setFeedback(data);
    } catch (err) {
      // Feedback might not exist yet
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchComplaintDetails();
      await fetchMessages();
      await fetchFeedback();
      setLoading(false);
    };
    initData();
  }, [id]);

  // Socket room join & real-time chat setup
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_complaint_room', id);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    };

    const handleStatusUpdate = (updatedTicket) => {
      setComplaint(updatedTicket);
    };

    const handleTyping = (data) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    };

    socket.on('NEW_CHAT_MESSAGE', handleNewMessage);
    socket.on('COMPLAINT_STATUS_UPDATED', handleStatusUpdate);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.emit('leave_complaint_room', id);
      socket.off('NEW_CHAT_MESSAGE', handleNewMessage);
      socket.off('COMPLAINT_STATUS_UPDATED', handleStatusUpdate);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage('');

    try {
      await API.post('/messages', {
        complaintId: id,
        text: textToSend
      });
      // Message socket broadcast is handled by backend server controller
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTypingInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && user) {
      socket.emit('typing_start', { complaintId: id, userName: user.name });
      setTimeout(() => {
        socket.emit('typing_stop', { complaintId: id });
      }, 2000);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const { data } = await API.post('/feedback', {
        complaintId: id,
        rating,
        comments: feedbackComments
      });
      setFeedback(data);
      setFeedbackSuccess(true);
    } catch (err) {
      console.error('Feedback submission failed:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium">Loading complaint ticket details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Complaint Ticket Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const steps = ['Submitted', 'In Progress', 'Resolved', 'Closed'];
  const currentStepIndex = steps.indexOf(complaint.status) !== -1 ? steps.indexOf(complaint.status) : 0;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Back */}
        <button
          onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </button>

        {/* Ticket Title & Overview Header */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl mb-8 border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-xl">
                  {complaint.ticketId}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {complaint.category}
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                  complaint.priority === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : complaint.priority === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {complaint.priority} PRIORITY ({complaint.priorityScore}/100)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {complaint.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{complaint.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Student: {complaint.student?.name} ({complaint.student?.email})</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filed: {new Date(complaint.createdAt).toLocaleString()}</span>
                </span>
              </div>
            </div>

            {/* Assigned Admin badge */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Assigned Administrator
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  {complaint.assignedAdmin?.name ? complaint.assignedAdmin.name[0] : 'A'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {complaint.assignedAdmin?.name || 'Unassigned / General Queue'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {complaint.assignedAdmin?.department || 'Staff Officer'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Lifecycle Visual Timeline */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Ticket Lifecycle Status Timeline
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="relative">
                    <div className={`h-2 rounded-full transition-all ${
                      isPassed ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-800'
                    }`} />
                    <div className="mt-2 flex items-center space-x-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-blue-500 text-white animate-pulse'
                          : isPassed
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isPassed ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                      </div>
                      <span className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-blue-400' : isPassed ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Two Column Grid: Left Description & Notes, Right Live Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Description, Reason, Resolution Notes, Star Rating Feedback) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Description Card */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Problem Description
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                {complaint.description}
              </p>

              {complaint.imageUrl && (
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Attached Proof / Photo Evidence
                  </span>
                  <a href={complaint.imageUrl} target="_blank" rel="noreferrer" className="block group relative rounded-2xl overflow-hidden border border-slate-800">
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint Evidence Attachment"
                      className="w-full max-h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                </div>
              )}

              {complaint.priorityReason && (
                <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    AI Priority Diagnosis
                  </span>
                  <p className="text-xs text-slate-300">
                    {complaint.priorityReason}
                  </p>
                </div>
              )}

              {complaint.resolutionNotes && (
                <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Resolution Notes from Staff
                  </span>
                  <p className="text-xs text-emerald-200">
                    {complaint.resolutionNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Post-Resolution Star Rating Feedback */}
            {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
              <div className="glass-card p-6 rounded-3xl border border-slate-800">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 mb-3">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Resolution Feedback</span>
                </h3>

                {feedback ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-5 h-5 ${
                            s <= feedback.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 italic">
                      "{feedback.comments || 'No comments provided'}"
                    </p>
                    <span className="text-[10px] text-slate-500 block">Submitted Feedback</span>
                  </div>
                ) : user?.role === 'STUDENT' ? (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">
                        Rate Resolution Quality (1-5 Stars)
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        Feedback / Comments
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackComments}
                        onChange={(e) => setFeedbackComments(e.target.value)}
                        placeholder="Was your complaint handled efficiently?"
                        className="glass-input w-full p-2.5 text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Star Feedback'}
                    </button>
                  </form>
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    Awaiting student rating feedback.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Real-Time Live Chat Window */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl border border-slate-800 flex flex-col h-[580px] overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Student-Admin Communication</h3>
                    <p className="text-[10px] text-slate-400">
                      Real-time chat socket room: <span className="font-mono text-blue-400">complaint_{id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Socket Connected</span>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-xs font-medium">No messages yet in this ticket thread.</p>
                    <p className="text-[10px] text-slate-600">Start the conversation below.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSelf = msg.sender?._id === user?._id || msg.sender === user?._id;
                    const isAdmin = msg.sender?.role === 'ADMIN';

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center space-x-1 mb-1 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-300">
                            {msg.sender?.name || (isSelf ? 'You' : 'Staff')}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                            isSelf
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : isAdmin
                              ? 'bg-purple-900/70 text-purple-100 border border-purple-700/50 rounded-tl-none'
                              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              {typingUser && (
                <div className="px-4 py-1 text-[10px] text-slate-400 italic bg-slate-900/50">
                  ⚡ {typingUser} is typing...
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTypingInputChange}
                  placeholder="Type your message to staff or student..."
                  className="glass-input flex-1 px-4 py-2.5 text-xs text-slate-100"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;
