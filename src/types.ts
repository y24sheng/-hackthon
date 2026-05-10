export type Role = 'mother' | 'child';

export interface UserProfile {
  uid: string;
  email: string | null;
  role: Role;
  familyId: string;
  settings: Record<string, any>;
  createdAt: string;
}

export type RecordType = 'mood' | 'hold' | 'challenge';

export interface Record {
  id: string;
  authorId: string;
  familyId: string;
  type: RecordType;
  content: string;
  originalContent?: string;
  anxietyScore?: number;
  anxietyWords?: string[];
  translatedContent?: string;
  isSent: boolean;
  scheduledAt?: string;
  createdAt: string;
}

export type FeedbackType = 'read' | 'hug' | 'thinking';

export interface Feedback {
  id: string;
  recordId: string;
  authorId: string;
  type: FeedbackType;
  translatedMessage?: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  familyId: string;
  content: string;
  status: 'pending' | 'completed';
  completedBy?: string;
  createdAt: string;
}
