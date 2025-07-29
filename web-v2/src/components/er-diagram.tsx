"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize, Download } from "lucide-react"

export function ERDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    // Draw tables
    const tables = [
      { name: "Users", x: 50, y: 50, fields: ["id (PK)", "email", "name", "created_at", "updated_at"] },
      { name: "Projects", x: 300, y: 50, fields: ["id (PK)", "name", "description", "owner_id (FK)", "created_at"] },
      {
        name: "Tasks",
        x: 550,
        y: 50,
        fields: ["id (PK)", "title", "description", "status", "project_id (FK)", "assignee_id (FK)", "created_at"],
      },
      {
        name: "Comments",
        x: 300,
        y: 250,
        fields: ["id (PK)", "content", "task_id (FK)", "user_id (FK)", "parent_id (FK)", "created_at"],
      },
    ]

    tables.forEach((table) => {
      // Table background
      ctx.fillStyle = "#f8fafc"
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 1
      const tableHeight = 30 + table.fields.length * 25
      ctx.fillRect(table.x, table.y, 200, tableHeight)
      ctx.strokeRect(table.x, table.y, 200, tableHeight)

      // Table header
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(table.x, table.y, 200, 30)

      // Table name
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px system-ui"
      ctx.textAlign = "center"
      ctx.fillText(table.name, table.x + 100, table.y + 20)

      // Fields
      ctx.fillStyle = "#1e293b"
      ctx.font = "12px system-ui"
      ctx.textAlign = "left"
      table.fields.forEach((field, index) => {
        const y = table.y + 45 + index * 25
        ctx.fillText(field, table.x + 10, y)

        // Field separator
        if (index < table.fields.length - 1) {
          ctx.strokeStyle = "#e2e8f0"
          ctx.beginPath()
          ctx.moveTo(table.x, y + 10)
          ctx.lineTo(table.x + 200, y + 10)
          ctx.stroke()
        }
      })
    })

    // Draw relationships
    ctx.strokeStyle = "#6366f1"
    ctx.lineWidth = 2

    // Users -> Projects (one-to-many)
    ctx.beginPath()
    ctx.moveTo(250, 100)
    ctx.lineTo(300, 100)
    ctx.stroke()

    // Projects -> Tasks (one-to-many)
    ctx.beginPath()
    ctx.moveTo(500, 100)
    ctx.lineTo(550, 100)
    ctx.stroke()

    // Users -> Tasks (one-to-many, assignee)
    ctx.beginPath()
    ctx.moveTo(150, 150)
    ctx.lineTo(150, 200)
    ctx.lineTo(600, 200)
    ctx.lineTo(600, 150)
    ctx.stroke()

    // Tasks -> Comments (one-to-many)
    ctx.beginPath()
    ctx.moveTo(600, 150)
    ctx.lineTo(600, 220)
    ctx.lineTo(500, 220)
    ctx.lineTo(500, 250)
    ctx.stroke()

    // Users -> Comments (one-to-many)
    ctx.beginPath()
    ctx.moveTo(150, 150)
    ctx.lineTo(150, 300)
    ctx.lineTo(300, 300)
    ctx.stroke()
  }, [])

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button variant="outline" size="sm">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Maximize className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-move" style={{ width: "100%", height: "100%" }} />

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span>Primary Key</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-indigo-500" />
            <span>Relationship</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
