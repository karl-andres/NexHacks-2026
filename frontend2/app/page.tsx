"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VisionFeed } from "@/components/vision-feed"
import { Canvas3D } from "@/components/canvas-3d"
import { generateSTL } from "@/lib/api"
import {
  Download,
  Share2,
  Undo2,
  Redo2,
  Layers,
  Cpu,
  Box,
  Sparkles,
  Terminal
} from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stlData, setStlData] = useState<ArrayBuffer | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState("")

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    try {
      const stlData = await generateSTL(prompt)
      setStlData(stlData)
      setPrompt("") // Clear on success
    } catch (error) {
      console.error("Generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 grid-bg" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none opacity-60 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none opacity-40 z-[1]" />

      {/* Main 3D Viewport - Full Screen */}
      <div className="absolute inset-0 z-[2]">
        <Canvas3D stlData={stlData} isGenerating={isGenerating} />
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
        {/* Left: Logo and Model Info */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-neon-cyan/10 rounded-lg flex items-center justify-center border border-neon-cyan/20">
              <Box className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Akvik</h1>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-tight">
                {isGenerating ? "Generating..." : isCapturing ? "Capturing" : "System Ready"}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Status Indicators */}
        <div className="flex gap-8 font-mono text-[10px] tracking-widest text-white/30 uppercase pointer-events-auto">
          <div>Render_Engine: <span className="text-neon-cyan/60">Neural_v2.4</span></div>
          <div>Latency: <span className="text-neon-emerald/60">12ms</span></div>
          <div>Status: <span className={isGenerating ? "text-yellow-400/60" : "text-neon-emerald/60"}>
            {isGenerating ? "Processing" : "Ready"}
          </span></div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="glass-panel p-1 rounded-xl flex">
            <button className="p-2 text-white/40 hover:text-white transition-colors">
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/40 hover:text-white transition-colors">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <div className="glass-panel p-1 rounded-xl flex">
            <button className="px-4 py-1.5 text-xs font-bold text-white/70 hover:bg-white/5 rounded-lg transition-all">
              SAVE
            </button>
            <Button
              className="px-4 py-1.5 text-xs font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-lg hover:bg-neon-cyan hover:text-black transition-all h-auto"
              disabled={!stlData}
              onClick={() => {
                if (!stlData) return
                const blob = new Blob([stlData], { type: "application/octet-stream" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "generated_model.stl"
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="w-3 h-3 mr-1" />
              EXPORT
            </Button>
          </div>
        </div>
      </header>

      {/* Right Context Panel - Properties (Always Visible) */}
      <aside className="fixed right-0 top-24 bottom-24 z-40 w-80">
        <div className="h-full glass-panel border-l border-white/10 rounded-l-2xl p-5 flex flex-col gap-4 shadow-2xl overflow-y-auto">
          {/* Camera Feed - Primary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Reference Camera</h3>
              <Badge className={`text-[9px] ${isCapturing ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-neon-emerald/10 text-neon-emerald border-neon-emerald/30"}`}>
                {isCapturing ? "RECORDING" : "READY"}
              </Badge>
            </div>
            <VisionFeed
              isCapturing={isCapturing}
              setIsCapturing={setIsCapturing}
              setIsGenerating={setIsGenerating}
              onStlGenerated={setStlData}
              compact
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Model Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" />
                Model Info
              </h3>
            </div>

            {/* Mesh Statistics */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-white/30 uppercase mb-1">Polygons</p>
                  <p className="text-sm font-bold font-mono text-white">24,000</p>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-white/30 uppercase mb-1">Vertices</p>
                  <p className="text-sm font-bold font-mono text-white">12,405</p>
                </div>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-2">Mesh Quality</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-neon-emerald shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                  </div>
                  <span className="text-[10px] font-bold text-neon-emerald">95%</span>
                </div>
              </div>

              {/* Render Latency */}
              <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-1 text-neon-cyan">
                  <Cpu className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase">Render Latency</span>
                </div>
                <div className="text-lg font-mono font-bold text-white">12ms</div>
                <div className="text-[10px] text-white/40">Optimal performance</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom Command Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-6">
        <div className="command-bar w-full max-w-4xl glass-panel rounded-2xl border border-white/10 neon-shadow shadow-2xl p-3 overflow-hidden">
          {/* Drag Handle */}
          <div className="flex justify-center mb-3 group">
            <div className="h-1.5 w-16 bg-white/10 rounded-full group-hover:bg-neon-cyan/40 transition-colors" />
          </div>

          {/* Input Row */}
          <div className="flex items-center gap-4">
            <div className="pl-3">
              <Terminal className={`w-5 h-5 text-neon-cyan ${isGenerating ? "animate-pulse" : ""}`} />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Describe the 3D model you want to generate..."
                disabled={isGenerating}
                className="w-full bg-transparent border-none text-white placeholder-white/20 focus:ring-0 focus:outline-none text-sm font-medium py-3 disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="text-[9px] font-bold text-white/40 px-2 py-1 rounded bg-white/5 border border-white/5">
                  LOD: HIGH
                </span>
                <span className="text-[9px] font-bold text-white/40 px-2 py-1 rounded bg-white/5 border border-white/5">
                  MESH: QUAD
                </span>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-black text-[11px] font-black tracking-widest h-10 px-6 rounded-xl transition-all shadow-lg shadow-cyan-900/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "GENERATING..." : "GENERATE"}
                <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Bottom Options */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Box className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Style Guide</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Iterative Gen</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Image Ref</span>
              </div>
            </div>
            <div className="text-[9px] font-mono text-white/20">
              GPU_UTIL: 42% | VRAM: 8.4GB / 24GB
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
