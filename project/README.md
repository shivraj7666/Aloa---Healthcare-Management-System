# ALOA Healthcare Management System - MERN Stack

A comprehensive healthcare management system built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start Guide for VS Code

### Prerequisites

Before starting, make sure you have these installed on your system:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one option:
   - **Option A**: [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Local installation)
   - **Option B**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud database - Recommended)
3. **VS Code** - [Download here](https://code.visualstudio.com/)
4. **Git** - [Download here](https://git-scm.com/)

### VS Code Extensions (Recommended)

Install these extensions in VS Code for better development experience:
- **ES7+ React/Redux/React-Native snippets**
- **MongoDB for VS Code**
- **Thunder Client** (for API testing)
- **Prettier - Code formatter**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

## 📁 Project Setup

### Step 1: Clone/Download the Project

1. Open VS Code
2. Open Terminal in VS Code (`Ctrl+` ` or `View > Terminal`)
3. Navigate to your desired directory:
   ```bash
   cd Desktop
   # or wherever you want to store the project
   ```

### Step 2: Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Install backend dependencies specifically
cd server
npm install
cd ..
```

### Step 3: Database Setup

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (choose free tier)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose Password authentication
   - Username: `admin`, Password: `password123` (or your choice)
5. Whitelist your IP:
   - Go to Network Access
   - Add IP Address
   - Choose "Allow access from anywhere" (0.0.0.0/0)
6. Get connection string:
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

#### Option B: Local MongoDB

1. Install MongoDB Community Server
2. Start MongoDB service:
   ```bash
   # Windows (run as administrator)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

### Step 4: Environment Configuration

1. Update the `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/aloa_healthcare
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/aloa_healthcare

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_different

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

2. Create `.env.local` file for frontend environment variables:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Database Seeding (Optional but Recommended)

Seed the database with demo data:

```bash
npm run seed
```

This will create:
- Demo users (patient, doctor, admin)
- Sample appointments
- Health records
- Prescriptions

## 🏃‍♂️ Running the Application

### Method 1: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev:full
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

### Method 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🔐 Demo Accounts

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@demo.com | demo123 |
| Doctor | doctor@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

## 🛠️ VS Code Development Setup

### 1. Workspace Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.js": "javascriptreact"
  }
}
```

### 2. Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 3. Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Full Stack",
      "type": "shell",
      "command": "npm run dev:full",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

## 🧪 Testing the API

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Create new requests:

**Login Request:**
- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "patient@demo.com",
  "password": "demo123"
}
```

**Get Appointments:**
- Method: GET
- URL: `http://localhost:5000/api/appointments`
- Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

### Using Browser

1. Open `http://localhost:5173`
2. Login with demo credentials
3. Navigate through different sections

## 📂 Project Structure

```
aloa-healthcare/
├── public/                 # Static files
├── src/                   # Frontend React code
│   ├── components/        # React components
│   ├── contexts/         # React contexts
│   ├── services/         # API services
│   └── ...
├── server/               # Backend Node.js code
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── .env                 # Environment variables
├── .env.local          # Frontend environment variables
└── package.json        # Dependencies and scripts
```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Error:**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   - Make sure MongoDB is running
   - Check your MONGODB_URI in .env file

2. **Port Already in Use:**
   ```
   Error: listen EADDRINUSE: address already in use :::5000
   ```
   - Kill the process: `npx kill-port 5000`
   - Or change PORT in .env file

3. **CORS Error:**
   ```
   Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked
   ```
   - Check CLIENT_URL in .env file
   - Restart the backend server

4. **JWT Token Issues:**
   - Clear browser localStorage
   - Check JWT_SECRET in .env file

### Debugging Steps

1. **Check if servers are running:**
   ```bash
   # Check backend
   curl http://localhost:5000/api/health
   
   # Check frontend
   curl http://localhost:5173
   ```

2. **Check database connection:**
   ```bash
   npm run seed
   ```

3. **View server logs:**
   - Backend logs appear in the terminal
   - Frontend logs appear in browser console

## 📱 Features Overview

- **User Authentication**: JWT-based login/signup
- **Role-based Access**: Patient, Doctor, Admin roles
- **Appointment Management**: Book, view, manage appointments
- **Health Records**: Upload, view, download medical records
- **Prescription Management**: Create and track prescriptions
- **Dashboard**: Role-specific dashboards with analytics
- **File Upload**: Secure file handling for medical documents

## 🚀 Production Deployment

For production deployment:

1. **Environment Variables:**
   - Set NODE_ENV=production
   - Use strong JWT secrets
   - Configure production MongoDB URI

2. **Build Frontend:**
   ```bash
   npm run build
   ```

3. **Deploy to platforms like:**
   - Heroku
   - Vercel
   - DigitalOcean
   - AWS

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify environment variables are set correctly
4. Check that MongoDB is running and accessible

## 🎯 Next Steps

After getting the project running:

1. Explore the different user roles (Patient, Doctor, Admin)
2. Test appointment booking and management
3. Upload and manage health records
4. Create and manage prescriptions
5. Customize the system for your specific needs

Happy coding! 🚀