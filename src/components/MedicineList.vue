<!-- MedicineList.vue -->
 
<template>
  <div class="medicine-list-view">
    <div class="header">
       <h1>Search Medicines</h1>
    </div>
    <div class="search-bar">
      <input type="text" placeholder="Search medicines..." v-model="searchQuery" />
    </div>

    <!-- Loading indicator -->
    <div class="loading-message" v-if="loading">
      <p>Loading medicines...</p>
    </div>

    <!-- Error message -->
    <div class="error-message" v-else-if="error">
      <p>{{ error }}</p>
      <button @click="fetchMedicines" class="load-all-button">Try Again</button>
    </div>

    <!-- No medicines message -->
    <div class="no-medicines" v-else-if="filteredMedicines.length === 0">
      <p>No medicines found matching your search.</p>
      <button @click="searchQuery = ''" class="load-all-button">Clear Search</button>
    </div>

    <div class="medicine-grid" v-else>
      <div 
        v-for="medicine in paginatedMedicines" 
        :key="medicine.id" 
        class="medicine-card"
      >
        <div class="medicine-img">
          <div class="placeholder-img">💊</div>
        </div>
        <div class="medicine-info">
          <h3>{{ medicine.name }}</h3>
          <div class="medicine-meta">
            <span class="medicine-subinfo">{{ medicine.generic }} || {{ medicine.company }}</span>
            <span class="price">${{ parseFloat(medicine.tp_amount || 0).toFixed(2) }}</span>
          </div>

          <div class="medicine-actions">
            <div class="left-actions">
              <div class="quantity-selector">
                <button @click="decreaseQuantity(medicine)">-</button>
                <span>{{ getQuantity(medicine) }}</span>
                <button @click="increaseQuantity(medicine)">+</button>
              </div>
              <p class="medicine_quantity">Strips</p>
              <p class="medicine_quantity_details">10 Tab:1 strips</p>
            </div>

            <button class="add-to-cart" @click="addToCart(medicine)">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination controls -->
    <div class="pagination-controls" v-if="totalPages > 1">
      <button 
        @click="currentPage = Math.max(1, currentPage - 1)" 
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        Previous
      </button>
      <span class="page-indicator">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        @click="currentPage = Math.min(totalPages, currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        Next
      </button>
    </div>

    <div class="cart-preview" v-if="cartItems.length > 0">
      <div class="cart-info">
        <span>{{ totalItems }} items</span>
        <span class="total-price">${{ totalPrice.toFixed(2) }}</span>
      </div>
      <div class="cart-buttons">
        <button class="clear-cart-button" @click="clearCart">Clear Cart</button>
        <button class="checkout-button" @click="proceedToCheckout">Proceed to Checkout</button>
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  name: 'MedicineList',
  props: {
    selectedPharmacyId: {
      type: String,
      required: false
    },
    selectedPharmacy: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      medicines: [],
      searchQuery: '',
      cartItems: [],
      loading: true,
      error: null,
      currentPage: 1,
      itemsPerPage: 20,
      localSelectedPharmacy: {}
    }
  },
  computed: {
    filteredMedicines() {
      let filtered = this.medicines
  
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(medicine => 
          medicine.name.toLowerCase().includes(query) || 
          medicine.generic.toLowerCase().includes(query) ||
          medicine.company.toLowerCase().includes(query)
        )
      }
  
      return filtered
    },
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0)
    },
    totalPrice() {
      return this.cartItems.reduce((total, item) => 
        total + (parseFloat(item.medicine.tp_amount || 0) * item.quantity), 0)
    },
    totalPages() {
      return Math.ceil(this.filteredMedicines.length / this.itemsPerPage)
    },
    paginatedMedicines() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredMedicines.slice(start, end)
    }
  },
  methods: {
    fetchMedicines() {
      this.loading = true
      this.error = null
      
      fetch('http://127.0.0.1:8000/pharmacy_api/medicine_list')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then(data => {
          if (data.status === 'success') {
            // Process the medicine list to ensure all have proper price values
            this.medicines = data.medicine_list.map(medicine => {
              return {
                ...medicine,
                // Ensure tp_amount is a string that can be parsed to a number
                tp_amount: medicine.tp_amount ? String(medicine.tp_amount) : "0.00"
              }
            })
            console.log('Medicines loaded:', this.medicines.length)
          } else {
            throw new Error(data.message || 'Failed to load medicines')
          }
        })
        .catch(error => {
          console.error('Error fetching medicines:', error)
          this.error = `Failed to load medicines: ${error.message}`
        })
        .finally(() => {
          this.loading = false
        })
    },
    getQuantity(medicine) {
      const cartItem = this.cartItems.find(item => item.medicine.id === medicine.id)
      return cartItem ? cartItem.quantity : 0
    },
    increaseQuantity(medicine) {
      const existingItem = this.cartItems.find(item => item.medicine.id === medicine.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.cartItems.push({
          medicine: medicine,
          quantity: 1
        })
      }
    },
    decreaseQuantity(medicine) {
      const existingItem = this.cartItems.find(item => item.medicine.id === medicine.id)
      
      if (existingItem && existingItem.quantity > 0) {
        existingItem.quantity--
        
        // Remove item from cart if quantity becomes 0
        if (existingItem.quantity === 0) {
          this.cartItems = this.cartItems.filter(item => item.medicine.id !== medicine.id)
        }
      }
    },
    addToCart(medicine) {
      const existingItem = this.cartItems.find(item => item.medicine.id === medicine.id)
      if (!existingItem) {
        this.cartItems.push({
          medicine: medicine,
          quantity: 1
        })     
      }
    },
    proceedToCheckout() {
      // Only proceed if cart has items
      if (this.cartItems.length === 0) {
        alert('Please add items to your cart first')
        return
      }
      
      // Make sure cartItems have proper price data
      const verifiedCartItems = this.cartItems.map(item => {
        // Ensure price is a valid number
        if (!item.medicine.tp_amount || isNaN(parseFloat(item.medicine.tp_amount))) {
          item.medicine.tp_amount = "0.00"
        }
        return item
      })
      
      // Store cart items and pharmacy in session storage to persist between routes
      sessionStorage.setItem('cartItems', JSON.stringify(verifiedCartItems))
      sessionStorage.setItem('pharmacy', JSON.stringify(this.localSelectedPharmacy.id ? this.localSelectedPharmacy : this.selectedPharmacy))
      
      // Log for debugging
      console.log('Proceeding to checkout with items:', verifiedCartItems)
      console.log('Using route:', '/checkout')
      
      // Navigate to checkout page
      this.$router.push('/checkout')
    },
    
    clearCart() {
      if (this.cartItems.length === 0) {
        alert('Cart is already empty')
        return
      }
      
      if (confirm('Are you sure you want to clear your cart?')) {
        this.cartItems = []
        sessionStorage.removeItem('cartItems')
      }
    }
  },
  created() {
    // Get params from route if available
    const routePharmacyId = this.$route.params.pharmacyId
    const pharmacyName = this.$route.params.pharmacy || "All Medicines"
    
    // Initialize localSelectedPharmacy with the prop data or route params
    this.localSelectedPharmacy = { 
      ...this.selectedPharmacy,
      name: pharmacyName 
    }
    
    console.log('Current route:', this.$route.path)
    console.log('Pharmacy info:', pharmacyName, routePharmacyId)
    
    // Update document title to reflect the current view
    document.title = `Medicine List - ${pharmacyName}`
    
    // Fetch medicines from API
    this.fetchMedicines()
    
    // Check if there are cart items in session storage
    const storedCartItems = sessionStorage.getItem('cartItems')
    if (storedCartItems) {
      try {
        this.cartItems = JSON.parse(storedCartItems)
      } catch (e) {
        console.error('Error parsing stored cart items:', e)
      }
    }
  },
  watch: {
    // Reset to first page when search query changes
    searchQuery() {
      this.currentPage = 1
    }
  }
}
</script>
  
