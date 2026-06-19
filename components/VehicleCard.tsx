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
      <div className="bg-card-bg rounded-xl border border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer h-full active:scale-95 hover:scale-102 sm:hover:scale-105 duration-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <div className="relative w-full h-40 sm:h-48 bg-background">
            <Image
              src={vehicle.images[0]}
              alt={vehicle.title || 'Vehicle'}
              fill
              className="object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1f2e" width="400" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23a1a7b8" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        ) : (
          <div className="w-full h-40 sm:h-48 bg-background flex items-center justify-center text-text-secondary text-sm">
            No image
          </div>
        )}

        <div className="p-4 sm:p-5 flex flex-col h-full">
          <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 line-clamp-2 text-foreground leading-snug">{vehicle.title || 'Untitled'}</h3>

          {vehicle.rating && vehicle.rating.rules_count > 0 && (
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold w-fit">
              <span>★ Rating</span>
              <span>{vehicle.rating.score_5.toFixed(1)}/5</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <span className="text-xl sm:text-2xl font-bold text-accent-blue flex-1 truncate">
              {formatPrice(vehicle.price)}
            </span>
            {vehicle.our_status && (
              <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border flex-shrink-0 ${statusBg}`}>
                {vehicle.our_status}
              </span>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 border-t border-border pt-3 sm:pt-4 text-xs sm:text-sm">
            {vehicle.location && (
              <p className="text-text-secondary truncate">📍 {vehicle.location}</p>
            )}

            {vehicle.seller_name && (
              <p className="text-text-secondary truncate">👤 {vehicle.seller_name}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border pt-3 mt-auto">
            <span className={vehicle.is_active ? 'text-success font-medium' : 'text-error font-medium'}>
              {vehicle.is_active ? '✓ Active' : '✗ Inactive'}
            </span>
            {vehicle.scraped_at && (
              <span>{new Date(vehicle.scraped_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

