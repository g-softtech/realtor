'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';

export interface PropertyData {
  title: string;
  location: string;
  district?: string;
  price: string;
  description: string;
  purpose: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  status: string;
  isFeatured?: boolean;
  images?: string[]; // Existing images (Cloudinary URLs)
}

interface PropertyFormProps {
  initialData?: PropertyData;
  onSubmit: (payload: any) => Promise<void>;
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
  const [purpose, setPurpose] = useState(initialData?.purpose || 'sale'); 
  const [propertyType, setPropertyType] = useState(initialData?.propertyType || 'duplex'); 
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms?.toString() || ''); 
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms?.toString() || ''); 
  const [size, setSize] = useState(initialData?.size?.toString() || ''); 
  const [status, setStatus] = useState(initialData?.status || 'Available'); 
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  
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
      setPurpose(initialData.purpose);
      setPropertyType(initialData.propertyType);
      if (initialData.bedrooms) setBedrooms(initialData.bedrooms.toString());
      if (initialData.bathrooms) setBathrooms(initialData.bathrooms.toString());
      if (initialData.size) setSize(initialData.size.toString());
      if (initialData.isFeatured) setIsFeatured(initialData.isFeatured);
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

  // 🚀 Compress images client-side to keep the overall payload safely under Vercel's 4.5MB limit
  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Output heavily compressed JPEG data URI
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve(reader.result as string); // Fallback
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (error) => reject(error);
    });
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

    // 🚀 Convert and compress all selected image files to bypass Vercel serverless stream limitations
    const base64Images = await Promise.all(selectedImages.map(compressImageToBase64));

    // Combine existing cloud URLs with new base64 strings
    const allImages = [...existingImages, ...base64Images];

    const payload = {
      title,
      location,
      district: district || undefined,
      price: numericPrice,
      description,
      purpose,
      propertyType,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      size: size ? Number(size) : undefined,
      status,
      isFeatured: Boolean(isFeatured),
      images: allImages
    };

    await onSubmit(payload);
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
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="short-let">Short-Let</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            >
              <option value="duplex">Duplex</option>
              <option value="detached-duplex">Detached Duplex</option>
              <option value="semi-detached-duplex">Semi-Detached Duplex</option>
              <option value="terrace">Terrace</option>
              <option value="bungalow">Bungalow</option>
              <option value="apartment">Apartment</option>
              <option value="penthouse">Penthouse</option>
              <option value="mansion">Mansion</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
              <option value="warehouse">Warehouse</option>
              <option value="land">Land</option>
              <option value="mixed-use">Mixed-Use</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Bedrooms</label>
            <input 
              type="number" 
              value={bedrooms} 
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="e.g., 4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Bathrooms</label>
            <input 
              type="number" 
              value={bathrooms} 
              onChange={(e) => setBathrooms(e.target.value)}
              placeholder="e.g., 5"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Size (sqm)</label>
            <input 
              type="number" 
              value={size} 
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g., 500"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="flex items-center space-x-3 mt-8">
            <input 
              type="checkbox" 
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700">
              Feature on Homepage (Admin Only)
            </label>
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
