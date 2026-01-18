"use client"
import { Badge } from "@/components/ui/badge"
import { VisionFeed } from "@/components/vision-feed"
import { Canvas3D } from "@/components/canvas-3d"
import { Zap, Menu } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stlData, setStlData] = useState<ArrayBuffer | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-border bg-secondary/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-secondary rounded-md transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-cyan" />
            </div> */}
            <h1 className="text-xl font-thin text-foreground tracking-tight">Akvik</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className="bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/30 hover:bg-neon-emerald/20">
            <div className="w-2 h-2 rounded-full bg-neon-emerald mr-2 animate-pulse" />
            Agent Active
          </Badge>
        </div>
      </nav>

      {/* Main Content Area - Split pane layout */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <VisionFeed isCapturing={isCapturing} setIsCapturing={setIsCapturing} setIsGenerating={setIsGenerating} onStlGenerated={setStlData} />
          </div>

          <div className="min-h-0 overflow-hidden">
            <Canvas3D stlData={stlData} isGenerating={isGenerating} />
          </div>
        </div>
      </div>
    </div>
  )
}
