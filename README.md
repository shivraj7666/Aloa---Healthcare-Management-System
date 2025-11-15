🏥 Aloa – Healthcare Management System

A modern full-stack web application designed to simplify and digitize healthcare processes such as appointments, medical records, prescriptions, user management, and real-time alerts.
Aloa provides separate dashboards for Patients, Doctors, and Admins, making the system organized, efficient, and easy to use.

🚀 Features

Patient Features -
Register and login securely
Book appointments with doctors
View appointment history
View health records
Receive alerts and notifications
Manage profile

Doctor Features -
View upcoming appointments
Accept or reject patient appointments
Add and update prescriptions
Manage patient health records
Receive alert notifications

Admin Features -
Manage all users including patients and doctors
View and monitor appointments across the system
Manage alerts and logs
Maintain database consistency

🗂️ Tech Stack

Frontend -
React with TypeScript
Vite as the build tool
Tailwind CSS for styling
Context API for state management
Axios for API communication

Backend -
Node.js
Express.js
JWT authentication
Mongoose as MongoDB ODM
CORS-enabled APIs

Database -
MongoDB or MongoDB Atlas

🔐 Authentication & Authorization -
The system uses JWT-based authentication.
It supports role-based access control for Patients, Doctors, and Admins.
Protected routes in the frontend are implemented using a custom ProtectedRoute component.

📡 API Modules -
Auth API supports registration, login, and role-based onboarding.
Appointment API allows booking appointments, viewing appointments by role, and approving or rejecting appointments.
Health Records API enables adding, updating, and viewing medical records.
Prescription API supports adding prescriptions and fetching patient prescriptions.
Alert API handles creating alerts and fetching alerts based on user type.
