// src/utils/apiClient.js
/**
 * API Client utility for making authenticated requests
 * Automatically includes JWT token and account ID from localStorage
 */

const API_BASE_URL = 'http://localhost:8000/api/v1'; // Backend kører på port 8000, all domain routes under /api/v1

export const apiClient = {
  /**
   * Get authorization header with JWT token and account ID
   */
  getAuthHeader(skipContentType = false) {
    const token = localStorage.getItem('access_token');
    const accountId = localStorage.getItem('account_id');
    
    const headers = {};
    
    // Kun tilføj Content-Type hvis det ikke er FormData
    if (!skipContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (accountId) {
      headers['X-Account-ID'] = accountId;
      console.log('✅ X-Account-ID header sat:', accountId);
    } else {
      console.warn('⚠️ account_id mangler i localStorage!');
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
    
    console.log('🌐 apiClient.fetch:', { url: fullUrl, method: options.method || 'GET' });
    
    // Tjek om body er FormData - hvis ja, skal vi ikke sætte Content-Type
    const isFormData = options.body instanceof FormData;
    
    // Start med auth headers
    const authHeaders = this.getAuthHeader(isFormData);
    
    // Hvis FormData, fjern Content-Type fra options.headers hvis den findes
    const userHeaders = { ...options.headers };
    if (isFormData && userHeaders['Content-Type']) {
      delete userHeaders['Content-Type'];
    }
    
    const headers = {
      ...authHeaders,
      ...userHeaders
    };

    console.log('📤 Sender request med headers:', headers);
    // Log body kun hvis det er en string (ikke FormData)
    if (options.body) {
      if (typeof options.body === 'string') {
        console.log('📤 Request body:', options.body.substring(0, 100) + '...');
      } else if (options.body instanceof FormData) {
        console.log('📤 Request body: FormData (file upload)');
      } else {
        console.log('📤 Request body:', typeof options.body);
      }
    } else {
      console.log('📤 Request body: No body');
    }

    // Tilføj timeout (30 sekunder)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏱️ Request timeout efter 30 sekunder');
      console.error('⏱️ URL der timeout:', fullUrl);
      controller.abort();
    }, 30000);

    try {
      console.log('🔄 Awaiting fetch til:', fullUrl);
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📡 Response modtaget:', { status: response.status, ok: response.ok, url: fullUrl });
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Fetch fejl:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - serveren svarer ikke');
      }
      throw error;
    }
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
    console.log('📝 apiClient.post kaldt:', { url, data: { ...data, password: '***' } });
    console.log('📝 this.fetch eksisterer?', typeof this.fetch);
    try {
      const result = await this.fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
      });
      console.log('✅ this.fetch returnerede:', result);
      return result;
    } catch (error) {
      console.error('❌ this.fetch fejlede:', error);
      throw error;
    }
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