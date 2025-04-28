<!-- PharmacyList.vue -->
 
<template>
  <div class="pharmacy-app">
    <!-- Header with status bar -->
    <div class="status-bar">
      <!-- {{ product_data[0]}} // from Kamrul Vai API Call -->
    </div>

    <!-- Header -->
    <div class="header">
      <h1>Nearby Pharmacies</h1>
      <div class="search-bar">
        <input type="text" placeholder="Search pharmacies..." v-model="searchQuery" />
      </div>
    </div>

    <!-- Filter options -->
    <div class="filter-options">
      <div class="filter-item" @click="toggleDropdown('city')">
        <span>All City</span>
        <i class="down-arrow" :class="{ 'rotated': activeDropdown === 'city' }"></i>
        <div class="dropdown-menu" v-show="activeDropdown === 'city'">
          <div class="dropdown-item" @click.stop="selectCity('All City')">All City</div>
          <div class="dropdown-item" @click.stop="selectCity('Dhaka')"> Dhaka </div>
          <div class="dropdown-item" @click.stop="selectCity('Chittagong')">Chittagong</div>
          <div class="dropdown-item" @click.stop="selectCity('Sylhet')">Sylhet</div>
        </div>
      </div>
      <div class="filter-item" @click="toggleDropdown('services')">
        <span>Services</span>
        <i class="down-arrow" :class="{ 'rotated': activeDropdown === 'services' }"></i>
        <div class="dropdown-menu" v-show="activeDropdown === 'services'">
          <div class="dropdown-item" @click.stop="selectService('All Services')">All Services</div>
          <div class="dropdown-item" @click.stop="selectService('Prescription')">Prescription</div>
          <div class="dropdown-item" @click.stop="selectService('Medical Supplies')">Medical Supplies</div>
          <div class="dropdown-item" @click.stop="selectService('Consultation')">Consultation</div>
        </div>
      </div>
      <div>
      </div>
      <div>
      </div>
    </div>

    <!-- Secondary filters -->
    <div class="secondary-filters">
      <div class="filter-tag active">Open Now</div>
      <div class="filter-tag">Delivery</div>
      <div class="filter-tag featured">Popular</div>
      <div class="filter-tag">24 Hours</div>
    </div>

    <!-- Pharmacy listings -->
    <div class="pharmacy-list">
      <div v-for="pharmacy in filteredPharmacies" :key="pharmacy.id" class="pharmacy-item">
        <div class="pharmacy-img">
          <img :src="pharmacy.logo" alt="Pharmacy image" class="placeholder-img"/>
        </div>
        
        <div class="pharmacy-info">
          <div class="pharmacy-header">
            <h3>{{ pharmacy.name }}</h3>
            <div class="pharmacy-badges">
              <span class="badge delivery">Delivery</span>
            </div>
          </div>
          <div class="rating">
            <div class="stars">★★★★★</div>
            <span class="score">{{ pharmacy.rating }}</span>
            <span class="reviews">({{ pharmacy.reviews }} reviews)</span>
          </div>
          <div class="address">{{ pharmacy.address }}</div>
          <div class="badges">
            <span class="open-now">Open Now</span>
            <span class="hours">{{ pharmacy.hours }}</span>
          </div>
          <div class="services">
            <div v-for="(service, i) in pharmacy.services" :key="i" class="service-pill">
              {{ service }}
            </div>
          </div>
          <button class="order-button" @click="orderNow(pharmacy)">Order Now</button>
        </div>
      </div>
      <footer class="footer">
        <p>&copy; 2025 HealthCare. All rights reserved.</p>
        <p>Contact us at: info@healthcare.com</p>
        <p>Follow us on social media</p>
      </footer>
    </div>
  </div>
</template>
  
<script>
import pharmacyData from '@/pharmacy-data.json'

