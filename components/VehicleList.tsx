'use client';

import { useMemo } from 'react';
import { Vehicle } from '@/lib/api';
import VehicleCard from './VehicleCard';

interface VehicleListProps {
  vehicles: Vehicle[];
  loading?: boolean;
  empty?: string;
  sortBy?: 'date' | 'rating-asc' | 'rating-desc';
}

export default function VehicleList({ 
  vehicles, 
  loading = false, 
  empty = 'No vehicles found',
  sortBy = 'date' 
}: VehicleListProps) {
  const sortedVehicles = useMemo(() => {
    const sorted = [...vehicles];
    
    if (sortBy === 'date') {
      return sorted.sort((a, b) => {
        const dateA = new Date(a.scraped_at || 0).getTime();
        const dateB = new Date(b.scraped_at || 0).getTime();
        return dateB - dateA; // Most recent first
      });
    } else if (sortBy === 'rating-asc') {
      return sorted.sort((a, b) => {
        const ratingA = a.rating?.score_5 ?? 0;
        const ratingB = b.rating?.score_5 ?? 0;
        return ratingA - ratingB;
      });
    } else if (sortBy === 'rating-desc') {
      return sorted.sort((a, b) => {
        const ratingA = a.rating?.score_5 ?? 0;
        const ratingB = b.rating?.score_5 ?? 0;
        return ratingB - ratingA;
      });
    }
    
    return sorted;
  }, [vehicles, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card-bg border border-border animate-pulse rounded-xl h-80 sm:h-96" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <div className="text-4xl mb-3 opacity-30">🚗</div>
        <p className="text-text-secondary text-base sm:text-lg">{empty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {sortedVehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

