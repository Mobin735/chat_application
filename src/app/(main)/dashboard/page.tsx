"use client"

import { UserInfo } from "@/components/dashboard/UserInfo";
import { ChatHistoryList } from "@/components/dashboard/ChatHistoryList";
import type { UserProfile, ChatSession } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Fetch user profile data
        const profileResponse = await fetch('/api/user/profile', {
          credentials: 'include',
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData);
        }

        // Fetch chat history
        const historyResponse = await fetch('/api/chat/history', {
          credentials: 'include',
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setChatSessions(historyData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return <Loader />;
  }

  if (!userProfile) {
    return <div>Error loading user profile</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome to FinChat Assistant</h1>
        <p className="text-muted-foreground">Manage your financial documents and conversations with ease.</p>
      </div>
      <Separator />
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UserInfo user={userProfile} />
        </div>
        <div className="lg:col-span-2">
          <ChatHistoryList chatSessions={chatSessions} />
        </div>
      </div>
    </div>
  );
}
