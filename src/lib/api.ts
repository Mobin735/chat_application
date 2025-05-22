
import type { ChatMessage } from './types';

const API_BASE_URL = 'https://fastapi-render-a7a4.onrender.com';

// Helper function to remove <think>...</think> blocks
const cleanApiResponse = (text: string): string => {
  if (typeof text !== 'string') {
    console.warn('cleanApiResponse received non-string input:', text);
    return 'Received non-text response.';
  }
  return text.replace(/<think>[\s\S]*?<\/think>\n\n/gm, '').trim();
};

interface ApiResponse {
  answer: string;
  context?: string[];
  history?: { type: string; content: string }[];
}

export async function uploadPdfAndInitialQuery(file: File, firstQuestion: string, sessionId: string): Promise<ChatMessage> {
  console.log(`API: Calling uploadPdfAndInitialQuery with sessionId: ${sessionId}`);
  console.log(`File: ${file.name}, Question: "${firstQuestion}"`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);
  formData.append('user_input', firstQuestion);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/upload_pdf/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Could not read error body");
      console.error('API Error (uploadPdfAndInitialQuery):', response.status, response.statusText, errorBody);
      const detail = errorBody.length < 100 && errorBody.length > 0 ? ` (Detail: ${errorBody})` : "";
      return {
        id: crypto.randomUUID(),
        text: `Sorry, the document processor returned an error: ${response.status} ${response.statusText}${detail}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
      };
    }

    const data: ApiResponse = await response.json();
    if (typeof data.answer !== 'string') {
      console.error('API Error (uploadPdfAndInitialQuery): Response `answer` field is not a string or is missing.', data);
      return {
        id: crypto.randomUUID(),
        text: "Sorry, I received an unexpected response format after processing your document. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    return {
      id: crypto.randomUUID(),
      text: cleanApiResponse(data.answer),
      sender: 'bot',
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error('Network or parsing error in uploadPdfAndInitialQuery:', error);
    let userFriendlyMessage = "Sorry, I encountered an error trying to process your document and question. Please try again.";
    if (error instanceof SyntaxError) { // Error parsing JSON
      userFriendlyMessage = "Sorry, I received an unreadable response from the document processor. Please try again.";
    } else if (error.message && error.message.toLowerCase().includes('failed to fetch')) { // Generic network error
        userFriendlyMessage = "Sorry, I couldn't connect to the document processor. Please check your internet connection and try again.";
    }
    return {
      id: crypto.randomUUID(),
      text: userFriendlyMessage,
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/invoke_query/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Could not read error body");
      console.error('API Error (continueConversation):', response.status, response.statusText, errorBody);
      const detail = errorBody.length < 100 && errorBody.length > 0 ? ` (Detail: ${errorBody})` : "";
      return {
        id: crypto.randomUUID(),
        text: `The chatbot reported an error: ${response.status} ${response.statusText}${detail}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
      };
    }

    const data: ApiResponse = await response.json();
    if (typeof data.answer !== 'string') {
      console.error('API Error (continueConversation): Response `answer` field is not a string or is missing.', data);
      return {
        id: crypto.randomUUID(),
        text: "Sorry, I received an unexpected response format from the chatbot. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
    }

    return {
      id: crypto.randomUUID(),
      text: cleanApiResponse(data.answer),
      sender: 'bot',
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error('Network or parsing error in continueConversation:', error);
    let userFriendlyMessage = "Sorry, I couldn't connect to the chatbot to continue our conversation. Please try again.";
    if (error instanceof SyntaxError) {
      userFriendlyMessage = "Sorry, I received an unreadable response from the chatbot. Please try again.";
    } else if (error.message && error.message.toLowerCase().includes('failed to fetch')) {
        userFriendlyMessage = "Sorry, I couldn't connect to the chatbot. Please check your internet connection and try again.";
    }
    return {
      id: crypto.randomUUID(),
      text: userFriendlyMessage,
      sender: 'bot',
      timestamp: new Date(),
    };
  }
}
