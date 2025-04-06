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

interface ForestPlotProps {
  studies: Study[]
  overallEffect: {
    estimate: number
    ci_lower: number
    ci_upper: number
    p_value: number
  }
  effectMeasure: string
}

export default function ForestPlot({ studies, overallEffect, effectMeasure }: ForestPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.clientWidth
    const height = Math.max(400, studies.length * 30 + 100)
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set styles
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    // Calculate plot dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 200 }
    const plotWidth = width - margin.left - margin.right
    const plotHeight = height - margin.top - margin.bottom

    // Calculate scale
    const allValues = [
      ...studies.map(s => s.effect_size - 1.96 * s.se),
      ...studies.map(s => s.effect_size + 1.96 * s.se),
      overallEffect.ci_lower,
      overallEffect.ci_upper
    ]
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const padding = (maxValue - minValue) * 0.1
    const scale = plotWidth / (maxValue - minValue + 2 * padding)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, height - margin.bottom)
    ctx.lineTo(width - margin.right, height - margin.bottom)
    ctx.strokeStyle = "#000"
    ctx.stroke()

    // Draw vertical line at 0
    const zeroX = margin.left + (-minValue + padding) * scale
    ctx.beginPath()
    ctx.moveTo(zeroX, margin.top)
    ctx.lineTo(zeroX, height - margin.bottom)
    ctx.strokeStyle = "#666"
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw study points and lines
    studies.forEach((study, i) => {
      const y = margin.top + i * 30 + 15
      const x = margin.left + (study.effect_size - minValue + padding) * scale
      const lowerX = margin.left + (study.effect_size - 1.96 * study.se - minValue + padding) * scale
      const upperX = margin.left + (study.effect_size + 1.96 * study.se - minValue + padding) * scale

      // Draw confidence interval line
      ctx.beginPath()
      ctx.moveTo(lowerX, y)
      ctx.lineTo(upperX, y)
      ctx.strokeStyle = "#000"
      ctx.stroke()

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#000"
      ctx.fill()

      // Draw study label
      ctx.fillStyle = "#000"
      ctx.fillText(study.study_label, 10, y)
    })

    // Draw overall effect diamond
    const diamondY = height - margin.bottom + 30
    const diamondX = margin.left + (overallEffect.estimate - minValue + padding) * scale
    const diamondLowerX = margin.left + (overallEffect.ci_lower - minValue + padding) * scale
    const diamondUpperX = margin.left + (overallEffect.ci_upper - minValue + padding) * scale

    ctx.beginPath()
    ctx.moveTo(diamondX, diamondY)
    ctx.lineTo(diamondUpperX, diamondY + 10)
    ctx.lineTo(diamondX, diamondY + 20)
    ctx.lineTo(diamondLowerX, diamondY + 10)
    ctx.closePath()
    ctx.fillStyle = "#000"
    ctx.fill()

    // Draw axis labels
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.fillText(effectMeasure, width / 2, height - 10)
    ctx.textAlign = "left"
    ctx.fillText("Studies", 10, height - 10)

    // Draw scale markers
    const step = (maxValue - minValue) / 5
    for (let i = 0; i <= 5; i++) {
      const value = minValue + i * step
      const x = margin.left + (value - minValue + padding) * scale
      ctx.beginPath()
      ctx.moveTo(x, height - margin.bottom)
      ctx.lineTo(x, height - margin.bottom + 5)
      ctx.stroke()
      ctx.fillText(value.toFixed(1), x, height - margin.bottom + 20)
    }
  }, [studies, overallEffect, effectMeasure])

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

