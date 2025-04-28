<template>
    <div class="order-cart">
      <div class="header">
        <a href="#" class="back-btn" @click.prevent="goBack">←</a>
        <div class="title">Order Cart</div>
        <div class="menu-btn" @click="toggleMenu">≡</div>
      </div>
        
      <div class="pharmacy-info">
        <div class="pharmacy-name">{{ pharmacy.name }}</div>
        <div class="pharmacy-address">{{ pharmacy.address }}</div>
        <div class="pharmacy-code">{{ pharmacy.code }}</div>
      </div>
      
      <div class="order-summary">
        <div class="order-details">
          <div>Count: {{ getTotalCount() }}</div>
          <div>Order value: {{ getTotalValue().toFixed(2) }}</div>
        </div>
        
        <div>Delivery</div>
        
        <div class="delivery-options">
          <div class="date-picker">{{ delivery.date }}</div>
          <div class="dropdown" @click="toggleTimeOptions">
            {{ delivery.time }} ▼
            <div v-if="showTimeOptions" class="dropdown-menu">
              <div class="dropdown-item" @click="selectTime('Morning')">Morning</div>
              <div class="dropdown-item" @click="selectTime('Afternoon')">Afternoon</div>
              <div class="dropdown-item" @click="selectTime('Evening')">Evening</div>
            </div>
          </div>
          <div class="dropdown" @click="togglePaymentOptions">
            {{ payment }} ▼
            <div v-if="showPaymentOptions" class="dropdown-menu">
              <div class="dropdown-item" @click="selectPayment('CASH')">CASH</div>
              <div class="dropdown-item" @click="selectPayment('CARD')">CARD</div>
              <div class="dropdown-item" @click="selectPayment('MOBILE')">MOBILE</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="notes">
        <input type="text" v-model="notes" placeholder="Notes...">
      </div>
      
      <div class="product-item" v-for="(product, index) in products" :key="index">
        <div class="product-name">{{ product.name }}</div>
        <div class="remove-btn" @click="removeProduct(index)">✕</div>
        
        <div class="product-table">
          <div class="table-header">
            <div class="table-cell">QTY</div>
            <div class="table-cell">TP</div>
            <div class="table-cell">Vat</div>
            <div class="table-cell">Total</div>
          </div>
          <div class="table-row">
            <div class="table-cell">
              <input type="text" class="qty-input" v-model="product.quantity" @input="updateTotal(index)">
            </div>
            <div class="table-cell">{{ product.price.toFixed(1) }}</div>
            <div class="table-cell">{{ product.vat.toFixed(1) }}</div>
            <div class="table-cell">{{ calculateTotal(product).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <div style="height: 80px;"></div> <!-- Spacer for footer -->
      
      <div class="footer">
        <a href="#" class="footer-btn" @click.prevent="saveDraft">
          <span class="footer-icon">✉</span>
          <span>Save Drafts</span>
        </a>
        <a href="#" class="footer-btn" @click.prevent="submitOrder">
          <span class="footer-icon">📝</span>
          <span>Submit</span>
        </a>
        <a href="#" class="footer-btn add-btn" @click.prevent="addItem">
          <span class="footer-icon">+</span>
          <span>Add Item</span>
        </a>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'OrderCart',
    data() {
      return {
        pharmacy: {
          name: 'Dhaka Pharmacy(DEMOBR900000000011)',
          address: '(GROCERY) Madlihat., Birampur,',
          code: 'ZMARKET | 55555'
        },
        products: [
          {
            name: 'Alkuli Syrup 100 ml|Alkuli Syrup 100 ml',
            quantity: 2,
            price: 75.0,
            vat: 0.0
          },
          {
            name: 'Amlasia Syrup 450 ml|Amlasia Syrup 450 ml',
            quantity: 1,
            price: 150.0,
            vat: 0.0
          }
        ],
        delivery: {
          date: '2025-04-26',
          time: 'Morning'
        },
        payment: 'CASH',
        notes: '',
        showTimeOptions: false,
        showPaymentOptions: false
      }
    },
    methods: {
      calculateTotal(product) {
        return product.quantity * product.price + product.vat;
      },
      getTotalCount() {
        return this.products.reduce((total, product) => total + parseInt(product.quantity), 0);
      },
      getTotalValue() {
        return this.products.reduce((total, product) => total + this.calculateTotal(product), 0);
      },
      updateTotal(index) {
        // Convert string to number if needed
        this.products[index].quantity = parseInt(this.products[index].quantity) || 0;
      },
      removeProduct(index) {
        this.products.splice(index, 1);
      },
      addItem() {
        // Implementation for adding a new item
        alert('Add item functionality would be implemented here');
      },
      saveDraft() {
        // Implementation for saving draft
        alert('Save draft functionality would be implemented here');
      },
      submitOrder() {
        // Implementation for submitting order
        alert('Submit order functionality would be implemented here');
      },
      goBack() {
        // Implementation for navigation
        alert('Back navigation would be implemented here');
      },
      toggleMenu() {
        // Implementation for menu toggle
        alert('Menu toggle would be implemented here');
      },
      toggleTimeOptions() {
        this.showTimeOptions = !this.showTimeOptions;
        this.showPaymentOptions = false;
      },
      togglePaymentOptions() {
        this.showPaymentOptions = !this.showPaymentOptions;
        this.showTimeOptions = false;
      },
      selectTime(time) {
        this.delivery.time = time;
        this.showTimeOptions = false;
      },
      selectPayment(payment) {
        this.payment = payment;
        this.showPaymentOptions = false;
      }
    }
  }
  </script>
  
  <style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
  }
  
  .order-cart {
    background-color: #f5f5f5;
    min-height: 100vh;
  }
  
  .status-bar {
    display: flex;
    justify-content: space-between;
    padding: 5px 10px;
    background-color: #5a9258;
    color: #000;
    font-size: 14px;
  }
  
  .right-icons {
    display: flex;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #5a9258;
    color: white;
  }
  
  .back-btn {
    font-size: 24px;
    color: white;
    text-decoration: none;
  }
  
  .title {
    font-size: 18px;
    font-weight: bold;
  }
  
  .menu-btn {
    font-size: 24px;
    cursor: pointer;
  }
  
  .pharmacy-info {
    background-color: #b3e6b3;
    padding: 15px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  
  .pharmacy-name {
    font-size: 18px;
    font-weight: bold;
    color: #000;
  }
  
  .pharmacy-address {
    font-size: 14px;
    color: #333;
    margin-top: 5px;
  }
  
  .pharmacy-code {
    font-size: 14px;
    color: #333;
    margin-top: 8px;
  }
  
  .order-summary {
    background-color: #e6f0fa;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  
  .order-details {
    display: flex;
    justify-content: space-between;
  }
  
  .delivery-options {
    display: flex;
    gap: 10px;
  }
  
  .date-picker {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    background-color: white;
    width: 180px;
    text-align: center;
  }
  
  .dropdown {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    background-color: white;
    width: 120px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    cursor: pointer;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    z-index: 10;
    margin-top: 5px;
  }
  
  .dropdown-item {
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .dropdown-item:last-child {
    border-bottom: none;
  }
  
  .dropdown-item:hover {
    background-color: #f5f5f5;
  }
  
  .notes {
    background-color: #c8e6c9;
    padding: 15px;
    border-radius: 10px;
    margin: 15px;
  }
  
  .notes input {
    background: transparent;
    border: none;
    width: 100%;
    color: #666;
    outline: none;
  }
  
  .product-item {
    background-color: #e6f0fa;
    margin: 10px 0;
    padding: 10px;
    position: relative;
  }
  
  .product-name {
    margin-bottom: 10px;
    color: #333;
    font-size: 16px;
  }
  
  .product-table {
    width: 100%;
    background-color: #d6f5d6;
    border-radius: 15px;
    overflow: hidden;
  }
  
  .table-header {
    display: flex;
    background-color: #b3e6b3;
    padding: 10px 0;
  }
  
  .table-row {
    display: flex;
    padding: 10px 0;
  }
  
  .table-cell {
    flex: 1;
    text-align: center;
  }
  
  .qty-input {
    width: 70px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f2f2f2;
    text-align: center;
  }
  
  .remove-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 20px;
    color: #999;
    cursor: pointer;
  }
  
  .footer {
    display: flex;
    justify-content: space-around;
    padding: 15px;
    background-color: white;
    position: fixed;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #ddd;
  }
  
  .footer-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #666;
    text-decoration: none;
  }
  
  .footer-icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  .add-btn {
    color: #2196F3;
  }
  </style>