"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent } from "react"

export default function ForgotPassword() {
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')

    // Here you would typically make an API call to send reset email
    console.log('Reset password request for:', email)
    
    // For now, just redirect to login page with a success message
    alert('If an account exists with this email, you will receive a password reset link.')
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <Link href="/" className="text-xl font-bold">ROX</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="hidden md:flex">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="container px-4 md:px-6 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
              <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="m@example.com"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Send reset link</Button>
                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full py-6 bg-gray-900 text-gray-200">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ROX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 