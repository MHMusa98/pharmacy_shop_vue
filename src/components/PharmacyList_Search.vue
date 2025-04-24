<template>
  <div class="pharmacy-app">
    <!-- Header with status bar -->
    <div class="status-bar">
     
    </div>

    <!-- Header -->
    <div class="header">
      <h1>Nearby Pharmacies</h1>
      <div class="search-bar">
        <input type="text" placeholder="Search pharmacies..." v-model="searchQuery" />
      </div>
    </div>

    <!-- Category navigation -->
    <!-- <div class="category-nav">
      <div class="category-item" :class="{ active: activeCategory === 'medicines' }" @click="setActiveCategory('medicines')">
        <div class="icon medicine-icon">💊</div>
        <span>Medicines</span>
      </div>
      <div class="category-item" :class="{ active: activeCategory === 'health' }" @click="setActiveCategory('health')">
        <div class="icon health-icon">🩺</div>
        <span>Health Items</span>
      </div>
    </div> -->

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
      <!-- <div class="filter-item" @click="toggleDropdown('sorting')">
        <span>Smart Sorting</span>
        <i class="down-arrow" :class="{ 'rotated': activeDropdown === 'sorting' }"></i>
        <div class="dropdown-menu" v-show="activeDropdown === 'sorting'">
          <div class="dropdown-item" @click.stop="setSorting('Prescription Filling')">Prescription Filling</div>
          <div class="dropdown-item" @click.stop="setSorting('Distance')">By Distance</div>
          <div class="dropdown-item" @click.stop="setSorting('All City')">All City</div>
        </div>
      </div> -->
      <div>

      </div>
      <!-- <div class="filter-item" @click="toggleDropdown('filters')">
        <span>Filters</span>
        <i class="down-arrow" :class="{ 'rotated': activeDropdown === 'filters' }"></i>
        <div class="dropdown-menu" v-show="activeDropdown === 'filters'">
          <div class="dropdown-item" @click.stop="applyFilter('Open Now')">Open Now</div>
          <div class="dropdown-item" @click.stop="applyFilter('Delivery')">Delivery</div>
          <div class="dropdown-item" @click.stop="applyFilter('Popular')">Popular</div>
          <div class="dropdown-item" @click.stop="applyFilter('24 Hours')">24 Hours</div>
        </div>
      </div> -->
      <div>

      </div>
    </div>

    <!-- Secondary filters -->
    <div class="secondary-filters">
      <div class="filter-tag" :class="{ active: activeFilters.includes('Open Now') }" @click="toggleFilter('Open Now')">Open Now</div>
      <div class="filter-tag" :class="{ active: activeFilters.includes('Delivery') }" @click="toggleFilter('Delivery')">Delivery</div>
      <div class="filter-tag featured" :class="{ active: activeFilters.includes('Popular') }" @click="toggleFilter('Popular')">Popular</div>
      <div class="filter-tag" :class="{ active: activeFilters.includes('24 Hours') }" @click="toggleFilter('24 Hours')">24 Hours</div>
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
              <span class="badge delivery" @click="handleDeliveryClick(pharmacy)">Delivery</span>
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
          <button class="order-button" @click="handleOrderClick(pharmacy)">Order Now</button>
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
      let result = [...this.pharmacies];
      
      // Apply search query filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(pharmacy => 
          pharmacy.name.toLowerCase().includes(query) || 
          pharmacy.address.toLowerCase().includes(query)
        );
      }
      
      // Apply city filter
     if (this.selectedCity !== 'All City') {
        result = result.filter(pharmacy => 
         pharmacy.address.includes(this.selectedCity)
       );
     }
      
      // Apply service filter
      // if (this.selectedService !== 'All Services') {
      //   result = result.filter(pharmacy => 
      //     pharmacy.services.includes(this.selectedService)
      //   );
      // }
      
      // Apply active filters
      if (this.activeFilters.includes('Open Now')) {
        result = result.filter(pharmacy => pharmacy.isOpen);
      }
      
      if (this.activeFilters.includes('Delivery')) {
        result = result.filter(pharmacy => pharmacy.delivery);
      }
      
      if (this.activeFilters.includes('Popular')) {
        result = result.filter(pharmacy => pharmacy.popular);
      }
      
      if (this.activeFilters.includes('24 Hours')) {
        result = result.filter(pharmacy => pharmacy.hours24);
      }
      
      // Apply sorting
      if (this.selectedSorting === 'Rating') {
        result.sort((a, b) => b.rating - a.rating);
      } else if (this.selectedSorting === 'Distance') {
        result.sort((a, b) => a.distance - b.distance);
      } else if (this.selectedSorting === 'Alphabetical') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      return result;
    }
  },
  methods: {
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
    handleOrderClick(pharmacy) {
      console.log('Order Now clicked for:', pharmacy.name);
      this.$router.push({
        name: 'OrderPage',
        params: { pharmacyId: pharmacy.id }
      });
    },
    handleDeliveryClick(pharmacy) {
      console.log('Delivery clicked for:', pharmacy.name);
      alert(`Delivery available for ${pharmacy.name}!`);
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
    this.pharmacies = pharmacyData.pharmacies;
    
    // For each pharmacy, add default values for filtering if they don't exist
    this.pharmacies.forEach(pharmacy => {
      pharmacy.isOpen = pharmacy.isOpen !== undefined ? pharmacy.isOpen : true;
      pharmacy.delivery = pharmacy.delivery !== undefined ? pharmacy.delivery : true;
      pharmacy.popular = pharmacy.popular !== undefined ? pharmacy.popular : false;
      pharmacy.hours24 = pharmacy.hours24 !== undefined ? pharmacy.hours24 : false;
      pharmacy.distance = pharmacy.distance !== undefined ? pharmacy.distance : Math.random() * 10;
    });
    
    // Add event listener for closing dropdowns when clicking outside
    document.addEventListener('click', this.closeDropdowns);
  },
  beforeUnmount() {
    // Remove event listener when component is destroyed
    document.removeEventListener('click', this.closeDropdowns);
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
  cursor: pointer;
  transition: color 0.2s;
}

.category-item:hover {
  color: #3aa757;
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
  transition: background-color 0.2s;
}

.category-item:hover .icon {
  background-color: #444;
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

.filter-item:hover {
  background-color: #333;
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
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
}

.filter-tag:hover {
  background-color: #222;
}

.filter-tag.active {
  color: #3aa757;
  background-color: rgba(58, 167, 87, 0.2);
  border-radius: 12px;
}

.filter-tag.featured {
  color: #f90;
}

.filter-tag.featured.active {
  color: #f90;
  background-color: rgba(255, 153, 0, 0.2);
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
  cursor: pointer;
  transition: background-color 0.2s;
}

.badge:hover {
  background-color: #2d8a46;
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
  transition: background-color 0.2s;
}

.order-button:hover {
  background-color: #2d8a46;
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