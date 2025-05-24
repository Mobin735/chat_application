import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession, ChatMessage } from "@/lib/types";
import { Archive, MessageSquareText, Clock, Download } from "lucide-react";
import { format } from 'date-fns';
import { generateChatPDF } from "@/lib/pdf-utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatHistoryListProps {
  chatSessions: ChatSession[];
}

export function ChatHistoryList({ chatSessions }: ChatHistoryListProps) {
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (sessionId: string) => {
    try {
      setDownloadingId(sessionId);
      
      // Fetch chat messages
      const response = await fetch(`/api/chat/download?chatId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      
      const { messages, title } = await response.json();
      
      // Generate PDF
      const pdfBlob = await generateChatPDF(messages as ChatMessage[], title);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your chat history has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error downloading chat:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your chat history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-primary">
          <Archive className="h-6 w-6" />
          Chat History
        </CardTitle>
        <CardDescription>Review your past conversations.</CardDescription>
      </CardHeader>
      <CardContent>
        {chatSessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No chat history found.</p>
        ) : (
          <ScrollArea className="h-[380px]">
            <ul className="space-y-4">
              {chatSessions.map((session) => (
                <li key={session.id} className="border p-4 rounded-lg shadow-sm hover:bg-secondary/30 transition-colors duration-150 cursor-pointer bg-card group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1 truncate">{session.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground space-x-4">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{format(new Date(session.lastMessageTime), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquareText size={14} />
                          <span>{session.messageCount} messages</span>
                        </div>
                      </div>
                      {session.previewText && (
                        <p className="text-sm text-muted-foreground mt-2 italic truncate">
                          "{session.previewText}"
                        </p>
                      )}
                    </div>
                    <button 
                      className={cn(
                        "p-2 rounded-full text-blue-500 self-center transition-colors duration-150",
                        downloadingId === session.id ? "opacity-50 cursor-wait" : "hover:bg-blue-50 dark:hover:bg-blue-950"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(session.chat_id);
                      }}
                      disabled={downloadingId === session.id}
                      title="Download chat history"
                    >
                      <Download className={cn("h-6 w-6", downloadingId === session.id && "animate-pulse")} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
