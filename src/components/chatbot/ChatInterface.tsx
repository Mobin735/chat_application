"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { DocumentUpload } from "./DocumentUpload";
import type { ChatMessage } from "@/lib/types";
import { uploadPdfAndInitialQuery, continueConversation } from "@/lib/api"; // Updated API imports
import { Send, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { log } from "console";

const initialMessages: ChatMessage[] = [
  {
    id: crypto.randomUUID(),
    text: "Hello! I'm FinChat Assistant. Please upload a financial document and ask your first question to begin.",
    sender: "bot",
    timestamp: new Date(),
  }
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Generate a session ID when the component mounts
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setChatId(newSessionId);
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if(scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveChatHistory = async (updatedMessages: ChatMessage[]) => {
    if (!chatId) return;

    try {
      const response = await fetch('/api/chat/save-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          messages: updatedMessages,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to save chat history:', await response.text());
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!sessionId || !chatId) {
        toast({ title: "Error", description: "Session not initialized. Please refresh.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    const userMessageText = inputValue.trim();
    // Input validation
    if (!isPdfUploaded) {
      if (!selectedFile) {
            toast({
              title: "PDF Required",
              description: "Please upload a PDF document with your first message.",
              variant: "default",
            });
            setIsLoading(false);
            return;
        }
        if (!userMessageText) {
            toast({
              title: "Question Required",
              description: "Please ask a question along with your PDF document.",
              variant: "default",
            });
            setIsLoading(false);
            return;
        }
    } else { // PDF is already uploaded
        if (!userMessageText) {
            toast({
              title: "Message Required",
              description: "Please type a message to continue the conversation.",
              variant: "default",
            });
            setIsLoading(false);
            return;
        }
        if (selectedFile) { // User trying to upload another file
             toast({
                title: "PDF Already Processed",
                description: "A PDF is already associated with this session. New documents will be ignored.",
                variant: "default"
            });
            setSelectedFile(null); // Clear it as it won't be used.
        }
    }
    
    const fileToUpload = selectedFile; // Capture for the first call

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
      ...(!isPdfUploaded && fileToUpload && { document: { name: fileToUpload.name, type: fileToUpload.type, size: fileToUpload.size } }),
    };
    
    // Update messages and save history
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveChatHistory(updatedMessages);
    
    setInputValue("");
    
    if (!isPdfUploaded && fileToUpload) {
        setSelectedFile(null);
    }

    try {
      let botMessage: ChatMessage;
      if (!isPdfUploaded && fileToUpload) {
        // Increment chat count only when starting a new chat (first PDF upload)
        try {
          const incrementResponse = await fetch('/api/user/increment-chat-count', {
            method: 'POST',
            credentials: 'include',
          });
          if (!incrementResponse.ok) {
            console.error('Failed to increment chat count:', await incrementResponse.text());
          }
        } catch (error) {
          console.error('Error incrementing chat count:', error);
        }

        botMessage = await uploadPdfAndInitialQuery(fileToUpload, userMessageText, sessionId);
        setIsPdfUploaded(true);
      } else {
        botMessage = await continueConversation(userMessageText, sessionId);
      }
      
      // Update messages with bot response and save history
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);

    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: "Could not connect to the chatbot. Please try again later.",
        variant: "destructive",
      });
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: "Sorry, I couldn't process your request right now. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      const errorMessages = [...updatedMessages, errorMessage];
      setMessages(errorMessages);
      await saveChatHistory(errorMessages);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Card className="h-[calc(100vh-8.1rem)] md:h-[calc(100vh-8.1rem)] w-full flex flex-col shadow-2xl rounded-xl overflow-hidden border-primary/20">
      <CardHeader className="p-4 border-b bg-muted/30">
        <h2 className="text-xl font-semibold text-primary">Chat with FinBot</h2>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length -1]?.sender === 'user' && (
            <div className="flex items-end gap-2 mb-4 justify-start">
               <div className="h-8 w-8"></div> {/* Placeholder for avatar alignment */}
               <div className="max-w-[70%] rounded-xl p-3 shadow-md bg-card text-card-foreground rounded-bl-none border flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
                <span className="text-sm">FinBot is typing...</span>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/30">
        <form onSubmit={handleSubmit} className="flex items-center w-full gap-2">
          <DocumentUpload 
            onFileSelect={setSelectedFile} 
            isLoading={isLoading} 
            disabled={isPdfUploaded || isLoading} // Disable after PDF is uploaded or while loading
          />
          <Input
            ref={inputRef}
            type="text"
            placeholder={isPdfUploaded ? "Ask a follow-up question..." : "Type your first question..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow rounded-full focus-visible:ring-primary focus-visible:ring-offset-0 px-4 py-2 h-11"
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-11 w-11 shrink-0" 
            disabled={isLoading || (!inputValue.trim() && (!selectedFile && !isPdfUploaded))} 
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardFooter>
      <Alert className="w-[96%] mx-auto my-4 border-accent/50 bg-accent/10">
          <Info className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent">Disclaimer</AlertTitle>
          <AlertDescription className="text-accent/80">
            FinChat Assistant is for informational purposes only and does not provide financial advice. A PDF document must be uploaded for the initial interaction.
          </AlertDescription>
      </Alert>
    </Card>
  );
}
