import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, FileText } from "lucide-react";
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={cn("flex items-end gap-2 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shadow">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={18} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-xl p-3 shadow-md",
          isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        {message.document && (
          <div className="mt-2 pt-2 border-t border-primary-foreground/20 dark:border-card-foreground/20">
            <div className="flex items-center gap-2 text-xs opacity-80">
              <FileText size={14} />
              <span>{message.document.name} ({(message.document.size && message.document.size > 0 ? (message.document.size / 1024).toFixed(2) + ' KB' : message.document.type)})</span>
            </div>
          </div>
        )}
        <p className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-right" : "text-left"
          )}>
          {format(new Date(message.timestamp), "h:mm a")}
        </p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shadow">
           <AvatarFallback className="bg-accent text-accent-foreground">
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
