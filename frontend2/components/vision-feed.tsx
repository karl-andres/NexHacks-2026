"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Video, Play, Square } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Webcam from "react-webcam"
import { vision, setOnResultCallback } from "@/overshoot/overshoot"
import { generateSTL } from "@/lib/api"

interface VisionFeedProps {
  isCapturing: boolean
  setIsCapturing: (value: boolean) => void
  setIsGenerating: (value: boolean) => void
  onStlGenerated: (stlData: ArrayBuffer) => void
}

export function VisionFeed({ isCapturing, setIsCapturing, setIsGenerating, onStlGenerated }: VisionFeedProps) {
  const [liveDescriptions, setLiveDescriptions] = useState<string[]>(["Awaiting capture..."])

  // Use ref to always have access to latest setter from async callbacks
  const addDescription = useCallback((text: string) => {
    console.log("Adding description to UI:", text)
    setLiveDescriptions((prev) => [...prev, text])
  }, [])

  // Set up callback to receive vision results and update UI
  useEffect(() => {
    setOnResultCallback(addDescription)
  }, [addDescription])

  const handleStartCapture = async () => {
    setLiveDescriptions(["Starting capture..."])
    setIsCapturing(true)
    await vision.start()
  }

  const handleStopCapture = async () => {
    await vision.stop()
    setIsCapturing(false)
    setIsGenerating(true)
    setLiveDescriptions((prev) => [...prev, "Starting STL generation..."])

    try {
      const lastDescription = liveDescriptions[liveDescriptions.length - 1]
      const stlData = await generateSTL(lastDescription)
      onStlGenerated(stlData) // set the stl data to the parent component
      setLiveDescriptions((prev) => [...prev, "✓ STL generated successfully"])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      setLiveDescriptions((prev) => [...prev, `✗ Error: ${message}`])
    } finally {
      setIsGenerating(false)
    }
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

        {/* Webcam Feed */}
        <div className="flex-1 bg-black/40 relative overflow-hidden flex items-center justify-center border-b border-border">
          <Webcam
            audio={false}
            mirrored
            className="absolute inset-0 w-full h-full object-cover"
            videoConstraints={{
              facingMode: "user",
            }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 1px, rgba(34, 211, 238, 0.1) 1px, transparent 2px), linear-gradient(transparent 1px, rgba(34, 211, 238, 0.1) 1px, transparent 2px)",
              backgroundSize: "50px 50px",
            }}
          />
          {/* Recording indicator */}
          {isCapturing && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 px-2 py-1 rounded">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white font-mono">REC</span>
            </div>
          )}
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
        onClick={() => (isCapturing ? handleStopCapture() : handleStartCapture())}
        className={`w-full ${
          isCapturing ? "bg-red-600 hover:bg-red-700 text-white" : "bg-neon-cyan hover:bg-neon-cyan/90 text-background"
        }`}
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
