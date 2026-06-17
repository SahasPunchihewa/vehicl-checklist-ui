const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Vehicle {
  id?: string;
  title?: string;
  url?: string;
  listing_id?: string;
  price?: string;
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

export async function scrapeVehicle(url: string): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scrape vehicle');
  }

  const data: any = await response.json();
  return data.vehicle || data.data || {};
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${API_URL}/vehicles`);

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  const data: any = await response.json();
  return data.vehicles || [];
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch vehicle');
  }

  const data: any = await response.json();
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to update status');
  }

  const data: any = await response.json();
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to update active status');
  }

  const data: any = await response.json();
  return data.vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete vehicle');
  }
}

export async function getStatuses(): Promise<string[]> {
  const response = await fetch(`${API_URL}/statuses`);

  if (!response.ok) {
    throw new Error('Failed to fetch statuses');
  }

  const data: any = await response.json();
  return data.statuses || [];
}

export async function getVehiclesByStatus(status: string): Promise<Vehicle[]> {
  const response = await fetch(`${API_URL}/vehicles/by-status/${status}`);

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  const data: any = await response.json();
  return data.vehicles || [];
}

