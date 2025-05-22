import type { ChatMessage } from './types';

const API_BASE_URL = 'https://fastapi-render-a7a4.onrender.com';

// Helper function to remove <think>...</think> blocks
const cleanApiResponse = (text: string): string => {
  return text.replace(/<think>[\s\S]*?<\/think>\n\n/gm, '').trim();
};

interface ApiResponse {
  answer: string;
  context?: string[]; // Optional, as we primarily use 'answer' for the chat message
  history?: { type: string; content: string }[]; // Optional
}

export async function uploadPdfAndInitialQuery(file: File, firstQuestion: string, sessionId: string): Promise<ChatMessage> {
  console.log(`API: Calling uploadPdfAndInitialQuery with sessionId: ${sessionId}`);
  console.log(`File: ${file.name}, Question: "${firstQuestion}"`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);
  formData.append('user_input', firstQuestion);

  try {
    const response = await fetch(`${API_BASE_URL}/upload_pdf/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error (uploadPdfAndInitialQuery):', response.status, errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }

    const data: ApiResponse = await response.json();
    
    return {
      id: crypto.randomUUID(),
      text: cleanApiResponse(data.answer),
      sender: 'bot',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Network or parsing error in uploadPdfAndInitialQuery:', error);
    // Return a user-friendly error message to be displayed in the chat
    return {
      id: crypto.randomUUID(),
      text: "Sorry, I encountered an error trying to process your document and question. Please try again.",
      sender: 'bot',
      timestamp: new Date(),
    };
  }
}

export async function continueConversation(question: string, sessionId: string): Promise<ChatMessage> {
  console.log(`API: Calling continueConversation with sessionId: ${sessionId}`);
  console.log(`Question: "${question}"`);

  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('user_input', question);

  try {
    const response = await fetch(`${API_BASE_URL}/invoke_query/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error (continueConversation):', response.status, errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }

    const data: ApiResponse = await response.json();

    return {
      id: crypto.randomUUID(),
      text: cleanApiResponse(data.answer),
      sender: 'bot',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Network or parsing error in continueConversation:', error);
    // Return a user-friendly error message
    return {
      id: crypto.randomUUID(),
      text: "Sorry, I couldn't connect to the chatbot to continue our conversation. Please try again.",
      sender: 'bot',
      timestamp: new Date(),
    };
  }
}
