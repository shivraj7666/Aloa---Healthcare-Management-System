import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Pill, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { appointments, healthRecords, prescriptions, alerts } = useData();

  const userAppointments = appointments.filter(apt => apt.patientId === user?.id);
  const userRecords = healthRecords.filter(record => record.patientId === user?.id);
  const userPrescriptions = prescriptions.filter(rx => rx.patientId === user?.id);
  const userAlerts = alerts.filter(alert => alert.userId === user?.id && !alert.read);

  const upcomingAppointments = userAppointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
    .slice(0, 3);

  const recentRecords = userRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const activePrescriptions = userPrescriptions.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your healthcare dashboard</p>
      </div>

      {/* Alert Banner */}
      {userAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
            <span className="text-amber-800 font-medium">
              You have {userAlerts.length} unread alert{userAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {userAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="text-sm text-amber-700">
                • {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{userAppointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Records</p>
              <p className="text-2xl font-bold text-gray-900">{userRecords.length}</p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{userPrescriptions.length}</p>
            </div>
            <Pill className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{userAlerts.length}</p>
            </div>
            <Activity className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link
                to="/appointments"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
              >
                View All
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link
                  to="/appointments"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                >
                  Book an appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Dr. {appointment.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/appointments"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Book Appointment
              </Link>
              <Link
                to="/records"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Upload Records
              </Link>
              <Link
                to="/prescriptions"
                className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
              >
                View Prescriptions
              </Link>
            </div>
          </div>

          {/* Recent Health Records */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Records</h2>
              <Link
                to="/records"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
              >
                View All
              </Link>
            </div>

            {recentRecords.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map(record => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{record.type}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}