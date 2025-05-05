module.exports = {
  // Use the default CRA preset but override some settings
  preset: "react-scripts",
  testEnvironment: "jsdom",
  // Add custom settings here
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    // Handle CSS imports (if used in your components)
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
