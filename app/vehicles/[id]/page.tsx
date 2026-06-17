'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getVehicle, updateVehicleStatus, updateVehicle, deleteVehicle, Vehicle, getStatuses, formatPrice } from '@/lib/api';

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
  const [copiedPhone, setCopiedPhone] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [editingField, setEditingField] = useState<null | 'interior_color' | 'notes'>(null);
  const [editValue, setEditValue] = useState('');
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [addingPhone, setAddingPhone] = useState(false);

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

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(''), 1500);
    } catch {
      setError('Failed to copy number');
    }
  };

  const handleStartEdit = (field: 'interior_color' | 'notes') => {
    setEditValue(vehicle?.[field] ?? '');
    setEditingField(field);
  };

  const handleSaveField = async (field: 'interior_color' | 'notes') => {
    if (!vehicle?.id) return;
    try {
      const updated = await updateVehicle(vehicle.id, { [field]: editValue });
      setVehicle(updated);
      setEditingField(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save field');
    }
  };

  const handleToggleSteering = async () => {
    if (!vehicle?.id) return;
    try {
      const updated = await updateVehicle(vehicle.id, {
        multifunction_steering: !vehicle.multifunction_steering,
      });
      setVehicle(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update steering');
    }
  };

  const handleAddPhone = async () => {
    const trimmed = newPhoneInput.trim();
    if (!trimmed || !vehicle?.id) return;
    setAddingPhone(true);
    try {
      const existing = vehicle.manual_phones || [];
      const scraped = vehicle.seller_phone || [];
      if (existing.includes(trimmed)) { setAddingPhone(false); return; }
      const nextManual = [...existing, trimmed];
      const nextSellerPhone = Array.from(new Set([...scraped, ...nextManual]));
      const updated = await updateVehicle(vehicle.id, {
        manual_phones: nextManual,
        seller_phone: nextSellerPhone,
      });
      setVehicle(updated);
      setNewPhoneInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add phone');
    } finally {
      setAddingPhone(false);
    }
  };

  const handleRemovePhone = async (phone: string) => {
    if (!vehicle?.id) return;
    try {
      const nextManual = (vehicle.manual_phones || []).filter((p) => p !== phone);
      const scrapedOnly = (vehicle.seller_phone || []).filter(
        (p) => !((vehicle.manual_phones || []).includes(p))
      );
      const updated = await updateVehicle(vehicle.id, {
        manual_phones: nextManual,
        seller_phone: Array.from(new Set([...scrapedOnly, ...nextManual])),
      });
      setVehicle(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove phone');
    }
  };

  const statusColor = {
    called: 'bg-blue-100 text-blue-800',
    checked: 'bg-purple-100 text-purple-800',
    inspected: 'bg-cyan-100 text-cyan-800',
    negotiated: 'bg-yellow-100 text-yellow-800',
    purchased: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusBg = statusColor[vehicle?.our_status as keyof typeof statusColor] || 'bg-gray-100 text-gray-800';
  const looksLikeScriptNoise = (value?: string) => {
    if (!value) return false;
    const lower = value.toLowerCase();
    return lower.includes('function(){') || lower.includes('var imgs=') || lower.includes('document.getelementbyid');
  };
  const safeDescription = looksLikeScriptNoise(vehicle?.description) ? '' : vehicle?.description;
  const filteredImages = (vehicle?.images || []).filter((image) => {
    const lower = image.toLowerCase();
    if (!/^https?:\/\//.test(lower)) return false;
    if (!/\.(jpg|jpeg|png|webp)(\?|$)/.test(lower)) return false;
    const blocked = [
      '/images/',
      'menu-icons',
      'logo',
      'icon',
      'sprite',
      'facebook.png',
      'twitter.png',
      'whatsapp',
      'tiktok',
      'cf-100',
    ];
    return !blocked.some((marker) => lower.includes(marker));
  });

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  const goNext = () => {
    if (!filteredImages.length) return;
    setViewerIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const goPrev = () => {
    if (!filteredImages.length) return;
    setViewerIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  useEffect(() => {
    if (!isViewerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isViewerOpen, filteredImages.length]);

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
          {filteredImages.length > 0 && (
            <div className="w-full h-96 bg-gray-200 relative">
              <Image
                src={filteredImages[0]}
                alt={vehicle.title || 'Vehicle'}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-cover cursor-zoom-in"
                onClick={() => openViewer(0)}
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
                    {formatPrice(vehicle.price)}
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

                {/* Phone Numbers - manual + any scraped */}
                {(() => {
                  const manualPhones = vehicle.manual_phones || [];
                  // Show scraped only if they look like real numbers (no date/time noise)
                  const scrapedPhones = (vehicle.seller_phone || []).filter((p) => {
                    const d = p.replace(/\D/g, '');
                    if (/(?:19|20)\d{6,}/.test(d) || /\d{1,2}:\d{2}/.test(p)) return false;
                    if (p.trim().startsWith('+')) return p.trim().startsWith('+94') && d.length === 11;
                    if (d.startsWith('94')) return d.length === 11;
                    if (d.startsWith('0')) return d.length === 10;
                    return false;
                  });
                  const allPhones = Array.from(new Set([...manualPhones, ...scrapedPhones]));
                  return (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Seller Phone</h3>
                      <div className="space-y-2">
                        {allPhones.map((phone, idx) => {
                          const isManual = manualPhones.includes(phone);
                          return (
                            <div key={idx} className="flex items-center gap-2 flex-wrap">
                              <a href={`tel:${phone.replace(/[\s-]/g, '')}`} className="text-blue-600 hover:underline font-medium">
                                {phone}
                              </a>
                              <a href={`tel:${phone.replace(/[\s-]/g, '')}`} className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700">
                                Call
                              </a>
                              <button type="button" onClick={() => handleCopyPhone(phone)} className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-800 hover:bg-gray-300">
                                {copiedPhone === phone ? 'Copied' : 'Copy'}
                              </button>
                              {isManual && (
                                <button type="button" onClick={() => handleRemovePhone(phone)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200">
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Add phone input */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="tel"
                            value={newPhoneInput}
                            onChange={(e) => setNewPhoneInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPhone()}
                            placeholder="Add phone number…"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddPhone}
                            disabled={addingPhone || !newPhoneInput.trim()}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
            {safeDescription && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{safeDescription}</p>
              </div>
            )}

            {/* Images Gallery */}
            {filteredImages.length > 1 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredImages.map((image, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => openViewer(idx)}
                      className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Vehicle image ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 220px"
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3C/svg%3E';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Fields */}
            <div className="mb-8 border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Notes & Inspection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Interior Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Interior Color</label>
                  {editingField === 'interior_color' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Beige, Black"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveField('interior_color');
                          if (e.key === 'Escape') setEditingField(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveField('interior_color')}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingField(null)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 text-sm">
                        {vehicle.interior_color || <span className="text-gray-400 italic">Not set</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit('interior_color')}
                        className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        {vehicle.interior_color ? 'Edit' : '+ Add'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Multifunction Steering */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Multifunction Steering Wheel</label>
                  <button
                    type="button"
                    onClick={handleToggleSteering}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                      vehicle.multifunction_steering ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        vehicle.multifunction_steering ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-2 text-sm text-gray-700">
                    {vehicle.multifunction_steering ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Personal Notes</label>
                  {editingField === 'notes' ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Any observations, conditions, follow-up notes..."
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveField('notes')}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingField(null)}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-gray-900 text-sm flex-1 whitespace-pre-wrap">
                        {vehicle.notes || <span className="text-gray-400 italic">No notes yet</span>}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleStartEdit('notes')}
                        className="shrink-0 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        {vehicle.notes ? 'Edit' : '+ Add'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

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

      {isViewerOpen && filteredImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={closeViewer}>
          <button
            type="button"
            onClick={closeViewer}
            className="absolute top-4 right-4 text-white text-3xl leading-none"
          >
            x
          </button>

          {filteredImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 text-white text-4xl leading-none px-2"
            >
              &lt;
            </button>
          )}

          <div className="relative w-full max-w-6xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={filteredImages[viewerIndex]}
              alt={`Vehicle image ${viewerIndex + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {filteredImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 text-white text-4xl leading-none px-2"
            >
              &gt;
            </button>
          )}

          <div className="absolute bottom-4 text-white text-sm">
            {viewerIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </div>
  );
}

