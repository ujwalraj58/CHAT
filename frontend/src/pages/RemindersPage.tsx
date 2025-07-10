
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Bell, Plus, Calendar, Clock, Trash2, Check } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

const RemindersPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Review quarterly report",
      description: "Go through Q2 performance metrics and prepare for team meeting",
      dueDate: new Date(2024, 6, 8, 14, 0),
      priority: "high",
      completed: false,
    },
    {
      id: "2",
      title: "Update project documentation",
      description: "Add new API endpoints to the developer documentation",
      dueDate: new Date(2024, 6, 9, 10, 30),
      priority: "medium",
      completed: false,
    },
    {
      id: "3",
      title: "Schedule team building event",
      description: "Plan and book venue for next month's team event",
      dueDate: new Date(2024, 6, 10, 16, 0),
      priority: "low",
      completed: true,
    },
  ]);

  const [newReminder, setNewReminder] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: "low" | "medium" | "high";
  }>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.dueDate) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      dueDate: new Date(newReminder.dueDate),
      priority: newReminder.priority,
      completed: false,
    };

    setReminders((prev) => [...prev, reminder]);
    setNewReminder({ title: "", description: "", dueDate: "", priority: "medium" });
    setIsDialogOpen(false);
  };

  const toggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const activeReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Reminders</h2>
          <p className="text-muted-foreground">
            Stay organized with your important tasks and deadlines
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newReminder.title}
                  onChange={(e) =>
                    setNewReminder((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter reminder title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReminder.description}
                  onChange={(e) =>
                    setNewReminder((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Add more details..."
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date & Time</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newReminder.dueDate}
                  onChange={(e) =>
                    setNewReminder((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full p-2 border rounded-md"
                  value={newReminder.priority}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      priority: e.target.value as "low" | "medium" | "high",
                    }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Button onClick={handleAddReminder} className="w-full">
                Create Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Reminders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Reminders ({activeReminders.length})</h3>
        {activeReminders.map((reminder) => (
          <Card key={reminder.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComplete(reminder.id)}
                    className="mt-1"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{reminder.title}</h4>
                      <Badge variant={getPriorityColor(reminder.priority)}>
                        {reminder.priority}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{reminder.dueDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {reminder.dueDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteReminder(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Completed ({completedReminders.length})</h3>
          {completedReminders.map((reminder) => (
            <Card key={reminder.id} className="opacity-60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComplete(reminder.id)}
                      className="mt-1"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <div className="space-y-2">
                      <h4 className="font-semibold line-through">{reminder.title}</h4>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground line-through">
                          {reminder.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reminders.length === 0 && (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reminders yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first reminder to stay organized
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </Card>
      )}
    </div>
  );
};

export default RemindersPage;
