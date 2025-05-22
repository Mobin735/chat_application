"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { DocumentUpload } from "./DocumentUpload";
import type { ChatMessage } from "@/lib/types";
import { getBotResponse } from "@/lib/api";
import { Send, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const initialMessages: ChatMessage[] = [
  {
    id: crypto.randomUUID(),
    text: "Hello! I'm FinChat Assistant. How can I help you with your financial documents today? Feel free to upload a document or ask a question.",
    sender: "bot",
    timestamp: new Date(),
  }
];


export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedFile) return;

    setIsLoading(true);
    const userMessageText = inputValue.trim();
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
      ...(selectedFile && { document: { name: selectedFile.name, type: selectedFile.type, size: selectedFile.size } }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    const fileToSend = selectedFile; // Capture selectedFile before clearing it
    setSelectedFile(null); // Clear the file from UI immediately

    // Reset file input in DocumentUpload component if it exposed a reset function or by key change
    // For now, this is handled by DocumentUpload itself when a new file is selected or removed.

    try {
      const botMessage = await getBotResponse(userMessageText, fileToSend || undefined);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting bot response:", error);
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
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Card className="h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] w-full flex flex-col shadow-2xl rounded-xl overflow-hidden border-primary/20">
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
          <DocumentUpload onFileSelect={setSelectedFile} isLoading={isLoading} />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message or upload a document..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow rounded-full focus-visible:ring-primary focus-visible:ring-offset-0 px-4 py-2 h-11"
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <Button type="submit" size="icon" className="rounded-full h-11 w-11 shrink-0" disabled={isLoading || (!inputValue.trim() && !selectedFile)} aria-label="Send message">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardFooter>
      <Alert className="m-4 border-accent/50 bg-accent/10">
          <Info className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent">Disclaimer</AlertTitle>
          <AlertDescription className="text-accent/80">
            FinChat Assistant is for informational purposes only and does not provide financial advice.
          </AlertDescription>
      </Alert>
    </Card>
  );
}
