import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="col-span-full bg-white flex flex-col items-center justify-center p-12 md:p-16 rounded-xl border border-gray-100 shadow-sm text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
        <span className="text-2xl text-gray-400">📄</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">{description}</p>
      
      {actionHref && actionLabel && (
        <Link 
          href={actionHref}
          className="mt-6 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-all duration-200 inline-flex items-center"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
