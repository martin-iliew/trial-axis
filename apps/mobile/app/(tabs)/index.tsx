import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MOBILE_API_BASE_URL } from '../../config/api';

export default function HomeScreen() {
  const { user, isAdmin, canDo } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Backend Connected</Text>
        <Text style={styles.title}>Authenticated Mobile App</Text>
        <Text style={styles.subtitle}>
          This mobile frontend now uses the current backend auth contract instead of the stale notes template.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current User</Text>
        <Text style={styles.cardValue}>{user?.email}</Text>
        <Text style={styles.cardMeta}>Role: {user?.role}</Text>
        <Text style={styles.cardMeta}>Admin access: {isAdmin() ? 'Yes' : 'No'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Runtime Config</Text>
        <Text style={styles.cardValue}>{MOBILE_API_BASE_URL}</Text>
        <Text style={styles.cardMeta}>Refresh strategy: Token session</Text>
        <Text style={styles.cardMeta}>
          Manage users permission: {canDo('ManageUsers') ? 'Enabled' : 'Disabled'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    gap: 16,
  },
  hero: {
    paddingTop: 12,
    gap: 8,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardMeta: {
    fontSize: 14,
    color: '#475569',
  },
});
