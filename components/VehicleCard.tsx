'use client';

import { Vehicle } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
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
    <Link href={`/vehicles/${vehicle.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer h-full">
        {vehicle.images && vehicle.images.length > 0 ? (
          <div className="relative w-full h-48 bg-gray-200">
            <Image
              src={vehicle.images[0]}
              alt={vehicle.title || 'Vehicle'}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{vehicle.title || 'Untitled'}</h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-blue-600">
              {vehicle.price ? `Rs ${vehicle.price}` : 'Price N/A'}
            </span>
            {vehicle.our_status && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBg}`}>
                {vehicle.our_status}
              </span>
            )}
          </div>

          {vehicle.location && (
            <p className="text-sm text-gray-600 mb-2">📍 {vehicle.location}</p>
          )}

          {vehicle.seller_name && (
            <p className="text-sm text-gray-700 mb-2">👤 {vehicle.seller_name}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{vehicle.is_active ? '✓ Active' : '✗ Inactive'}</span>
            {vehicle.scraped_at && (
              <span>{new Date(vehicle.scraped_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

