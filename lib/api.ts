const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vehicl-checklist-api-142549112609.europe-west1.run.app/api';

export interface Vehicle {
  id?: string;
  title?: string;
  url?: string;
  listing_id?: string;
  number_plate?: string;
  price?: string;
  mileage?: string;
  specs?: string[];
  description?: string;
  location?: string;
  seller_name?: string;
  seller_phone?: string[];
  images?: string[];
  posted_date?: string;
  our_status?: string;
  is_active?: boolean;
  scraped_at?: string;
  created_at?: string;
  updated_at?: string;
  // Manually entered fields
  interior_color?: string;
  car_color?: string;
  engine_condition?: string;
  gearbox_condition?: string;
  interior_condition?: string;
  multifunction_steering?: boolean;
  notes?: string;
  manual_phones?: string[];
  rating?: VehicleRating;
}

export interface VehicleRating {
  score: number;
  max_score: number;
  score_5: number;
  percentage: number;
  rules_count: number;
  matched_rules: Array<{
    id: string;
    field: string;
    value: string;
    score: number;
    max_score: number;
    label: string;
  }>;
}

export interface RatingRule {
  id: string;
  field: string;
  value: string;
  match_type: 'equals' | 'contains' | 'scale_5' | 'value_map';
  score: number;
  max_score: number;
  label?: string;
  value_scores?: Record<string, number>;
}

export interface RatingConfig {
  rules: RatingRule[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  vehicle?: T;
  vehicles?: T;
  count?: number;
  vehicle_id?: string;
}

interface ApiErrorPayload {
  error?: string;
  detail?: string;
}

export async function scrapeVehicle(url: string): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiErrorPayload;
    throw new Error(error.error || error.detail || 'Failed to scrape vehicle');
  }

  const data = (await response.json()) as { vehicle?: Vehicle; data?: Vehicle };
  return data.vehicle || data.data || {};
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${API_URL}/vehicles`);

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  const data = (await response.json()) as { vehicles?: Vehicle[] };
  return data.vehicles || [];
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch vehicle');
  }

  const data = (await response.json()) as { vehicle?: Vehicle };
  return data.vehicle;
}

export async function updateVehicleStatus(
  id: string,
  status: string
): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ our_status: status }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiErrorPayload;
    throw new Error(error.error || 'Failed to update status');
  }

  const data = (await response.json()) as { vehicle?: Vehicle };
  return data.vehicle;
}

export async function updateVehicleActiveStatus(
  id: string,
  isActive: boolean
): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles/${id}/active-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiErrorPayload;
    throw new Error(error.error || 'Failed to update active status');
  }

  const data = (await response.json()) as { vehicle?: Vehicle };
  return data.vehicle;
}

export async function updateVehicle(
  id: string,
  fields: Partial<Vehicle>
): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiErrorPayload;
    throw new Error(error.error || 'Failed to update vehicle');
  }

  const data = (await response.json()) as { vehicle?: Vehicle };
  return data.vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiErrorPayload;
    throw new Error(error.error || 'Failed to delete vehicle');
  }
}

export async function getStatuses(): Promise<string[]> {
  const response = await fetch(`${API_URL}/statuses`);

  if (!response.ok) {
    throw new Error('Failed to fetch statuses');
  }

  const data = (await response.json()) as { statuses?: string[] };
  return data.statuses || [];
}

export async function getVehiclesByStatus(status: string): Promise<Vehicle[]> {
  const response = await fetch(`${API_URL}/vehicles/by-status/${status}`);

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  const data = (await response.json()) as { vehicles?: Vehicle[] };
  return data.vehicles || [];
}

export async function getRatingConfig(): Promise<RatingConfig> {
  const response = await fetch(`${API_URL}/rating-config`);

  if (!response.ok) {
    throw new Error('Failed to fetch rating config');
  }

  const data = (await response.json()) as { config?: RatingConfig };
  return data.config || { rules: [] };
}

export async function updateRatingConfig(config: RatingConfig): Promise<RatingConfig> {
  const response = await fetch(`${API_URL}/rating-config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiErrorPayload;
    throw new Error(error.error || error.detail || 'Failed to update rating config');
  }

  const data = (await response.json()) as { config?: RatingConfig };
  return data.config || { rules: [] };
}

export function formatPrice(price?: string): string {
  if (!price) return 'Price N/A';
  const num = Number(price.replace(/,/g, ''));
  if (isNaN(num) || num < 10000) return price; // don't format if it looks wrong
  return `Rs ${num.toLocaleString('en-LK')}`;
}
