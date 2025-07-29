"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, Monitor, Tablet, Plus, Search, Filter } from "lucide-react"

const mockTasks = [
  {
    id: 1,
    title: "Design homepage mockup",
    description: "Create initial design for new homepage",
    status: "in-progress",
    assignee: "Jane Smith",
    project: "Website Redesign",
    dueDate: "2024-01-20",
  },
  {
    id: 2,
    title: "Set up development environment",
    description: "Configure local dev environment",
    status: "completed",
    assignee: "John Doe",
    project: "Website Redesign",
    dueDate: "2024-01-18",
  },
  {
    id: 3,
    title: "Research UI frameworks",
    description: "Compare React vs Vue for mobile app",
    status: "todo",
    assignee: "Bob Johnson",
    project: "Mobile App",
    dueDate: "2024-01-25",
  },
]

export function AppPreview() {
  const [viewMode, setViewMode] = useState("desktop")
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  const getStatusColor = (
    
    
    
    status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const getViewportClass = () => {
    switch (viewMode) {
      case "mobile":
        return "max-w-sm mx-auto"
      case "tablet":
        return "max-w-2xl mx-auto"
      default:
        return "w-full"
    }
  }

  return (
    <div className="h-full bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Preview</span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-md">
            <Button
              variant={viewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 rounded-r-none"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "tablet" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 rounded-none border-x border-slate-200 dark:border-slate-700"
              onClick={() => setViewMode("tablet")}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 rounded-l-none"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={`${getViewportClass()} transition-all duration-300`}>
          {/* Mock App Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Task Manager</h1>
              <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex space-x-3 mb-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search tasks..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* New Task Form */}
          {showNewTaskForm && (
            <Card className="border-x border-slate-200 dark:border-slate-800 rounded-none">
              <CardHeader>
                <CardTitle className="text-lg">Create New Task</CardTitle>
                <CardDescription>Add a new task to your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Task title" />
                <Textarea placeholder="Task description" rows={3} />
                <div className="grid grid-cols-2 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website Redesign</SelectItem>
                      <SelectItem value="mobile">Mobile App</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Doe</SelectItem>
                      <SelectItem value="jane">Jane Smith</SelectItem>
                      <SelectItem value="bob">Bob Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-blue-500 hover:bg-blue-600">Create Task</Button>
                  <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task List */}
          <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-lg">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{task.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Project: {task.project}</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {task.assignee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {mockTasks.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Get started by creating your first task</p>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
