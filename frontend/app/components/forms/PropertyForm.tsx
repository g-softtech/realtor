'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';

export interface PropertyData {
  title: string;
  location: string;
  district?: string;
  price: string;
  description: string;
  type: string;
  status: string;
  images?: string[]; // Existing images (Cloudinary URLs)
}

interface PropertyFormProps {
  initialData?: PropertyData;
  onSubmit: (formData: FormData) => Promise<void>;
  onDeleteExistingImage?: (imageUrl: string) => Promise<void>;
  onCancelHref: string;
  loading: boolean;
  submitLabel: string;
  error?: string;
}

export default function PropertyForm({
  initialData,
  onSubmit,
  onDeleteExistingImage,
  onCancelHref,
  loading,
  submitLabel,
  error
}: PropertyFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [district, setDistrict] = useState(initialData?.district || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState(initialData?.type || 'sale'); 
  const [status, setStatus] = useState(initialData?.status || 'Available'); 
  
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [localError, setLocalError] = useState('');
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  // Hydrate form if initialData changes (useful for async loading)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setLocation(initialData.location);
      if (initialData.district) setDistrict(initialData.district);
      setPrice(initialData.price);
      setDescription(initialData.description);
      setType(initialData.type);
      setStatus(initialData.status);
      setExistingImages(initialData.images || []);
    }
  }, [initialData]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prevImages) => [...prevImages, ...filesArray]);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls((prevPreviews) => [...prevPreviews, ...previews]);
    }
  };

  const removeNewImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviewUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleExistingImageDelete = async (url: string) => {
    if (!onDeleteExistingImage) return;
    
    if (!confirm("Are you sure you want to permanently delete this image from the cloud?")) {
      return;
    }

    setDeletingImage(url);
    try {
      await onDeleteExistingImage(url);
      setExistingImages(prev => prev.filter(img => img !== url));
    } catch (err: any) {
      setLocalError(err.message || 'Failed to delete image');
    } finally {
      setDeletingImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!title || !location || !price || !description) {
      setLocalError('Please populate all structural listing fields.');
      return;
    }

    const numericPrice = Number(price.toString().replace(/,/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setLocalError('Price must be a valid positive number.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    if (district) formData.append('district', district);
    formData.append('price', String(numericPrice));
    formData.append('description', description);
    formData.append('type', type);
    formData.append('status', status);

    selectedImages.forEach((imageFile) => {
      formData.append('images', imageFile);
    });

    await onSubmit(formData);
  };

  const displayError = error || localError;

  return (
    <div className="space-y-6">
      {displayError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
          ⚠️ {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Property Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., 4 Bedroom Duplex with BQ"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Specific Location</label>
            <input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 15 Maitama Crescent"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Broad District</label>
            <input 
              type="text" 
              value={district} 
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g., Maitama"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Price (Base Currency)</label>
            <input 
              type="text" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 150000000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Listing Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="land">Land Property</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Market Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            >
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Detailed Public Summary</label>
          <textarea 
            rows={4}
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe internal finishing, infrastructure networks, parking capacity attributes..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 resize-none"
          />
        </div>

        <div>
          {/* Read-Only Existing Media (For Edit Mode) */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Existing Media Files (Cloud Assets)</label>
              <div className="grid grid-cols-4 gap-4 mt-2">
                {existingImages.map((url, index) => {
                  const isDeleting = deletingImage === url;
                  return (
                    <div key={url} className={`relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 ${isDeleting ? 'opacity-50' : ''}`}>
                      <img 
                        src={url} 
                        alt={`Existing ${index + 1}`} 
                        className="w-full h-full object-cover opacity-90 transition-opacity"
                      />
                      {isDeleting ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="text-white text-xs font-bold animate-pulse">Deleting...</span>
                        </div>
                      ) : (
                        onDeleteExistingImage && (
                          <button
                            type="button"
                            onClick={() => handleExistingImageDelete(url)}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white font-black text-[9px] w-5 h-5 flex items-center justify-center rounded-full transition shadow opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            {initialData ? 'Append New Media Quality Files' : 'Property Media Quality Files'}
          </label>
          <div className="relative border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-gray-50 transition-colors">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-2xl block mb-1">📷</span>
            <p className="text-sm font-bold text-gray-700">Click or drag {initialData ? 'new' : ''} files here to upload</p>
            <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, JPEG, and WebP (Max 5MB per file)</p>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                  <img 
                    src={url} 
                    alt={`Preview allocation ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white font-black text-[9px] w-5 h-5 flex items-center justify-center rounded-full transition shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link 
            href={onCancelHref}
            className="px-5 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            {loading ? 'Processing...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
