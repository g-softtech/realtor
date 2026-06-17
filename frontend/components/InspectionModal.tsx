'use client';

import { useState, FormEvent } from 'react';
import { api } from '../lib/api';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export default function InspectionModal({ isOpen, onClose, propertyId, propertyTitle }: InspectionModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(`I would like to schedule a physical inspection for "${propertyTitle}".`);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Safely intercept if the interactive state flag is false
  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.post('/api/leads', { name, email, phone, message, propertyId });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
    } catch (error: any) {
      console.error('Error submitting lead:', error);
      alert(error.message || 'Unable to reach the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fixed z-index to z-[9999] and removed standard animate-fade-in class to prevent invisible render opacity locks
    // <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-200">
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl transform transition-all scale-100">
        <button 
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
        >
          ✕
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
            <p className="text-gray-600 mb-6">An Abuja Realty agent will review your inspection request and call you within 24 hours.</p>
            <button 
              onClick={() => { setSuccess(false); onClose(); }}
              className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Book Physical Inspection</h3>
            <p className="text-sm text-gray-500 mb-6">{propertyTitle}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Full Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-600 text-sm"
                  placeholder="e.g., Chukwuma Bello"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Phone Number</label>
                <input 
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-600 text-sm"
                  placeholder="e.g., +234 80 1234 5678"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-600 text-sm"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Message / Notes</label>
                <textarea 
                  rows={3} required value={message} onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-600 text-sm resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
            >
              {loading ? 'Sending Request...' : 'Confirm Inspection Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}