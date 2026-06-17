'use client';

import { useState, useEffect } from 'react';
import InspectionModal from '../../components/InspectionModal'; 

interface InspectionSectionProps {
  propertyId: string;
  propertyTitle: string;
  whatsappUrl: string;
}

export default function InspectionSection({ propertyId, propertyTitle, whatsappUrl }: InspectionSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Force component hydration sync
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center p-4 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors"
        >
          💬 Chat on WhatsApp
        </a>
        <button 
          onClick={(e) => {
            e.preventDefault();
            console.log("Button clicked! Opening modal for property:", propertyId);
            setIsModalOpen(true);
          }}
          type="button"
          className="flex items-center justify-center p-4 bg-black text-white rounded-xl font-bold shadow-md hover:bg-zinc-800 transition-colors"
        >
          📅 Book Physical Inspection
        </button>
      </div>

      <InspectionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          console.log("Closing modal...");
          setIsModalOpen(false);
        }} 
        propertyId={propertyId} 
        propertyTitle={propertyTitle} 
      />
    </>
  );
}