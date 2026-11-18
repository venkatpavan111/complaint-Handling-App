import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export const ComplaintsContext = createContext();

const INITIAL_SAMPLE_TICKETS = [
  {
    _id: 't_001',
    ticketId: 'TKT-9842',
    title: 'Lab 3 Projector power failure during exam prep',
    description: 'During our afternoon lab revision session, the main overhead projector sparked and suffered a complete power cut. Exam is in 2 days and student presentations are blocked.',
    category: 'Academic',
    location: 'Block B - Room 304',
    priority: 'HIGH',
    priorityScore: 88,
    priorityReason: 'Urgent exam keywords and electrical hazard detected.',
    status: 'In Progress',
    assignedAdmin: { name: 'Prof. David Vance (IT & Labs)' },
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
      { status: 'Analyzed', timestamp: new Date(Date.now() - 3600000 * 5.8).toISOString() },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    ],
    attachments: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    _id: 't_002',
    ticketId: 'TKT-9810',
    title: 'Water dispenser leaking in Hostel Block 2 1st floor',
    description: 'The main water cooler dispenser on the first floor is leaking heavily on the floor, creating a slip hazard for students.',
    category: 'Maintenance',
    location: 'Hostel 2 - Hallway',
    priority: 'MEDIUM',
    priorityScore: 54,
    priorityReason: 'Water leakage slip hazard in high traffic dorm area.',
    status: 'Submitted',
    assignedAdmin: { name: 'Hostel Facilities Officer' },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
    ],
    attachments: [],
  },
  {
    _id: 't_003',
    ticketId: 'TKT-9799',
    title: 'Request for extra chairs in Seminar Hall B',
    description: 'Need 30 extra chairs for the upcoming student club workshop.',
    category: 'Facilities',
    location: 'Main Auditorium',
    priority: 'LOW',
    priorityScore: 22,
    priorityReason: 'Standard routine facilities request.',
    status: 'Resolved',
    assignedAdmin: { name: 'Auditorium In-Charge' },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { status: 'Analyzed', timestamp: new Date(Date.now() - 3600000 * 23).toISOString() },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 20).toISOString() },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
      { status: 'Resolved', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    ],
    attachments: [],
  },
];

export const ComplaintsProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const stored = await AsyncStorage.getItem('@user_complaints');
      if (stored) {
        setComplaints(JSON.parse(stored));
      } else {
        setComplaints(INITIAL_SAMPLE_TICKETS);
        await AsyncStorage.setItem('@user_complaints', JSON.stringify(INITIAL_SAMPLE_TICKETS));
      }

      // Sync with backend API if online
      try {
        const res = await API.get('/complaints/my');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setComplaints(res.data);
          await AsyncStorage.setItem('@user_complaints', JSON.stringify(res.data));
        }
      } catch (err) {
        // Backend offline, keep cached/sample list
      }
    } catch (e) {
      console.warn('Error loading complaints context:', e);
      setComplaints(INITIAL_SAMPLE_TICKETS);
    } finally {
      setLoading(false);
    }
  };

  const addComplaint = async (newComplaintData) => {
    const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    const newEntry = {
      _id: 't_' + Date.now(),
      ticketId,
      title: newComplaintData.title,
      description: newComplaintData.description,
      category: newComplaintData.category,
      location: newComplaintData.location,
      priority: newComplaintData.priority || 'LOW',
      priorityScore: newComplaintData.priorityScore || 15,
      priorityReason: newComplaintData.priorityReason || 'Processed by AI Priority Engine',
      detectedKeywords: newComplaintData.detectedKeywords || [],
      status: 'Submitted',
      assignedAdmin: { name: 'Campus Department Desk' },
      createdAt: new Date().toISOString(),
      statusHistory: [
        { status: 'Submitted', timestamp: new Date().toISOString() },
      ],
      attachments: newComplaintData.attachments || [],
    };

    // Try posting to API
    try {
      const res = await API.post('/complaints', newComplaintData);
      if (res.data && res.data.complaint) {
        newEntry._id = res.data.complaint._id || newEntry._id;
        newEntry.ticketId = res.data.complaint.ticketId || newEntry.ticketId;
      }
    } catch (e) {
      console.warn('[API Post Fallback] Storing complaint in local state.');
    }

    const updatedList = [newEntry, ...complaints];
    setComplaints(updatedList);
    await AsyncStorage.setItem('@user_complaints', JSON.stringify(updatedList));
    return newEntry;
  };

  const getComplaintByTicketId = (ticketId) => {
    return complaints.find((c) => c.ticketId === ticketId) || null;
  };

  const refreshComplaints = async () => {
    await loadComplaints();
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        loading,
        addComplaint,
        getComplaintByTicketId,
        refreshComplaints,
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
};

export default ComplaintsProvider;
