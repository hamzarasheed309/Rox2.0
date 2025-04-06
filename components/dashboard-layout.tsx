import type React from "react"
import Link from "next/link"
import { Activity, LayoutDashboard, FileText, BarChart2, Users, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-bold">ROX</span>
                </div>
                <nav className="flex flex-col gap-4">
                  <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/projects" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Projects
                  </Link>
                  <Link
                    href="/dashboard/meta-analysis"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600"
                  >
                    <BarChart2 className="h-4 w-4" />
                    Meta-Analysis
                  </Link>
                  <Link href="/dashboard/team" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Team
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 text-sm font-medium">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Activity className="h-6 w-6 text-blue-600" />
            <Link href="/" className="text-xl font-bold hidden md:flex">
              ROX
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/projects" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Projects
            </Link>
            <Link href="/dashboard/meta-analysis" className="text-sm font-medium text-blue-600 transition-colors">
              Meta-Analysis
            </Link>
            <Link href="/dashboard/team" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Team
            </Link>
            <Link href="/dashboard/settings" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Dr. Sarah Chen</p>
                    <p className="text-xs leading-none text-muted-foreground">sarah.chen@research.org</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard/profile" className="flex w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/settings" className="flex w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/billing" className="flex w-full">
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Link href="/logout" className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">{children}</main>

      <footer className="border-t py-4 bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">ROX</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ROX Clinical Data Analysis. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

