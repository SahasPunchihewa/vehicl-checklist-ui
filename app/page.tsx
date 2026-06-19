'use client';

import { useState, useEffect } from 'react';
import Scraper from '@/components/Scraper';
import VehicleList from '@/components/VehicleList';
import StatusFilter from '@/components/StatusFilter';
import SortBar from '@/components/SortBar';
import RatingCriteriaManager from '@/components/RatingCriteriaManager';
import { getVehicles, getStatuses, getVehiclesByStatus, Vehicle } from '@/lib/api';

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating-asc' | 'rating-desc'>('date');
  const [error, setError] = useState('');

  const loadVehiclesForStatus = async (status: string) => {
    if (status === 'all') {
      return getVehicles();
    }
    return getVehiclesByStatus(status);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vehiclesData, statusesData] = await Promise.all([
          getVehicles(),
          getStatuses(),
        ]);
        setVehicles(vehiclesData);
        setStatuses(statusesData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStatusFilter = async (status: string) => {
    setSelectedStatus(status);
    setLoading(true);
    try {
      const filtered = await loadVehiclesForStatus(status);
      setVehicles(filtered);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleScraperSuccess = async () => {
    try {
      const updated = await loadVehiclesForStatus(selectedStatus);
      setVehicles(updated);
    } catch (err) {
      console.error('Failed to refresh vehicles:', err);
    }
  };

  const handleRatingConfigUpdated = async () => {
    try {
      setLoading(true);
      const updated = await loadVehiclesForStatus(selectedStatus);
      setVehicles(updated);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh ratings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card-bg border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">Vehicle Picker</h1>
          <p className="text-text-secondary mt-2 text-base sm:text-lg">Scrape and manage vehicle listings</p>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <Scraper onSuccess={handleScraperSuccess} />

        <RatingCriteriaManager onUpdated={handleRatingConfigUpdated} />

        {error && (
          <div className="mb-6 sm:mb-8 p-4 bg-error/10 border border-error/30 text-red-300 rounded-lg text-sm sm:text-base animate-pulse">
            {error}
          </div>
        )}

        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Filter Vehicles</h2>
          <StatusFilter
            statuses={statuses}
            selected={selectedStatus}
            onSelect={handleStatusFilter}
          />
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Vehicles {selectedStatus !== 'all' && `(${selectedStatus})`}
            </h2>
            {vehicles.length > 0 && !loading && (
              <span className="text-sm text-text-secondary bg-border/30 px-3 py-1 rounded-full w-fit">
                {vehicles.length} results
              </span>
            )}
          </div>
          
          {vehicles.length > 0 && !loading && (
            <SortBar sortBy={sortBy} onSortChange={setSortBy} />
          )}
          
          <VehicleList
            vehicles={vehicles}
            loading={loading}
            empty={`No vehicles found${selectedStatus !== 'all' ? ' with this status' : ''}`}
            sortBy={sortBy}
          />
        </div>
      </main>
    </div>
  );
}
