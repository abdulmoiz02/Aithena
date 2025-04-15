export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  subject: string;
  timestamp: number;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
}