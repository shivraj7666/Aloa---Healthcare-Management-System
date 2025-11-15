# ALOA Healthcare Backend API

A comprehensive Node.js + Express + MongoDB backend for the ALOA Healthcare Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd aloa-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/aloa_healthcare
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

4. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/doctors` | Get all doctors | Private |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/:id` | Update user | Private |
| DELETE | `/api/users/:id` | Deactivate user | Admin |

### Appointments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/appointments` | Get appointments | Private |
| GET | `/api/appointments/:id` | Get appointment by ID | Private |
| POST | `/api/appointments` | Create appointment | Private |
| PUT | `/api/appointments/:id` | Update appointment | Private |
| DELETE | `/api/appointments/:id` | Cancel appointment | Private |
| GET | `/api/appointments/availability/:doctorId` | Get doctor availability | Private |

### Health Records

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/health-records` | Get health records | Private |
| GET | `/api/health-records/:id` | Get record by ID | Private |
| POST | `/api/health-records` | Create record (with file upload) | Private |
| PUT | `/api/health-records/:id` | Update record | Private |
| DELETE | `/api/health-records/:id` | Delete record | Private |
| GET | `/api/health-records/:id/download/:fileIndex` | Download file | Private |

### Prescriptions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/prescriptions` | Get prescriptions | Private |
| GET | `/api/prescriptions/:id` | Get prescription by ID | Private |
| POST | `/api/prescriptions` | Create prescription | Doctor/Admin |
| PUT | `/api/prescriptions/:id` | Update prescription | Doctor/Admin |
| POST | `/api/prescriptions/:id/refill` | Request refill | Patient |
| DELETE | `/api/prescriptions/:id` | Cancel prescription | Doctor/Admin |
| GET | `/api/prescriptions/stats/summary` | Get statistics | Doctor/Admin |

### Alerts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/alerts` | Get user alerts | Private |
| GET | `/api/alerts/:id` | Get alert by ID | Private |
| POST | `/api/alerts` | Create alert | Admin |
| PUT | `/api/alerts/:id/read` | Mark as read | Private |
| PUT | `/api/alerts/read-all` | Mark all as read | Private |
| DELETE | `/api/alerts/:id` | Delete alert | Private |
| GET | `/api/alerts/stats/summary` | Get statistics | Admin |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to get access and refresh tokens
2. **Include access token** in Authorization header: `Bearer <token>`
3. **Refresh token** when access token expires
4. **Logout** to invalidate tokens

### Token Headers
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 👥 User Roles

- **Patient**: Can manage own appointments, records, and prescriptions
- **Doctor**: Can manage patient appointments, create prescriptions, view records
- **Admin**: Full access to all resources and user management

## 📁 Project Structure

```
aloa-backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Appointment.js       # Appointment model
│   ├── HealthRecord.js      # Health record model
│   ├── Prescription.js      # Prescription model
│   └── Alert.js             # Alert model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── appointments.js      # Appointment routes
│   ├── healthRecords.js     # Health record routes
│   ├── prescriptions.js     # Prescription routes
│   └── alerts.js            # Alert routes
├── uploads/                 # File upload directory
├── utils/
│   └── seedData.js          # Database seeding
├── .env.example             # Environment variables template
├── server.js                # Main server file
└── package.json             # Dependencies and scripts
```

## 🛡️ Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Role-based access control**
- **Rate limiting** to prevent abuse
- **File upload validation**
- **CORS configuration**
- **Helmet.js** for security headers
- **Input validation** with express-validator

## 📊 Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['patient', 'doctor', 'admin'],
  phone: String,
  specialization: String (doctors only),
  isActive: Boolean,
  lastLogin: Date
}
```

### Appointment Schema
```javascript
{
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: User),
  date: Date,
  time: String,
  type: String,
  status: ['scheduled', 'completed', 'cancelled'],
  notes: String,
  diagnosis: String,
  treatment: String
}
```

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with demo data
npm test         # Run tests (when implemented)
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/aloa_healthcare` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `MAX_FILE_SIZE` | Max upload file size | `5242880` (5MB) |

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Demo Accounts (after seeding)
- **Patient**: `patient@demo.com` / `demo123`
- **Doctor**: `doctor@demo.com` / `demo123`
- **Admin**: `admin@demo.com` / `demo123`

## 🚀 Deployment

### Production Setup

1. **Set environment variables**
2. **Use production MongoDB**
3. **Configure reverse proxy** (nginx)
4. **Enable SSL/HTTPS**
5. **Set up monitoring**

### Docker Support (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 API Response Format

### Success Response
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.