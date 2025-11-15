🏥 Aloa – Healthcare Management System

A modern full-stack web application designed to simplify and digitize healthcare processes such as appointments, medical records, prescriptions, user management, and real-time alerts.
Aloa provides separate dashboards for Patients, Doctors, and Admins, making the system organized, efficient, and easy to use.

🚀 Features
👤 Patient Features

✔ Register & Login securely
✔ Book appointments with doctors
✔ View appointment history
✔ View health records
✔ Receive alerts & notifications
✔ Manage profile

🩺 Doctor Features

✔ View upcoming appointments
✔ Accept or reject patient appointments
✔ Add and update prescriptions
✔ Manage patient health records
✔ Receive alert notifications

🛠 Admin Features

✔ Manage all users (Patients & Doctors)
✔ View and monitor appointments across the system
✔ Manage alerts/logs
✔ Maintain database consistency

🗂️ Tech Stack

✔ Frontend
✔ React + TypeScript
✔ Vite
✔ Tailwind CSS
✔ Context API for state management
✔ Axios for API calls
✔ Backend
✔ Node.js
✔ Express.js
✔ JWT Authentication
✔ Mongoose (MongoDB ODM)
✔ CORS enabled APIs
✔ Database
✔ MongoDB (MongoDB Atlas recommended)

🔐 Authentication & Authorization

✔ JWT-based authentication
✔ Role-based access control (Patient / Doctor / Admin)
✔ Protected routes in frontend using custom ProtectedRoute component

📡 API Modules

✔ Auth API
✔ Register
✔ Login
✔ Role-based onboarding
✔ Appointment API
✔ Book appointment
✔ Fetch appointments by role
✔ Approve / reject appointments
✔ Health Records API
✔ Add / update / view records
✔ Prescription API
✔ Add prescriptions
✔ Fetch patient prescriptions
✔ Alert API

🧱 Project Structure
project/
│
├── aloa-backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── src/  (Frontend)
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .gitignore
├── package.json
└── README.md
