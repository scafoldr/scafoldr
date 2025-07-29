"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, FileText, Server, Database } from "lucide-react"

const codeFiles = {
  backend: {
    "models/User.js": `const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);`,
    "routes/tasks.js": `const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      project: { $in: req.user.projects } 
    }).populate('assignee', 'name email');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user._id
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;`,
  },
  frontend: {
    "components/TaskList.jsx": `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function TaskList({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(\`/api/tasks?project=\${projectId}\`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card key={task._id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Assigned to: {task.assignee?.name || 'Unassigned'}
              </span>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}`,
    "pages/dashboard.jsx": `import React from 'react';
import { TaskList } from '../components/TaskList';
import { ProjectSidebar } from '../components/ProjectSidebar';

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar 
        onProjectSelect={setSelectedProject}
        selectedProject={selectedProject}
      />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Task Dashboard</h1>
          
          {selectedProject ? (
            <TaskList projectId={selectedProject.id} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select a project to view tasks</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}`,
  },
  database: {
    "schema.sql": `-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);`,
    "seeds.sql": `-- Insert sample users
INSERT INTO users (email, name, password_hash) VALUES
('john@example.com', 'John Doe', '$2b$10$hash1'),
('jane@example.com', 'Jane Smith', '$2b$10$hash2'),
('bob@example.com', 'Bob Johnson', '$2b$10$hash3');

-- Insert sample projects
INSERT INTO projects (name, description, owner_id) VALUES
('Website Redesign', 'Complete redesign of company website', 1),
('Mobile App', 'New mobile application development', 2),
('API Integration', 'Third-party API integration project', 1);

-- Insert sample tasks
INSERT INTO tasks (title, description, status, project_id, assignee_id, created_by) VALUES
('Design homepage mockup', 'Create initial design for new homepage', 'in-progress', 1, 2, 1),
('Set up development environment', 'Configure local dev environment', 'completed', 1, 1, 1),
('Research UI frameworks', 'Compare React vs Vue for mobile app', 'todo', 2, 3, 2),
('API documentation review', 'Review third-party API documentation', 'in-progress', 3, 1, 1);`,
  },
}

export function CodeViewer() {
  const [activeCategory, setActiveCategory] = useState("backend")
  const [activeFile, setActiveFile] = useState("models/User.js")

  const currentFiles = codeFiles[activeCategory as keyof typeof codeFiles]
  const currentCode = currentFiles[activeFile as keyof typeof currentFiles] || ""

  return (
    <div className="h-full flex">
      {/* File Explorer */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="backend" className="text-xs">
                <Server className="w-3 h-3 mr-1" />
                API
              </TabsTrigger>
              <TabsTrigger value="frontend" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                UI
              </TabsTrigger>
              <TabsTrigger value="database" className="text-xs">
                <Database className="w-3 h-3 mr-1" />
                DB
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-2">
            {Object.keys(currentFiles).map((filename) => (
              <Button
                key={filename}
                variant={activeFile === filename ? "secondary" : "ghost"}
                className="w-full justify-start text-xs h-8 mb-1"
                onClick={() => setActiveFile(filename)}
              >
                <FileText className="w-3 h-3 mr-2" />
                {filename}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium">{activeFile}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Code Content */}
        <ScrollArea className="flex-1">
          <pre className="p-4 text-sm font-mono bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-x-auto">
            <code>{currentCode}</code>
          </pre>
        </ScrollArea>
      </div>
    </div>
  )
}
