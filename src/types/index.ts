export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  label_format: string;
  label_padding: number;
  label_separator: string;
  label_next_number: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  label_id?: string;
  name: string;
  description?: string;
  location_id?: string;
  category_id?: string;
  quantity?: number;
  model_number?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;
  warranty?: string;
  custom_fields?: Record<string, any>;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  item_id?: string;
  location_id?: string;
  workspace_id: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  item_id: string;
  workspace_id: string;
  created_at: string;
}

export interface AuthRequest {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    workspace_id: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  workspaceId: string;
} 