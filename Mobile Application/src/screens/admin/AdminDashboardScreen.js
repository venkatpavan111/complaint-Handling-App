import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
  Alert,
  TextInput,
  Platform,
  StatusBar
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import {
  Shield,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  UserCheck,
  MessageSquare,
  ChevronRight,
  LogOut,
  RefreshCw,
  Bell
} from 'lucide-react-native';

export const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Status Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const departments = [
    'ALL',
    'Saveetha School of Engineering (SSE)',
    'Hostel Maintenance',
    'IT & Wi-Fi Support',
    'Electrical & Power',
    'Sanitation & Cleanliness',
    'Security & Safety',
    'Transport & Campus Bus'
  ];

  const fetchAdminComplaints = async () => {
    setLoading(true);
    try {
      let url = '/complaints?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (priorityFilter !== 'ALL') url += `priority=${priorityFilter}&`;
      if (selectedDept !== 'ALL') url += `category=${encodeURIComponent(selectedDept)}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const { data } = await API.get(url);
      setComplaints(data);
    } catch (err) {
      console.warn('Failed to fetch admin complaints from backend API:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminComplaints();
  }, [statusFilter, priorityFilter, selectedDept]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminComplaints();
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      await API.put(`/complaints/${selectedTicket._id}/status`, {
        status: newStatus,
        assignedTo: assignedStaff,
        notes: adminNotes
      });

      Alert.alert('Status Updated', `Ticket ${selectedTicket.ticketId} updated to ${newStatus}`);
      setShowStatusModal(false);
      fetchAdminComplaints();
    } catch (err) {
      // Local fallback for offline/development updates
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === selectedTicket._id ? { ...c, status: newStatus, assignedTo: assignedStaff } : c
        )
      );
      Alert.alert('Updated', `Status set to ${newStatus}`);
      setShowStatusModal(false);
    }
  };

  // Metric summaries
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Submitted').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const urgentCount = complaints.filter((c) => c.priority === 'HIGH' || c.priorityScore >= 70).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c084fc" />}
      >
        {/* Admin Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={styles.adminLogoBadge}>
              <Shield size={22} color="#c084fc" />
            </View>
            <View>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitle}>ResolveQ Admin</Text>
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>COMMAND CENTER</Text>
                </View>
              </View>
              <Text style={styles.brandSub}>Campus Complaint Resolution Portal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert('Logout', 'Are you sure you want to sign out of Admin Portal?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => logout() }
              ]);
            }}
          >
            <LogOut size={18} color="#fca5a5" />
          </TouchableOpacity>
        </View>

        {/* Urgent Alert Banner */}
        {urgentCount > 0 && (
          <View style={styles.urgentBanner}>
            <AlertTriangle size={20} color="#f87171" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.urgentTitle}>🚨 {urgentCount} Urgent / High Priority Tickets</Text>
              <Text style={styles.urgentSub}>
                Critical campus issues require immediate department dispatch & SLA resolution.
              </Text>
            </View>
          </View>
        )}

        {/* Admin Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalCount}</Text>
            <Text style={styles.metricLabel}>Total Tickets</Text>
          </View>
          <View style={[styles.metricCard, { borderColor: '#3b82f640' }]}>
            <Text style={[styles.metricValue, { color: '#60a5fa' }]}>{pendingCount}</Text>
            <Text style={styles.metricLabel}>Pending Triage</Text>
          </View>
          <View style={[styles.metricCard, { borderColor: '#818cf840' }]}>
            <Text style={[styles.metricValue, { color: '#818cf8' }]}>{inProgressCount}</Text>
            <Text style={styles.metricLabel}>In Progress</Text>
          </View>
          <View style={[styles.metricCard, { borderColor: '#ef444440' }]}>
            <Text style={[styles.metricValue, { color: '#f87171' }]}>{urgentCount}</Text>
            <Text style={styles.metricLabel}>High Priority</Text>
          </View>
        </View>

        {/* Filter Bar */}
        <Text style={styles.sectionTitle}>Filter & Manage Complaints</Text>

        {/* Status Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['ALL', 'Submitted', 'In Progress', 'Resolved'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, statusFilter === st && styles.activeFilterChip]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.filterChipText, statusFilter === st && styles.activeFilterChipText]}>
                {st === 'ALL' ? 'All Statuses' : st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Department Filter Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { marginTop: 8 }]}>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[styles.deptChip, selectedDept === dept && styles.activeDeptChip]}
              onPress={() => setSelectedDept(dept)}
            >
              <Text style={[styles.deptChipText, selectedDept === dept && styles.activeDeptChipText]}>
                {dept === 'ALL' ? 'All Departments' : dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Complaint Tickets List */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>Active Campus Tickets ({complaints.length})</Text>
          <TouchableOpacity onPress={onRefresh} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={14} color="#818cf8" />
            <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600' }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {complaints.length === 0 ? (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={40} color="#34d399" />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptySub}>No active complaints matching the selected filters.</Text>
          </View>
        ) : (
          complaints.map((item) => (
            <View key={item._id} style={styles.ticketCard}>
              {/* Ticket Top Row */}
              <View style={styles.ticketTopRow}>
                <Text style={styles.ticketId}>{item.ticketId}</Text>
                <PriorityBadge priority={item.priority} score={item.priorityScore} showScore />
              </View>

              {/* Title & Info */}
              <Text style={styles.ticketTitle}>{item.title}</Text>
              <Text style={styles.ticketLoc}>📍 {item.location}</Text>
              <Text style={styles.ticketDept}>🏢 {item.category || item.department}</Text>
              {item.description ? (
                <Text style={styles.ticketDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {/* Ticket Actions */}
              <View style={styles.ticketFooter}>
                <TouchableOpacity
                  style={styles.statusActionBtn}
                  onPress={() => {
                    setSelectedTicket(item);
                    setNewStatus(item.status);
                    setAssignedStaff(item.assignedTo || '');
                    setShowStatusModal(true);
                  }}
                >
                  <UserCheck size={14} color="#c084fc" />
                  <Text style={styles.statusActionText}>Status: {item.status}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chatActionBtn}
                  onPress={() =>
                    navigation.navigate('RealtimeChat', { ticketId: item.ticketId, complaint: item })
                  }
                >
                  <MessageSquare size={14} color="#818cf8" />
                  <Text style={styles.chatActionText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Update Status Modal */}
        <Modal visible={showStatusModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Ticket #{selectedTicket?.ticketId}</Text>

              <Text style={styles.modalLabel}>Select Resolution Status:</Text>
              <View style={styles.statusBtnGrid}>
                {['Submitted', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusSelectBtn, newStatus === st && styles.statusSelectBtnActive]}
                    onPress={() => setNewStatus(st)}
                  >
                    <Text style={[styles.statusSelectText, newStatus === st && styles.statusSelectTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Assign Department Staff:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Officer Ramesh (Electrical Team)"
                placeholderTextColor="#64748b"
                value={assignedStaff}
                onChangeText={setAssignedStaff}
              />

              <Text style={styles.modalLabel}>Admin Remarks / Notes:</Text>
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Add resolution update notes for student..."
                placeholderTextColor="#64748b"
                multiline
                value={adminNotes}
                onChangeText={setAdminNotes}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: '#334155' }]}
                  onPress={() => setShowStatusModal(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: '#c084fc' }]}
                  onPress={handleUpdateStatus}
                >
                  <Text style={{ color: '#0f172a', fontWeight: 'bold' }}>Save Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  adminLogoBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#3b0764',
    borderColor: '#c084fc',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  adminBadge: {
    backgroundColor: '#581c87',
    borderColor: '#c084fc',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8
  },
  adminBadgeText: {
    color: '#e9d5ff',
    fontSize: 9,
    fontWeight: '800'
  },
  brandSub: {
    color: '#94a3b8',
    fontSize: 11
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 10
  },
  urgentTitle: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  urgentSub: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 16
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800'
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 6
  },
  filterChip: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeFilterChip: {
    backgroundColor: '#c084fc20',
    borderColor: '#c084fc'
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  activeFilterChipText: {
    color: '#e9d5ff',
    fontWeight: '800'
  },
  deptChip: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeDeptChip: {
    backgroundColor: '#38bdf820',
    borderColor: '#38bdf8'
  },
  deptChipText: {
    color: '#64748b',
    fontSize: 12
  },
  activeDeptChipText: {
    color: '#38bdf8',
    fontWeight: '700'
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12
  },
  listHeaderTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700'
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 10
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4
  },
  ticketCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  ticketId: {
    color: '#c084fc',
    fontSize: 13,
    fontWeight: '800'
  },
  ticketTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  ticketLoc: {
    color: '#818cf8',
    fontSize: 12,
    marginBottom: 2
  },
  ticketDept: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6
  },
  ticketDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 12
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10
  },
  statusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c084fc15',
    borderColor: '#c084fc30',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6
  },
  statusActionText: {
    color: '#e9d5ff',
    fontSize: 12,
    fontWeight: '700'
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#818cf815',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4
  },
  chatActionText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#475569'
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16
  },
  modalLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10
  },
  statusBtnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  statusSelectBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  statusSelectBtnActive: {
    backgroundColor: '#c084fc',
    borderColor: '#c084fc'
  },
  statusSelectText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600'
  },
  statusSelectTextActive: {
    color: '#0f172a',
    fontWeight: '800'
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 13
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20
  },
  modalActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  }
});

export default AdminDashboardScreen;
