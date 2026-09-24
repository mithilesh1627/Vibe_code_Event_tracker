import React from 'react';

export const EventSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse flex flex-col">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-slate-200" />

      {/* Card Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 w-20 bg-slate-200 rounded-md" />
            <div className="h-5 w-24 bg-slate-200 rounded-md" />
          </div>

          {/* Title */}
          <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-slate-200 rounded mb-4" />

          {/* Venue & Location */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-2/3 bg-slate-200 rounded" />
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="h-5 w-28 bg-slate-200 rounded" />
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
