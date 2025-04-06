"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, FileText, BarChart2, Users, Settings } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="h-6 w-6 text-blue-600" />
            <Link href="/" className="text-xl font-bold">
              ROX
            </Link>
          </div>
          <nav className="space-y-4">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects"
              className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard/projects"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              <FileText className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/dashboard/meta-analysis"
              className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard/meta-analysis"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              Meta-Analysis
            </Link>
            <Link
              href="/dashboard/team"
              className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard/team"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              <Users className="h-4 w-4" />
              Team
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard/settings"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
} 