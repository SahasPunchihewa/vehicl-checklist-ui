'use client';

import { useState, useEffect } from 'react';
import Scraper from '@/components/Scraper';
import VehicleList from '@/components/VehicleList';
import StatusFilter from '@/components/StatusFilter';
import { getVehicles, getStatuses, getVehiclesByStatus, Vehicle } from '@/lib/api';

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [error, setError] = useState('');

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
      let filtered: Vehicle[];
      if (status === 'all') {
        filtered = await getVehicles();
      } else {
        filtered = await getVehiclesByStatus(status);
      }
      setVehicles(filtered);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleScraperSuccess = async (vehicle: Vehicle) => {
    try {
      const updated = await getVehicles();
      setVehicles(updated);
      if (selectedStatus !== 'all') {
        setSelectedStatus('all');
      }
    } catch (err) {
      console.error('Failed to refresh vehicles:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">Vehicle Picker</h1>
          <p className="text-gray-600 mt-2">Scrape and manage vehicle listings</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Scraper onSuccess={handleScraperSuccess} />

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Filter Vehicles</h2>
          <StatusFilter
            statuses={statuses}
            selected={selectedStatus}
            onSelect={handleStatusFilter}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">
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
