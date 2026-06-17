'use client';

import { useState } from 'react';
import { api } from '../lib/api';

export default function ContactAgentForm({ propertyId }: { propertyId: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property and would like to schedule an inspection.',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const data = await api.post('/api/leads', { ...formData, property_id: propertyId });
      
      setStatus('success');
      setErrorMessage(null);
    } catch (error) {
      console.error('Lead Submission Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-12 p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-xl font-semibold text-green-900 mb-2">Thank you!</h3>
        <p className="text-green-700">Your inquiry has been sent. An agent will contact you shortly.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 p-8 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Interested in this property?</h3>
      <p className="text-gray-600 mb-6">Fill out the form below to contact an agent and book an inspection.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Your Full Name" 
            required 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input 
            type="email" 
            placeholder="Your Email Address" 
            required 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <input 
          type="tel" 
          placeholder="Your Phone Number" 
          required 
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <textarea 
          rows={4}
          placeholder="Your Message" 
          required 
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        ></textarea>
        
        {status === 'error' && <p className="text-red-600 text-sm font-medium">Something went wrong connecting to the server. Please try again.</p>}
        
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400"
        >
          {status === 'loading' ? 'Sending Inquiry...' : 'Contact Agent'}
        </button>
      </form>
    </div>
  );
}