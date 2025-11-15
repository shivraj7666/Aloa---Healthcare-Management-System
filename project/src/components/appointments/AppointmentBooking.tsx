import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Calendar, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function AppointmentBooking() {
  const { user } = useAuth();
  const { appointments, addAppointment, updateAppointment, getDoctors } = useData();
  
  const [activeTab, setActiveTab] = useState('book');
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const doctors = getDoctors();
  const userAppointments = user?.role === 'patient' 
    ? appointments.filter(apt => apt.patientId === user.id)
    : user?.role === 'doctor'
    ? appointments.filter(apt => apt.doctorId === user.id)
    : appointments;

  const appointmentTypes = [
    'General Consultation',
    'Follow-up',
    'Specialist Consultation',
    'Emergency',
    'Routine Checkup',
    'Lab Results Review'
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      if (!selectedDoctor) {
        setError('Please select a doctor');
        setLoading(false);
        return;
      }

      // Check for conflicts
      const conflictAppointment = appointments.find(apt => 
        apt.doctorId === formData.doctorId &&
        apt.date === formData.date &&
        apt.time === formData.time &&
        apt.status === 'scheduled'
      );

      if (conflictAppointment) {
        setError('This time slot is already booked. Please choose another time.');
        setLoading(false);
        return;
      }

      const newAppointment = {
        patientId: user?.id || '',
        doctorId: formData.doctorId,
        patientName: user?.name || '',
        doctorName: selectedDoctor.name,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: 'scheduled' as const,
        notes: formData.notes
      };

      addAppointment(newAppointment);
      setSuccess('Appointment booked successfully!');
      setFormData({
        doctorId: '',
        date: '',
        time: '',
        type: '',
        notes: ''
      });
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (appointmentId: string, newStatus: 'completed' | 'cancelled') => {
    updateAppointment(appointmentId, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-2">Manage your healthcare appointments</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {user?.role === 'patient' && (
              <button
                onClick={() => setActiveTab('book')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'book'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Book Appointment
              </button>
            )}
            <button
              onClick={() => setActiveTab('view')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'view'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {user?.role === 'patient' ? 'My Appointments' : 'Patient Appointments'}
            </button>
          </nav>
        </div>
      </div>

      {/* Book Appointment Tab */}
      {activeTab === 'book' && user?.role === 'patient' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Book New Appointment</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any specific concerns or requirements..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Appointments Tab */}
      {activeTab === 'view' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {user?.role === 'patient' ? 'My Appointments' : 'Patient Appointments'}
          </h2>

          {userAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found</p>
              {user?.role === 'patient' && (
                <button
                  onClick={() => setActiveTab('book')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Book Your First Appointment
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {userAppointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(appointment => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user?.role === 'patient' 
                            ? `Dr. ${appointment.doctorName}` 
                            : appointment.patientName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {user?.role === 'patient' ? appointment.doctorName : appointment.patientName}
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}

                    {user?.role === 'doctor' && appointment.status === 'scheduled' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}