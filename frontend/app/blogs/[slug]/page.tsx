import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import PublicNavbar from '../../components/PublicNavbar';

interface BlogArticle {
  _id: string;
  title: string;
  slug: string;
  category: string;
  meta_description: string;
  content: string;
  cover_image?: string;
  createdAt?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SERVER-SIDE DATA FETCHING PIPELINE
async function getBlogData(slug: string): Promise<BlogArticle | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  
  try {
    const res = await fetch(`${apiUrl}/api/blogs/${slug}`, {
      cache: 'no-store', // Always fetch fresh editorial data
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching blog post content string:', error);
    return null;
  }
}

export default async function PublicBlogReaderPage({ params }: PageProps) {
  // Safely unwrap parameters tracking Next.js asynchronous standard rules
  const resolvedParams = await params;
  const blog = await getBlogData(resolvedParams.slug);

  // Fallback state if article parameters don't resolve against the database records
  if (!blog) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <span className="text-3xl mb-2">🕵️‍♂️</span>
        <h1 className="text-md font-black text-gray-900 tracking-tight uppercase">Article Matrix Missing</h1>
        <p className="text-xs text-gray-400 font-medium mt-1 mb-6 max-w-sm">
          The publication data profile requested may have been unlinked or cached incorrectly by the system.
        </p>
        <Link href="/blogs" className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition hover:bg-gray-800">
          Return To Insights
        </Link>
      </main>
    );
  }

  const fallbackBanner = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';
  const formatTime = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Market Insight';

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-20">
      <PublicNavbar />
      
      {/* 🧭 Editorial Minimal Navigation Header Context */}
      <nav className="max-w-4xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Link href="/blogs" className="text-xs font-black text-blue-600 hover:underline tracking-wide uppercase">
          ← Back To Intelligence
        </Link>
        <span className="text-[10px] font-black text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded uppercase tracking-widest">
          {blog.category}
        </span>
      </nav>

      {/* 🏙️ Article Metadata Showcase Title Cluster */}
      <header className="max-w-3xl mx-auto px-6 text-center mt-12 mb-10 space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>By Specialist Broker Desk</span>
          <span>•</span>
          <time>{formatTime}</time>
        </div>
      </header>

      {/* 🖼️ Premium Editorial Cinematic Image Container Frame */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div className="aspect-21/9 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm relative">
          <img 
            src={blog.cover_image || fallbackBanner} 
            alt={blog.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 📝 UPGRADED TYPOGRAPHY RUNNER CONTAINER INTERACTION BLOCK */}
      <article className="max-w-3xl mx-auto px-6">
        <div className="text-gray-800 text-sm leading-relaxed font-medium">
          
          {/* 🚀 FIXED: Custom class selectors wrap the server-rendered parser node to maintain absolute type safety */}
          <div className="prose prose-blue max-w-none 
            [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-3
            [&>h3]:text-xl [&>h3]:font-black [&>h3]:text-gray-900 [&>h3]:mt-6 [&>h3]:mb-2
            [&>p]:mb-4 [&>p]:leading-relaxed
            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ul]:mb-4
            [&>blockquote]:border-l-4 [&>blockquote]:border-blue-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-500 [&>blockquote]:bg-gray-50 [&>blockquote]:py-2 [&>blockquote]:my-4 [&>blockquote]:rounded-r-lg"
          >
            <ReactMarkdown>
              {blog.content}
            </ReactMarkdown>
          </div>

        </div>
      </article>

      {/* 📥 Editorial Footer Mini Callout Section Box */}
      <section className="max-w-2xl mx-auto px-6 mt-16 pt-8 border-t border-gray-100 text-center space-y-3">
        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Need Portfolio Representation?</h4>
        <p className="text-xs text-gray-400 font-semibold max-w-md mx-auto leading-normal">
          Inquiries concerning primary capital investments, land allocation files, or premium rentals can be routed straight through our homepage hub.
        </p>
        <Link href="/" className="inline-block mt-2 text-xs font-black text-blue-600 border border-blue-100 bg-blue-50/50 px-4 py-2 rounded-xl hover:bg-blue-50 transition uppercase tracking-wider">
          Consult With An Agent
        </Link>
      </section>

    </main>
  );
}