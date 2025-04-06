"use client"

import { useEffect, useRef, useState } from "react"

export default function ForestPlot() {
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

      // Draw forest plot
      drawForestPlot(ctx, canvas.width, canvas.height)
    } catch (error) {
      console.error("Error drawing forest plot:", error)
    }
  }, [dimensions])

  const drawForestPlot = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Set background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Define plot area
    const margin = { top: 60, right: 150, bottom: 50, left: 250 }
    const plotWidth = width - margin.left - margin.right
    const plotHeight = height - margin.top - margin.bottom

    // Draw title
    ctx.fillStyle = "#111827"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Forest Plot: Effect of Interventions on Primary Outcome", width / 2, 30)

    // Draw x-axis
    ctx.beginPath()
    ctx.moveTo(margin.left, height - margin.bottom)
    ctx.lineTo(width - margin.right, height - margin.bottom)
    ctx.strokeStyle = "#d1d5db"
    ctx.stroke()

    // Draw vertical line at effect size = 1 (no effect)
    const noEffectX = margin.left + plotWidth / 2
    ctx.beginPath()
    ctx.moveTo(noEffectX, margin.top)
    ctx.lineTo(noEffectX, height - margin.bottom)
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "#9ca3af"
    ctx.stroke()
    ctx.setLineDash([])

    // Draw x-axis labels
    ctx.fillStyle = "#4b5563"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    const xValues = [0.1, 0.2, 0.5, 1, 2, 5, 10]
    const xScale = (x: number) => {
      // Log scale mapping
      const logX = Math.log(x) / Math.log(10)
      const minLog = Math.log(0.1) / Math.log(10)
      const maxLog = Math.log(10) / Math.log(10)
      return margin.left + (plotWidth * (logX - minLog)) / (maxLog - minLog)
    }

    xValues.forEach((x) => {
      const xPos = xScale(x)
      ctx.fillText(x.toString(), xPos, height - margin.bottom + 20)

      // Tick marks
      ctx.beginPath()
      ctx.moveTo(xPos, height - margin.bottom)
      ctx.lineTo(xPos, height - margin.bottom + 5)
      ctx.strokeStyle = "#d1d5db"
      ctx.stroke()
    })

    // X-axis title
    ctx.fillStyle = "#111827"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Odds Ratio (log scale)", width / 2, height - 10)

    // Mock study data
    const studies = [
      { name: "Smith et al. (2018)", effect: 1.5, ci: [0.8, 2.8], weight: 15 },
      { name: "Johnson et al. (2019)", effect: 2.1, ci: [1.3, 3.4], weight: 18 },
      { name: "Williams et al. (2020)", effect: 0.8, ci: [0.5, 1.3], weight: 20 },
      { name: "Brown et al. (2021)", effect: 1.7, ci: [1.1, 2.6], weight: 17 },
      { name: "Davis et al. (2022)", effect: 1.2, ci: [0.9, 1.6], weight: 12 },
      { name: "Miller et al. (2022)", effect: 1.9, ci: [1.2, 3.0], weight: 14 },
      { name: "Taylor et al. (2021)", effect: 1.3, ci: [0.9, 1.9], weight: 13 },
      { name: "Anderson et al. (2020)", effect: 1.6, ci: [1.1, 2.3], weight: 16 },
      { name: "Wilson et al. (2019)", effect: 1.1, ci: [0.7, 1.7], weight: 14 },
      { name: "Thomas et al. (2022)", effect: 1.8, ci: [1.2, 2.7], weight: 15 },
    ]

    // Draw studies
    const studyHeight = plotHeight / (studies.length + 2) // +2 for summary

    studies.forEach((study, i) => {
      const y = margin.top + (i + 1) * studyHeight

      // Study name
      ctx.fillStyle = "#111827"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(study.name, margin.left - 15, y + 4)

      // Effect size point
      const x = xScale(study.effect)
      const size = 5 + study.weight / 5

      ctx.beginPath()
      ctx.rect(x - size / 2, y - size / 2, size, size)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()

      // Confidence interval line
      const ciStartX = xScale(study.ci[0])
      const ciEndX = xScale(study.ci[1])

      ctx.beginPath()
      ctx.moveTo(ciStartX, y)
      ctx.lineTo(ciEndX, y)
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      // CI end caps
      ctx.beginPath()
      ctx.moveTo(ciStartX, y - 5)
      ctx.lineTo(ciStartX, y + 5)
      ctx.moveTo(ciEndX, y - 5)
      ctx.lineTo(ciEndX, y + 5)
      ctx.stroke()

      // Weight percentage
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`${study.weight.toFixed(1)}%`, width - margin.right + 15, y + 4)
    })

    // Draw summary diamond
    const summaryY = margin.top + (studies.length + 1) * studyHeight
    const summaryEffect = 1.42
    const summaryCI = [1.18, 1.71]

    const diamondCenterX = xScale(summaryEffect)
    const diamondLeftX = xScale(summaryCI[0])
    const diamondRightX = xScale(summaryCI[1])
    const diamondHeight = 15

    ctx.beginPath()
    ctx.moveTo(diamondCenterX, summaryY - diamondHeight / 2)
    ctx.lineTo(diamondRightX, summaryY)
    ctx.lineTo(diamondCenterX, summaryY + diamondHeight / 2)
    ctx.lineTo(diamondLeftX, summaryY)
    ctx.closePath()
    ctx.fillStyle = "#1e40af"
    ctx.fill()

    // Summary label
    ctx.fillStyle = "#111827"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("Overall Effect (Random Effects)", margin.left - 15, summaryY + 4)

    // Summary effect size and CI
    ctx.fillStyle = "#111827"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(
      `OR = ${summaryEffect.toFixed(2)} [${summaryCI[0].toFixed(2)}, ${summaryCI[1].toFixed(2)}]`,
      width - margin.right + 15,
      summaryY + 4,
    )

    // Legend
    ctx.fillStyle = "#111827"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Favors Control", margin.left, margin.top - 15)
    ctx.fillText("Favors Treatment", width - margin.right, margin.top - 15)
  }

  return (
    <div className="w-full h-full min-h-[600px]">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      />
    </div>
  )
}

