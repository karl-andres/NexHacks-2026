"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Video, Play, Square } from "lucide-react"
import { useState, useEffect } from "react"

interface VisionFeedProps {
  isCapturing: boolean
  setIsCapturing: (value: boolean) => void
  setIsGenerating: (value: boolean) => void
}

export function VisionFeed({ isCapturing, setIsCapturing, setIsGenerating }: VisionFeedProps) {
  const [liveDescriptions, setLiveDescriptions] = useState<string[]>(["Awaiting capture..."])

  useEffect(() => {
    if (!isCapturing) {
      setLiveDescriptions(["Awaiting capture..."])
      return
    }

    const mockDescriptions = [
      "Detected: Cylinder, 50mm diameter, 120mm height",
      "Material: Metal, brushed aluminum finish",
      "Orientation: Vertical, centered in frame",
      "Additional features: Threaded top, mounting points detected",
      "Surface quality: Good, minimal wear",
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < mockDescriptions.length) {
        setLiveDescriptions((prev) => [...prev, mockDescriptions[index]])
        index++
      }
    }, 800)

    return () => clearInterval(interval)
  }, [isCapturing])

  const handleStopCapture = async () => {
    setIsCapturing(false)
    setIsGenerating(true)

    setTimeout(() => {
      setIsGenerating(false)
      // Mock STL file response from backend
      setLiveDescriptions((prev) => [...prev, "✓ STL file generated successfully"])
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="bg-secondary border-border flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-sm font-semibold text-foreground">Vision Feed</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCapturing ? "bg-red-500 animate-pulse" : "bg-neon-emerald"}`} />
            <span className="text-xs text-muted-foreground">{isCapturing ? "Recording" : "Ready"}</span>
          </div>
        </div>

        {/* Video Placeholder */}
        <div className="flex-1 bg-black/40 relative overflow-hidden flex items-center justify-center border-b border-border">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 1px, rgba(34, 211, 238, 0.1) 1px, transparent 2px), linear-gradient(transparent 1px, rgba(34, 211, 238, 0.1) 1px, transparent 2px)",
              backgroundSize: "50px 50px",
            }}
          />
          <div className="relative z-10 text-center">
            <div
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-3 ${
                isCapturing ? "border-red-500/50 animate-pulse" : "border-neon-cyan/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full border-2 ${
                  isCapturing ? "border-red-500/70" : "border-neon-cyan/50"
                }`}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {isCapturing ? "Capturing..." : "Video stream from Overshoot API"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isCapturing ? "Processing input..." : "Waiting for input..."}
            </p>
          </div>
        </div>

        {/* Live Description Log */}
        <div className="p-4 border-t border-border">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full" />
            Live Description
          </p>
          <ScrollArea className="h-24">
            <div className="space-y-2 pr-4">
              {liveDescriptions.map((desc, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground font-mono border-l-2 border-neon-cyan/30 pl-2 py-1"
                >
                  {desc}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>

      <Button
        onClick={() => (isCapturing ? handleStopCapture() : setIsCapturing(true))}
        className={`w-full ${
          isCapturing ? "bg-red-600 hover:bg-red-700 text-white" : "bg-neon-cyan hover:bg-neon-cyan/90 text-background"
        }`}
        disabled={false}
      >
        {isCapturing ? (
          <>
            <Square className="w-4 h-4 mr-2" />
            Stop Capture
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start Capture
          </>
        )}
      </Button>
    </div>
  )
}
