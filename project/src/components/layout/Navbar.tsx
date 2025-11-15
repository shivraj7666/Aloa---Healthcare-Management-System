import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Stethoscope, Bell, User, LogOut, Menu, X, Calendar, FileText, Pill } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { alerts } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadAlerts = alerts.filter(alert => !alert.read && alert.userId === user?.id).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ALOA</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/appointments"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </Link>
            <Link
              to="/records"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <FileText className="w-4 h-4" />
              <span>Records</span>
            </Link>
            <Link
              to="/prescriptions"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <Pill className="w-4 h-4" />
              <span>Prescriptions</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors duration-200" />
                {unreadAlerts > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadAlerts}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/appointments"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Appointments
            </Link>
            <Link
              to="/records"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Records
            </Link>
            <Link
              to="/prescriptions"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Prescriptions
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}