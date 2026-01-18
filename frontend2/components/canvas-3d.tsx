"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Eye, EyeOff, Zap } from "lucide-react"
import { useState } from "react"
import { STLViewer } from "./stl-viewer"

interface Canvas3DProps {
  stlData: ArrayBuffer | null
  isGenerating: boolean
}

export function Canvas3D({ stlData, isGenerating }: Canvas3DProps) {
  const [showCode, setShowCode] = useState(false)

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
            ) : (
              <>
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent 1px, rgba(34, 211, 238, 0.1) 1px, transparent 2px), linear-gradient(transparent 1px, rgba(34, 211, 238, 0.1) 1px, transparent 2px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative z-10">
                    <div
                      className="w-32 h-32 border-2 border-neon-cyan/40 rounded-lg"
                      style={{
                        perspective: "1000px",
                        transform: "rotateX(20deg) rotateZ(25deg)",
                      }}
                    >
                      <div className="w-full h-full border border-neon-emerald/30 rounded flex items-center justify-center text-center">
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {isGenerating ? "Generating..." : "3D Model Preview"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isGenerating ? "STL incoming" : "Start capture to generate"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
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
        <Button className="flex-1 bg-neon-emerald hover:bg-neon-emerald/90 text-background" disabled={isGenerating}>
          <Zap className="w-4 h-4 mr-2" />
          Generate 3D Model
        </Button>
        <Button
          className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border"
          disabled={!stlData}
        >
          <Download className="w-4 h-4 mr-2" />
          Download STL
        </Button>
      </div>
    </div>
  )
}
