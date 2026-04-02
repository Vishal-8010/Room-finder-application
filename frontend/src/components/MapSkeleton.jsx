import React from 'react';

export default function MapSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-300 rounded animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-lg">Loading map...</div>
    </div>
  );
}
