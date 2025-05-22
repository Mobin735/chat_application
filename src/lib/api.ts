import type { ChatMessage } from './types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBotResponse(userMessage: string, document?: File): Promise<ChatMessage> {
  await delay(1000 + Math.random() * 1000); // Simulate network latency

  let botText = `I received your message: "${userMessage}".`;
  if (document) {
    botText += ` And I see you've uploaded a document: ${document.name} (${(document.size / 1024).toFixed(2)} KB).`;
  }
  
  if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
    botText = "Hello there! How can I assist you with your financial documents today?";
  } else if (userMessage.toLowerCase().includes("balance")) {
    botText = "To check your balance, please specify which account or document you're referring to.";
  } else if (userMessage.toLowerCase().includes("tax")) {
    botText = "I can help with tax-related queries. What specifically about taxes are you interested in?";
  } else if (document && document.type === "application/pdf") {
    botText = `I've processed the PDF: ${document.name}. What information would you like to extract or discuss from it?`;
  }


  return {
    id: crypto.randomUUID(),
    text: botText,
    sender: 'bot',
    timestamp: new Date(),
    ...(document && { document: { name: document.name, type: document.type, size: document.size } }),
  };
}