export default {
  name: 'PharmacyList',
  data() {
    return {
      // product_data: product_data, // from Kamrul Vai API Call
      pharmacies: [],
      searchQuery: '',
      activeCategory: 'medicines',
      activeDropdown: null,
      selectedCity: 'All City',
      selectedService: 'All Services',
      selectedSorting: 'Rating',
      activeFilters: ['Open Now']
    }
  },
  computed: {
    filteredPharmacies() {
      let result = this.pharmacies.slice();
      
      // Apply search query filter
      if (this.searchQuery) {
        result = result.filter(pharmacy => 
          pharmacy.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          pharmacy.address.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      
      // Apply city filter
      if (this.selectedCity !== 'All City') {
        result = result.filter(pharmacy => 
          pharmacy.address.includes(this.selectedCity)
        );
      }
      
      // Apply service filter
      if (this.selectedService !== 'All Services') {
        result = result.filter(pharmacy => 
          pharmacy.services.includes(this.selectedService)
        );
      }
      
      return result;
    }
  },
  methods: {
    orderNow(pharmacy) {
      console.log('Order button clicked for pharmacy:', pharmacy.name, 'ID:', pharmacy.id)
      // Navigate to medicine list with pharmacy information
      this.$router.push({
        name: 'MedicineList',
        params: {
          pharmacyId: pharmacy.id,
          pharmacy: pharmacy
        }
      })
    },
    setActiveCategory(category) {
      this.activeCategory = category;
      console.log(`Category changed to: ${category}`);
    },
    toggleDropdown(dropdown) {
      if (this.activeDropdown === dropdown) {
        this.activeDropdown = null;
      } else {
        this.activeDropdown = dropdown;
      }
    },
    selectCity(city) {
      this.selectedCity = city;
      this.activeDropdown = null;
      console.log(`City selected: ${city}`);
    },
    selectService(service) {
      this.selectedService = service;
      this.activeDropdown = null;
      console.log(`Service selected: ${service}`);
    },
    setSorting(sorting) {
      this.selectedSorting = sorting;
      this.activeDropdown = null;
      console.log(`Sorting changed to: ${sorting}`);
    },
    applyFilter(filter) {
      this.toggleFilter(filter);
      this.activeDropdown = null;
    },
    toggleFilter(filter) {
      if (this.activeFilters.includes(filter)) {
        this.activeFilters = this.activeFilters.filter(f => f !== filter);
      } else {
        this.activeFilters.push(filter);
      }
      console.log(`Filter toggled: ${filter}, Active filters: ${this.activeFilters.join(', ')}`);
    },
    // Close dropdowns when clicking outside
    closeDropdowns(event) {
      if (!event.target.closest('.filter-item')) {
        this.activeDropdown = null;
      }
    }
  },
  created() {
    // Load pharmacy data when component is created
    if (pharmacyData && pharmacyData.pharmacies) {
      this.pharmacies = pharmacyData.pharmacies.map(pharmacy => {
        // Ensure each pharmacy has an ID
        if (!pharmacy.id) {
          pharmacy.id = 'pharm' + Math.floor(Math.random() * 1000)
          console.warn('Added missing ID to pharmacy:', pharmacy.name)
        }
        return pharmacy
      })
      console.log('Loaded', this.pharmacies.length, 'pharmacies')
    } else {
      console.error('Pharmacy data not found or has incorrect format')
      this.pharmacies = []
    }
  }
}
</script>
  
<style scoped>
.pharmacy-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #000;
  color: #fff;
  max-width: 480px;
  margin: 0 auto;
}
  
.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 14px;
}
  
.network {
  display: flex;
  gap: 4px;
  align-items: center;
}
  
.battery {
  background-color: #fff;
  color: #000;
  border-radius: 8px;
  padding: 0 4px;
}
  
.header {
  padding: 16px;
}
  
.header h1 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #fff;
}
  
.search-bar {
  width: 100%;
  margin-bottom: 12px;
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
  
.category-nav {
  display: flex;
  padding: 12px 8px;
  gap: 16px;
}
  
.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
  
.category-item.active {
  color: #3aa757;
}
  
.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background-color: #333;
  border-radius: 4px;
  font-size: 16px;
}
  
.icon.medicine-icon {
  background-color: #3aa757;
}
  
.filter-options {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #333;
  position: relative;
}
  
.filter-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  position: relative;
  transition: background-color 0.2s;
}
  
.down-arrow {
  border: solid #999;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 2px;
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.down-arrow.rotated {
  transform: rotate(-135deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #222;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  z-index: 10;
  min-width: 150px;
  margin-top: 4px;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #333;
}
  
.secondary-filters {
  display: flex;
  padding: 8px;
  gap: 12px;
  overflow-x: auto;
  border-bottom: 1px solid #333;
}
  
.filter-tag {
  font-size: 12px;
  white-space: nowrap;
  padding: 2px 0;
}
  
.filter-tag.active {
  color: #3aa757;
  border-bottom: 2px solid #3aa757;
}
  
.filter-tag.featured {
  color: #f90;
}
  
.pharmacy-list {
  padding: 8px;
}
  
.pharmacy-item {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
}
  
.pharmacy-img {
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
  
.pharmacy-info {
  flex: 1;
}
  
.pharmacy-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
  
.pharmacy-header h3 {
  font-size: 14px;
  margin: 0;
  font-weight: bold;
}
  
.pharmacy-badges {
  display: flex;
  gap: 4px;
}
  
.badge {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  background-color: #3aa757;
  color: #fff;
}
  
.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-bottom: 4px;
}
  
.stars {
  color: #f90;
}
  
.score {
  color: #f90;
}
  
.address {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 8px;
  line-height: 1.4;
}
  
.badges {
  display: flex;
  gap: 8px;
  font-size: 10px;
  margin-bottom: 8px;
}
  
.badges span {
  background-color: #333;
  padding: 2px 4px;
  border-radius: 2px;
}
  
.open-now {
  color: #3aa757;
}
  
.services {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
  
.service-pill {
  background-color: #333;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: #ccc;
}
  
.order-button {
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.footer {
  background-color: #000000;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  font-size: 14px;
}
  
.footer p {
  margin: 5px 0;
}
</style>