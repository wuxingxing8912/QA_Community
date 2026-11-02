export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  points: number;
  create_at: string;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  tags: string[];
  author_id: number;
  views: number;
  answers_count: number;
  votes: number;
  is_solved: number;
  create_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string | null;
}

export interface Answer {
  id: number;
  content: string;
  question_id: number;
  author_id: number;
  votes: number;
  is_accepted: number;
  create_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string | null;
}
