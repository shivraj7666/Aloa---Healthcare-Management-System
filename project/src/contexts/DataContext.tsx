import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface HealthRecord {
  id: string;
  patientId: string;
  date: string;
  type: string;
  description: string;
  fileName?: string;
  fileData?: string;
  doctorId?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  date: string;
  notes?: string;
}

interface Alert {
  id: string;
  userId: string;
  type: 'appointment' | 'medication' | 'checkup';
  message: string;
  date: string;
  read: boolean;
}

interface DataContextType {
  appointments: Appointment[];
  healthRecords: HealthRecord[];
  prescriptions: Prescription[];
  alerts: Alert[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => void;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  markAlertAsRead: (id: string) => void;
  getDoctors: () => any[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedAppointments = localStorage.getItem('appointments');
    const savedRecords = localStorage.getItem('healthRecords');
    const savedPrescriptions = localStorage.getItem('prescriptions');
    const savedAlerts = localStorage.getItem('alerts');

    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    if (savedRecords) setHealthRecords(JSON.parse(savedRecords));
    if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

    // Initialize sample data if empty
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const sampleUsers = [
        {
          id: '1',
          email: 'patient@demo.com',
          password: 'demo123',
          name: 'John Doe',
          role: 'patient',
          phone: '+1234567890'
        },
        {
          id: '2',
          email: 'doctor@demo.com',
          password: 'demo123',
          name: 'Dr. Sarah Wilson',
          role: 'doctor',
          specialization: 'Cardiology',
          phone: '+1234567891'
        },
        {
          id: '3',
          email: 'admin@demo.com',
          password: 'demo123',
          name: 'Admin User',
          role: 'admin',
          phone: '+1234567892'
        }
      ];
      localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    const updated = [...appointments, newAppointment];
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const updated = appointments.map(apt => 
      apt.id === id ? { ...apt, ...updates } : apt
    );
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const addHealthRecord = (record: Omit<HealthRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
    };
    const updated = [...healthRecords, newRecord];
    setHealthRecords(updated);
    localStorage.setItem('healthRecords', JSON.stringify(updated));
  };

  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    const newPrescription = {
      ...prescription,
      id: Date.now().toString(),
    };
    const updated = [...prescriptions, newPrescription];
    setPrescriptions(updated);
    localStorage.setItem('prescriptions', JSON.stringify(updated));
  };

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const newAlert = {
      ...alert,
      id: Date.now().toString(),
    };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    localStorage.setItem('alerts', JSON.stringify(updated));
  };

  const markAlertAsRead = (id: string) => {
    const updated = alerts.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    );
    setAlerts(updated);
    localStorage.setItem('alerts', JSON.stringify(updated));
  };

  const getDoctors = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter((user: any) => user.role === 'doctor');
  };

  return (
    <DataContext.Provider value={{
      appointments,
      healthRecords,
      prescriptions,
      alerts,
      addAppointment,
      updateAppointment,
      addHealthRecord,
      addPrescription,
      addAlert,
      markAlertAsRead,
      getDoctors,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}