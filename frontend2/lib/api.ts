/**
 * API client for STL generation service.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Generate an STL file from a description.
 *
 * @param description - Text description of the 3D object to generate
 * @returns ArrayBuffer containing the binary STL data
 * @throws ApiError if the request fails
 */
export async function generateSTL(description: string): Promise<ArrayBuffer> {
  const response = await fetch("/api/generate-stl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new ApiError(`STL generation failed: ${errorText}`, response.status)
  }

  return response.arrayBuffer()
}
