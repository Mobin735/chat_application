import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/lib/types";
import { Archive, MessageSquareText, Clock } from "lucide-react";
import { format } from 'date-fns';

interface ChatHistoryListProps {
  chatSessions: ChatSession[];
}

export function ChatHistoryList({ chatSessions }: ChatHistoryListProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 mt-8">
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
          <ScrollArea className="h-[400px] pr-4">
            <ul className="space-y-4">
              {chatSessions.map((session) => (
                <li key={session.id} className="border p-4 rounded-lg shadow-sm hover:bg-secondary/30 transition-colors duration-150 cursor-pointer bg-card">
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
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
