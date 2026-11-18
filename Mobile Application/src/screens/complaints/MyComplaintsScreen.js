import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl
} from 'react-native';
import { ComplaintsContext } from '../../context/ComplaintsContext';
import PriorityBadge from '../../components/PriorityBadge';
import { Search, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react-native';

const FILTERS = ['All', 'Active', 'Resolved', 'High Priority'];

export const MyComplaintsScreen = ({ route, navigation }) => {
  const { complaints, refreshComplaints } = useContext(ComplaintsContext);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    if (route.params?.filter) {
      const f = route.params.filter;
      if (f === 'In Progress' || f === 'Active') setActiveFilter('Active');
      else if (f === 'Resolved') setActiveFilter('Resolved');
      else if (f === 'Urgent' || f === 'High Priority') setActiveFilter('High Priority');
      else setActiveFilter('All');
    }
  }, [route.params?.filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshComplaints();
    setRefreshing(false);
  };

  const filteredComplaints = complaints.filter((item) => {
    // Filter by tab
    if (activeFilter === 'Active') {
      if (item.status === 'Resolved' || item.status === 'Closed') return false;
    } else if (activeFilter === 'Resolved') {
      if (item.status !== 'Resolved' && item.status !== 'Closed') return false;
    } else if (activeFilter === 'High Priority') {
      if (item.priority !== 'HIGH' && item.priorityScore < 70) return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.ticketId.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      return matchId || matchTitle || matchCat || matchLoc;
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Complaints 📋</Text>
        <Text style={styles.subtitle}>Track live resolution updates & chat directly with assigned admins</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ticket ID, title, or location..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, isSelected && styles.activePill]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, isSelected && styles.activeFilterText]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Ticket List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {filteredComplaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={40} color="#64748b" />
            <Text style={styles.emptyTitle}>No matching tickets found</Text>
            <Text style={styles.emptySub}>Try adjusting your search terms or filter selection.</Text>
          </View>
        ) : (
          filteredComplaints.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('TicketDetailTimeline', { ticketId: item.ticketId, complaint: item })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.ticketId}>{item.ticketId}</Text>
                <PriorityBadge priority={item.priority} score={item.priorityScore} showScore />
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardLoc}>📍 {item.location} • {item.category}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.statusBadge}>
                  <View style={[styles.dot, { backgroundColor: item.status === 'Resolved' ? '#10b981' : '#f59e0b' }]} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>

                <View style={styles.footerRight}>
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() => navigation.navigate('RealtimeChat', { ticketId: item.ticketId, complaint: item })}
                  >
                    <MessageSquare size={14} color="#818cf8" />
                    <Text style={styles.chatBtnText}>Chat Live</Text>
                  </TouchableOpacity>

                  <ChevronRight size={18} color="#64748b" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activePill: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8',
  },
  filterText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTop: {
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
  cardTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  cardLoc: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f115',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  chatBtnText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MyComplaintsScreen;
