<template>
    <div class="order-history">
      <h1>Order History</h1>
      <button @click="loadOrders" class="refresh-button">
        Refresh Orders
      </button>
      
      <div v-if="loading" class="loading">
        Loading orders...
      </div>
      
      <div v-else-if="orders.length === 0" class="no-orders">
        No orders found
      </div>
      
      <div v-else class="orders-container">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <h3>Order ID: {{ order.orderId }}</h3>
            <span class="order-date">{{ formatDate(order.orderDate) }}</span>
          </div>
          
          <div class="order-details">
            <div class="order-section">
              <h4>Customer Details</h4>
              <p><strong>Phone:</strong> {{ order.customer.mobileNumber }}</p>
              <p><strong>Address:</strong> {{ order.customer.deliveryAddress }}</p>
            </div>
            
            <div class="order-section">
              <h4>Order Items</h4>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in order.items" :key="idx">
                    <td>{{ item.medicineName }}</td>
                    <td>${{ item.price.toFixed(2) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>${{ item.subtotal.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="order-section totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${{ order.payment.subtotal.toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Delivery Fee:</span>
                <span>${{ order.payment.deliveryFee.toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Tax:</span>
                <span>${{ order.payment.tax.toFixed(2) }}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>${{ order.payment.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <span class="payment-badge">{{ order.payment.method }}</span>
            <span class="status-badge">{{ order.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import apiConfig from '/apiConfig.js'; // Update path to match your structures
  
  export default {
    name: 'OrderHistory',
    data() {
      return {
        orders: [],
        loading: false,
        apiBaseUrl: apiConfig.apiBaseUrl
      };
    },
    methods: {
      async loadOrders() {
        this.loading = true;
        try {
          const response = await fetch(`${this.apiBaseUrl}/orders`);
          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`);
          }
          
          this.orders = await response.json();
          console.log('Loaded orders:', this.orders);
        } catch (error) {
          console.error('Error loading orders:', error);
          alert('Failed to load orders. Please try again.');
        } finally {
          this.loading = false;
        }
      },
      formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
      }
    },
    created() {
      this.loadOrders();
    }
  };
  </script>
  
  <style scoped>
  .order-history {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    color: #333;
    margin-bottom: 20px;
  }
  
  .refresh-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .loading, .no-orders {
    text-align: center;
    padding: 30px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;
  }
  
  .orders-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .order-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .order-header {
    background-color: #f5f5f5;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
  }
  
  .order-header h3 {
    margin: 0;
    color: #333;
  }
  
  .order-date {
    color: #666;
    font-size: 14px;
  }
  
  .order-details {
    padding: 15px;
  }
  
  .order-section {
    margin-bottom: 20px;
  }
  
  .order-section h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  }
  
  .items-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .items-table th, .items-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .items-table th {
    background-color: #f9f9f9;
  }
  
  .totals {
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 4px;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
  }
  
  .grand-total {
    font-weight: bold;
    font-size: 18px;
    border-top: 1px solid #ddd;
    padding-top: 10px;
    margin-top: 5px;
  }
  
  .order-footer {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    background-color: #f5f5f5;
    border-top: 1px solid #eee;
  }
  
  .payment-badge, .status-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  .payment-badge {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .status-badge {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  </style>