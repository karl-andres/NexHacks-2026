import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/generate-stl
 *
 * Generates an STL file from a text description.
 * Proxies request to Modal TRELLIS endpoint.
 *
 * Set STL_API_URL env var to your Modal endpoint:
 * https://your-workspace--trellis-3d-generate-stl.modal.run
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description } = body

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Modal endpoint URL (after: modal deploy backend/trellis_modal.py)
    const STL_API_URL = process.env.STL_API_URL

    if (!STL_API_URL) {
      return NextResponse.json(
        { error: "STL_API_URL not configured. Deploy Modal app first." },
        { status: 503 }
      )
    }

    const response = await fetch(STL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description, format: "stl" }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error("STL API error:", response.status, errorText)
      return NextResponse.json(
        { error: `STL generation service error: ${errorText}` },
        { status: response.status }
      )
    }

    // Return the binary STL data
    const stlData = await response.arrayBuffer()

    return new NextResponse(stlData, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="model.stl"',
      },
    })
  } catch (error) {
    console.error("STL generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
