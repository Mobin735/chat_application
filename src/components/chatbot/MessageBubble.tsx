import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, FileText } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";          // remove if you don't need raw HTML
import rehypeSanitize from "rehype-sanitize"; // keeps the raw HTML safe

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";

  /** one fixed TZ so server + client render identical strings */
  const time = formatInTimeZone(
    new Date(message.timestamp),
    "Australia/Adelaide",     // or "UTC" / your preferred zone
    "h:mm a"
  );

  return (
    <div
      className={cn(
        "flex items-end gap-2 mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
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
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
        {/* --------------- Markdown renderer --------------- */}
        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        {/* -------------------------------------------------- */}

        {message.document && (
          <div className="mt-2 pt-2 border-t border-primary-foreground/20 dark:border-card-foreground/20">
            <div className="flex items-center gap-2 text-xs opacity-80">
              <FileText size={14} />
              <span>
                {message.document.name}{" "}
                (
                {message.document.size && message.document.size > 0
                  ? `${(message.document.size / 1024).toFixed(2)} KB`
                  : message.document.type}
                )
              </span>
            </div>
          </div>
        )}

        <p
          suppressHydrationWarning
          className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-right" : "text-left"
          )}
        >
          {time}
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
