import React from 'react';

export function RoomSkeleton() {
  return (
    <div className="animate-pulse min-h-screen bg-light py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="h-8 w-32 bg-gray-300 rounded mb-6" />
        {/* Image gallery skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="h-64 w-96 bg-gray-300 rounded" />
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-24 bg-gray-300 rounded" />
            ))}
          </div>
        </div>
        {/* Room info skeleton */}
        <div className="h-6 w-1/2 bg-gray-300 rounded mb-4" />
        <div className="h-4 w-1/3 bg-gray-300 rounded mb-2" />
        <div className="h-4 w-1/4 bg-gray-300 rounded mb-2" />
        {/* Amenities skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-300 rounded" />
          ))}
        </div>
        {/* Reviews skeleton */}
        <div className="h-6 w-32 bg-gray-300 rounded mb-4" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-gray-300 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
