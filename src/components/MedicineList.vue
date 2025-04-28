<!-- MedicineList.vue -->
 
<template>
  <div class="medicine-list-view">
    <div class="header">
      <div class="back-button" @click="goBack">
        <span>&larr;</span>
      </div>
      <h1>{{ localSelectedPharmacy.name || selectedPharmacy.name }} - Medicines</h1>
    </div>

    <!-- Debug info - remove in production -->
    <div class="debug-info" v-if="debugMode">
      <p>Selected Pharmacy ID: {{ selectedPharmacyId }}</p>
      <p>Total Medicines Loaded: {{ allMedicines.length }}</p>
      <p>Filtered Medicines: {{ medicines.length }}</p>
      <button @click="loadAllMedicines">Show All Medicines</button>
    </div>

    <div class="search-bar">
      <input type="text" placeholder="Search medicines..." v-model="searchQuery" />
    </div>

    <div class="category-filters" v-if="categories.length > 0">
      <div 
        v-for="(category, index) in categories" 
        :key="index"
        :class="['category-pill', selectedCategory === category ? 'active' : '']"
        @click="selectedCategory = category"
      >
        {{ category }}
      </div>
      <div class="category-pill" @click="selectedCategory = null">All</div>
    </div>

    <!-- No medicines message -->
    <div class="no-medicines" v-if="filteredMedicines.length === 0">
      <p>No medicines found for this pharmacy.</p>
      <button @click="loadAllMedicines" class="load-all-button">Show All Available Medicines</button>
    </div>

    <div class="medicine-grid" v-else>
      <div 
        v-for="medicine in filteredMedicines" 
        :key="medicine.id" 
        class="medicine-card"
      >
        <div class="medicine-img">
          <div class="placeholder-img">💊</div>
        </div>
        <div class="medicine-info">
          <h3>{{ medicine.name }}</h3>
          <div class="medicine-meta">
            <span class="category">{{ medicine.category }}</span>
            <span class="price">${{ medicine.price.toFixed(2) }}</span>
          </div>
          <p class="description">{{ medicine.description }}</p>
          <div class="medicine-actions">
            <div class="quantity-selector">
              <button @click="decreaseQuantity(medicine)">-</button>
              <span>{{ getQuantity(medicine) }}</span>
              <button @click="increaseQuantity(medicine)">+</button>
            </div>
            <button class="add-to-cart" @click="addToCart(medicine)">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="cart-preview" v-if="cartItems.length > 0">
      <div class="cart-info">
        <span>{{ totalItems }} items</span>
        <span class="total-price">${{ totalPrice.toFixed(2) }}</span>
      </div>
      <button class="checkout-button" @click="proceedToCheckout">Proceed to Checkout</button>
    </div>
  </div>
</template>
  
<script>
import medicineData from '@/medicine-data.json'
  
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
      allMedicines: [],
      medicines: [],
      searchQuery: '',
      selectedCategory: null,
      cartItems: [],
      categories: [],
      debugMode: true, // Set to false in production
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
          medicine.description.toLowerCase().includes(query)
        )
      }
  
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(medicine => 
          medicine.category === this.selectedCategory
        )
      }
  
      return filtered
    },
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0)
    },
    totalPrice() {
      return this.cartItems.reduce((total, item) => total + (item.medicine.price * item.quantity), 0)
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
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
      this.increaseQuantity(medicine)
    },
    loadAllMedicines() {
      // Show all medicines regardless of pharmacy
      this.medicines = [...this.allMedicines]
      this.updateCategories()
    },
    updateCategories() {
      // Extract unique categories from current medicines
      const uniqueCategories = new Set(this.medicines.map(medicine => medicine.category))
      this.categories = Array.from(uniqueCategories)
    },
    proceedToCheckout() {
      // Only proceed if cart has items
      if (this.cartItems.length === 0) {
        alert('Please add items to your cart first')
        return
      }
      
      // Store cart items and pharmacy in session storage to persist between routes
      sessionStorage.setItem('cartItems', JSON.stringify(this.cartItems))
      sessionStorage.setItem('pharmacy', JSON.stringify(this.localSelectedPharmacy.id ? this.localSelectedPharmacy : this.selectedPharmacy))
      
      // Navigate to checkout page
      this.$router.push('/checkout')
    }
  },
  created() {
    // Get params from route if not provided as props
    const routePharmacyId = this.$route.params.pharmacyId
    const routePharmacy = this.$route.params.pharmacy
    
    // Use either props or route params
    const currentPharmacyId = this.selectedPharmacyId || routePharmacyId
    
    // Initialize localSelectedPharmacy with the prop data
    this.localSelectedPharmacy = { ...this.selectedPharmacy }
    
    // Update local selectedPharmacy if routePharmacy exists
    if (routePharmacy && !this.selectedPharmacy.id) {
      this.localSelectedPharmacy = { ...routePharmacy }
      this.$emit('update:selectedPharmacy', this.localSelectedPharmacy)
    }
    
    console.log('Using pharmacy ID:', currentPharmacyId)
    console.log('Using pharmacy:', this.localSelectedPharmacy)
    
    // Load all medicine data first
    if (medicineData && medicineData.medicines) {
      this.allMedicines = medicineData.medicines
      
      // Check if the selected pharmacy ID matches any medicines
      if (currentPharmacyId) {
        this.medicines = this.allMedicines.filter(medicine => 
          medicine.pharmacyId === currentPharmacyId
        )
        
        console.log('Selected Pharmacy ID:', currentPharmacyId)
        console.log('Total Medicines:', this.allMedicines.length)
        console.log('Filtered Medicines:', this.medicines.length)
        
        // If no medicines found for this pharmacy, just load all
        if (this.medicines.length === 0) {
          console.warn('No medicines found for pharmacy ID:', currentPharmacyId)
          // Don't auto-load all medicines, let the user click the button instead
        }
      } else {
        // No pharmacy ID, load all medicines
        this.medicines = [...this.allMedicines]
        console.warn('No pharmacy ID provided, loading all medicines')
      }
      
      this.updateCategories()
    } else {
      console.error('Medicine data not found or has incorrect format')
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
  padding-bottom: 60px;
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
  font-size: 20px;
  flex: 1;
}
  
.search-bar {
  padding: 0 16px 12px;
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
  
.category-filters {
  display: flex;
  padding: 8px 16px;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid #333;
}
  
.category-pill {
  background-color: #333;
  color: #ccc;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}
  
.category-pill.active {
  background-color: #3aa757;
  color: #fff;
}
  
.medicine-grid {
  padding: 16px;
}
  
.medicine-card {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;
}
  
.medicine-img {
  width: 80px;
  height: 80px;
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
  font-size: 40px;
}
  
.medicine-info {
  flex: 1;
}
  
.medicine-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}
  
.medicine-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
  
.category {
  color: #ccc;
}
  
.price {
  font-weight: bold;
  color: #3aa757;
}
  
.description {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 12px;
  line-height: 1.4;
}
  
.medicine-actions {
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
  
.add-to-cart {
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
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
  
.checkout-button {
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
  
.debug-info {
  background-color: #333;
  padding: 10px;
  margin: 10px 16px;
  border-radius: 4px;
  font-size: 12px;
}
  
.no-medicines {
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
</style>
