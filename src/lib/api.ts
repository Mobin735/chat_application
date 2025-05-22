import type { ChatMessage } from './types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function uploadPdfAndInitialQuery(file: File, firstQuestion: string, sessionId: string): Promise<ChatMessage> {
  await delay(1500 + Math.random() * 1000); // Simulate network latency for upload

  console.log(`API: uploadPdfAndInitialQuery called with sessionId: ${sessionId}`);
  console.log(`File: ${file.name}, Question: "${firstQuestion}"`);

  let botText = `I've received your document "${file.name}" and your question: "${firstQuestion}". I'm processing it now.`;
  
  if (firstQuestion.toLowerCase().includes("summarize")) {
    botText = `Okay, I'm summarizing ${file.name} based on your request: "${firstQuestion}". This might take a moment... Done! The main points are X, Y, and Z.`;
  } else {
    botText = `I've received ${file.name}. Regarding your question "${firstQuestion}", let me look into that... Based on the document, the answer is [simulated answer].`;
  }

  return {
    id: crypto.randomUUID(),
    text: botText,
    sender: 'bot',
    timestamp: new Date(),
    // Document info is implicitly tied to the session now, not necessarily returned with every message.
  };
}

export async function continueConversation(question: string, sessionId: string): Promise<ChatMessage> {
  await delay(1000 + Math.random() * 500); // Simulate network latency

  console.log(`API: continueConversation called with sessionId: ${sessionId}`);
  console.log(`Question: "${question}"`);

  let botText = `Regarding your question: "${question}"...`;

  if (question.toLowerCase().includes("details about section 3")) {
    botText = "Section 3 of the previously uploaded document discusses [simulated details from document based on session].";
  } else if (question.toLowerCase().includes("thank you")) {
    botText = "You're welcome! Is there anything else I can help you with from the document?";
  } else {
    botText = `Okay, responding to "${question}" based on our ongoing conversation and the document provided earlier. The answer is [simulated contextual answer].`;
  }
  
  return {
    id: crypto.randomUUID(),
    text: botText,
    sender: 'bot',
    timestamp: new Date(),
  };
}
