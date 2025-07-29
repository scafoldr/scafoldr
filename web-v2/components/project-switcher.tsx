"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus, Folder, MoreHorizontal, Trash2, Edit3 } from "lucide-react"

interface ProjectSwitcherProps {
  currentProject: string
  onProjectChange: (project: string) => void
}

const projects = [
  { name: "Task Manager App", status: "active", lastModified: "2 hours ago" },
  { name: "E-commerce Platform", status: "draft", lastModified: "1 day ago" },
  { name: "Blog CMS", status: "completed", lastModified: "3 days ago" },
  { name: "Social Media Dashboard", status: "draft", lastModified: "1 week ago" },
]

export function ProjectSwitcher({ currentProject, onProjectChange }: ProjectSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 h-9">
          <Folder className="w-4 h-4 text-slate-500" />
          <span className="font-medium max-w-[200px] truncate">{currentProject}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Projects</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {projects.map((project) => (
          <DropdownMenuItem
            key={project.name}
            className="flex items-center justify-between p-3 cursor-pointer"
            onClick={() => onProjectChange(project.name)}
          >
            <div className="flex items-center space-x-3 flex-1">
              <Folder className="w-4 h-4 text-slate-400" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium truncate">{project.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      project.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : project.status === "completed"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{project.lastModified}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-3">
          <Plus className="w-4 h-4 mr-3" />
          <span>Create new project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
