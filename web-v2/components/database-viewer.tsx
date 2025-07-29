"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Database, TableIcon } from "lucide-react"

const tables = {
  users: {
    name: "users",
    columns: [
      { name: "id", type: "SERIAL", isPrimary: true },
      { name: "email", type: "VARCHAR(255)", isUnique: true },
      { name: "name", type: "VARCHAR(255)", isRequired: true },
      { name: "created_at", type: "TIMESTAMP", hasDefault: true },
    ],
    data: [
      { id: 1, email: "john@example.com", name: "John Doe", created_at: "2024-01-15 10:30:00" },
      { id: 2, email: "jane@example.com", name: "Jane Smith", created_at: "2024-01-16 14:20:00" },
      { id: 3, email: "bob@example.com", name: "Bob Johnson", created_at: "2024-01-17 09:15:00" },
    ],
  },
  projects: {
    name: "projects",
    columns: [
      { name: "id", type: "SERIAL", isPrimary: true },
      { name: "name", type: "VARCHAR(255)", isRequired: true },
      { name: "description", type: "TEXT" },
      { name: "owner_id", type: "INTEGER", isForeignKey: true },
      { name: "created_at", type: "TIMESTAMP", hasDefault: true },
    ],
    data: [
      {
        id: 1,
        name: "Website Redesign",
        description: "Complete redesign of company website",
        owner_id: 1,
        created_at: "2024-01-15 11:00:00",
      },
      {
        id: 2,
        name: "Mobile App",
        description: "New mobile application development",
        owner_id: 2,
        created_at: "2024-01-16 15:30:00",
      },
    ],
  },
  tasks: {
    name: "tasks",
    columns: [
      { name: "id", type: "SERIAL", isPrimary: true },
      { name: "title", type: "VARCHAR(255)", isRequired: true },
      { name: "description", type: "TEXT" },
      { name: "status", type: "VARCHAR(50)", hasDefault: true },
      { name: "project_id", type: "INTEGER", isForeignKey: true },
      { name: "assignee_id", type: "INTEGER", isForeignKey: true },
      { name: "created_at", type: "TIMESTAMP", hasDefault: true },
    ],
    data: [
      {
        id: 1,
        title: "Design homepage mockup",
        description: "Create initial design for new homepage",
        status: "in-progress",
        project_id: 1,
        assignee_id: 2,
        created_at: "2024-01-15 12:00:00",
      },
      {
        id: 2,
        title: "Set up development environment",
        description: "Configure local dev environment",
        status: "completed",
        project_id: 1,
        assignee_id: 1,
        created_at: "2024-01-16 09:30:00",
      },
      {
        id: 3,
        title: "Research UI frameworks",
        description: "Compare React vs Vue for mobile app",
        status: "todo",
        project_id: 2,
        assignee_id: 3,
        created_at: "2024-01-17 10:15:00",
      },
    ],
  },
}

export function DatabaseViewer() {
  const [activeTable, setActiveTable] = useState("users")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("data")

  const currentTable = tables[activeTable as keyof typeof tables]
  const filteredData = currentTable.data.filter((row) =>
    Object.values(row).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="h-full flex">
      {/* Table List */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 mb-3">
            <Database className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-sm">Tables</span>
          </div>
          <Input
            placeholder="Search tables..."
            className="h-8 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2">
            {Object.keys(tables).map((tableName) => (
              <Button
                key={tableName}
                variant={activeTable === tableName ? "secondary" : "ghost"}
                className="w-full justify-start text-xs h-8 mb-1"
                onClick={() => setActiveTable(tableName)}
              >
                <TableIcon className="w-3 h-3 mr-2" />
                {tableName}
                <Badge variant="outline" className="ml-auto text-xs">
                  {tables[tableName as keyof typeof tables].data.length}
                </Badge>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Table Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-2">
            <TableIcon className="w-4 h-4 text-slate-500" />
            <span className="font-medium">{currentTable.name}</span>
            <Badge variant="outline" className="text-xs">
              {currentTable.data.length} rows
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-slate-200 dark:border-slate-800 px-3">
            <TabsList className="h-9">
              <TabsTrigger value="data" className="text-xs">
                Data
              </TabsTrigger>
              <TabsTrigger value="schema" className="text-xs">
                Schema
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="data" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {currentTable.columns.map((column) => (
                      <TableHead key={column.name} className="text-xs font-medium">
                        <div className="flex items-center space-x-1">
                          <span>{column.name}</span>
                          {column.isPrimary && (
                            <Badge variant="outline" className="text-xs">
                              PK
                            </Badge>
                          )}
                          {column.isForeignKey && (
                            <Badge variant="outline" className="text-xs">
                              FK
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={index}>
                      {currentTable.columns.map((column) => (
                        <TableCell key={column.name} className="text-xs">
                          {row[column.name as keyof typeof row]?.toString() || "-"}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="schema" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Column</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Constraints</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTable.columns.map((column) => (
                      <TableRow key={column.name}>
                        <TableCell className="text-xs font-medium">{column.name}</TableCell>
                        <TableCell className="text-xs">{column.type}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            {column.isPrimary && (
                              <Badge variant="outline" className="text-xs">
                                PRIMARY KEY
                              </Badge>
                            )}
                            {column.isForeignKey && (
                              <Badge variant="outline" className="text-xs">
                                FOREIGN KEY
                              </Badge>
                            )}
                            {column.isUnique && (
                              <Badge variant="outline" className="text-xs">
                                UNIQUE
                              </Badge>
                            )}
                            {column.isRequired && (
                              <Badge variant="outline" className="text-xs">
                                NOT NULL
                              </Badge>
                            )}
                            {column.hasDefault && (
                              <Badge variant="outline" className="text-xs">
                                DEFAULT
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
