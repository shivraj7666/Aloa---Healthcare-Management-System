import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { FileText, Upload, Download, Calendar, User, AlertCircle, CheckCircle, Eye } from 'lucide-react';

export default function HealthRecords() {
  const { user } = useAuth();
  const { healthRecords, addHealthRecord } = useData();
  
  const [activeTab, setActiveTab] = useState('view');
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const userRecords = user?.role === 'patient' 
    ? healthRecords.filter(record => record.patientId === user.id)
    : healthRecords;

  const recordTypes = [
    'Lab Results',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Prescription',
    'Medical Report',
    'Vaccination Record',
    'Allergy Information',
    'Surgery Report',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let fileData = '';
      let fileName = '';

      if (selectedFile) {
        // Convert file to base64 for storage
        const reader = new FileReader();
        fileData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
        fileName = selectedFile.name;
      }

      const newRecord = {
        patientId: user?.id || '',
        type: formData.type,
        description: formData.description,
        date: formData.date,
        fileName,
        fileData,
        doctorId: user?.role === 'doctor' ? user.id : undefined
      };

      addHealthRecord(newRecord);
      setSuccess('Health record uploaded successfully!');
      setFormData({
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError('Failed to upload record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (record: any) => {
    if (record.fileData) {
      const link = document.createElement('a');
      link.href = record.fileData;
      link.download = record.fileName || 'health-record';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lab results':
      case 'prescription':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'x-ray':
      case 'mri':
      case 'ct scan':
        return <Eye className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
        <p className="text-gray-600 mt-2">Manage and view your medical records securely</p>
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
              View Records
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload Record
            </button>
          </nav>
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Health Record</h2>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select record type</option>
                  {recordTypes.map(type => (
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide details about this health record..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG, DOC up to 5MB
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-600 font-medium">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Uploading...' : 'Upload Record'}
            </button>
          </form>
        </div>
      )}

      {/* View Records Tab */}
      {activeTab === 'view' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {user?.role === 'patient' ? 'My Health Records' : 'All Health Records'}
          </h2>

          {userRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No health records found</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Record
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(record => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getRecordIcon(record.type)}
                        <div>
                          <h3 className="font-medium text-gray-900">{record.type}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {record.description}
                    </p>

                    {record.fileName && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 truncate">
                            {record.fileName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(record)}
                          className="flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                      </div>
                    )}

                    {user?.role !== 'patient' && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        Patient ID: {record.patientId}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Record ID: {record.id.slice(-8)}</span>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
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