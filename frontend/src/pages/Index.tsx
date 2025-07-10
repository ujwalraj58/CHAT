
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, History, Bell, Upload, TrendingUp, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome to your AI Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your conversations, files, and stay organized with intelligent assistance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 max-w-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 due today</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <CardTitle>Start New Chat</CardTitle>
            </div>
            <CardDescription>
              Begin a new conversation with your AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/chat">
              <Button className="w-full">Start Chatting</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="h-6 w-6 text-primary" />
              <CardTitle>Upload Files</CardTitle>
            </div>
            <CardDescription>
              Upload documents, images, or other files for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/files">
              <Button variant="outline" className="w-full">Upload Files</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle>Set Reminder</CardTitle>
            </div>
            <CardDescription>
              Create reminders for important tasks and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/reminders">
              <Button variant="outline" className="w-full">Manage Reminders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
            <MessageCircle className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Chat session completed</p>
              <p className="text-xs text-muted-foreground">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
            <Upload className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">File uploaded: document.pdf</p>
              <p className="text-xs text-muted-foreground">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
            <Bell className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Reminder set for tomorrow</p>
              <p className="text-xs text-muted-foreground">3 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
