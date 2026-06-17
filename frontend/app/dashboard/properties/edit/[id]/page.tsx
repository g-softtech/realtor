'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PropertyForm, { PropertyData } from '../../../../components/forms/PropertyForm';
import { api } from '../../../../../lib/api';

export default function EditProperty({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.id;

  const [initialData, setInitialData] = useState<PropertyData | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await api.get(`/api/properties/${propertyId}`);
        setInitialData({
          title: data.title || '',
          location: data.location || '',
          price: data.price ? String(data.price) : '',
          description: data.description || '',
          type: data.type || 'sale',
          status: data.status || 'Available',
          images: data.images || []
        });
      } catch (err: any) {
        setError(err.message || 'Error loading existing data.');
      } finally {
        setInitialLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');

    try {
      await api.put(`/api/properties/${propertyId}`, formData);
      router.push('/dashboard/properties');
    } catch (err: any) {
      setError(err.message || 'Network sync disruption occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await api.delete(`/api/properties/${propertyId}/images?url=${encodeURIComponent(imageUrl)}`);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to permanently delete cloud asset.');
    }
  };

  if (initialLoading) return <div className="p-12 text-center font-medium text-gray-500">Loading property details...</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Link href="/dashboard/properties" className="hover:text-blue-600 transition">Catalog</Link>
            <span>/</span>
            <span className="text-gray-600">Edit Listing</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Listing</h1>
          <p className="text-sm text-gray-500 mt-1">Update existing details and manage cloud media assets.</p>
        </div>

        <PropertyForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          onDeleteExistingImage={handleDeleteImage}
          onCancelHref="/dashboard/properties"
          loading={loading}
          submitLabel="Save Changes"
          error={error}
        />
      </div>
    </main>
  );
}
