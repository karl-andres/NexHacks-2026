"use client"

import { useState, useEffect } from "react"
import { STLViewer } from "./stl-viewer"
import { cn } from "@/lib/utils"

interface Canvas3DProps {
  stlData: ArrayBuffer | null
  isGenerating: boolean
  className?: string
}

export function Canvas3D({ stlData, isGenerating, className }: Canvas3DProps) {
  const [demoStlData, setDemoStlData] = useState<ArrayBuffer | null>(null)

  // Load demo model on mount
  useEffect(() => {
    fetch("/gaming_mouse.stl")
      .then((res) => res.arrayBuffer())
      .then(setDemoStlData)
      .catch(console.error)
  }, [])

  return (
    <div className={cn("w-full h-full relative", className)}>
      {/* Viewport Status Overlays */}
      <div className="absolute top-20 left-6 z-10 flex gap-2 pointer-events-none">
        <div className="px-3 py-1.5 glass-panel rounded-lg text-[10px] font-mono text-white/50 uppercase tracking-wider">
          PRV_MODE: FULL_RENDER
        </div>
        <div className="px-3 py-1.5 glass-panel rounded-lg text-[10px] font-mono text-white/50 uppercase tracking-wider">
          MESH_TYPE: POLYGONAL
        </div>
      </div>

      {/* Axis Info */}
      <div className="absolute top-20 right-[340px] z-10 text-right pointer-events-none">
        <div className="text-[10px] font-mono text-white/30 uppercase">Render_Latency: 12ms</div>
        <div className="text-[10px] font-mono text-white/30 uppercase">View_Axis: Front_Ortho</div>
      </div>

      {/* 3D Viewport */}
      <div className="w-full h-full">
        {stlData ? (
          <STLViewer stlData={stlData} />
        ) : demoStlData && !isGenerating ? (
          <>
            <STLViewer stlData={demoStlData} />
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-xl text-xs text-white/50 pointer-events-none">
              Demo Model — Use camera or describe a model to generate your own
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {isGenerating ? (
                <>
                  <div className="w-16 h-16 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-white/60 font-medium">Generating STL...</p>
                  <p className="text-xs text-white/30 mt-1">Neural processing in progress</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 border border-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 border border-white/20 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm text-white/40">Loading demo model...</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-20 left-6 w-8 h-8 border-l-2 border-t-2 border-white/10 pointer-events-none" />
      <div className="absolute top-20 right-[340px] w-8 h-8 border-r-2 border-t-2 border-white/10 pointer-events-none" />
      <div className="absolute bottom-32 left-6 w-8 h-8 border-l-2 border-b-2 border-white/10 pointer-events-none" />
      <div className="absolute bottom-32 right-[340px] w-8 h-8 border-r-2 border-b-2 border-white/10 pointer-events-none" />

      {/* Crosshair Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
        <div className="w-px h-6 bg-white/50 absolute left-1/2 -translate-x-1/2 -top-8" />
        <div className="w-px h-6 bg-white/50 absolute left-1/2 -translate-x-1/2 top-2" />
        <div className="h-px w-6 bg-white/50 absolute top-1/2 -translate-y-1/2 -left-8" />
        <div className="h-px w-6 bg-white/50 absolute top-1/2 -translate-y-1/2 left-2" />
      </div>
    </div>
  )
}
