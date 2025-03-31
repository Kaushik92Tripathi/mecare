"use client";

import { Phone, Ambulance, Hospital, Bandage, AlertCircle } from 'lucide-react';

export default function EmergencyContact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Contacts & Help</h1>
            <p className="text-gray-600">Quick access to emergency services and urgent care information</p>
          </div>

          {/* Emergency Numbers Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Emergency Numbers
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <Ambulance className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="font-medium">Ambulance</p>
                  <p className="text-xl font-bold text-red-600">102</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <Phone className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="font-medium">Emergency Helpline</p>
                  <p className="text-xl font-bold text-red-600">112</p>
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Care Centers */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Hospital className="w-6 h-6 mr-2" />
              Nearby Urgent Care Centers
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-lg">City General Hospital</h3>
                <p className="text-gray-600">123 Healthcare Avenue, City Center</p>
                <p className="text-gray-600">Open 24/7</p>
                <p className="text-primary font-medium">+91 1234567890</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-lg">MedCare Emergency Center</h3>
                <p className="text-gray-600">456 Medical Plaza, Downtown</p>
                <p className="text-gray-600">Open 24/7</p>
                <p className="text-primary font-medium">+91 9876543210</p>
              </div>
              <div>
                <h3 className="font-medium text-lg">LifeLine Urgent Care</h3>
                <p className="text-gray-600">789 Health Street, Suburb Area</p>
                <p className="text-gray-600">8:00 AM - 11:00 PM</p>
                <p className="text-primary font-medium">+91 8765432109</p>
              </div>
            </div>
          </div>

          {/* First Aid Tips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bandage className="w-6 h-6 mr-2" />
              Basic First Aid Tips
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Heart Attack</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Call emergency services immediately</li>
                  <li>Have the person sit down and rest</li>
                  <li>Loosen any tight clothing</li>
                  <li>If prescribed, help them take their medication</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Severe Bleeding</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Apply direct pressure to the wound</li>
                  <li>Use a clean cloth or sterile bandage</li>
                  <li>Keep the injured area elevated</li>
                  <li>Seek immediate medical attention</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 text-center text-gray-600">
            <p>In case of any medical emergency, please dial 102 for immediate assistance.</p>
            <p className="mt-2 text-sm">This information is for reference only and should not be used as a substitute for professional medical advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 