<style scoped>
.medicine-list-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #000;
  color: #fff;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  padding-bottom: 80px; /* Increased to accommodate pagination */
}
  
.header {
  display: flex;
  align-items: center;
  padding: 16px;
  position: sticky;
  top: 0;
  background-color: #000;
  z-index: 10;
}
  
.back-button {
  margin-right: 16px;
  font-size: 24px;
  cursor: pointer;
}
  
.header h1 {
  margin: 0;
  color: #3aa757;
  font-size: 20px;
  flex: 1;
}
  
.search-bar {
  padding: 8px 16px 8px;
}
  
.search-bar input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: #333;
  color: #fff;
  box-sizing: border-box;
}
  
.medicine-grid {
  padding: 8px;
}
  
.medicine-card {
  display: flex;
  background-color: #1a1a1a;
  border: 1px solid #444;
  border-radius: 7px;
  margin: 5px;
  padding: 5px 5px 5px 2px;
  gap: 0.7rem; /* Reduced gap for more compact layout */
}
  
.medicine-img {
  width: 60px; /* Made slightly smaller */
  height: 60px; /* Made slightly smaller */
  overflow: hidden;
  border-radius: 4px;
  margin-right: 8px; /* Reduced margin */
  background-color: #333;
}
  
.placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px; /* Slightly smaller font */
}
  
