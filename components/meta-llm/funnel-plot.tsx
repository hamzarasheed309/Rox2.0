"use client"

import { useEffect, useRef, useState } from "react"

export default function FunnelPlot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      setDimensions({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas element not found")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas context")
      return
    }

    try {
      // Set canvas dimensions
      canvas.width = dimensions.width
      canvas.height = dimensions.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw funnel plot
      drawFunnelPlot(ctx, canvas.width, canvas.height)
    } catch (error) {
      console.error("Error drawing funnel plot:", error)
    }
  }, [dimensions])

  const drawFunnelPlot = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Set background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Define plot area
    const margin = { top: 60, right: 50, bottom: 50, left: 80 }
    const plotWidth = width - margin.left - margin.right
    const plotHeight = height - margin.top - margin.bottom

    // Draw title
    ctx.fillStyle = "#111827"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Funnel Plot: Assessment of Publication Bias", width / 2, 30)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, height - margin.bottom)
    ctx.lineTo(width - margin.right, height - margin.bottom)
    ctx.strokeStyle = "#d1d5db"
    ctx.stroke()

    // Draw vertical line at effect size = 0 (no effect)
    const noEffectX = margin.left + plotWidth / 2
    ctx.beginPath()
    ctx.moveTo(noEffectX, margin.top)
    ctx.lineTo(noEffectX, height - margin.bottom)
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "#9ca3af"
    ctx.stroke()
    ctx.setLineDash([])

    // X-axis labels
    ctx.fillStyle = "#4b5563"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    
    const xValues = [-2, -1, 0, 1, 2]
    xValues.forEach(x => {
      const xPos = margin.left + plotWidth * ((x + 2) / 4)
      ctx.fillText(x.toString(), xPos, height - margin.bottom + 20)
    })

    // Y-axis labels
    ctx.textAlign = "right"
    const yValues = [0, 0.1, 0.2, 0.3, 0.4]
    yValues.forEach(y => {
      const yPos = margin.top + plotHeight * (1 - y)
      ctx.fillText(y.toString(), margin.left - 10, yPos)
    })

    // Draw funnel
    ctx.beginPath()
    ctx.moveTo(noEffectX - plotWidth / 4, height - margin.bottom)
    ctx.lineTo(noEffectX, margin.top)
    ctx.lineTo(noEffectX + plotWidth / 4, height - margin.bottom)
    ctx.strokeStyle = "#93c5fd"
    ctx.stroke()

    // Plot points (mock data)
    const points = [
      { x: 0.5, se: 0.1 },
      { x: -0.2, se: 0.15 },
      { x: 1.1, se: 0.08 },
      { x: 0.3, se: 0.12 },
      { x: -0.8, se: 0.2 },
      { x: 0.9, se: 0.05 },
    ]

    points.forEach(point => {
      const x = margin.left + plotWidth * ((point.x + 2) / 4)
      const y = margin.top + plotHeight * point.se
      
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()
    })
  }

  return (
    <div className="w-full h-full min-h-[500px]">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      />
    </div>
  )
}

