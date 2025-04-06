"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Send, Loader2, Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Study } from "@/types/meta-analysis"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MetaLLMInterface() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [studies, setStudies] = useState<Study[]>([])
  const [analysisType, setAnalysisType] = useState<string>("general")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setUploadStatus("idle")
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setUploadStatus("uploading")
    setUploadProgress(0)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const response = await fetch("/api/meta-analysis/document-processor", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      setUploadProgress(50)
      setUploadStatus("processing")

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to process document")
      }

      // Update studies with the extracted data
      if (data.data && data.data.studies) {
        setStudies(data.data.studies)
        setUploadProgress(100)
        setUploadStatus("success")
        setResponse(`Successfully extracted ${data.data.studies.length} studies from the document. You can now ask questions about the data.`)
      } else {
        throw new Error("No study data found in the processed document")
      }
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "An error occurred while processing the document")
      setUploadStatus("error")
    }
  }

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError("Please enter a question")
      return
    }

    if (studies.length === 0) {
      setError("Please upload a document with study data first")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/meta-analysis/llm-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          studies,
          analysisType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze data")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze data")
      }

      setResponse(data.data.response || "No response generated")
    } catch (error) {
      console.error("Error:", error)
      setError("An error occurred while processing your request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setUploadStatus("idle")
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          Meta-Analysis AI Assistant
        </CardTitle>
        <CardDescription>
          Upload research documents or ask questions about your meta-analysis results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="query" disabled={studies.length === 0}>Ask Questions</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="file">Upload Research Document</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.docx,.txt,.csv,.xlsx,.json"
                    onChange={handleFileChange}
                    disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                    ref={fileInputRef}
                    className="flex-1"
                  />
                  {file && (
                    <Button variant="outline" size="icon" onClick={clearFile} disabled={uploadStatus === "uploading" || uploadStatus === "processing"}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOCX, TXT, CSV, Excel, JSON
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              {uploadStatus !== "idle" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {uploadStatus === "uploading" && "Uploading document..."}
                      {uploadStatus === "processing" && "Processing document..."}
                      {uploadStatus === "success" && "Document processed successfully"}
                      {uploadStatus === "error" && "Error processing document"}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!file || uploadStatus === "uploading" || uploadStatus === "processing"}
                className="flex items-center gap-2"
              >
                {uploadStatus === "uploading" || uploadStatus === "processing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadStatus === "uploading" ? "Uploading..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {uploadStatus === "success" ? "Process Again" : "Upload & Process"}
                  </>
                )}
              </Button>

              {uploadStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Successfully extracted {studies.length} studies from the document. You can now ask questions about the data.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          <TabsContent value="query" className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="analysis-type">Analysis Type</Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger id="analysis-type">
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Analysis</SelectItem>
                    <SelectItem value="heterogeneity">Heterogeneity Analysis</SelectItem>
                    <SelectItem value="publication_bias">Publication Bias</SelectItem>
                    <SelectItem value="sensitivity">Sensitivity Analysis</SelectItem>
                    <SelectItem value="subgroup">Subgroup Analysis</SelectItem>
                    <SelectItem value="meta_regression">Meta-Regression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about your meta-analysis results..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!query.trim() || isLoading}
                  className={cn("self-end", isLoading && "opacity-50 cursor-not-allowed")}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && !error && (
          <Alert className="bg-blue-50 border-blue-200">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">AI Response</AlertTitle>
            <AlertDescription className="text-blue-700 whitespace-pre-line">
              {response}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 