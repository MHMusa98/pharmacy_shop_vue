<!-- CheckoutNow.vue -->
 
<template>
  <div class="checkout-view">
    <div class="header">
      <h1>Checkout</h1>
    </div>

    <!-- Order Summary -->
    <div class="order-summary">
      <h2>Order Summary</h2>

      <!-- Items in cart -->
      <div class="cart-items">
        <div v-for="item in localCartItems" :key="item.medicine.id" class="cart-item">
          <div class="item-details">
            <div class="item-info">
              <h4>{{ item.medicine.name }}</h4>
              <span class="category">{{ item.medicine.category || 'Medicine' }}</span>
              <span class="medicine_quantity_details">10 Tablets (1 strips)</span>
            </div>
            <div class="item-price">
              <span class="price">${{ parseFloat(item.medicine.price || 0).toFixed(2) }}</span>
              <div class="quantity-selector">
                <button @click="decreaseQuantity(item.medicine)">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="increaseQuantity(item.medicine)">+</button>
              </div>
              <span class="item-total">${{ (parseFloat(item.medicine.price || 0) * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order totals -->
      
        <!-- <div class="totals-row">
          <div class="totals-label">
            <span>Subtotal</span>
            <span>Delivery Fee</span>
            <span>Tax</span>
          </div>
          <div class="totals-amount">
            <span>${{ subtotal.toFixed(2) }}</span>
            <span>${{ deliveryFee.toFixed(2) }}</span>
            <span>${{ tax.toFixed(2) }}</span>
          </div>
        </div> -->
      <div class="order-totals">
        <div class="total">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="sections-container">
      <!-- Delivery Information -->
      <div class="delivery-info">
        <h2>Delivery Information</h2>
        <div class="form-group">
          <label>Mobile Number</label>
          <input type="tel" v-model="mobileNumber" placeholder="Enter your mobile number"/>
        </div>
        <div class="form-group">
          <label>Shipping Address</label>
          <textarea 
            v-model="deliveryAddress" 
            placeholder="Enter your shipping address"
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="payment-method">
        <h2>Payment Method</h2>
        <div class="payment-options">
          <div 
            class="payment-option" 
            :class="{ active: paymentMethod === 'cash' }"
            @click="paymentMethod = 'cash'"
          >
            <div class="payment-icon">💵</div>
            <span>Cash on Delivery</span>
          </div>
          <!-- <div 
            class="payment-option" 
            :class="{ active: paymentMethod === 'card' }"
            @click="paymentMethod = 'card'"
          >
            <div class="payment-icon">💳</div>
            <span>Card</span>
          </div> -->
          <div 
            class="payment-option" 
            :class="{ active: paymentMethod === 'mobile' }"
            @click="paymentMethod = 'mobile'"
          >
            <div class="payment-icon">
              <img class="payment-icon" src="/image/BKash-Icon-Logo.svg" alt="Bkash">
            </div>
            <span>Bkash</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Place Order Button -->
    <div class="place-order">
      <button class="place-order-button" @click="placeOrder" :disabled="isSubmitting">
        {{ isSubmitting ? 'Processing...' : 'Place Order' }}
      </button>
    </div>

    <!-- Order Success Modal -->
    <div class="modal" v-if="showOrderSuccess">
      <div class="modal-content">
        <div class="success-icon">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order will be delivered on {{ formattedDeliveryDate }}</p>
        <p class="order-id">Order ID: {{ orderId }}</p>
        <button class="close-button" @click="closeModal">Continue Shopping</button>
      </div>
    </div>

    <!-- Error Modal -->
    <div class="modal" v-if="showErrorModal">
      <div class="modal-content error">
        <div class="error-icon">❌</div>
        <h2>Order Placement Failed</h2>
        <p>{{ errorMessage }}</p>
        <button class="close-button" @click="closeErrorModal">Try Again</button>
      </div>
    </div>
  </div>
</template>

<script>
import apiConfig from '/apiConfig.js'; // Update this path to match your project structure
export default {
  name: 'CheckoutNow',
  props: {
    cartItems: {
      type: Array,
      default: () => []
    },
    pharmacy: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localCartItems: [],
      localPharmacy: {},
      deliveryDate: new Date().toISOString().substr(0, 10),
      deliveryTime: 'morning',
      deliveryAddress: '',
      mobileNumber: '',
      orderNotes: '',
      paymentMethod: 'cash',
      deliveryFee: 5.00,
      taxRate: 0.05,
      showOrderSuccess: false,
      showErrorModal: false,
      errorMessage: '',
      orderId: '',
      isSubmitting: false,
      apiBaseUrl: apiConfig?.apiBaseUrl || 'http://localhost:3000/api'
    }
  },
  computed: {
    subtotal() {
      return this.localCartItems.reduce((total, item) => 
        total + (parseFloat(item.medicine.price || 0) * item.quantity), 0)
    },
    tax() {
      return this.subtotal * this.taxRate
    },
    total() {
      return this.subtotal + this.deliveryFee + this.tax
    },
    formattedDeliveryDate() {
      const date = new Date(this.deliveryDate)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  },
  methods: {
    goBack() {
      this.$emit('back')
      this.$router.go(-1)
    },
    increaseQuantity(medicine) {
      const item = this.localCartItems.find(item => item.medicine.id === medicine.id)
      if (item) {
        item.quantity++
        this.$emit('update:cartItems', [...this.localCartItems])
      }
    },
    decreaseQuantity(medicine) {
      const item = this.localCartItems.find(item => item.medicine.id === medicine.id)
      if (item && item.quantity > 1) {
        item.quantity--
        this.$emit('update:cartItems', [...this.localCartItems])
      } else if (item && item.quantity === 1) {
        // Remove item if quantity becomes 0
        const index = this.localCartItems.indexOf(item)
        this.localCartItems.splice(index, 1)
        this.$emit('update:cartItems', [...this.localCartItems])
      }
    },
    async placeOrder() {
      // Validate form fields
      if (!this.deliveryAddress) {
        alert('Please enter a delivery address')
        return
      }

      if (!this.mobileNumber) {
        alert('Please enter a mobile number')
        return
      }

      try {
        this.isSubmitting = true;
        // Generate a random order ID
        this.orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000)
        
        // Prepare order data to send to backend
        const orderData = {
          orderId: this.orderId,
          customer: {
            mobileNumber: this.mobileNumber,
            deliveryAddress: this.deliveryAddress
          },
          pharmacy: this.localPharmacy,
          items: this.localCartItems.map(item => ({
            medicineId: item.medicine.id,
            medicineName: item.medicine.name,
            price: parseFloat(item.medicine.price || 0),
            quantity: item.quantity,
            subtotal: parseFloat(item.medicine.price || 0) * item.quantity
          })),
          payment: {
            method: this.paymentMethod,
            subtotal: this.subtotal,
            deliveryFee: this.deliveryFee,
            tax: this.tax,
            total: this.total
          },
          orderDate: new Date().toISOString(),
          deliveryDate: this.deliveryDate,
          status: 'pending'
        }

        // Log for debugging
        console.log('Sending order data:', orderData);

        try {
          // Try to send order data to mock API or real backend
          const response = await fetch(`${this.apiBaseUrl}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
          });

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Order placed successfully:', data);
          
        } catch (apiError) {
          console.warn('API request failed. Falling back to localStorage:', apiError);
          
          // Store in localStorage as fallback
          const savedOrders = JSON.parse(localStorage.getItem('savedOrders') || '[]');
          savedOrders.push(orderData);
          localStorage.setItem('savedOrders', JSON.stringify(savedOrders));
          console.log('Order saved to localStorage. Total orders:', savedOrders.length);
        }
        
        // Show success modal regardless - for development purposes
        this.showOrderSuccess = true;
        
        // Clear session storage after successful order
        sessionStorage.removeItem('cartItems');
        sessionStorage.removeItem('pharmacy');

      } catch (error) {
        console.error('Error placing order:', error);
        this.errorMessage = 'Failed to place your order. Please try again later.';
        this.showErrorModal = true;
      } finally {
        this.isSubmitting = false;
      }
    },
    closeModal() {
      this.showOrderSuccess = false;
      // Navigate back to pharmacy list
      this.$router.push('/');
    },
    closeErrorModal() {
      this.showErrorModal = false;
    },
    
    // Method to fetch all past orders - for testing purposes
    async fetchPastOrders() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/orders`);
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        
        const orders = await response.json();
        console.log('Past orders:', orders);
        return orders;
      } catch (error) {
        console.error('Error fetching past orders:', error);
        return [];
      }
    },
    loadDataFromSessionStorage() {
      // Try to get cart items from session storage
      const storedCartItems = sessionStorage.getItem('cartItems')
      const storedPharmacy = sessionStorage.getItem('pharmacy')
      
      if (storedCartItems) {
        try {
          const parsedItems = JSON.parse(storedCartItems);
          
          // Ensure each medicine has a price property
          this.localCartItems = parsedItems.map(item => {
            if (!item.medicine.price && item.medicine.tp_amount) {
              item.medicine.price = parseFloat(item.medicine.tp_amount);
            } else if (!item.medicine.price) {
              item.medicine.price = 0;
            }
            return item;
          });
          
          console.log('Loaded cart items from session storage:', this.localCartItems.length)
        } catch (error) {
          console.error('Error parsing cart items from session storage:', error)
          this.localCartItems = [];
        }
      }
      
      if (storedPharmacy) {
        try {
          this.localPharmacy = JSON.parse(storedPharmacy)
          console.log('Loaded pharmacy from session storage:', this.localPharmacy.name)
        } catch (error) {
          console.error('Error parsing pharmacy from session storage:', error)
          this.localPharmacy = {};
        }
      }
    }
  },
  created() {
    // Initialize local copies of props
    this.localCartItems = [...this.cartItems].map(item => {
      // Ensure price property exists
      if (!item.medicine.price && item.medicine.tp_amount) {
        item.medicine.price = parseFloat(item.medicine.tp_amount);
      } else if (!item.medicine.price) {
        item.medicine.price = 0;
      }
      return item;
    });
    
    this.localPharmacy = { ...this.pharmacy };
    
    // Load data from session storage
    this.loadDataFromSessionStorage();
    
    // If still no cart items are available, redirect back
    if (!this.localCartItems || this.localCartItems.length === 0) {
      console.warn('No cart items found, returning to pharmacy list');
      this.$router.push('/');
    }
    
    // Set a default for apiBaseUrl in case apiConfig import fails
    if (!this.apiBaseUrl) {
      console.warn('API base URL not found in config, using default');
      this.apiBaseUrl = 'http://localhost:3000/api';
    }
  }
}
</script>

<style scoped>
.checkout-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #000;
  color: #fff;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  padding-bottom: 70px; /* Reduced space for the place order button */
}

.header {
  display: flex;
  color: #3aa757;
  align-items: center;
  padding: 12px 16px; /* Reduced padding */
  position: sticky;
  top: 0;
  background-color: #000;
  z-index: 10;
  border-bottom: 1px solid #333;
}

.header h1 {
  margin: 0;
  font-size: 18px; /* Smaller font */
  flex: 1;
}

h2 {
  font-size: 16px; /* Smaller heading */
  margin: 12px 0 8px; /* Reduced margins */
  padding: 0 16px;
}

.order-summary, .delivery-info, .payment-method {
  margin-bottom: 16px; /* Reduced margin */
  border-bottom: 1px solid #333;
  padding-bottom: 12px; /* Reduced padding */
}

.cart-items {
  padding: 0 12px; /* Reduced padding */
}

.cart-item {
  padding: 8px 0; /* Reduced padding */
  border-bottom: 1px solid #222;
}

.item-details {
  display: flex;
  justify-content: space-between;
}

.item-info {
  flex: 3;
  display: flex;
  flex-direction: column;
}

.item-info h4 {
  margin: 0 0 2px 0; /* Reduced margin */
  font-size: 14px;
}

.item-price {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.category {
  color: #ccc;
  font-size: 11px; /* Smaller font */
  margin-bottom: 2px;
}

.price {
  font-weight: bold;
  color: #3aa757;
  font-size: 14px;
  margin-bottom: 4px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin: 2px 0;
}

.quantity-selector button {
  width: 22px;
  height: 22px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-selector span {
  padding: 0 8px;
  font-size: 14px;
}

.item-total {
  font-weight: bold;
  color: #3aa757;
  font-size: 14px;
}

.order-totals {
  padding: 12px;
  background-color: #111;
  border-radius: 4px;
  margin: 12px;
}

.totals-row {
  display: flex;
  justify-content: space-between;
}

.totals-label, .totals-amount {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.totals-amount {
  text-align: right;
}

.total {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #333;
  font-weight: bold;
  font-size: 15px;
}

.total span:last-child {
  color: #3aa757;
}

.sections-container {
  padding: 0 12px;
}

.delivery-info, .payment-method {
  background-color: #111;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: #ccc;
}

input, textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 4px;
  border: none;
  background-color: #222;
  color: #fff;
  box-sizing: border-box;
  font-size: 14px;
}

.payment-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.payment-option {
  flex: 1;
  background-color: #222;
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-option.active {
  border-color: #3aa757;
  background-color: #111;
}

.payment-icon {
  font-size: 20px;
  height: 25px;
  width: 25px;
  margin-bottom: 4px;
}

.payment-option span {
  font-size: 12px;
}

.place-order {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #111;
  padding: 12px 16px;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
}

.place-order-button {
  width: 100%;
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: #111;
  border-radius: 8px;
  padding: 20px;
  width: 80%;
  max-width: 320px;
  text-align: center;
}

.success-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.modal-content h2 {
  margin: 8px 0;
  padding: 0;
}

.modal-content p {
  margin-bottom: 12px;
  color: #ccc;
  font-size: 14px;
}

.order-id {
  font-family: monospace;
  background-color: #222;
  padding: 6px;
  border-radius: 4px;
  margin: 12px 0;
  font-size: 13px;
}

.close-button {
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 12px;
}

.medicine_quantity_details {
  font-size: 11px;
  color: #ccc;
  margin-top: 2px;
}

/* Add a bit of responsiveness for very small screens */
@media (max-width: 340px) {
  .item-details {
    flex-direction: column;
  }
  
  .item-price {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
  
  .price, .item-total {
    margin: 0;
  }
}
</style>