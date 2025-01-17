export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  department: string;
  role: 'admin' | 'user';
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  votes: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: User;
  comments: Comment[];
  attachments: Attachment[];
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  idea_id: string;
  user: User;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  idea_id: string;
  created_at: string;
}

export interface Vote {
  id: string;
  idea_id: string;
  user_id: string;
  type: 'up' | 'down';
  created_at: string;
}
