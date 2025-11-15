import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { appointments, healthRecords, prescriptions } = useData();

  const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
  const doctorRecords = healthRecords.filter(record => record.doctorId === user?.id);
  const doctorPrescriptions = prescriptions.filter(rx => rx.doctorId === user?.id);

  const todayAppointments = doctorAppointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.date).toDateString() === today && apt.status === 'scheduled';
  });

  const upcomingAppointments = doctorAppointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
    .slice(0, 5);

  const recentRecords = doctorRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const uniquePatients = new Set(doctorAppointments.map(apt => apt.patientId)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dr. {user?.name}</h1>
        <p className="text-gray-600 mt-2">{user?.specialization} • Doctor Dashboard</p>
      </div>

      {/* Today's Alert */}
      {todayAppointments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              You have {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{uniquePatients}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions Issued</p>
              <p className="text-2xl font-bold text-gray-900">{doctorPrescriptions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Records Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">{doctorRecords.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <Link
                to="/appointments"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
              >
                View All
              </Link>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">{appointment.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/prescriptions"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Write Prescription
              </Link>
              <Link
                to="/records"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Review Records
              </Link>
              <Link
                to="/appointments"
                className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
              >
                Manage Schedule
              </Link>
            </div>
          </div>

          {/* Recent Patient Records */}
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
                      <FileText className="w-4 h-4 text-blue-500" />
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