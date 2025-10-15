import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center gap-2 p-8">
      <span className="text-gray-600 font-medium">Loading</span>
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
};