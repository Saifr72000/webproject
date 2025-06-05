# Webproject Backend

A Node.js/Express backend API for a research study platform with user authentication, study management, and tracking for participations in studies.

## Features

- **User Authentication** - JWT-based auth with refresh tokens
- **Study Management** - Create, manage, and publish research studies
- **Session Tracking** - Track participant responses and demographics
- **File Upload** - Handle stimulus files and cover images
- **Rate Limiting** - Protect against abuse and DDoS
- **CORS Support** - Cross-origin resource sharing for frontend integration
- **MongoDB Integration** - Document-based data storage
- **TypeScript** - Type-safe development
- **Docker Support** - Containerized deployment

## Prerequisites

- **Node.js** (v20.18.0 or higher)
- **MongoDB** (v6 or higher)
- **npm** or **yarn**

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Saifr72000/webproject/
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory at root level
Review the .env.example file to see the env variables (also listed below)

```env
# Database
MONGO_DB_URL = mongodb+srv://saif:webproject@cluster0.3ekmn.mongodb.net/webproject

# Server
PORT=2000

# Salt rounds
SALT_ROUNDS = 10

# JWT Secrets
JWT_ACCESS_SECRET=RrFtLu4a+Nf8AwZ8zkB3lWxl/EIlvqJidD17VRjKFfQ=
JWT_REFRESH_SECRET=N/JblOWYqfSNz+WBkuvOsaJAPZqRKAaXhfScr7PymZ8=

# Base url variable
REACT_APP_BASE_URL = http://localhost:2000
```

### 4. Start MongoDB

**Option A: Local MongoDB**

```bash
mongod --dbpath /path/to/your/db
```

**Option B: Docker MongoDB**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

**Option C: Use Docker Compose (recommended)**

```bash
# From project root
docker-compose up database
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:2000` with hot reload.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```
