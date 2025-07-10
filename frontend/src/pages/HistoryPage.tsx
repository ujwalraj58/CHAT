
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Calendar, Clock, Trash2 } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messageCount: number;
  duration: string;
}

const HistoryPage = () => {
  const chatSessions: ChatSession[] = [
    {
      id: "1",
      title: "Project Planning Discussion",
      preview: "We talked about the new project timeline and requirements...",
      date: new Date(2024, 6, 6, 14, 30),
      messageCount: 24,
      duration: "15 min",
    },
    {
      id: "2",
      title: "Code Review Help",
      preview: "I helped debug the React component issue you were facing...",
      date: new Date(2024, 6, 5, 10, 15),
      messageCount: 18,
      duration: "22 min",
    },
    {
      id: "3",
      title: "Data Analysis",
      preview: "We analyzed the customer feedback data and found interesting patterns...",
      date: new Date(2024, 6, 4, 16, 45),
      messageCount: 31,
      duration: "28 min",
    },
    {
      id: "4",
      title: "Writing Assistant",
      preview: "I helped you write and improve the marketing copy for the new campaign...",
      date: new Date(2024, 6, 3, 11, 20),
      messageCount: 12,
      duration: "8 min",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Chat History</h2>
        <p className="text-muted-foreground">
          Browse through your previous conversations and continue where you left off
        </p>
      </div>

      <div className="grid gap-4">
        {chatSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <MessageCircle className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">
                      {session.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {session.preview}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{session.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{session.duration}</span>
                  </div>
                  <Badge variant="secondary">
                    {session.messageCount} messages
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Continue Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chatSessions.length === 0 && (
        <Card className="p-12 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No chat history yet</h3>
          <p className="text-muted-foreground mb-4">
            Start your first conversation to see it appear here
          </p>
          <Button>Start New Chat</Button>
        </Card>
      )}
    </div>
  );
};

export default HistoryPage;
