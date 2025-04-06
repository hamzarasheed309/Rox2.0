"use client"

import { Activity, MessageSquare, Maximize2, Minimize2, PanelLeft, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { useEffect } from "react"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  layoutMode: "standard" | "compact" | "expanded"
  setLayoutMode: (mode: "standard" | "compact" | "expanded") => void
}

export default function MetaAnalysisHeader({
  sidebarOpen,
  setSidebarOpen,
  chatOpen,
  setChatOpen,
  layoutMode,
  setLayoutMode,
}: HeaderProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            setSidebarOpen(!sidebarOpen)
            break
          case "/":
            e.preventDefault()
            setChatOpen(!chatOpen)
            break
          case "m":
            e.preventDefault()
            if (layoutMode === "standard") setLayoutMode("compact")
            else if (layoutMode === "compact") setLayoutMode("expanded")
            else setLayoutMode("standard")
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [sidebarOpen, chatOpen, layoutMode, setSidebarOpen, setChatOpen, setLayoutMode])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center mr-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(!sidebarOpen)} 
                  aria-label={`${sidebarOpen ? "Hide" : "Show"} sidebar`}
                  className="hover:bg-muted"
                >
                  {sidebarOpen ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle sidebar (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2 mr-auto">
          <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
          <Link 
            href="/dashboard/meta-analysis" 
            className="font-bold text-lg hidden md:block"
            aria-label="Go to Meta-Analysis Dashboard"
          >
            Meta-Analysis LLM
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`hover:bg-muted ${chatOpen ? "text-primary" : ""}`}
                  aria-label={`${chatOpen ? "Hide" : "Show"} chat`}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle chat (Ctrl+/)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (layoutMode === "standard") setLayoutMode("compact")
                    else if (layoutMode === "compact") setLayoutMode("expanded")
                    else setLayoutMode("standard")
                  }}
                  className="hover:bg-muted"
                  aria-label={`Switch to ${
                    layoutMode === "standard" ? "compact" :
                    layoutMode === "compact" ? "expanded" : "standard"
                  } layout`}
                >
                  {layoutMode === "compact" ? (
                    <Maximize2 className="h-5 w-5" />
                  ) : layoutMode === "expanded" ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle layout mode (Ctrl+M)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

