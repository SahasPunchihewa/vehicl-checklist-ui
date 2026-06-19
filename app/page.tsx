'use client';

import { useState, useEffect } from 'react';
import Scraper from '@/components/Scraper';
import VehicleList from '@/components/VehicleList';
import StatusFilter from '@/components/StatusFilter';
import RatingCriteriaManager from '@/components/RatingCriteriaManager';
import { getVehicles, getStatuses, getVehiclesByStatus, Vehicle } from '@/lib/api';

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
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
      <header className="bg-card-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-5xl font-bold text-foreground">Vehicle Picker</h1>
          <p className="text-text-secondary mt-3 text-lg">Scrape and manage vehicle listings</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Scraper onSuccess={handleScraperSuccess} />

        <RatingCriteriaManager onUpdated={handleRatingConfigUpdated} />

        {error && (
          <div className="mb-8 p-4 bg-red-950 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Filter Vehicles</h2>
          <StatusFilter
            statuses={statuses}
            selected={selectedStatus}
            onSelect={handleStatusFilter}
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Vehicles {selectedStatus !== 'all' && `(${selectedStatus})`}
          </h2>
          <VehicleList
            vehicles={vehicles}
            loading={loading}
            empty={`No vehicles found${selectedStatus !== 'all' ? ' with this status' : ''}`}
          />
        </div>
      </main>
    </div>
  );
}
