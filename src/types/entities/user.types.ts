export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_image_url?: string;
  user_type: 'owner' | 'employee';
  role_id?: string;
  status: 'active' | 'inactive' | 'locked';
  kiosk_enabled: boolean;
  warehouse_id?: string;
  max_discount_percent?: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  role_name?: string;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  phone?: string;
  password?: string;
  user_type: 'employee';
  role_id: string;
  status: 'active' | 'inactive';
  kiosk_enabled: boolean;
  pin?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone?: string;
  role_id?: string;
  status?: 'active' | 'inactive';
  kiosk_enabled?: boolean;
  warehouse_id?: string;
  max_discount_percent?: number;
}
