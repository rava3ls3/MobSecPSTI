import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Pearl {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  size: string;
  origin: string;
}

export default function ProductsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'akoya', name: 'Akoya', icon: 'diamond-outline' },
    { id: 'tahitian', name: 'Tahitian', icon: 'moon-outline' },
    { id: 'south-sea', name: 'South Sea', icon: 'sunny-outline' },
    { id: 'freshwater', name: 'Freshwater', icon: 'water-outline' },
  ];

  const pearls: Pearl[] = [
    {
      id: '1',
      name: 'Classic Akoya Pearl Necklace',
      price: 299,
      category: 'akoya',
      image: 'https://via.placeholder.com/200x200/FFE4E6/8B5A3C?text=Akoya',
      description: 'Elegant 18-inch strand of lustrous Akoya pearls',
      size: '7-7.5mm',
      origin: 'Japan'
    },
    {
      id: '2',
      name: 'Tahitian Black Pearl Earrings',
      price: 599,
      category: 'tahitian',
      image: 'https://via.placeholder.com/200x200/2F2F2F/FFFFFF?text=Black',
      description: 'Sophisticated black Tahitian pearl stud earrings',
      size: '9-10mm',
      origin: 'French Polynesia'
    },
    {
      id: '3',
      name: 'South Sea Golden Pearl Ring',
      price: 899,
      category: 'south-sea',
      image: 'https://via.placeholder.com/200x200/FFD700/000000?text=Gold',
      description: 'Luxurious golden South Sea pearl cocktail ring',
      size: '11-12mm',
      origin: 'Australia'
    },
    {
      id: '4',
      name: 'Freshwater Pearl Bracelet',
      price: 149,
      category: 'freshwater',
      image: 'https://via.placeholder.com/200x200/87CEEB/000000?text=Fresh',
      description: 'Delicate freshwater pearl tennis bracelet',
      size: '6-7mm',
      origin: 'China'
    },
    {
      id: '5',
      name: 'Akoya Pearl Pendant',
      price: 399,
      category: 'akoya',
      image: 'https://via.placeholder.com/200x200/FFE4E6/8B5A3C?text=Pendant',
      description: 'Single Akoya pearl pendant with gold chain',
      size: '8-8.5mm',
      origin: 'Japan'
    },
    {
      id: '6',
      name: 'Tahitian Pearl Strand',
      price: 1299,
      category: 'tahitian',
      image: 'https://via.placeholder.com/200x200/2F2F2F/FFFFFF?text=Strand',
      description: 'Premium Tahitian black pearl necklace',
      size: '10-11mm',
      origin: 'French Polynesia'
    }
  ];

  const filteredPearls = pearls.filter(pearl => {
    const matchesCategory = selectedCategory === 'all' || pearl.category === selectedCategory;
    const matchesSearch = pearl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pearl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderPearl = ({ item }: { item: Pearl }) => (
    <TouchableOpacity 
      style={styles.pearlCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.pearlImage} />
      <View style={styles.pearlInfo}>
        <Text style={styles.pearlCategory}>{item.category.toUpperCase()}</Text>
        <Text style={styles.pearlName}>{item.name}</Text>
        <Text style={styles.pearlSize}>{item.size} • {item.origin}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.pearlPrice}>${item.price}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Products</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="bag-outline" size={24} color="#333" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pearls..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.id ? '#FFFFFF' : '#666'} 
            />
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredPearls.length} products found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort by</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredPearls}
        renderItem={renderPearl}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  cartButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingLeft: 20,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    gap: 6,
  },
  selectedCategory: {
    backgroundColor: '#8B5A3C',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  productsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pearlCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pearlImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pearlInfo: {
    padding: 12,
  },
  pearlCategory: {
    fontSize: 10,
    color: '#8B5A3C',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pearlName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    lineHeight: 18,
  },
  pearlSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pearlPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5A3C',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});