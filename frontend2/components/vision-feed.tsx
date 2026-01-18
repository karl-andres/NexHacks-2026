"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Video, Play, Square, Send, Type, Maximize2, Settings } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Webcam from "react-webcam"
import { vision, setOnResultCallback } from "@/overshoot/overshoot"
import { generateSTL } from "@/lib/api"
import { cn } from "@/lib/utils"

interface VisionFeedProps {
  isCapturing: boolean
  setIsCapturing: (value: boolean) => void
  setIsGenerating: (value: boolean) => void
  onStlGenerated: (stlData: ArrayBuffer) => void
  compact?: boolean
}

export function VisionFeed({ isCapturing, setIsCapturing, setIsGenerating, onStlGenerated, compact = false }: VisionFeedProps) {
  const [liveDescriptions, setLiveDescriptions] = useState<string[]>(["Awaiting capture..."])
  const [textDescription, setTextDescription] = useState("")
  const [isSubmittingText, setIsSubmittingText] = useState(false)

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

  const handleTextSubmit = async () => {
    if (!textDescription.trim() || isSubmittingText) return

    setIsSubmittingText(true)
    setIsGenerating(true)
    setLiveDescriptions((prev) => [...prev, `Generating from text: "${textDescription}"`])
    setLiveDescriptions((prev) => [...prev, "Starting STL generation..."])

    try {
      const stlData = await generateSTL(textDescription)
      onStlGenerated(stlData)
      setLiveDescriptions((prev) => [...prev, "✓ STL generated successfully"])
      setTextDescription("") // Clear input on success
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      setLiveDescriptions((prev) => [...prev, `✗ Error: ${message}`])
    } finally {
      setIsSubmittingText(false)
      setIsGenerating(false)
    }
  }

  // Compact mode for PiP display in side panel
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Camera Feed PiP */}
        <div className="relative group aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50">
          {/* Live Badge */}
          <div className="absolute top-2 left-2 z-10 flex gap-1.5">
            <div className={cn(
              "text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1",
              isCapturing ? "bg-red-500" : "bg-neon-emerald/80"
            )}>
              <span className={cn("size-1 rounded-full", isCapturing ? "bg-white animate-pulse" : "bg-white")} />
              {isCapturing ? "REC" : "LIVE"}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 bg-black/50 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
              <Maximize2 className="w-3 h-3" />
            </button>
            <button className="p-1.5 bg-black/50 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
              <Settings className="w-3 h-3" />
            </button>
          </div>

          {/* Webcam */}
          <Webcam
            audio={false}
            mirrored
            className="w-full h-full object-cover"
            videoConstraints={{
              facingMode: "user",
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Bottom label */}
          <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between">
            <span className="text-[10px] font-medium text-white/60">Reference_Cam_01</span>
          </div>
        </div>

        {/* Capture Button */}
        <Button
          onClick={() => (isCapturing ? handleStopCapture() : handleStartCapture())}
          disabled={isSubmittingText}
          className={cn(
            "w-full py-2.5 text-xs font-bold tracking-widest transition-all",
            isCapturing
              ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white"
              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white"
          )}
        >
          {isCapturing ? (
            <>
              <Square className="w-3 h-3 mr-2" />
              STOP CAPTURE
            </>
          ) : (
            <>
              <Play className="w-3 h-3 mr-2" />
              START CAPTURE
            </>
          )}
        </Button>

        {/* Latest description */}
        {liveDescriptions.length > 0 && (
          <div className="text-[10px] text-white/40 font-mono truncate px-1">
            {liveDescriptions[liveDescriptions.length - 1]}
          </div>
        )}
      </div>
    )
  }

  // Full mode
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

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Webcam Capture Button */}
        <Button
          onClick={() => (isCapturing ? handleStopCapture() : handleStartCapture())}
          disabled={isSubmittingText}
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

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Text Description Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
              placeholder="Describe a 3D model..."
              disabled={isCapturing || isSubmittingText}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <Button
            onClick={handleTextSubmit}
            disabled={!textDescription.trim() || isCapturing || isSubmittingText}
            className="bg-neon-emerald hover:bg-neon-emerald/90 text-background"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
