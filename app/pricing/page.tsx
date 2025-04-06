"use client"

import { useState } from "react"
import Link from "next/link"
import { Activity, Check, ChevronDown, ChevronRight, Info, Shield, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PricingCardProps {
  title: string
  description: string
  price: number
  billingCycle: "monthly" | "annual"
  features: string[]
  cta: string
  ctaLink: string
  variant: "default" | "outline"
  popular?: boolean
  icon: React.ReactNode
}

interface FeatureComparisonTableProps {
  features: Array<{
    name: string
    basic: string | boolean
    professional: string | boolean
    enterprise: string | boolean
    tooltip?: string
  }>
}

interface FeatureCategoryProps {
  title: string
  features: string[]
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual")
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const handleBillingToggle = () => {
    setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <Link href="/" className="text-xl font-bold">
              ROX
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#services" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-blue-600 transition-colors">
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Transparent Pricing for Every Research Need
                </h1>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Choose the plan that fits your research scope, with all the tools you need for powerful clinical data
                  analysis.
                </p>
              </div>

              <div className="flex items-center space-x-2 mt-8">
                <Label
                  htmlFor="billing-toggle"
                  className={`text-sm ${billingCycle === "monthly" ? "text-gray-900 font-medium" : "text-gray-500"}`}
                >
                  Monthly
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={billingCycle === "annual"}
                  onCheckedChange={handleBillingToggle}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor="billing-toggle"
                  className={`text-sm ${billingCycle === "annual" ? "text-gray-900 font-medium" : "text-gray-500"}`}
                >
                  Annual
                </Label>
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                  Save 20%
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <PricingCard
                title="Basic"
                description="For individual researchers and small projects"
                price={billingCycle === "monthly" ? 99 : 79}
                billingCycle={billingCycle}
                features={[
                  "Up to 5 projects",
                  "10GB data storage",
                  "3 core analysis services",
                  "Standard visualizations",
                  "Email support",
                  "1 user",
                ]}
                cta="Start Free Trial"
                ctaLink="/signup"
                variant="outline"
                popular={false}
                icon={<Zap className="h-5 w-5 text-blue-600" />}
              />

              {/* Professional Plan */}
              <PricingCard
                title="Professional"
                description="For research teams and complex studies"
                price={billingCycle === "monthly" ? 249 : 199}
                billingCycle={billingCycle}
                features={[
                  "Unlimited projects",
                  "50GB data storage",
                  "All analysis services",
                  "Advanced visualizations",
                  "Priority support",
                  "Up to 5 users",
                ]}
                cta="Get Professional"
                ctaLink="/signup?plan=professional"
                variant="default"
                popular={true}
                icon={<Shield className="h-5 w-5 text-blue-600" />}
              />

              {/* Enterprise Plan */}
              <PricingCard
                title="Enterprise"
                description="For institutions and large research departments"
                price={billingCycle === "monthly" ? 599 : 479}
                billingCycle={billingCycle}
                features={[
                  "Unlimited projects",
                  "250GB data storage",
                  "All analysis services + custom",
                  "Custom visualizations",
                  "Dedicated support",
                  "Unlimited users",
                ]}
                cta="Contact Sales"
                ctaLink="/contact"
                variant="outline"
                popular={false}
                icon={<Users className="h-5 w-5 text-blue-600" />}
              />
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">Compare Plan Features</h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Detailed breakdown of what's included in each plan
                </p>
              </div>
            </div>

            <Tabs defaultValue="category-1" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="category-1">Core Features</TabsTrigger>
                <TabsTrigger value="category-2">Analysis Tools</TabsTrigger>
                <TabsTrigger value="category-3">Data Management</TabsTrigger>
                <TabsTrigger value="category-4">Support</TabsTrigger>
              </TabsList>

              <TabsContent value="category-1" className="w-full">
                <FeatureComparisonTable
                  features={[
                    { name: "Number of Projects", basic: "5", professional: "Unlimited", enterprise: "Unlimited" },
                    { name: "Number of Users", basic: "1", professional: "5", enterprise: "Unlimited" },
                    { name: "Data Storage", basic: "10GB", professional: "50GB", enterprise: "250GB" },
                    { name: "API Access", basic: false, professional: true, enterprise: true },
                    {
                      name: "Export Formats",
                      basic: "CSV, PDF",
                      professional: "CSV, PDF, DOCX, PPTX",
                      enterprise: "All formats + custom",
                    },
                    { name: "White Labeling", basic: false, professional: false, enterprise: true },
                    { name: "Custom Domain", basic: false, professional: false, enterprise: true },
                    { name: "SSO Integration", basic: false, professional: true, enterprise: true },
                  ]}
                />
              </TabsContent>

              <TabsContent value="category-2" className="w-full">
                <FeatureComparisonTable
                  features={[
                    {
                      name: "Data Cleaning & Preparation",
                      basic: "Basic",
                      professional: "Advanced",
                      enterprise: "Advanced + Custom",
                    },
                    { name: "Descriptive Statistics", basic: true, professional: true, enterprise: true },
                    {
                      name: "Survival Analysis",
                      basic: "Basic",
                      professional: "Advanced",
                      enterprise: "Advanced + Custom",
                    },
                    { name: "Hypothesis Testing", basic: "Limited", professional: true, enterprise: true },
                    { name: "Predictive Modeling", basic: false, professional: true, enterprise: true },
                    { name: "Meta-Analysis", basic: false, professional: true, enterprise: true },
                    { name: "Custom Analysis Pipelines", basic: false, professional: false, enterprise: true },
                    {
                      name: "AI-Powered Report Builder",
                      basic: "Basic",
                      professional: "Advanced",
                      enterprise: "Advanced + Custom",
                    },
                  ]}
                />
              </TabsContent>

              <TabsContent value="category-3" className="w-full">
                <FeatureComparisonTable
                  features={[
                    {
                      name: "Data Import Sources",
                      basic: "CSV, Excel",
                      professional: "CSV, Excel, REDCap, SPSS",
                      enterprise: "All sources + custom",
                    },
                    { name: "Data Versioning", basic: false, professional: true, enterprise: true },
                    { name: "Automated Backups", basic: "Daily", professional: "Hourly", enterprise: "Real-time" },
                    {
                      name: "Data Anonymization",
                      basic: "Basic",
                      professional: "Advanced",
                      enterprise: "Advanced + Custom",
                    },
                    { name: "Medical Terminology Mapping", basic: false, professional: true, enterprise: true },
                    { name: "Collaborative Editing", basic: false, professional: true, enterprise: true },
                    { name: "Audit Trails", basic: false, professional: true, enterprise: true },
                    { name: "Data Retention Policy", basic: "30 days", professional: "1 year", enterprise: "Custom" },
                  ]}
                />
              </TabsContent>

              <TabsContent value="category-4" className="w-full">
                <FeatureComparisonTable
                  features={[
                    {
                      name: "Support Channels",
                      basic: "Email",
                      professional: "Email, Chat",
                      enterprise: "Email, Chat, Phone",
                    },
                    { name: "Response Time", basic: "48 hours", professional: "24 hours", enterprise: "4 hours" },
                    { name: "Dedicated Account Manager", basic: false, professional: false, enterprise: true },
                    {
                      name: "Training Sessions",
                      basic: "Self-service",
                      professional: "2 sessions",
                      enterprise: "Unlimited",
                    },
                    { name: "Custom Onboarding", basic: false, professional: true, enterprise: true },
                    { name: "SLA", basic: false, professional: false, enterprise: true },
                    { name: "Priority Bug Fixes", basic: false, professional: true, enterprise: true },
                    { name: "Feature Request Priority", basic: false, professional: false, enterprise: true },
                  ]}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                className="flex items-center gap-2"
              >
                {showAllFeatures ? "Show Less" : "Show All Features"}
                <ChevronDown className={`h-4 w-4 transition-transform ${showAllFeatures ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {showAllFeatures && (
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6 text-center">Complete Feature List</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FeatureCategory
                    title="Data Management"
                    features={[
                      "Data import/export",
                      "Data cleaning",
                      "Variable normalization",
                      "Missing value handling",
                      "Outlier detection",
                      "Data labeling",
                      "Data versioning",
                      "Automated backups",
                      "Data anonymization",
                      "Medical terminology mapping",
                    ]}
                  />
                  <FeatureCategory
                    title="Statistical Analysis"
                    features={[
                      "Descriptive statistics",
                      "Inferential statistics",
                      "Survival analysis",
                      "Hypothesis testing",
                      "Group comparisons",
                      "Regression modeling",
                      "Time series analysis",
                      "Meta-analysis",
                      "Power calculations",
                      "Multivariate analysis",
                    ]}
                  />
                  <FeatureCategory
                    title="Visualization & Reporting"
                    features={[
                      "Interactive charts",
                      "Publication-ready figures",
                      "Custom visualizations",
                      "Automated report generation",
                      "APA/CONSORT formatting",
                      "Word/PDF export",
                      "Presentation slides",
                      "Interactive dashboards",
                      "Custom templates",
                      "White labeling",
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Custom Pricing */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold">Need a custom solution?</h2>
                <p className="text-gray-500 max-w-md">
                  Our team can create a tailored plan for your specific research needs, data volume, and institutional
                  requirements.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700">Contact Sales</Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline">Book a Demo</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Everything you need to know about our pricing and plans
                </p>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I know which plan is right for me?</AccordionTrigger>
                <AccordionContent>
                  The Basic plan is ideal for individual researchers or small projects with limited data. The
                  Professional plan is designed for research teams working on multiple projects with more complex
                  analysis needs. The Enterprise plan is best for institutions or large departments with extensive data
                  and customization requirements. You can always start with a lower tier and upgrade as your needs grow.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I change plans later?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be
                  available immediately, and you'll be charged the prorated difference. When downgrading, the change
                  will take effect at the end of your current billing cycle.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is there a free trial available?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer a 14-day free trial of the Professional plan with no credit card required. This gives
                  you access to all Professional features so you can thoroughly evaluate if ROX meets your research
                  needs before committing.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Do you offer academic or non-profit discounts?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer special pricing for academic institutions, non-profit organizations, and students.
                  Contact our sales team for more information about our educational and non-profit discount programs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. For
                  Enterprise plans, we also offer invoice payment options with net-30 terms. For academic institutions,
                  we can work with procurement systems and purchase orders.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Is my data secure and compliant with regulations?</AccordionTrigger>
                <AccordionContent>
                  Yes, ROX is fully HIPAA compliant and follows strict data security protocols. All data is encrypted
                  both in transit and at rest. We maintain SOC 2 compliance and regular security audits. Our platform is
                  designed to help researchers maintain compliance with various regulatory requirements including GDPR,
                  CCPA, and research ethics guidelines.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">What Our Customers Say</h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Researchers and institutions that have transformed their workflow with ROX
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gray-50 border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-yellow-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600">
                      "The Professional plan has been perfect for our department. We've reduced our analysis time by 70%
                      and the visualizations are publication-ready with minimal adjustments."
                    </p>
                    <div className="pt-4">
                      <p className="font-semibold">Dr. Michael Chen</p>
                      <p className="text-sm text-gray-500">Research Director, University Hospital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-yellow-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600">
                      "We started with the Basic plan but quickly upgraded to Enterprise as our research expanded. The
                      ROI has been incredible - what used to take weeks now takes hours."
                    </p>
                    <div className="pt-4">
                      <p className="font-semibold">Dr. Sarah Johnson</p>
                      <p className="text-sm text-gray-500">Clinical Trials Lead, Pharma Research Inc.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-yellow-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600">
                      "As a small research team, the Basic plan gives us everything we need at an affordable price. The
                      survival analysis tools alone have saved us countless hours of manual work."
                    </p>
                    <div className="pt-4">
                      <p className="font-semibold">Dr. Emily Rodriguez</p>
                      <p className="text-sm text-gray-500">Principal Investigator, Cancer Research Center</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 bg-blue-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Research Workflow?
                </h2>
                <p className="max-w-[900px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Start your 14-day free trial today. No credit card required.
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
                  <Link href="#" className="hover:text-white transition-colors">
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

function PricingCard({
  title,
  description,
  price,
  billingCycle,
  features,
  cta,
  ctaLink,
  variant,
  popular = false,
  icon,
}: PricingCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-all ${popular ? "border-blue-200 shadow-lg scale-105 z-10" : "border-gray-200 shadow-md"}`}
    >
      {popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">Most Popular</div>
        </div>
      )}
      <CardHeader className={`pb-4 ${popular ? "bg-blue-50" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-gray-500 ml-1">/{billingCycle === "monthly" ? "mo" : "mo, billed annually"}</span>
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-1" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={ctaLink} className="w-full">
          <Button
            variant={variant}
            className={`w-full ${variant === "default" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            {cta}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function FeatureComparisonTable({ features }: FeatureComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-1/3">Feature</TableHead>
            <TableHead className="text-center">Basic</TableHead>
            <TableHead className="text-center">Professional</TableHead>
            <TableHead className="text-center">Enterprise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature, index) => (
            <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-1">
                  {feature.name}
                  {feature.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">{renderFeatureValue(feature.basic)}</TableCell>
              <TableCell className="text-center">{renderFeatureValue(feature.professional)}</TableCell>
              <TableCell className="text-center">{renderFeatureValue(feature.enterprise)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function renderFeatureValue(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <div className="h-5 w-5 rounded-full border-2 border-gray-200 mx-auto" />
    )
  }
  return value
}

function FeatureCategory({ title, features }: FeatureCategoryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <ChevronRight className="h-4 w-4 mr-2 text-blue-600 shrink-0 mt-1" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
} 