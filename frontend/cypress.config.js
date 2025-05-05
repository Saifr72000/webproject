const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001", // Or your frontend dev server URL
    supportFile: false, // Optional
  },
});

