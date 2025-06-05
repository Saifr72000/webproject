# Webproject Frontend

A React-based frontend application for a research study platform that allows researchers to create, manage, and conduct studies with participant tracking and data collection.

## Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Backend API** running on configured URL

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Saifr72000/webproject/
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the frontend directory at root level
Review the .env.example file to see the env variables (also listed below)

```env
# Backend API URL
# For local environement:
REACT_APP_BASE_URL=http://localhost:2000

# For deployed environment:
REACT_APP_BASE_URL = https://group7-api.sustainability.it.ntnu.no
(remember to enable this before pushing for deployment purposes)

# Frontend URL (for sharing links)
# For local environement:
REACT_APP_FRONTEND_URL=http://localhost:3000

# For deployed environment:
# REACT_APP_FRONTEND_URL = https://group7.sustainability.it.ntnu.no

```

## Running the Application

### Development Mode

```bash
npm start
```

Application will start on `http://localhost:3000` with hot reload.

### Production Mode

```bash
# Build for production
npm run build

# Serve build locally (optional)
npx serve -s build
```
