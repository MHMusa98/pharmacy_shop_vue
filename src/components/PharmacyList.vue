<!-- PharmacyList.vue -->
 
<template>
  <div class="pharmacy-app">
    <!-- Header with status bar -->
    <div class="status-bar">
    </div>

    <!-- Header -->
    <div class="header">
      <h1>Nearby Pharmacies</h1>
      <div v-if="locationStatus" class="location-status" :class="locationStatus.type">
        {{ locationStatus.message }}
      </div>
    </div>

    <!-- Filter options -->
    <div class="filter-options">
      <div class="filter-item" @click="toggleDropdown('city')">
        <span>{{ selectedCity }}</span>
        <i class="down-arrow" :class="{ 'rotated': activeDropdown === 'city' }"></i>
        <div class="dropdown-menu" v-show="activeDropdown === 'city'">
          <div class="dropdown-item" @click.stop="selectCity('All City')">All City</div>
          <div class="dropdown-item" @click.stop="selectCity('Dhaka')"> Dhaka </div>
          <div class="dropdown-item" @click.stop="selectCity('Chittagong')">Chittagong</div>
          <div class="dropdown-item" @click.stop="selectCity('Sylhet')">Sylhet</div>
        </div>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Search pharmacies..." v-model="searchQuery" />
      </div>
      <div>
      </div>
      <div>
      </div>
    </div>

    <!-- Location controls -->
    <div class="location-controls">
      <button class="location-button" @click="requestLocation" :disabled="isLocationLoading">
        <span v-if="isLocationLoading">Getting location...</span>
        <span v-else>{{ userLocation ? 'Refresh location' : 'Use my location' }}</span>
      </button>
      <div v-if="userLocation" class="location-info">
        <span class="location-label">Showing nearby pharmacies</span>
        <!-- <span class="location-label">Showing pharmacies within {{ maxDistance }}km</span> -->
        <input 
          type="range" 
          min="0" 
          max="250" 
          v-model.number="maxDistance" 
          class="distance-slider"
          @change="updatePharmacyDistances"
        />
      </div>
    </div>

    <!-- Pharmacy listings -->
    <div class="pharmacy-list">
      <div v-if="isLocationLoading" class="loading-indicator">
        <div class="loading-spinner"></div>
        <p>Finding nearby pharmacies...</p>
      </div>
      <div v-else-if="filteredPharmacies.length === 0" class="no-results">
        <p>No pharmacies found. Try adjusting your search or location settings.</p>
      </div>
      <div v-else v-for="pharmacy in filteredPharmacies" :key="pharmacy.id" class="pharmacy-item">
        <div class="pharmacy-img">
          <img :src="pharmacy.logo" alt="Pharmacy image" class="placeholder-img"/>
        </div>
        
        <div class="pharmacy-info">
          <div class="pharmacy-header">
            <h3>{{ pharmacy.name }}</h3>
            <div class="pharmacy-badges">
              <span class="badge delivery">Delivery</span>
              <span v-if="pharmacy.distance" class="badge distance">{{ pharmacy.distance.toFixed(1) }}km</span>
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
          <button class="order-button" @click="orderNow(pharmacy)">Order Now</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import pharmacyData from '@/pharmacy-data.json'

