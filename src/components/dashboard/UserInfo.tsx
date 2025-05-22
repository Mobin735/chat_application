import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/lib/types";
import { Mail, MessagesSquare } from "lucide-react";

interface UserInfoProps {
  user: UserProfile;
}

export function UserInfo({ user }: UserInfoProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold text-primary">User Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
          <Mail className="h-6 w-6 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
          <MessagesSquare className="h-6 w-6 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">Total Chats</p>
            <p className="font-medium text-foreground">{user.chatCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
