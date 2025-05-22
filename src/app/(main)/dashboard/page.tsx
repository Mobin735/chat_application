import { UserInfo } from "@/components/dashboard/UserInfo";
import { ChatHistoryList } from "@/components/dashboard/ChatHistoryList";
import type { UserProfile, ChatSession } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

// Mock data - in a real app, this would come from an API or auth context
const mockUser: UserProfile = {
  email: "user@example.com",
  chatCount: 3,
};

const mockChatSessions: ChatSession[] = [
  {
    id: "1",
    title: "Inquiry about Q4 Tax Deductions",
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    messageCount: 12,
    previewText: "Can you explain the new rules for home office deductions...",
  },
  {
    id: "2",
    title: "Uploaded Payslip for Analysis - June",
    lastMessageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    messageCount: 8,
    previewText: "Here is my payslip for June, can you break down the taxes...",
  },
  {
    id: "3",
    title: "Restaurant Bill Split Calculation",
    lastMessageTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    messageCount: 5,
    previewText: "I have a restaurant bill, can you help me split it three ways...",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome to FinChat Assistant</h1>
        <p className="text-muted-foreground">Manage your financial documents and conversations with ease.</p>
      </div>
      <Separator />
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UserInfo user={mockUser} />
        </div>
        <div className="lg:col-span-2">
          <ChatHistoryList chatSessions={mockChatSessions} />
        </div>
      </div>
    </div>
  );
}
