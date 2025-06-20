import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Plus, Settings, Crown, UserPlus, Copy, Mail, Calendar, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';

export default function HouseholdScreen() {
  const { user } = useAuth();
  const { currentHousehold, households } = useHousehold();
  const [inviteEmail, setInviteEmail] = useState('');

  // If no household is selected, show household selection
  if (!currentHousehold) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Select Household</Text>
          <Text style={styles.headerSubtitle}>Choose a household to manage</Text>
        </LinearGradient>

        <View style={styles.content}>
          {households.length === 0 ? (
            <View style={styles.emptyState}>
              <Users color="#ccc" size={64} />
              <Text style={styles.emptyStateText}>No households found</Text>
              <Text style={styles.emptyStateSubtext}>Create or join a household to get started</Text>
            </View>
          ) : (
            <ScrollView style={styles.householdList}>
              {households.map((household) => (
                <TouchableOpacity
                  key={household.id}
                  style={styles.householdCard}
                  onPress={() => {
                    // This will be handled by the context automatically
                  }}
                >
                  <Text style={styles.householdName}>{household.name}</Text>
                  <Text style={styles.householdDescription}>{household.description}</Text>
                  <Text style={styles.householdMembers}>
                    {household.members.length} member{household.members.length > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = currentHousehold.members.find(m => m.userId === user?.id)?.role === 'admin';

  const copyInviteCode = () => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Invite Code Copied', `Code "${currentHousehold.inviteCode}" copied to clipboard!`);
  };

  const inviteMember = () => {
    Alert.alert(
      'Invite Member',
      'Send an invitation to join your household',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Email Invite', onPress: () => {} },
        { text: 'Share Invite Code', onPress: copyInviteCode },
      ]
    );
  };

  const manageMember = (member: any) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only administrators can manage members');
      return;
    }

    const options = ['View Profile'];
    if (member.userId !== user?.id) {
      options.push('Change Role');
      if (member.role !== 'admin') {
        options.push('Remove from Household');
      }
    }
    options.push('Cancel');

    Alert.alert(
      `Manage ${member.displayName}`,
      'What would you like to do?',
      options.map((option) => ({
        text: option,
        style: option === 'Cancel' ? 'cancel' : option.includes('Remove') ? 'destructive' : 'default',
        onPress: () => {
          if (option.includes('Remove')) {
            removeMember(member.userId);
          } else if (option.includes('Change Role')) {
            changeRole(member);
          }
        },
      }))
    );
  };

  const removeMember = (memberId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the household?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement remove member functionality
            Alert.alert('Info', 'Remove member functionality will be implemented');
          },
        },
      ]
    );
  };

  const changeRole = (member: any) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    Alert.alert(
      'Change Role',
      `Change ${member.displayName}'s role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => {
            // TODO: Implement change role functionality
            Alert.alert('Info', 'Change role functionality will be implemented');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{currentHousehold.name}</Text>
            <Text style={styles.headerSubtitle}>
              {currentHousehold.members.length} member{currentHousehold.members.length > 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invite Section */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invite Members</Text>
            <View style={styles.inviteCard}>
              <View style={styles.inviteInfo}>
                <Text style={styles.inviteTitle}>Household Invite Code</Text>
                <Text style={styles.inviteCode}>{currentHousehold.inviteCode}</Text>
                <Text style={styles.inviteDescription}>
                  Share this code with family members to join your household
                </Text>
              </View>
              <View style={styles.inviteActions}>
                <TouchableOpacity style={styles.copyButton} onPress={copyInviteCode}>
                  <Copy color="#667eea" size={16} />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.inviteButton} onPress={inviteMember}>
                  <UserPlus color="#ffffff" size={16} />
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household Members</Text>
          <View style={styles.membersContainer}>
            {currentHousehold.members.map((member) => (
              <View key={member.userId} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {member.displayName.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    {member.role === 'admin' && (
                      <View style={styles.adminBadge}>
                        <Crown color="#f39c12" size={12} />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.displayName}</Text>
                    <View style={styles.memberMeta}>
                      <Mail color="#666" size={12} />
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    <View style={styles.memberMeta}>
                      <Calendar color="#666" size={12} />
                      <Text style={styles.memberJoined}>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.memberRole}>
                      {member.role === 'admin' ? 'Administrator' : 'Member'}
                    </Text>
                  </View>
                </View>

                {isAdmin && member.userId !== user?.id && (
                  <TouchableOpacity
                    style={styles.memberActions}
                    onPress={() => manageMember(member)}
                  >
                    <MoreVertical color="#666" size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Household Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Notification Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Low Stock Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Expiry Notifications</Text>
            </TouchableOpacity>
            {!isAdmin && (
              <TouchableOpacity style={styles.settingItem}>
                <Text style={[styles.settingText, styles.dangerText]}>Leave Household</Text>
              </TouchableOpacity>
            )}
            {isAdmin && (
              <TouchableOpacity style={styles.settingItem}>
                <Text style={[styles.settingText, styles.dangerText]}>Delete Household</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  householdList: {
    flex: 1,
  },
  householdCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  householdName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  householdDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  householdMembers: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inviteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteInfo: {
    marginBottom: 16,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    letterSpacing: 2,
    marginBottom: 8,
  },
  inviteDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  copyButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  inviteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  inviteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  membersContainer: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  memberJoined: {
    fontSize: 12,
    color: '#666',
  },
  memberRole: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginTop: 4,
  },
  memberActions: {
    padding: 8,
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  dangerText: {
    color: '#e74c3c',
  },
  bottomPadding: {
    height: 40,
  },
});