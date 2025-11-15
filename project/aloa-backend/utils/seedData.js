const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const Prescription = require('../models/Prescription');
const Alert = require('../models/Alert');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    const users = [
      {
        name: 'John Doe',
        email: 'patient@demo.com',
        password: 'demo123',
        role: 'patient',
        phone: '+1234567890',
        isActive: true
      },
      {
        name: 'Dr. Sarah Wilson',
        email: 'doctor@demo.com',
        password: 'demo123',
        role: 'doctor',
        specialization: 'Cardiology',
        phone: '+1234567891',
        isActive: true
      },
      {
        name: 'Dr. Michael Chen',
        email: 'doctor2@demo.com',
        password: 'demo123',
        role: 'doctor',
        specialization: 'Neurology',
        phone: '+1234567892',
        isActive: true
      },
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'demo123',
        role: 'admin',
        phone: '+1234567893',
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'patient2@demo.com',
        password: 'demo123',
        role: 'patient',
        phone: '+1234567894',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const seedAppointments = async (users) => {
  try {
    // Clear existing appointments
    await Appointment.deleteMany({});

    const patients = users.filter(user => user.role === 'patient');
    const doctors = users.filter(user => user.role === 'doctor');

    const appointments = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '10:00',
        type: 'General Consultation',
        status: 'scheduled',
        notes: 'Regular checkup appointment',
        symptoms: 'Mild chest pain, occasional shortness of breath'
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        time: '14:30',
        type: 'Specialist Consultation',
        status: 'scheduled',
        notes: 'Neurological consultation for headaches'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        time: '09:00',
        type: 'Follow-up',
        status: 'completed',
        diagnosis: 'Hypertension under control',
        treatment: 'Continue current medication, lifestyle modifications'
      },
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Two weeks ago
        time: '11:00',
        type: 'Routine Checkup',
        status: 'completed',
        diagnosis: 'Overall health good, minor concerns addressed',
        treatment: 'Recommended annual blood work'
      }
    ];

    await Appointment.insertMany(appointments);
    console.log('✅ Appointments seeded successfully');
    return appointments;
  } catch (error) {
    console.error('❌ Error seeding appointments:', error);
    throw error;
  }
};

const seedHealthRecords = async (users) => {
  try {
    // Clear existing health records
    await HealthRecord.deleteMany({});

    const patients = users.filter(user => user.role === 'patient');
    const doctors = users.filter(user => user.role === 'doctor');

    const healthRecords = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        type: 'Lab Results',
        title: 'Complete Blood Count (CBC)',
        description: 'Routine blood work showing normal values across all parameters. White blood cell count, red blood cell count, and platelet levels all within normal ranges.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['blood work', 'routine', 'normal'],
        labValues: [
          {
            parameter: 'Hemoglobin',
            value: '14.2',
            unit: 'g/dL',
            referenceRange: '12.0-15.5',
            status: 'normal'
          },
          {
            parameter: 'White Blood Cells',
            value: '6.8',
            unit: '10³/μL',
            referenceRange: '4.5-11.0',
            status: 'normal'
          }
        ]
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        type: 'MRI',
        title: 'Brain MRI Scan',
        description: 'MRI scan of the brain to investigate recurring headaches. No abnormalities detected. Brain structure appears normal.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        tags: ['brain', 'headaches', 'normal']
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        type: 'X-Ray',
        title: 'Chest X-Ray',
        description: 'Chest X-ray showing clear lungs with no signs of infection or abnormalities. Heart size normal.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tags: ['chest', 'lungs', 'clear']
      },
      {
        patient: patients[0]._id,
        type: 'Vaccination Record',
        title: 'COVID-19 Vaccination',
        description: 'Second dose of COVID-19 vaccine administered. No adverse reactions reported.',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        tags: ['vaccination', 'covid-19', 'immunization']
      }
    ];

    await HealthRecord.insertMany(healthRecords);
    console.log('✅ Health records seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding health records:', error);
    throw error;
  }
};

const seedPrescriptions = async (users, appointments) => {
  try {
    // Clear existing prescriptions
    await Prescription.deleteMany({});

    const patients = users.filter(user => user.role === 'patient');
    const doctors = users.filter(user => user.role === 'doctor');

    const prescriptions = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments.find(apt => apt.status === 'completed')?._id,
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning with food'
          },
          {
            name: 'Aspirin',
            dosage: '81mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food to prevent stomach upset'
          }
        ],
        diagnosis: 'Hypertension',
        notes: 'Monitor blood pressure regularly. Return if experiencing any side effects.',
        status: 'active',
        refillsAllowed: 3,
        refillsUsed: 0
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        medications: [
          {
            name: 'Sumatriptan',
            dosage: '50mg',
            frequency: 'As needed',
            duration: '30 days',
            instructions: 'Take at onset of migraine symptoms. Maximum 2 doses per day.'
          }
        ],
        diagnosis: 'Migraine headaches',
        notes: 'Use only when experiencing migraine symptoms. Avoid triggers like stress and certain foods.',
        status: 'active',
        refillsAllowed: 2,
        refillsUsed: 1,
        isUrgent: false
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        medications: [
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '7 days',
            instructions: 'Take with food. Complete entire course even if feeling better.'
          }
        ],
        diagnosis: 'Bacterial infection',
        notes: 'Complete the full course of antibiotics. Contact if symptoms worsen.',
        status: 'completed',
        refillsAllowed: 0,
        refillsUsed: 0
      }
    ];

    await Prescription.insertMany(prescriptions);
    console.log('✅ Prescriptions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding prescriptions:', error);
    throw error;
  }
};

const seedAlerts = async (users) => {
  try {
    // Clear existing alerts
    await Alert.deleteMany({});

    const patients = users.filter(user => user.role === 'patient');

    const alerts = [
      {
        user: patients[0]._id,
        type: 'appointment',
        title: 'Upcoming Appointment Reminder',
        message: 'You have an appointment with Dr. Sarah Wilson tomorrow at 10:00 AM.',
        priority: 'medium',
        isRead: false,
        scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
      },
      {
        user: patients[0]._id,
        type: 'medication',
        title: 'Medication Refill Due',
        message: 'Your Lisinopril prescription is running low. You have 2 refills remaining.',
        priority: 'high',
        isRead: false
      },
      {
        user: patients[0]._id,
        type: 'checkup',
        title: 'Annual Checkup Due',
        message: 'It\'s time for your annual health checkup. Please schedule an appointment.',
        priority: 'low',
        isRead: true,
        readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: patients[1]._id,
        type: 'lab_results',
        title: 'Lab Results Available',
        message: 'Your recent blood work results are now available for review.',
        priority: 'medium',
        isRead: false
      }
    ];

    await Alert.insertMany(alerts);
    console.log('✅ Alerts seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding alerts:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    const users = await seedUsers();
    const appointments = await seedAppointments(users);
    await seedHealthRecords(users);
    await seedPrescriptions(users, appointments);
    await seedAlerts(users);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Patient: patient@demo.com / demo123');
    console.log('Doctor: doctor@demo.com / demo123');
    console.log('Admin: admin@demo.com / demo123');
    console.log('\n🚀 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };