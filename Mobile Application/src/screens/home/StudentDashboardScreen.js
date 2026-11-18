import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
  Modal,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ComplaintsContext } from '../../context/ComplaintsContext';
import MetricCard from '../../components/MetricCard';
import PriorityBadge from '../../components/PriorityBadge';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Bell,
  Shield
} from 'lucide-react-native';

export const StudentDashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const { complaints, refreshComplaints } = useContext(ComplaintsContext);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });

  const mockNotifications = [
    { id: '1', title: 'Ticket In Progress', desc: 'Your complaint regarding Library Wi-Fi has been assigned to IT Support.', time: '10m ago', unread: true },
    { id: '2', title: 'Priority Updated', desc: 'AI Priority Engine marked your Hostels water leak complaint as High.', time: '2h ago', unread: true },
    { id: '3', title: 'Complaint Resolved', desc: 'The classroom projector issue has been marked resolved.', time: '1d ago', unread: false },
  ];

  useEffect(() => {
    calculateMetrics(complaints);
  }, [complaints]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshComplaints();
    setRefreshing(false);
  };

  const calculateMetrics = (list = []) => {
    const total = list.length;
    const inProgress = list.filter((c) => c.status === 'In Progress' || c.status === 'Submitted' || c.status === 'Assigned').length;
    const resolved = list.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const urgent = list.filter((c) => c.priority === 'HIGH' || c.priorityScore >= 70).length;

    setMetrics({ total, inProgress, resolved, urgent });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* ResolveQ Top Navigation Bar */}
        <View style={styles.brandBar}>
          <View style={styles.brandLeft}>
            <View style={styles.logoCircle}>
              <Shield size={20} color="#60a5fa" />
            </View>
            <View>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitle}>ResolveQ</Text>
                <View style={styles.systemBadge}>
                  <Text style={styles.systemBadgeText}>SYSTEM</Text>
                </View>
              </View>
              <Text style={styles.brandSub}>College Complaint Resolution</Text>
            </View>
          </View>

          <View style={styles.brandRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => setShowNotifications(true)}
            >
              <Bell size={20} color="#cbd5e1" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image
                source={{
                  uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                }}
                style={styles.avatarMini}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Greeting Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Student'} 👋</Text>
          <Text style={styles.idText}>
            ID: {user?.identifier || 'CS2026-089'} • {user?.department || 'Saveetha Engineering'}
          </Text>
        </View>

        {/* Notifications Modal */}
        <Modal visible={showNotifications} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🔔 Recent Notifications</Text>
              {mockNotifications.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.notifItem, n.unread && styles.unreadNotif]}
                  onPress={() => {
                    setShowNotifications(false);
                    navigation.navigate('MyComplaints');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifDesc}>{n.desc}</Text>
                  <Text style={styles.notifTime}>{n.time}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#6366f1', marginTop: 15, alignItems: 'center' }]}
                onPress={() => setShowNotifications(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Account Menu Modal */}
        <Modal visible={showAccountMenu} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>👤 Account Options</Text>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setShowAccountMenu(false);
                  navigation.navigate('Profile');
                }}
              >
                <Text style={styles.menuOptionText}>✏️ Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setShowAccountMenu(false);
                  Alert.alert('Switch Account', 'Redirecting to sign in with another role...');
                }}
              >
                <Text style={styles.menuOptionText}>🔄 Switch Account / Role</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, { backgroundColor: '#7f1d1d' }]}
                onPress={() => {
                  setShowAccountMenu(false);
                  handleLogout();
                }}
              >
                <Text style={[styles.menuOptionText, { color: '#fca5a5' }]}>🚪 Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#334155', marginTop: 15, alignItems: 'center' }]}
                onPress={() => setShowAccountMenu(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* AI Powered Header Banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiBannerContent}>
            <View style={styles.aiChip}>
              <Sparkles size={14} color="#818cf8" />
              <Text style={styles.aiChipText}>AI Priority Engine Active</Text>
            </View>
            <Text style={styles.aiBannerTitle}>Fast-Track Campus Issues</Text>
            <Text style={styles.aiBannerSub}>
              Smart automated priority scoring routes critical complaints directly to department admins.
            </Text>
          </View>
        </View>

        {/* Overview Metric Cards */}
        <Text style={styles.sectionTitle}>Complaints Overview</Text>
        <View style={styles.metricsGrid}>
          <TouchableOpacity
            style={{ width: '47%' }}
            onPress={() => navigation.navigate('MyComplaints', { filter: 'All' })}
            activeOpacity={0.8}
          >
            <MetricCard
              title="Total Raised"
              count={metrics.total}
              icon={FileText}
              color="#818cf8"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ width: '47%' }}
            onPress={() => navigation.navigate('MyComplaints', { filter: 'Active' })}
            activeOpacity={0.8}
          >
            <MetricCard
              title="In Progress"
              count={metrics.inProgress}
              icon={Clock}
              color="#38bdf8"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ width: '47%' }}
            onPress={() => navigation.navigate('MyComplaints', { filter: 'Resolved' })}
            activeOpacity={0.8}
          >
            <MetricCard
              title="Resolved"
              count={metrics.resolved}
              icon={CheckCircle2}
              color="#34d399"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ width: '47%' }}
            onPress={() => navigation.navigate('MyComplaints', { filter: 'High Priority' })}
            activeOpacity={0.8}
          >
            <MetricCard
              title="Urgent / High"
              count={metrics.urgent}
              icon={AlertTriangle}
              color="#f87171"
            />
          </TouchableOpacity>
        </View>

        {/* Recent Tickets Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyComplaints')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {complaints.length === 0 ? (
          <View style={styles.emptyCard}>
            <FileText size={36} color="#64748b" />
            <Text style={styles.emptyTitle}>No Complaints Yet</Text>
            <Text style={styles.emptySub}>
              Need help or noticed a problem on campus? Click the '+' button below to register a ticket.
            </Text>
          </View>
        ) : (
          complaints.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.ticketCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TicketDetailTimeline', { ticketId: item.ticketId, complaint: item })}
            >
              <View style={styles.ticketTopRow}>
                <Text style={styles.ticketId}>{item.ticketId}</Text>
                <PriorityBadge priority={item.priority} score={item.priorityScore} showScore />
              </View>

              <Text style={styles.ticketTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.ticketLocation}>📍 {item.location}</Text>

              <View style={styles.ticketFooter}>
                <View style={styles.statusPill}>
                  <View style={[styles.statusDot, { backgroundColor: item.status === 'Resolved' ? '#10b981' : '#f59e0b' }]} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>

                <TouchableOpacity
                  style={styles.chatShortcutBtn}
                  onPress={() => navigation.navigate('RealtimeChat', { ticketId: item.ticketId, complaint: item })}
                >
                  <MessageSquare size={14} color="#818cf8" />
                  <Text style={styles.chatShortcutText}>Chat</Text>
                </TouchableOpacity>

                <ChevronRight size={18} color="#64748b" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CategorySelection')}
      >
        <Plus size={26} color="#ffffff" />
        <Text style={styles.fabText}>Raise Complaint</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 12,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  systemBadge: {
    backgroundColor: '#1e3a8a30',
    borderColor: '#3b82f640',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  systemBadgeText: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSub: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
  brandRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBtn: {
    padding: 2,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  welcomeCard: {
    backgroundColor: '#1e293b80',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  idText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  aiBanner: {
    backgroundColor: '#1e1b4b',
    borderColor: '#4338ca',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  aiBannerContent: {},
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  aiChipText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
  },
  aiBannerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  aiBannerSub: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  seeAllText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 10,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  ticketCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700',
  },
  ticketTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  ticketLocation: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  chatShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f115',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  chatShortcutText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    gap: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 14,
  },
  notifItem: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  unreadNotif: {
    borderColor: '#6366f1',
  },
  notifTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  notifDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  notifTime: {
    color: '#6366f1',
    fontSize: 10,
    textAlign: 'right',
  },
  menuOption: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuOptionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default StudentDashboardScreen;
