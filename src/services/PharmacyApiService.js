// PharmacyApiService.js
// A dedicated service file for API interactions

export default {
  /**
   * Fetch pharmacy data from the API
   * @param {string} baseUrl - Base URL for the API (default: '')
   * @returns {Promise} - Promise that resolves to pharmacy data
   */
  async fetchPharmacies(baseUrl = '') {
    try {
      const apiUrl = baseUrl || 'http://127.0.0.1:8000/pharmacy_api/data';
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.client_list) {
        // Map API data to pharmacy format
        return data.client_list.map(client => ({
          id: client.cid,
          name: client.name,
          address: client.address,
          coordinates: {
            lat: parseFloat(client.latitude) || 23.8103,
            lng: parseFloat(client.longitude) || 90.4125
          },
          // Add default values for properties that might be expected by the UI
          logo: '/image/Ph01.jpg',
          latitude: parseFloat(client.latitude),
          longitude: parseFloat(client.longitude)
        }));
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      console.error('Error in fetchPharmacies:', error);
      throw error;
    }
  }
}