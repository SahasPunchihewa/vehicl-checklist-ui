'use client';

import { Vehicle, formatPrice } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const statusColor = {
    called: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    checked: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
    inspected: 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50',
    negotiated: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
    purchased: 'bg-green-900/30 text-green-300 border-green-700/50',
    rejected: 'bg-red-900/30 text-red-300 border-red-700/50',
  };

  const statusBg = statusColor[vehicle.our_status as keyof typeof statusColor] || 'bg-border text-text-secondary border-border';

  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <div className="bg-card-bg rounded-xl border border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer h-full transform hover:scale-105 duration-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <div className="relative w-full h-48 bg-background">
            <Image
              src={vehicle.images[0]}
              alt={vehicle.title || 'Vehicle'}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1f2e" width="400" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23a1a7b8" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-background flex items-center justify-center text-text-secondary">
            No image
          </div>
        )}

        <div className="p-5">
          <h3 className="font-bold text-lg mb-3 line-clamp-2 text-foreground">{vehicle.title || 'Untitled'}</h3>

          {vehicle.rating && vehicle.rating.rules_count > 0 && (
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold">
              <span>Rating</span>
              <span>{vehicle.rating.score_5.toFixed(1)}/5</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-accent-blue">
              {formatPrice(vehicle.price)}
            </span>
            {vehicle.our_status && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBg}`}>
                {vehicle.our_status}
              </span>
            )}
          </div>

          <div className="space-y-2 mb-4 border-t border-border pt-4">
            {vehicle.location && (
              <p className="text-sm text-text-secondary">📍 {vehicle.location}</p>
            )}

            {vehicle.seller_name && (
              <p className="text-sm text-text-secondary">👤 {vehicle.seller_name}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border pt-3">
            <span className={vehicle.is_active ? 'text-success' : 'text-error'}>
              {vehicle.is_active ? '✓ Active' : '✗ Inactive'}
            </span>
            {vehicle.scraped_at && (
              <span>{new Date(vehicle.scraped_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

