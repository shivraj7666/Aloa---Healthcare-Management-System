import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Users, Calendar, FileText, TrendingUp, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { appointments, healthRecords, prescriptions } = useData();

  // Get all users
  const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const patients = allUsers.filter((u: any) => u.role === 'patient');
  const doctors = allUsers.filter((u: any) => u.role === 'doctor');

  // Appointment statistics
  const totalAppointments = appointments.length;
  const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled').length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;

  // Recent activity
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentRecords = healthRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Monthly data for basic analytics
  const currentMonth = new Date().getMonth();
  const monthlyAppointments = appointments.filter(apt => 
    new Date(apt.date).getMonth() === currentMonth
  ).length;

  const monthlyRecords = healthRecords.filter(record => 
    new Date(record.date).getMonth() === currentMonth
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Hospital Management Overview</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Records</p>
              <p className="text-2xl font-bold text-gray-900">{healthRecords.length}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Appointment Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-blue-600">{scheduledAppointments}</p>
            </div>
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">{completedAppointments}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-red-600">{cancelledAppointments}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-xl font-bold text-purple-600">{monthlyAppointments}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
          {recentAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments yet</p>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.patientName} → Dr. {appointment.doctorName}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Health Records</h2>
          {recentRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No records yet</p>
          ) : (
            <div className="space-y-4">
              {recentRecords.map(record => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{record.type}</h3>
                      <p className="text-sm text-gray-600">{record.description}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <FileText className="w-4 h-4 mr-1" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Doctor List */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Doctors</h2>
        {doctors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No doctors registered</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor: any) => (
              <div key={doctor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Dr. {doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-xs text-gray-500">{doctor.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}