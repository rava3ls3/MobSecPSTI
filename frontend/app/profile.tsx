import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const redirectUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/profile`;
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    
    // In a real app, you'd open this URL in a webview or browser
    Alert.alert(
      'Login Required',
      'Please use a web browser to login with Google.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Browser', 
          onPress: () => {
            // In React Native, you'd use Linking.openURL(authUrl)
            console.log('Open login URL:', authUrl);
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
              });
              setUser(null);
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { title: 'Order History', icon: 'time-outline', action: () => console.log('Order History') },
    { title: 'Wishlist', icon: 'heart-outline', action: () => console.log('Wishlist') },
    { title: 'Addresses', icon: 'location-outline', action: () => console.log('Addresses') },
    { title: 'Payment Methods', icon: 'card-outline', action: () => console.log('Payment Methods') },
    { title: 'Settings', icon: 'settings-outline', action: () => console.log('Settings') },
    { title: 'Help & Support', icon: 'help-circle-outline', action: () => console.log('Help') },
    { title: 'About', icon: 'information-circle-outline', action: () => router.push('/about') },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {user && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => console.log('Edit profile')}
          >
            <Ionicons name="create-outline" size={24} color="#8B5A3C" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user ? (
          <>
            {/* User Info */}
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                {user.picture ? (
                  <Image source={{ uri: user.picture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#8B5A3C" />
                  </View>
                )}
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.memberBadge}>
                <Ionicons name="diamond" size={16} color="#8B5A3C" />
                <Text style={styles.memberText}>Pearl Collector</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              {menuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.menuItem}
                  onPress={item.action}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon as any} size={20} color="#8B5A3C" />
                    </View>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FF4757" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Login State */
          <View style={styles.loginContainer}>
            <View style={styles.loginIcon}>
              <Ionicons name="person-outline" size={60} color="#8B5A3C" />
            </View>
            <Text style={styles.loginTitle}>Welcome to Pearl Treasures</Text>
            <Text style={styles.loginSubtitle}>
              Sign in to access your account, save favorites, and track orders
            </Text>
            
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Ionicons name="logo-google" size={20} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
            
            <View style={styles.loginBenefits}>
              <Text style={styles.benefitsTitle}>Benefits of signing in:</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#8B5A3C" />
                <Text style={styles.benefitText}>Save items to wishlist</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#8B5A3C" />
                <Text style={styles.benefitText}>Track your orders</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#8B5A3C" />
                <Text style={styles.benefitText}>Faster checkout</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#8B5A3C" />
                <Text style={styles.benefitText}>Exclusive member offers</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  memberText: {
    fontSize: 14,
    color: '#8B5A3C',
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 32,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4757',
  },
  loginContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loginIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5A3C',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginBenefits: {
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
  },
});