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
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">Scrape Vehicle</h2>
        <p className="text-sm text-gray-600 mb-6">Paste a vehicle ad URL to extract all details</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Ad URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/vehicle/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handlePaste}
                disabled={loading}
                title="Paste from clipboard"
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:bg-gray-100 font-medium transition"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported: riyasewana.com, olx.com, pakwheels.com, and more
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
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


