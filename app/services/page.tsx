import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronRight,
  BarChart2,
  FileText,
  Activity,
  PieChart,
  TrendingUp,
  Users,
  LineChart,
  BookOpen,
  Code,
  Shield,
  Database,
  Brain,
  Check,
} from "lucide-react"
import Link from "next/link"

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  includes: string[];
  link?: string;
}

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  return service.link ? (
    <Link href={service.link} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
        <CardHeader className="p-6">
          <div className="mb-3">{service.icon}</div>
          <CardTitle className="text-xl">{service.title}</CardTitle>
          <CardDescription className="text-gray-500">{service.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <h4 className="text-sm font-medium mb-2">Includes:</h4>
          <ul className="space-y-1 text-sm text-gray-500">
            {service.includes.map((item: string, index: number) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 mr-1 text-green-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  ) : (
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
      <CardHeader className="p-6">
        <div className="mb-3">{service.icon}</div>
        <CardTitle className="text-xl">{service.title}</CardTitle>
        <CardDescription className="text-gray-500">{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <h4 className="text-sm font-medium mb-2">Includes:</h4>
        <ul className="space-y-1 text-sm text-gray-500">
          {service.includes.map((item: string, index: number) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 mr-1 text-green-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

interface AddonCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AddonCard({ icon, title, description }: AddonCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-6">
        <div className="mb-3">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-gray-500">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

const services: Service[] = [
  {
    icon: <FileText className="h-8 w-8 text-blue-600" />,
    title: "Clinical Data Cleaning & Preparation",
    description:
      "Upload raw clinical trial, EHR, or survey data and let ROX detect missing values, normalize variables, and prepare it for statistical analysis.",
    includes: [
      "Handling missing values",
      "Outlier detection",
      "Data labeling & grouping",
      "Automated descriptive stats",
    ],
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-blue-600" />,
    title: "Descriptive Statistical Summary",
    description:
      "Instantly generate frequency tables, stratified summaries, and visual charts across any variable set.",
    includes: [
      "Age-sex distribution",
      "Disease-wise case counts",
      "Group-wise comparisons",
      "Charts & tables auto-generated",
    ],
  },
  {
    icon: <Activity className="h-8 w-8 text-blue-600" />,
    title: "Survival Analysis",
    description:
      "For time-to-event studies, ROX automates full survival analysis — ideal for oncology, ICU data, and more.",
    includes: ["KM curves", "Log-rank tests", "Cox proportional hazard modeling", "Censoring support"],
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Hypothesis Testing & Group Comparisons",
    description:
      "Test treatment effectiveness or patient group differences with AI-driven stats (Chi-square, t-tests, ANOVA, etc.).",
    includes: ["P-value generation", "Confidence intervals", "Significance interpretation", "Graphs for publications"],
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
    title: "Predictive Modeling & Risk Scoring",
    description:
      "Build logistic or linear regression models with AI prompts. Predict disease risk or outcome probabilities in minutes.",
    includes: [
      "Binary outcome modeling",
      "ROC curve generation",
      "Risk factor identification",
      "Model performance summary",
    ],
  },
  {
    icon: <Users className="h-8 w-8 text-blue-600" />,
    title: "Clinical Trial Analysis Suite",
    description:
      "Automate analysis of RCT data with built-in CONSORT alignment. Handle treatment vs control arms, blinding, ITT vs PP.",
    includes: [
      "Randomization checks",
      "Treatment effect analysis",
      "Stratified group comparisons",
      "Pre-post intervention summaries",
    ],
  },
  {
    icon: <LineChart className="h-8 w-8 text-blue-600" />,
    title: "Medical Data Visualization",
    description:
      "Generate publication-ready visuals that illustrate patterns, significance, and trends with zero manual plotting.",
    includes: ["Histograms & boxplots", "Heatmaps & scatterplots", "KM curves", "Custom chart templates"],
  },
  {
    icon: <BookOpen className="h-8 w-8 text-blue-600" />,
    title: "Meta-Analysis Automation",
    description: "Combine findings across multiple studies, complete with forest plots and heterogeneity tests.",
    includes: ["Effect size calculation", "Forest plots", "Publication bias detection", "I² heterogeneity measures"],
    link: "/dashboard/meta-analysis"
  },
  {
    icon: <FileText className="h-8 w-8 text-blue-600" />,
    title: "AI-Powered Research Report Builder",
    description:
      "Convert your entire dataset into a full structured report (APA, CONSORT, or journal-ready). Instantly export to Word or PDF.",
    includes: ["Results summary", "Auto-generated charts & stats", "Customizable headings", "Referencing support"],
  },
  {
    icon: <Code className="h-8 w-8 text-blue-600" />,
    title: "Smart Prompt-to-Code Converter",
    description:
      "For those transitioning to coding, see the actual R code ROX would've written. Great for learning or transparency.",
    includes: ["R code preview per task", "Explain-in-plain-English", "Copy/export functionality"],
  },
]

export default function Services() {
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
            <Link href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">
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
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Our Services
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Comprehensive Clinical Data Solutions
                </h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered platform handles every aspect of clinical data analysis, from cleaning to visualization
                  and reporting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <ServiceCard key={index} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Optional Add-ons
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Enhance Your Data Analysis</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Customize your experience with these powerful add-ons
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <AddonCard
                icon={<Shield className="h-8 w-8 text-blue-600" />}
                title="Data Compliance & Anonymization"
                description="Ensure your data meets regulatory standards with automated anonymization and compliance checks."
              />
              <AddonCard
                icon={<Database className="h-8 w-8 text-blue-600" />}
                title="Medical Terminology Mapping"
                description="Seamlessly map your data to standard medical terminologies with ICD/LOINC support."
              />
              <AddonCard
                icon={<Brain className="h-8 w-8 text-blue-600" />}
                title="Literature Insight Assistant"
                description="Upload research papers and get summarized statistics and insights automatically."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 bg-blue-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Clinical Data Analysis?
                </h2>
                <p className="max-w-[900px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join hundreds of research teams who have simplified their workflow with ROX.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="bg-white text-blue-600 hover:bg-blue-50">Start Free Trial</Button>
                <Button variant="outline" className="text-white border-white hover:bg-blue-700">
                  Schedule a Demo
                </Button>
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