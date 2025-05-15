<!-- PharmacyList.vue -->
 
<template>
  <div class="pharmacy-app">
    <!-- Header -->
    <div class="header">
      <h1>Nearby Pharmacies</h1>
      <div v-if="locationStatus" class="location-status" :class="locationStatus.type">
        {{ locationStatus.message }}
      </div>
    </div>

    <!-- Filter and search controls -->
    <div class="control-panel">
      <div class="filter-city">
        <div class="filter-item" @click="toggleDropdown('city')">
          <span>{{ selectedCity }}</span>
          <i class="down-arrow" :class="{ 'rotated': activeDropdown === 'city' }"></i>
          <div class="dropdown-menu" v-show="activeDropdown === 'city'">
            <div class="dropdown-item" @click.stop="selectCity('All City')">All City</div>
            <div class="dropdown-item" @click.stop="selectCity('Dhaka')">Dhaka</div>
            <div class="dropdown-item" @click.stop="selectCity('Chittagong')">Chittagong</div>
            <div class="dropdown-item" @click.stop="selectCity('Sylhet')">Sylhet</div>
          </div>
        </div>
        <button class="location-button" @click="requestLocation" :disabled="isLocationLoading">
          <span v-if="isLocationLoading">Getting...</span>
          <span v-else>{{ userLocation ? 'Refresh' : 'Use my location' }}</span>
        </button>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Search pharmacies..." v-model="searchQuery" />
      </div>
    </div>
   
    <!-- Loading indicator for API -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <p>Loading pharmacy data...</p>
    </div>

    <!-- Error message for API -->
    <div v-else-if="apiError" class="no-results">
      <p>{{ apiError }}</p>
      <button class="order-button" @click="fetchPharmacies">Retry</button>
    </div>

    <!-- Pharmacy listings -->
    <div v-else class="pharmacy-list">
      <div v-if="isLocationLoading" class="loading-indicator">
        <div class="loading-spinner"></div>
        <p>Finding nearby pharmacies...</p>
      </div>
      <div v-else-if="filteredPharmacies.length === 0" class="no-results">
        <p>No pharmacies found. Try adjusting your search or location settings.</p>
      </div>
      <div v-else v-for="pharmacy in filteredPharmacies" :key="pharmacy.id" class="pharmacy-item">
        <div class="pharmacy-img">
          <img :src="pharmacy.logo || '/assets/pharmacy-placeholder.png'" alt="Pharmacy image" class="placeholder-img"/>
        </div>
        
        <div class="pharmacy-info">
          <div class="pharmacy-header">
            <h3>{{ pharmacy.name }}</h3>
            <div class="pharmacy-badges">
              <span v-if="pharmacy.distance" class="badge distance">{{ pharmacy.distance.toFixed(1) }}km</span>
            </div>
          </div>
          <div class="address">{{ pharmacy.address }}</div>
          <button class="order-button" @click="orderNow(pharmacy)">Order Now</button>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>© {{ new Date().getFullYear() }} Pharmacy App</p>
    </div>
  </div>
</template>
  
<script>
import PharmacyApiService from '@/services/PharmacyApiService';

export default {
  name: 'PharmacyList',
  data() {
    return {
      selectedCity: 'All City',
      pharmacies: [],
      searchQuery: '',
      activeDropdown: null,
      userLocation: null,
      isLocationLoading: false,
      locationStatus: null,
      maxDistance: 250, // Default 5km radius
      isLoading: true, // Loading state for API
      apiError: null, // Error message for API
      apiUrl: 'http://127.0.0.1:8000/pharmacy_api/data' // Your actual API endpoint
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
    // Fetch pharmacy data from API
    fetchPharmacies() {
      this.isLoading = true;
      this.apiError = null;

      PharmacyApiService.fetchPharmacies()
        .then(pharmacies => {
          this.pharmacies = pharmacies;
          console.log('Loaded', this.pharmacies.length, 'pharmacies from API');
          
          // Calculate distances if user location is available
          if (this.userLocation) {
            this.updatePharmacyDistances();
          }
        })
        .catch(error => {
          console.error('Error fetching pharmacy data:', error);
          this.apiError = 'Failed to load pharmacy data. Please try again.';
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    orderNow(pharmacy) {
      console.log('Order button clicked for pharmacy:', pharmacy.name, 'ID:', pharmacy.id);
      // Navigate to medicine list with pharmacy information
      this.$router.push({
        name: 'MedicineList',
        params: {
          pharmacyId: pharmacy.id,
          pharmacy: pharmacy
        }
      });
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
    // Add event listener to close dropdowns when clicking outside
    document.addEventListener('click', this.closeDropdowns);
    
    // Fetch pharmacy data from API
    this.fetchPharmacies();
    
    // Check if the browser supports geolocation
    if (navigator.geolocation) {
      // Request location permission automatically on component creation
      setTimeout(() => {
        this.requestLocation();
      }, 1000);
    } else {
      this.locationStatus = { type: 'error', message: 'Geolocation is not supported by your browser' };
    }
    
    // Update document title
    document.title = 'Nearby Pharmacies';
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
  padding: 0 8px;
}
  
.header {
  padding: 8px 0;
}
  
.header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #3aa757;
}

.location-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
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

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.filter-city {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
  
.search-bar {
  width: 100%;
}
  
.search-bar input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: none;
  background-color: #333;
  color: #fff;
  box-sizing: border-box;
}

.location-button {
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  background-color: #333;
  color: white;
  border-radius: 4px;
  white-space: nowrap;
}

.location-button:disabled {
  background-color: #444;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #333;
  border-top: 3px solid #3aa757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #ccc;
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
  
.pharmacy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
  
.pharmacy-item {
  display: flex;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 6px;
  box-shadow: none;
}
  
.pharmacy-img {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 8px;
  background-color: #333;
  flex-shrink: 0;
}
  
.placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  object-fit: cover;
}
  
.pharmacy-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
  
.pharmacy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
  
.pharmacy-header h3 {
  font-size: 14px;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
  
.pharmacy-badges {
  flex-shrink: 0;
}
  
.badge {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
  background-color: #3aa757;
  color: #fff;
}

.badge.distance {
  background-color: #005500;
}
  
.address {
  font-size: 11px;
  color: #ccc;
  margin-bottom: 4px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-button {
  background-color: #3aa757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-self: flex-start;
}

.order-button:hover {
  background-color: #2a9a47;
}

.footer {
  text-align: center;
  padding: 12px 0;
  margin-top: 16px;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #333;
}
</style>