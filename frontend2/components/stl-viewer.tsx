"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import { useEffect, useRef } from "react"
import * as THREE from "three"

interface STLViewerProps {
  stlData?: ArrayBuffer | null
}

function STLModel({ stlData }: STLViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!stlData || !meshRef.current) return

    try {
      const geometry = parseSTL(stlData)
      meshRef.current.geometry = geometry

      // Center and scale the geometry
      geometry.computeBoundingBox()
      const center = new THREE.Vector3()
      geometry.boundingBox?.getCenter(center)
      geometry.translate(-center.x, -center.y, -center.z)

      // Auto-scale to fit view
      const size = new THREE.Vector3()
      geometry.boundingBox?.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 1 / maxDim
      geometry.scale(scale, scale, scale)
    } catch (error) {
      console.error("[v0] Error parsing STL:", error)
    }
  }, [stlData])

  return (
    <mesh ref={meshRef}>
      <bufferGeometry />
      <meshPhongMaterial color="#22d3ee" specular="#22d3ee" shininess={100} />
    </mesh>
  )
}

function parseSTL(arrayBuffer: ArrayBuffer): THREE.BufferGeometry {
  const view = new DataView(arrayBuffer)
  const isASCII = isASCIISTL(arrayBuffer)

  if (isASCII) {
    return parseASCIISTL(new TextDecoder().decode(arrayBuffer))
  } else {
    return parseBinarySTL(view)
  }
}

function isASCIISTL(arrayBuffer: ArrayBuffer): boolean {
  const view = new Uint8Array(arrayBuffer)
  const header = new TextDecoder().decode(view.slice(0, 5))
  return header === "solid"
}

function parseBinarySTL(view: DataView): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const triangles = view.getUint32(80, true)
  const vertices: number[] = []
  const normals: number[] = []

  let offset = 84
  for (let i = 0; i < triangles; i++) {
    const nx = view.getFloat32(offset, true)
    const ny = view.getFloat32(offset + 4, true)
    const nz = view.getFloat32(offset + 8, true)
    offset += 12

    for (let j = 0; j < 3; j++) {
      vertices.push(view.getFloat32(offset, true))
      vertices.push(view.getFloat32(offset + 4, true))
      vertices.push(view.getFloat32(offset + 8, true))
      offset += 12

      normals.push(nx, ny, nz)
    }

    offset += 2 // attribute byte count
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3))

  return geometry
}

function parseASCIISTL(data: string): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const normals: number[] = []

  const vertexPattern =
    /vertex\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/g
  const normalPattern =
    /facet normal\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/g

  let normalMatch
  let vertexMatch
  let currentNormal = [0, 0, 0]

  while ((normalMatch = normalPattern.exec(data))) {
    currentNormal = [
      Number.parseFloat(normalMatch[1]),
      Number.parseFloat(normalMatch[3]),
      Number.parseFloat(normalMatch[5]),
    ]

    const facetStartIndex = data.indexOf("outer loop", normalMatch.index)
    const facetEndIndex = data.indexOf("endloop", facetStartIndex)

    vertexPattern.lastIndex = facetStartIndex
    while ((vertexMatch = vertexPattern.exec(data)) && vertexMatch.index < facetEndIndex) {
      vertices.push(
        Number.parseFloat(vertexMatch[1]),
        Number.parseFloat(vertexMatch[3]),
        Number.parseFloat(vertexMatch[5]),
      )
      normals.push(...currentNormal)
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3))

  return geometry
}

export function STLViewer({ stlData }: STLViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 50 }} className="w-full h-full">
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <STLModel stlData={stlData} />
      <Grid args={[10, 10]} cellColor="#22d3ee" sectionColor="#10b981" fadeDistance={30} fadeStrength={0.3} />
      <OrbitControls autoRotate />
    </Canvas>
  )
}
