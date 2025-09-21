import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface Pearl {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  size: string;
  origin: string;
  in_stock: boolean;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pearl, setPearl] = useState<Pearl | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadPearl();
    }
  }, [id]);

  const loadPearl = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/pearls/${id}`);
      
      if (response.ok) {
        const pearlData = await response.json();
        setPearl(pearlData);
      }
    } catch (error) {
      console.error('Error loading pearl:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pearl_id: id,
          quantity: quantity
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Added to Cart',
          `${pearl?.name} has been added to your cart.`,
          [
            { text: 'Continue Shopping', style: 'default' },
            { 
              text: 'View Cart', 
              onPress: () => router.push('/cart')
            }
          ]
        );
      } else if (response.status === 401) {
        Alert.alert(
          'Login Required',
          'Please login to add items to your cart.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Login', 
              onPress: () => router.push('/profile')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pearl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Product not found</Text>
          <TouchableOpacity 
            style={styles.backToProductsButton}
            onPress={() => router.push('/products')}
          >
            <Text style={styles.backToProductsText}>Back to Products</Text>
          </TouchableOpacity>
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
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF4757" : "#333"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => console.log('Share product')}
          >
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: pearl.image }} style={styles.productImage} />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{pearl.category.toUpperCase()}</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{pearl.name}</Text>
          <Text style={styles.productPrice}>${pearl.price}</Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="resize-outline" size={16} color="#8B5A3C" />
              <Text style={styles.detailText}>{pearl.size}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#8B5A3C" />
              <Text style={styles.detailText}>{pearl.origin}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons 
                name={pearl.in_stock ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={pearl.in_stock ? "#4CAF50" : "#FF4757"} 
              />
              <Text style={[
                styles.detailText,
                { color: pearl.in_stock ? "#4CAF50" : "#FF4757" }
              ]}>
                {pearl.in_stock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{pearl.description}</Text>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Key Features</Text>
            <View style={styles.featureItem}>
              <Ionicons name="diamond-outline" size={16} color="#8B5A3C" />
              <Text style={styles.featureText}>AAA Grade Quality</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#8B5A3C" />
              <Text style={styles.featureText}>Authenticity Guaranteed</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="gift-outline" size={16} color="#8B5A3C" />
              <Text style={styles.featureText}>Elegant Gift Packaging</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="refresh-outline" size={16} color="#8B5A3C" />
              <Text style={styles.featureText}>30-Day Return Policy</Text>
            </View>
          </View>

          {/* Care Instructions */}
          <View style={styles.careSection}>
            <Text style={styles.careTitle}>Care Instructions</Text>
            <Text style={styles.careText}>
              • Store in a soft cloth pouch{'\n'}
              • Clean with soft, damp cloth{'\n'}
              • Avoid contact with perfumes and chemicals{'\n'}
              • Have professionally restrung annually
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={18} color="#8B5A3C" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={18} color="#8B5A3C" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            !pearl.in_stock && styles.disabledButton
          ]}
          onPress={addToCart}
          disabled={!pearl.in_stock}
        >
          <Ionicons name="bag-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            {pearl.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  productImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#8B5A3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B5A3C',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  careSection: {
    backgroundColor: '#FFF8F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  careTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5A3C',
    marginBottom: 8,
  },
  careText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  quantityContainer: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
  },
  addToCartButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5A3C',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToProductsButton: {
    backgroundColor: '#8B5A3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  backToProductsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});