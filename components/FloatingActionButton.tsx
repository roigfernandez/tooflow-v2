
'use client';
import Link from 'next/link';

export default function FloatingActionButton() {
  return (
    <Link 
      href="/tasks/new"
      className="fixed bottom-20 right-4 md:bottom-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 z-50"
    >
      <i className="ri-add-line text-2xl"></i>
    </Link>
  );
}