export default {
  name: 'PharmacyList',
  data() {
    return {
      selectedCity: 'All City',
      pharmacies: [],
      searchQuery: '',
      activeCategory: 'medicines',
      activeDropdown: null,
      selectedService: 'All Services',
      selectedSorting: 'Rating',
      activeFilters: ['Open Now'],
      userLocation: null,
      isLocationLoading: false,
      locationStatus: null,
      maxDistance: 250 // Default 5km radius
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
      
      // Apply location-based filter if user location is available
      if (this.userLocation) {
        result = result.filter(pharmacy => {
          return pharmacy.distance !== undefined && pharmacy.distance <= this.maxDistance;
        });
        
        // Sort by distance when location is available
        result.sort((a, b) => a.distance - b.distance);
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
    // Close dropdowns when clicking outside
    closeDropdowns(event) {
      if (!event.target.closest('.filter-item')) {
        this.activeDropdown = null;
      }
    },
    // Location methods
    requestLocation() {
      this.isLocationLoading = true;
      this.locationStatus = { type: 'info', message: 'Requesting your location...' };
      
      // Check if geolocation is available
      if (!navigator.geolocation) {
        this.locationStatus = { type: 'error', message: 'Geolocation is not supported by your browser' };
        this.isLocationLoading = false;
        return;
      }
      
      // Request current position
      navigator.geolocation.getCurrentPosition(
        this.handleLocationSuccess,
        this.handleLocationError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },
    handleLocationSuccess(position) {
      const { latitude, longitude } = position.coords;
      console.log('Location obtained:', latitude, longitude);
      
      this.userLocation = { lat: latitude, lng: longitude };
      this.locationStatus = { type: 'success', message: 'Location obtained successfully' };
      
      // Calculate distances for each pharmacy
      this.updatePharmacyDistances();
      
      this.isLocationLoading = false;
      
      // Clear status message after a delay
      setTimeout(() => {
        this.locationStatus = null;
      }, 2000);
    },
    handleLocationError(error) {
      console.error('Error getting location:', error);
      
      let errorMessage = 'Failed to get your location';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please allow location access.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        case error.UNKNOWN_ERROR:
          errorMessage = 'An unknown error occurred.';
          break;
      }
      
      this.locationStatus = { type: 'error', message: errorMessage };
      this.isLocationLoading = false;
    },
    updatePharmacyDistances() {
      if (!this.userLocation) return;
      
      this.pharmacies.forEach(pharmacy => {
        // Use pharmacy coordinates from latitude and longitude fields
        if (pharmacy.coordinates && pharmacy.coordinates.lat && pharmacy.coordinates.lng) {
          pharmacy.distance = this.calculateDistance(
            this.userLocation.lat, 
            this.userLocation.lng,
            pharmacy.coordinates.lat,
            pharmacy.coordinates.lng
          );
        } else {
          // Fallback to a default distance if coordinates are missing
          console.warn(`Missing coordinates for pharmacy: ${pharmacy.name}`);
          pharmacy.distance = 999; // Set a large distance so it appears at the end
        }
      });
    },
    calculateDistance(lat1, lon1, lat2, lon2) {
      // Haversine formula to calculate distance between two points
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1);
      const dLon = this.deg2rad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c; // Distance in km
      return distance;
    },
    deg2rad(deg) {
      return deg * (Math.PI/180);
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
        
        // Use the pharmacy's latitude and longitude data
        // The data is already in pharmacy-data.json
        pharmacy.coordinates = {
          lat: pharmacy.latitude || 23.8103,
          lng: pharmacy.longitude || 90.4125
        };
        
        return pharmacy
      })
      console.log('Loaded', this.pharmacies.length, 'pharmacies')
      
      // Location permission will be requested in the created hook
    } else {
      console.error('Pharmacy data not found or has incorrect format')
      this.pharmacies = []
    }
    
    // Add event listener to close dropdowns when clicking outside
    document.addEventListener('click', this.closeDropdowns);
    
    // Check if the browser supports geolocation
    if (navigator.geolocation) {
      // Request location permission automatically on component creation
      setTimeout(() => {
        this.requestLocation();
      }, 1000);
    } else {
      this.locationStatus = { type: 'error', message: 'Geolocation is not supported by your browser' };
    }
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
  padding: 5px;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
  
.header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #3aa757;
}

.location-status {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.location-status.info {
  background-color: #2d4e9a;
}

.location-status.success {
  background-color: #3aa757;
}

.location-status.error {
  background-color: #e74c3c;
}
  
.search-bar {
  width: 85%;
  margin-bottom: 12px;
  height: 20px;
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

.location-controls {
  display: flex;
  flex-direction: column;
  padding: 0 8px 12px;
  border-bottom: 1px solid #333;
}

.location-button {
  background-color: #2d4e9a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 8px;
}

.location-button:disabled {
  background-color: #444;
  cursor: not-allowed;
}

.location-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #ccc;
}

.location-label {
  margin-bottom: 4px;
}

.distance-slider {
  width: 100%;
  background-color: #333;
  height: 4px;
  outline: none;
  -webkit-appearance: none;
  border-radius: 2px;
}

.distance-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3aa757;
  cursor: pointer;
}

.distance-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3aa757;
  cursor: pointer;
  border: none;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top: 3px solid #3aa757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  padding: 40px 20px;
  text-align: center;
  color: #ccc;
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

.badge.distance {
  background-color: #2d4e9a;
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