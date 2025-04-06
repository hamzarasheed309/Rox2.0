import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  Users,
  Target,
  Award,
  Heart,
  Microscope,
  Code,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-6">
        <div className="mb-4 flex justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full">
            <img
              src={member.image}
              alt={member.name}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <CardTitle className="text-xl text-center">{member.name}</CardTitle>
        <CardDescription className="text-blue-600 text-center">{member.role}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="text-gray-500 text-center">{member.description}</p>
      </CardContent>
    </Card>
  )
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Sarah Chen",
    role: "Chief Executive Officer",
    image: "https://images.pexels.com/photos/5722166/pexels-photo-5722166.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    description: "Former clinical researcher with 15+ years experience in healthcare data analytics and machine learning.",
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Chief Technology Officer",
    image: "https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    description: "R language expert and biostatistician with a passion for making data analysis accessible.",
  },
  {
    name: "Dr. Emily Thompson",
    role: "Head of Research",
    image: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    description: "Specializes in clinical trial design and analysis with focus on oncology research.",
  },
]

const values = [
  {
    icon: <Heart className="h-12 w-12 text-blue-600" />,
    title: "Patient-Centric",
    description: "Every feature we build aims to improve patient outcomes through better data analysis.",
  },
  {
    icon: <Target className="h-12 w-12 text-blue-600" />,
    title: "Precision",
    description: "We maintain the highest standards of statistical accuracy and reproducibility.",
  },
  {
    icon: <Award className="h-12 w-12 text-blue-600" />,
    title: "Excellence",
    description: "Continuous improvement and innovation drive our development process.",
  },
]

export default function About() {
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
            <Button variant="outline" className="hidden md:flex">
              Log in
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Our Story
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Revolutionizing Clinical Data Analysis
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Founded by healthcare professionals, ROX was born from the need to make clinical data analysis more accessible and efficient.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <img
                    src="https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Team collaboration in medical research"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Our Mission
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Empowering Healthcare Innovation
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We're on a mission to democratize clinical data analysis, making it accessible to healthcare professionals worldwide.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-500">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Our Team
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Meet the Experts</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Led by healthcare professionals and data scientists committed to transforming clinical research.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 bg-blue-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-blue-100">Research Teams</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold">50M+</div>
                <div className="text-blue-100">Data Points Analyzed</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold">100+</div>
                <div className="text-blue-100">Publications</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold">25+</div>
                <div className="text-blue-100">Countries</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 md:py-12 bg-gray-900 text-gray-200">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">ROX</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered clinical data analysis for healthcare professionals and researchers.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    HIPAA Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} ROX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 