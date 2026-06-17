import Link from 'next/link';
import InspectionSection from '../../components/InspectionSection';

async function getSingleProperty(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${apiUrl}/api/properties/${id}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Backend returned status: ${res.status} for ID: ${id}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching single property:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  // Resolve the async route parameter safely
  const resolvedParams = await params;
  const property = await getSingleProperty(resolvedParams.id);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">Attempted to parse ID: {resolvedParams.id || 'none'}</p>
        <Link href="/" className="text-blue-600 hover:underline">← Back to Homepage</Link>
      </div>
    );
  }

  // Pre-formatted WhatsApp link for conversions
  const whatsappMessage = encodeURIComponent(`Hello, I am interested in the property: "${property.title}" listed for ₦${property.price?.toLocaleString()} in ${property.location}. Is it still available?`);
  const whatsappUrl = `https://wa.me/2348000000000?text=${whatsappMessage}`; // Replace with your company number

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <Link href="/" className="inline-block text-gray-600 hover:text-black mb-8 font-medium">
        ← Back to Featured Properties
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Image Gallery */}
        <div>
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-sm mb-4">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
            )}
          </div>
          
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {property.images?.map((imgUrl: string, idx: number) => (
              <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Details & Interactivity */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">{property.type}</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wider">{property.status}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{property.title}</h1>
            <p className="text-lg text-gray-500 mb-6 font-medium">{property.location}</p>
            
            <div className="text-3xl font-black text-blue-600 mb-6">
              ₦{property.price?.toLocaleString()}
            </div>

            <hr className="my-6 border-gray-100" />

            <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {/* 🚀 Mounts the interactive client component containing your InspectionModal */}
          <InspectionSection 
            propertyId={property._id} 
            propertyTitle={property.title} 
            whatsappUrl={whatsappUrl} 
          />
        </div>
      </div>
    </main>
  );
}