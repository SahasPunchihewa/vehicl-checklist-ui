'use client';

import { useState } from 'react';
import { scrapeVehicle, Vehicle } from '@/lib/api';

interface ScraperProps {
  onSuccess?: (vehicle: Vehicle) => void;
  onError?: (error: string) => void;
}

const SUPPORTED_SITES = [
  'riyasewana.com',
  'daraz.pk',
  'facebook.com',
  'olx.com',
  'pakwheels.com',
];

export default function Scraper({ onSuccess, onError }: ScraperProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateUrl = (urlString: string): { valid: boolean; message?: string } => {
    try {
      const urlObj = new URL(urlString);

      // Check if URL is HTTP or HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, message: 'URL must use http:// or https://' };
      }

      // Optional: Check if it's from a known site (can be disabled)
      // const hostname = urlObj.hostname.replace('www.', '');
      // if (!SUPPORTED_SITES.some(site => hostname.includes(site))) {
      //   return { valid: false, message: `Website may not be supported. Supported sites: ${SUPPORTED_SITES.join(', ')}` };
      // }

      return { valid: true };
    } catch {
      return { valid: false, message: 'Invalid URL format' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      const errorMsg = 'Please enter a URL';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const validation = validateUrl(trimmedUrl);
    if (!validation.valid) {
      setError(validation.message || 'Invalid URL');
      onError?.(validation.message || 'Invalid URL');
      return;
    }

    setLoading(true);
    try {
      const vehicle = await scrapeVehicle(trimmedUrl);
      const title = vehicle.title || vehicle.listing_id || 'Vehicle';
      setSuccess(`✓ Scraped successfully: ${title}`);
      setUrl('');
      onSuccess?.(vehicle);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to scrape vehicle';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setUrl(clipboardText);
    } catch {
      setError('Unable to read clipboard');
    }
  };

  return (
    <div className="w-full mb-8 sm:mb-12">
      <div className="bg-card-bg rounded-xl border border-border shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Scrape Vehicle</h2>
        <p className="text-sm sm:text-base text-text-secondary mb-6">Paste a vehicle ad URL to extract all details</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-foreground mb-3">
              Vehicle Ad URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/vehicle/..."
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-lg text-sm sm:text-base text-foreground placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition"
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handlePaste}
                disabled={loading}
                title="Paste from clipboard"
                className="px-3 py-2.5 sm:py-3 bg-border hover:bg-border/80 text-foreground rounded-lg disabled:bg-border/50 disabled:opacity-50 font-medium transition active:scale-95"
                aria-label="Paste URL from clipboard"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Supported: riyasewana.com, olx.com, pakwheels.com, daraz.pk, facebook.com
            </p>
          </div>

          {error && (
            <div className="p-3 sm:p-4 bg-error/10 border border-error/30 text-red-300 rounded-lg text-xs sm:text-sm animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 sm:p-4 bg-success/10 border border-success/30 text-green-300 rounded-lg text-xs sm:text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 sm:py-3 rounded-lg disabled:bg-border disabled:cursor-not-allowed disabled:opacity-50 font-medium transition duration-200 active:scale-95 text-sm sm:text-base min-h-[44px] sm:min-h-auto"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Scraping...
              </>
            ) : (
              'Scrape Vehicle'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


