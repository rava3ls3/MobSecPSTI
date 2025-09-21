import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const featuredPearls = [
    {
      id: '1',
      name: 'Akoya Classic',
      price: '$299',
      image: 'https://via.placeholder.com/200x200/FFE4E6/8B5A3C?text=Akoya+Pearl',
      type: 'Akoya'
    },
    {
      id: '2',
      name: 'Tahitian Black',
      price: '$599',
      image: 'https://via.placeholder.com/200x200/2F2F2F/FFFFFF?text=Black+Pearl',
      type: 'Tahitian'
    },
    {
      id: '3',
      name: 'South Sea Gold',
      price: '$899',
      image: 'https://via.placeholder.com/200x200/FFD700/000000?text=Gold+Pearl',
      type: 'South Sea'
    }
  ];

  const categories = [
    { name: 'Akoya', icon: 'diamond-outline', color: '#FFE4E6' },
    { name: 'Tahitian', icon: 'moon-outline', color: '#2F2F2F' },
    { name: 'South Sea', icon: 'sunny-outline', color: '#FFD700' },
    { name: 'Freshwater', icon: 'water-outline', color: '#87CEEB' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandText}>Pearl Treasures</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="bag-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/400x200/F8F9FA/8B5A3C?text=Discover+Luxury+Pearls' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Discover Luxury</Text>
            <Text style={styles.heroSubtitle}>Handpicked pearls for every occasion</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.push('/products')}
            >
              <Text style={styles.shopButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pearl Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.categoryCard, { backgroundColor: category.color }]}
                onPress={() => router.push(`/products?category=${category.name.toLowerCase()}`)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={32} 
                  color={category.name === 'Tahitian' ? '#FFFFFF' : '#333'} 
                />
                <Text style={[
                  styles.categoryName,
                  { color: category.name === 'Tahitian' ? '#FFFFFF' : '#333' }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Pearls</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsContainer}>
            {featuredPearls.map((pearl) => (
              <TouchableOpacity 
                key={pearl.id} 
                style={styles.productCard}
                onPress={() => router.push(`/product/${pearl.id}`)}
              >
                <Image source={{ uri: pearl.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productType}>{pearl.type}</Text>
                  <Text style={styles.productName}>{pearl.name}</Text>
                  <Text style={styles.productPrice}>{pearl.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Who We Are</Text>
            <Text style={styles.aboutText}>
              We're Pearl Treasures® and we're here to help you discover the timeless elegance of authentic pearls.
            </Text>
            <TouchableOpacity 
              style={styles.aboutButton}
              onPress={() => router.push('/about')}
            >
              <Ionicons name="arrow-forward-outline" size={16} color="#8B5A3C" />
              <Text style={styles.aboutButtonText}>About Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home" size={24} color="#8B5A3C" />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/products')}
        >
          <Ionicons name="grid-outline" size={24} color="#666" />
          <Text style={styles.navText}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="bag-outline" size={24} color="#666" />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  welcomeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5A3C',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  shopButton: {
    backgroundColor: '#8B5A3C',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5A3C',
    fontWeight: '600',
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoryCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  productsContainer: {
    marginTop: 16,
  },
  productCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productInfo: {
    padding: 12,
  },
  productType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5A3C',
    marginTop: 4,
  },
  aboutCard: {
    backgroundColor: '#F8F9FA',
    padding: 24,
    borderRadius: 16,
    marginTop: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutButtonText: {
    fontSize: 14,
    color: '#8B5A3C',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  navTextActive: {
    color: '#8B5A3C',
    fontWeight: '600',
  },
});