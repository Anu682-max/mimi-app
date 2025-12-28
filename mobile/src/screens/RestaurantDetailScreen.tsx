import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isAvailable?: boolean;
}

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  phone: string;
  cuisine: string;
  rating: number;
  menu: MenuItem[];
}

interface OrderItem {
  menuItem: string;
  quantity: number;
  price: number;
}

export default function RestaurantDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { id } = route.params as { id: string };

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`http://localhost:3699/api/v1/restaurants/${id}`);
      if (!response.ok) throw new Error('Failed to fetch restaurant');
      const data = await response.json();
      setRestaurant(data);
    } catch (err) {
      setError('Рестораныг ачааллахад алдаа гарлаа');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menuItem === item.name);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menuItem === item.name
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { menuItem: item.name, quantity: 1, price: item.price }]);
    }
  };

  const updateQuantity = (itemName: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.menuItem !== itemName));
    } else {
      setCart(cart.map(item =>
        item.menuItem === itemName ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleOrder = async () => {
    if (!token || !user) {
      Alert.alert('Анхааруулга', 'Захиалга өгөхийн тулд нэвтэрнэ үү');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Анхааруулга', 'Захиалгын сагс хоосон байна');
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Анхааруулга', 'Хүргэлтийн хаяг оруулна уу');
      return;
    }

    setOrdering(true);
    try {
      const response = await fetch('http://localhost:3699/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant: id,
          items: cart,
          totalAmount: getTotalAmount(),
          deliveryAddress,
          paymentMethod: 'cash',
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      Alert.alert('Амжилттай', 'Захиалга амжилттай үүслээ! 🎉');
      setCart([]);
      setDeliveryAddress('');
      navigation.navigate('MyOrders' as never);
    } catch (err) {
      Alert.alert('Алдаа', 'Захиалга үүсгэхэд алдаа гарлаа');
      console.error(err);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Ресторан олдсонгүй'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Restaurant Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.headerInfo}>🍽️ {restaurant.cuisine}</Text>
          <Text style={styles.headerInfo}>📍 {restaurant.address}</Text>
          <Text style={styles.headerInfo}>📞 {restaurant.phone}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Цэс</Text>
          {restaurant.menu.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Text style={styles.emptyMenuText}>Цэс байхгүй байна</Text>
            </View>
          ) : (
            restaurant.menu.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  )}
                  <Text style={styles.menuItemPrice}>{item.price.toLocaleString()}₮</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(item)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Cart */}
      {cart.length > 0 && (
        <View style={styles.cart}>
          <ScrollView style={styles.cartScroll}>
            <Text style={styles.cartTitle}>🛒 Захиалгын сагс</Text>
            {cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.menuItem}</Text>
                  <Text style={styles.cartItemPrice}>{(item.price * item.quantity).toLocaleString()}₮</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.menuItem, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.menuItem, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Нийт:</Text>
              <Text style={styles.totalAmount}>{getTotalAmount().toLocaleString()}₮</Text>
            </View>

            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Хүргэлтийн хаяг</Text>
              <TextInput
                style={styles.addressInput}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Хаягаа оруулна уу..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.orderButton, ordering && styles.orderButtonDisabled]}
              onPress={handleOrder}
              disabled={ordering}
            >
              <Text style={styles.orderButtonText}>
                {ordering ? 'Захиалж байна...' : '🛍️ Захиалах'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingStar: {
    fontSize: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  headerInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  menuSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyMenu: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyMenuText: {
    fontSize: 16,
    color: '#6b7280',
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  addButton: {
    backgroundColor: '#ec4899',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cart: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cartScroll: {
    padding: 16,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#e5e7eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  addressContainer: {
    marginTop: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  addressInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  orderButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  orderButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