.medicine-info {
  flex: 1;
  transform: translateY(-5px);
}

.medicine-subinfo {
  color: #c7c09c;
  font-size: 11px; /* Smaller font size */
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px; /* Constrain width */
  display: inline-block;
}

.medicine-info h3 {
  margin: 0 0 6px 0; /* Reduced margin */
  font-size: 15px; /* Slightly smaller */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 230px;
}
  
.medicine-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px; /* Reduced margin */
  font-size: 13px; /* Slightly smaller */
}
  
.price {
  font-weight: bold;
  color: #3aa757;
  margin-left: auto;
}
  
.medicine-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 4px; /* Reduced gap */
  flex-wrap: wrap;
}

.medicine_quantity,.medicine_quantity_details {
  font-size: 10px; /* Smaller font */
  margin: 0;
  padding: 0 2px; /* Reduced padding */
  text-align: center;
  color: #ccc;
}

.medicine_quantity_details {
  font-size: 9px; /* Even smaller font */
  color: #999;
  text-align: left;
  transform: translateY(0);
}

.medicine-actions > * {
  margin-top: -5px;
}
  
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 2px; /* Reduced gap */
  font-size: 11px; /* Smaller font */
  height: 22px; /* Slightly shorter */
}

.quantity-selector button {
  width: 22px; /* Slightly smaller */
  height: 22px; /* Slightly smaller */
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px; /* Smaller font */
  cursor: pointer;
}
  
.quantity-selector span {
  padding: 0 8px; /* Reduced padding */
}
  
.add-to-cart {
  background-color: #3aa757;
  color: rgb(255, 255, 255);
  border: 4px solid #3aa757; /* Slightly thinner border */
  border-radius: 6px; /* Slightly less rounded */
  padding: 4px 10px; /* Reduced padding */
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-sizing: border-box;
}

.add-to-cart:hover,.checkout-button:hover {
  background-color: #308de4;
  border-color: #2f74b4;
  color: #fff;
}

.cart-preview {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #222;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 480px;
  margin: 0 auto;
  border-top: 1px solid #333;
  z-index: 15; /* Ensure it's above pagination */
}
  
.cart-info {
  display: flex;
  flex-direction: column;
}
  
.total-price {
  font-weight: bold;
  font-size: 16px;
  color: #3aa757;
}

.cart-buttons {
  display: flex;
  gap: 8px;
}

.checkout-button {
  background-color: #3aa757;
  color: rgb(255, 255, 255);
  border: 5px solid #3aa757;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-sizing: border-box;
}

.clear-cart-button {
  background-color: #e74c3c;
  color: white;
  border: 5px solid #e74c3c;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-sizing: border-box;
}

.clear-cart-button:hover {
  background-color: #c0392b;
  border-color: #c0392b;
}
  
.no-medicines, .loading-message, .error-message {
  padding: 40px 16px;
  text-align: center;
  color: #ccc;
}
  
.load-all-button {
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-top: 16px;
  font-size: 14px;
  cursor: pointer;
}

.medicine_quantity {
  font-size: 11px;
  color: #ccc;
  padding-bottom: 10px; /* Slightly reduced */
  text-align: center;
  transform: translateY(5px);
}

/* Pagination styles */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  padding: 10px 0;
  gap: 16px;
}

.pagination-button {
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: #444;
}

.page-indicator {
  font-size: 14px;
  color: #ccc;
}
</style>