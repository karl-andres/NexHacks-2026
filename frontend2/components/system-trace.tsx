"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react"
import { useState } from "react"

interface TraceStep {
  id: string
  step: number
  title: string
  status: "pending" | "in-progress" | "completed" | "error"
  timestamp: string
  details: string[]
}

export function SystemTrace() {
  const [traces] = useState<TraceStep[]>([
    {
      id: "1",
      step: 1,
      title: "Vision Analysis",
      status: "completed",
      timestamp: "14:23:45",
      details: [
        "Initializing Overshoot video stream...",
        "Detected object: Cylindrical shape",
        "Dimensions extracted: ∅50mm × H120mm",
        "Surface analysis: Metallic finish detected",
      ],
    },
    {
      id: "2",
      step: 2,
      title: "Geometry Extraction",
      status: "completed",
      timestamp: "14:23:52",
      details: [
        "Converting visual data to geometric primitives",
        "Base cylinder parameters: radius=25mm, height=120mm",
        "Thread pattern detected and parameterized",
        "Mounting points: 3 identified",
      ],
    },
    {
      id: "3",
      step: 3,
      title: "OpenSCAD Generation",
      status: "in-progress",
      timestamp: "14:23:58",
      details: [
        "Generating OpenSCAD script...",
        "module cylinder_part() { ... }",
        "Applying transformations...",
        "Syntax validation in progress",
      ],
    },
    {
      id: "4",
      step: 4,
      title: "STL Export",
      status: "pending",
      timestamp: "-",
      details: ["Waiting for generation to complete", "Will render and export STL file", "Mesh optimization pending"],
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
      case "in-progress":
        return <Zap className="w-4 h-4 text-neon-cyan animate-pulse" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <Card className="bg-secondary border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <h3 className="text-sm font-semibold text-foreground">System Trace (Arize Phoenix Logs)</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Agent: Instrumented with Arize</p>
      </div>

      <ScrollArea className="h-48">
        <div className="p-4 space-y-4">
          {traces.map((trace, index) => (
            <div key={trace.id} className="space-y-2">
              <div className="flex items-start gap-3">
                {getStatusIcon(trace.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-mono text-foreground">
                      <span className="text-muted-foreground">Step {trace.step}:</span> {trace.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{trace.timestamp}</span>
                  </div>
                  <div className="mt-2 space-y-1 ml-0">
                    {trace.details.map((detail, i) => (
                      <p key={i} className="text-xs text-muted-foreground font-mono pl-2 border-l border-neon-cyan/20">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              {index < traces.length - 1 && <div className="h-8 ml-2 border-l border-neon-cyan/20" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
