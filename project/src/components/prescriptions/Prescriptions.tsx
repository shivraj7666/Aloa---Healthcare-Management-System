import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Pill, Plus, Trash2, User, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function Prescriptions() {
  const { user } = useAuth();
  const { prescriptions, addPrescription, getDoctors } = useData();
  
  const [activeTab, setActiveTab] = useState('view');
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    notes: ''
  });
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Get all users to select patients (for doctors)
  const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const patients = allUsers.filter((u: any) => u.role === 'patient');
  
  const userPrescriptions = user?.role === 'patient' 
    ? prescriptions.filter(rx => rx.patientId === user.id)
    : user?.role === 'doctor'
    ? prescriptions.filter(rx => rx.doctorId === user.id)
    : prescriptions;

  const commonMedications = [
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Amoxicillin', 'Lisinopril',
    'Metformin', 'Amlodipine', 'Omeprazole', 'Simvastatin', 'Losartan'
  ];

  const frequencies = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'As needed'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'patientId') {
      const selectedPatient = patients.find(p => p.id === e.target.value);
      setFormData({
        ...formData,
        patientId: e.target.value,
        patientName: selectedPatient ? selectedPatient.name : ''
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updated = medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate medications
      const validMedications = medications.filter(med => 
        med.name && med.dosage && med.frequency && med.duration
      );

      if (validMedications.length === 0) {
        setError('Please add at least one complete medication entry');
        setLoading(false);
        return;
      }

      let targetPatientId = formData.patientId;
      let targetPatientName = formData.patientName;

      if (user?.role === 'patient') {
        targetPatientId = user.id;
        targetPatientName = user.name;
      }

      const newPrescription = {
        patientId: targetPatientId,
        doctorId: user?.id || '',
        patientName: targetPatientName,
        doctorName: user?.name || '',
        medications: validMedications,
        date: new Date().toISOString().split('T')[0],
        notes: formData.notes
      };

      addPrescription(newPrescription);
      setSuccess('Prescription created successfully!');
      setFormData({ patientId: '', patientName: '', notes: '' });
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
    } catch (err) {
      setError('Failed to create prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMedicationStatusColor = (medication: any) => {
    // Simple logic to determine if medication is active
    const today = new Date();
    const prescriptionDate = new Date();
    const daysDiff = Math.floor((today.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Assume medications are active for duration specified or 30 days default
    const durationDays = parseInt(medication.duration.split(' ')[0]) || 30;
    
    return daysDiff <= durationDays ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-600 mt-2">Manage medical prescriptions and medication history</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('view')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'view'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              View Prescriptions
            </button>
            {user?.role === 'doctor' && (
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Write Prescription
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Create Prescription Tab (Doctors only) */}
      {activeTab === 'create' && user?.role === 'doctor' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Write New Prescription</h2>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Medications</h3>
                <button
                  type="button"
                  onClick={addMedication}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Medication {index + 1}
                      </h4>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medication Name
                        </label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          list="medications"
                          placeholder="e.g., Aspirin"
                        />
                        <datalist id="medications">
                          {commonMedications.map(med => (
                            <option key={med} value={med} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 500mg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select frequency</option>
                          {frequencies.map(freq => (
                            <option key={freq} value={freq}>{freq}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 7 days"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Special instructions, warnings, or additional information..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating Prescription...' : 'Create Prescription'}
            </button>
          </form>
        </div>
      )}

      {/* View Prescriptions Tab */}
      {activeTab === 'view' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {user?.role === 'patient' ? 'My Prescriptions' : 'Patient Prescriptions'}
          </h2>

          {userPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No prescriptions found</p>
              {user?.role === 'doctor' && (
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Prescription
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {userPrescriptions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(prescription => (
                  <div
                    key={prescription.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user?.role === 'patient' 
                            ? `Dr. ${prescription.doctorName}` 
                            : prescription.patientName}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(prescription.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Active
                        </div>
                      </div>
                    </div>

                    {/* Medications List */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Medications:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prescription.medications.map((medication, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-md p-4 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{medication.name}</h5>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMedicationStatusColor(medication)}`}>
                                Active
                              </div>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Dosage:</strong> {medication.dosage}</p>
                              <p><strong>Frequency:</strong> {medication.frequency}</p>
                              <p><strong>Duration:</strong> {medication.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-md">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-blue-900 mb-1">Additional Notes:</h5>
                            <p className="text-sm text-blue-800">{prescription.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Prescription Footer */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Prescription ID: {prescription.id.slice(-8)}</span>
                        <div className="flex items-center space-x-4">
                          <span>
                            {user?.role === 'patient' ? `Dr. ${prescription.doctorName}` : prescription.patientName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}