export interface Photo {
    id: string;
    profile_id: string;
    url: string;
    thumbnail_url: string | null;
    caption: string | null;
    sort_order: number;
    is_visible: boolean;
    width: number | null;
    height: number | null;
    size_bytes: number | null;
    created_at: string;
    updated_at?: string;
    // Analytics
    view_count?: number;
    click_count?: number;
  }
  
  export interface PhotoUpdate {
    id: string;
    sort_order: number;
    is_visible: boolean;
  }