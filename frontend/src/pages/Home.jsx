import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to LocalWorks
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connecting local workers with enterprises
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 mt-8">
          <Link to="/login" className="w-full h-14 flex items-center justify-center px-4 py-2 border border-transparent text-lg font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 md:text-xl">
            I am a Worker
          </Link>
          <Link to="/login" className="w-full h-14 flex items-center justify-center px-4 py-2 border border-purple-600 text-lg font-medium rounded-xl text-purple-600 bg-white hover:bg-purple-50 md:text-xl">
            I am a Business Owner
          </Link>
        </div>
      </div>
    </div>
  );
}
