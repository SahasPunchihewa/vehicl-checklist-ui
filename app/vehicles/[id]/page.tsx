'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getVehicle, updateVehicleStatus, deleteVehicle, Vehicle, getStatuses } from '@/lib/api';

export default function VehicleDetail() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vehicleData, statusesData] = await Promise.all([
          getVehicle(vehicleId),
          getStatuses(),
        ]);
        setVehicle(vehicleData);
        setSelectedStatus(vehicleData.our_status || '');
        setStatuses(statusesData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [vehicleId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!vehicle || newStatus === vehicle.our_status) return;

    setUpdating(true);
    try {
      const updated = await updateVehicleStatus(vehicleId, newStatus);
      setVehicle(updated);
      setSelectedStatus(updated.our_status || '');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    setUpdating(true);
    try {
      await deleteVehicle(vehicleId);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Vehicle not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to vehicles
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = {
    called: 'bg-blue-100 text-blue-800',
    checked: 'bg-purple-100 text-purple-800',
    inspected: 'bg-cyan-100 text-cyan-800',
    negotiated: 'bg-yellow-100 text-yellow-800',
    purchased: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusBg = statusColor[vehicle.our_status as keyof typeof statusColor] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to vehicles
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Details</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image Gallery */}
          {vehicle.images && vehicle.images.length > 0 && (
            <div className="w-full h-96 bg-gray-200 relative">
              <Image
                src={vehicle.images[0]}
                alt={vehicle.title || 'Vehicle'}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23e5e7eb" width="800" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="24"%3EImage not available%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.title || 'Untitled'}</h2>
                  <p className="text-2xl font-bold text-blue-600">
                    {vehicle.price ? `Rs ${vehicle.price}` : 'Price N/A'}
                  </p>
                </div>
                {vehicle.our_status && (
                  <span className={`text-sm font-semibold px-4 py-2 rounded-full ${statusBg}`}>
                    {vehicle.our_status}
                  </span>
                )}
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <div className="flex gap-2 flex-wrap">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || status === vehicle.our_status}
                    className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                      status === vehicle.our_status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                {vehicle.location && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Location</h3>
                    <p className="text-gray-900">{vehicle.location}</p>
                  </div>
                )}

                {vehicle.seller_name && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Seller Name</h3>
                    <p className="text-gray-900">{vehicle.seller_name}</p>
                  </div>
                )}

                {vehicle.seller_phone && vehicle.seller_phone.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Seller Phone</h3>
                    <div className="space-y-1">
                      {vehicle.seller_phone.map((phone, idx) => (
                        <p key={idx} className="text-gray-900">
                          <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                            {phone}
                          </a>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {vehicle.listing_id && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Listing ID</h3>
                    <p className="text-gray-900 font-mono">{vehicle.listing_id}</p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {vehicle.is_active !== undefined && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Status</h3>
                    <p className="text-gray-900">
                      {vehicle.is_active ? (
                        <span className="text-green-600 font-semibold">✓ Active</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗ Inactive</span>
                      )}
                    </p>
                  </div>
                )}

                {vehicle.posted_date && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Posted Date</h3>
                    <p className="text-gray-900">{vehicle.posted_date}</p>
                  </div>
                )}

                {vehicle.scraped_at && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Scraped Date</h3>
                    <p className="text-gray-900">{new Date(vehicle.scraped_at).toLocaleString()}</p>
                  </div>
                )}

                {vehicle.url && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Original URL</h3>
                    <a
                      href={vehicle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      View on site →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {vehicle.specs && vehicle.specs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Specifications</h3>
                <ul className="space-y-2">
                  {vehicle.specs.map((spec, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Images Gallery */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehicle.images.map((image, idx) => (
                    <div key={idx} className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Vehicle image ${idx + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delete Button */}
            <div className="border-t pt-8">
              <button
                onClick={handleDelete}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

