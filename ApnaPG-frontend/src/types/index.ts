export type Role = 'tenant' | 'owner' | 'admin';

export interface User {
  _id: string;
  clerk_id: string;
  role: Role;
  full_name: string;
  email: string;
  phone_number?: string;
  profile_image_url?: string;
  created_at: string;
}

export interface PropertyImage {
  url: string;
  is_cover: boolean;
  _id?: string;
}

export interface Property {
  _id: string;
  owner_id: string | User;
  title: string;
  description: string;
  locality: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  monthly_rent: number;
  occupancy_type: 'single' | 'double' | 'triple';
  is_verified_owner: boolean;
  house_rules?: Record<string, any>;
  images: PropertyImage[];
  created_at: string;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'active_tenancy' | 'ended';

export interface Connection {
  _id: string;
  tenant_id: string | User;
  property_id: string | Property;
  status: ConnectionStatus;
  tenancy_start_date?: string;
  tenancy_end_date?: string;
  created_at: string;
  // Denormalized fields for simple UI mapping if needed
  property_title?: string;
  property_locality?: string;
  tenant_name?: string;
}

export interface Review {
  _id: string;
  connection_id: string | Connection;
  author_id: string | User;
  target_user_id: string | User;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  average_rating: number;
  total_reviews: number;
  reviews: Review[];
}
