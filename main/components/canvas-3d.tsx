"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Eye, EyeOff, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { STLViewer } from "./stl-viewer"

interface Canvas3DProps {
  stlData: ArrayBuffer | null
  isGenerating: boolean
}

export function Canvas3D({ stlData, isGenerating }: Canvas3DProps) {
  const [showCode, setShowCode] = useState(false)
  const [demoStlData, setDemoStlData] = useState<ArrayBuffer | null>(null)

  // Load demo model on mount
  useEffect(() => {
    fetch("/gaming_mouse.stl")
      .then((res) => res.arrayBuffer())
      .then(setDemoStlData)
      .catch(console.error)
  }, [])

  const mockOpenSCADCode = `// VisionSCAD Generated Model
module cylinder_part() {
  cylinder(h=120, r=25, center=true);
}

module threads() {
  for(i = [0:10]) {
    rotate([0, 0, i*36])
    translate([25, 0, 50])
    cube([2, 2, 5]);
  }
}

union() {
  cylinder_part();
  threads();
}

// Export STL for manufacturing`

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="bg-secondary border-border flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-sm font-semibold text-foreground">3D Canvas</h3>
            {isGenerating && <span className="text-xs text-neon-emerald ml-2 animate-pulse">Generating STL...</span>}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCode(!showCode)}
            className="h-8 w-8 p-0 hover:bg-secondary"
          >
            {showCode ? <EyeOff className="w-4 h-4 text-neon-cyan" /> : <Eye className="w-4 h-4 text-neon-cyan" />}
          </Button>
        </div>

        {/* 3D Canvas Area or Code View */}
        {!showCode ? (
          <div className="flex-1 bg-black/60 relative overflow-hidden">
            {stlData ? (
              <STLViewer stlData={stlData} />
            ) : demoStlData && !isGenerating ? (
              <>
                <STLViewer stlData={demoStlData} />
                <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded text-xs text-muted-foreground">
                  Demo Model - Start capture to generate your own
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {isGenerating ? "Generating STL..." : "Loading demo..."}
                  </p>
                  {isGenerating && (
                    <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto" />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-black/80 overflow-auto p-4">
            <pre className="text-xs font-mono text-neon-emerald whitespace-pre-wrap break-words">
              {mockOpenSCADCode}
            </pre>
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Button
          className="flex-1 bg-neon-emerald hover:bg-neon-emerald/90 text-background"
          disabled={!stlData && !demoStlData}
          onClick={() => {
            const dataToDownload = stlData || demoStlData
            if (!dataToDownload) return
            const blob = new Blob([dataToDownload], { type: "application/octet-stream" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = stlData ? "generated_model.stl" : "model.stl"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Download STL
        </Button>
      </div>
    </div>
  )
}
