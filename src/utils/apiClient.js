// src/utils/apiClient.js
/**
 * API Client utility for making authenticated requests
 * Automatically includes JWT token and account ID from localStorage
 */

const API_BASE_URL = 'http://localhost:8001'; // Backend kører på port 8001

export const apiClient = {
  /**
   * Get authorization header with JWT token and account ID
   */
  getAuthHeader() {
    const token = localStorage.getItem('access_token');
    const accountId = localStorage.getItem('account_id');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (accountId) {
      headers['X-Account-ID'] = accountId;
    }
    
    return headers;
  },

  /**
   * Fetch with authentication
   * @param {string} url - API endpoint URL (kan være relativ eller absolut)
   * @param {object} options - Fetch options
   */
  async fetch(url, options = {}) {
    // Hvis URL er relativ, tilføj base URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const headers = {
      ...this.getAuthHeader(),
      ...options.headers
    };

    const response = await fetch(fullUrl, {
      ...options,
      headers
    });

    return response;
  },

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.fetch(url, {
      method: 'GET',
      ...options
    });
  },

  /**
   * POST request
   */
  async post(url, data, options = {}) {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  },

  /**
   * PUT request
   */
  async put(url, data, options = {}) {
    return this.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  },

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.fetch(url, {
      method: 'DELETE',
      ...options
    });
  }
};

export default apiClient;