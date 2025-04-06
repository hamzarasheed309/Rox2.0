"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface Study {
  study_id: string
  study_label: string
  effect_size: number
  se: number
  weight: number
  year?: number
  author?: string
  [key: string]: any
}

interface FunnelPlotProps {
  studies: Study[]
  effectMeasure: string
}

export function FunnelPlot({ studies, effectMeasure }: FunnelPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.clientWidth
    const height = 400
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set styles
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Calculate plot dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const plotWidth = width - margin.left - margin.right
    const plotHeight = height - margin.top - margin.bottom

    // Calculate scales
    const maxSE = Math.max(...studies.map(s => s.se))
    const minSE = Math.min(...studies.map(s => s.se))
    const seScale = plotHeight / (maxSE - minSE)

    const allEffects = studies.map(s => s.effect_size)
    const minEffect = Math.min(...allEffects)
    const maxEffect = Math.max(...allEffects)
    const effectPadding = (maxEffect - minEffect) * 0.1
    const effectScale = plotWidth / (maxEffect - minEffect + 2 * effectPadding)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, height - margin.bottom)
    ctx.lineTo(width - margin.right, height - margin.bottom)
    ctx.strokeStyle = "#000"
    ctx.stroke()

    // Draw vertical line at overall effect
    const overallEffect = studies.reduce((sum, s) => sum + s.effect_size * s.weight, 0) / 
                         studies.reduce((sum, s) => sum + s.weight, 0)
    const overallX = margin.left + (overallEffect - minEffect + effectPadding) * effectScale
    ctx.beginPath()
    ctx.moveTo(overallX, margin.top)
    ctx.lineTo(overallX, height - margin.bottom)
    ctx.strokeStyle = "#666"
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw funnel lines
    const funnelWidth = plotWidth * 0.8
    const funnelTop = margin.top
    const funnelBottom = height - margin.bottom
    const funnelTopWidth = funnelWidth * 0.2
    const funnelBottomWidth = funnelWidth

    ctx.beginPath()
    ctx.moveTo(overallX - funnelTopWidth / 2, funnelTop)
    ctx.lineTo(overallX - funnelBottomWidth / 2, funnelBottom)
    ctx.moveTo(overallX + funnelTopWidth / 2, funnelTop)
    ctx.lineTo(overallX + funnelBottomWidth / 2, funnelBottom)
    ctx.strokeStyle = "#666"
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw study points
    studies.forEach(study => {
      const x = margin.left + (study.effect_size - minEffect + effectPadding) * effectScale
      const y = margin.top + (study.se - minSE) * seScale

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#000"
      ctx.fill()
    })

    // Draw axis labels
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.fillText(effectMeasure, width / 2, height - 10)
    ctx.textAlign = "right"
    ctx.fillText("Standard Error", margin.left - 10, height / 2)

    // Draw scale markers
    const seStep = (maxSE - minSE) / 5
    for (let i = 0; i <= 5; i++) {
      const value = minSE + i * seStep
      const y = margin.top + (value - minSE) * seScale
      ctx.beginPath()
      ctx.moveTo(margin.left - 5, y)
      ctx.lineTo(margin.left, y)
      ctx.stroke()
      ctx.fillText(value.toFixed(2), margin.left - 10, y)
    }

    const effectStep = (maxEffect - minEffect) / 5
    for (let i = 0; i <= 5; i++) {
      const value = minEffect + i * effectStep
      const x = margin.left + (value - minEffect + effectPadding) * effectScale
      ctx.beginPath()
      ctx.moveTo(x, height - margin.bottom)
      ctx.lineTo(x, height - margin.bottom + 5)
      ctx.stroke()
      ctx.fillText(value.toFixed(2), x, height - margin.bottom + 20)
    }
  }, [studies, effectMeasure])

  return (
    <Card className="p-4">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ minHeight: "400px" }}
      />
    </Card>
  )
}

