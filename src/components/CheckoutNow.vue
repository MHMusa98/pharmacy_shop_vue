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
            <h4>{{ item.medicine.name }}</h4>
            <div class="item-meta">
              <span class="category">{{ item.medicine.category }}</span>
              
            </div>
            
            <div class="item-meta2">
              <span class="medicine_quantity_details">10 Tablets (1 strips)</span>
              <span class="price">${{ item.medicine.price.toFixed(2) }}</span>
            </div>
          </div>
          <div class="item-quantity">
            <div class="quantity-selector">
              <button @click="decreaseQuantity(item.medicine)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item.medicine)">+</button>
              <p class="medicine_quantity">Strips</p>
            </div>
            <div class="item-total">${{ (item.medicine.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- Order totals -->
      <div class="order-totals">
        <div class="subtotal">
          <span>Subtotal</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="delivery-fee">
          <span>Delivery Fee</span>
          <span>${{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div class="tax">
          <span>Tax</span>
          <span>${{ tax.toFixed(2) }}</span>
        </div>
        <div class="total">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Delivery Information -->
    <div class="delivery-info">
      <h2>Delivery Information</h2>
      <div class="contact-number">
        <label>Mobile Number</label>
        <div>
          <input type="tel" v-model="mobileNumber" placeholder="Enter your mobile number"/>
        </div>
      </div>
      <div class="address-field">
        <label>Shipping Address</label>
        <textarea 
          v-model="deliveryAddress" 
          placeholder="Enter your shipping address"
          rows="3"
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
        <div 
          class="payment-option" 
          :class="{ active: paymentMethod === 'card' }"
          @click="paymentMethod = 'card'"
        >
          <div class="payment-icon">💳</div>
          <span>Credit/Debit Card</span>
        </div>
        <div 
          class="payment-option" 
          :class="{ active: paymentMethod === 'mobile' }"
          @click="paymentMethod = 'mobile'"
        >
          <div class="payment-icon">📱</div>
          <span>Mobile Banking</span>
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
        <p>Your order has been confirmed and will be delivered on {{ formattedDeliveryDate }}</p>
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
      apiBaseUrl: apiConfig.apiBaseUrl
    }
  },
  computed: {
    subtotal() {
      return this.localCartItems.reduce((total, item) => 
        total + (item.medicine.price * item.quantity), 0)
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
            price: item.medicine.price,
            quantity: item.quantity,
            subtotal: item.medicine.price * item.quantity
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
          this.localCartItems = JSON.parse(storedCartItems)
          console.log('Loaded cart items from session storage:', this.localCartItems.length)
        } catch (error) {
          console.error('Error parsing cart items from session storage:', error)
        }
      }
      
      if (storedPharmacy) {
        try {
          this.localPharmacy = JSON.parse(storedPharmacy)
          console.log('Loaded pharmacy from session storage:', this.localPharmacy.name)
        } catch (error) {
          console.error('Error parsing pharmacy from session storage:', error)
        }
      }
    }
  },
  created() {
    // Initialize local copies of props
    this.localCartItems = [...this.cartItems]
    this.localPharmacy = { ...this.pharmacy }
    
    // Load data from session storage
    this.loadDataFromSessionStorage()
    
    // If still no cart items are available, redirect back
    if (!this.localCartItems || this.localCartItems.length === 0) {
      console.warn('No cart items found, returning to pharmacy list')
      this.$router.push('/')
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
  padding-bottom: 80px; /* Space for the place order button */
}

.header {
  display: flex;
  color: #3aa757;
  align-items: center;
  padding: 16px;
  position: sticky;
  top: 0;
  background-color: #000;
  z-index: 10;
  border-bottom: 1px solid #333;
}

.back-button {
  margin-right: 16px;
  font-size: 24px;
  cursor: pointer;
}

.header h1 {
  margin: 0;
  font-size: 20px;
  flex: 1;
}

h2 {
  font-size: 18px;
  margin: 16px 0;
  padding: 0 16px;
}

.order-summary, .delivery-info, .payment-method {
  margin-bottom: 24px;
  border-bottom: 1px solid #333;
  padding-bottom: 16px;
}

.pharmacy-info {
  display: flex;
  padding: 0 16px 16px;
  border-bottom: 1px solid #333;
  margin-bottom: 16px;
}

.pharmacy-img {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 12px;
  background-color: #333;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}

.pharmacy-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.address {
  font-size: 12px;
  color: #ccc;
  margin: 0;
}

.cart-items {
  padding: 0 16px;
}

.cart-item {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  border-bottom: 1px solid #222;
}

.item-details {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.item-details h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.item-meta2 {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 0 0 0 0;
  text-align: left;
}

.item-meta2 span {
  margin: 3px 0 0 0;
}

.category {
  color: #ccc;
}

.price {
  font-weight: bold;
  color: #3aa757;
}

.item-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
}

.quantity-selector button {
  width: 24px;
  height: 24px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.quantity-selector span {
  padding: 0 12px;
}

.item-total {
  font-weight: bold;
  color: #3aa757;
}

.order-totals {
  padding: 16px;
  background-color: #111;
  border-radius: 4px;
  margin: 16px;
}

.order-totals > div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #333;
  font-weight: bold;
  font-size: 16px !important;
}

.total span:last-child {
  color: #3aa757;
}

.delivery-info, .payment-method {
  padding: 0 0 16px 0;
}

.delivery-date, .delivery-time, .address-field, .notes-field {
  padding: 0 16px;
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #ccc;
}

.date-selector input, .time-selector select, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: #333;
  color: #fff;
  box-sizing: border-box;
  font-size: 14px;
}

.contact-number {
  padding: 0 16px;
  margin-bottom: 16px;
}

.contact-number input, .time-selector select, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: #333;
  color: #fff;
  box-sizing: border-box;
  font-size: 14px;
}

.payment-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 16px;
}

.payment-option {
  flex: 1;
  min-width: 100px;
  background-color: #222;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.payment-option.active {
  border-color: #3aa757;
  background-color: #111;
}

.payment-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.place-order {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #111;
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}

.place-order-button {
  width: 100%;
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px;
  font-size: 16px;
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
  padding: 24px;
  width: 80%;
  max-width: 400px;
  text-align: center;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-content h2 {
  margin: 8px 0 16px;
  padding: 0;
}

.modal-content p {
  margin-bottom: 16px;
  color: #ccc;
}

.order-id {
  font-family: monospace;
  background-color: #222;
  padding: 8px;
  border-radius: 4px;
  margin: 16px 0;
}

.close-button {
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;
}

.medicine_quantity_details {
  font-size: 12px;
  font-weight: bold;
  color: #ccc;
  margin: auto;
  text-align: left;
}

.medicine_quantity {
  font-size: 12px;
  color: #ccc;
  margin-top: 6px;
  padding-top: 4px;
  padding-left: 4px;
  text-align: center;
}
</style>