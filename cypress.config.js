// cypress.config.js

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // 🎯 The base URL for all your tests
    baseUrl: 'http://localhost:3000', 
    
    setupNodeEvents(on, config) {
      // Add any custom configuration or plugins here
    },
  },
});