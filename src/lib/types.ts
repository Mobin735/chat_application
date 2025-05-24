export interface UserProfile {
  email: string;
  chatCount: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  document?: {
    name: string;
    type: string; // e.g., 'application/pdf', 'image/png'
    size?: number; // Optional: size in bytes
  };
}

export interface ChatSession {
  id: string;
  chat_id: string;
  title: string; // Could be the first user message or a generated summary
  lastMessageTime: Date;
  messageCount: number;
  // Optional: could include a snippet of the first or last message
  previewText?: string; 
}

