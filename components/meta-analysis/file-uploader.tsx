"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Study } from "@/types/meta-analysis"

interface FileUploaderProps {
  onUpload: (studies: Study[]) => void
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Mock data for demonstration
      const mockData: Study[] = [
        { 
          study_id: "S001", 
          study_label: "Smith et al. (2018)", 
          effect_size: 1.5, 
          se: 0.3, 
          weight: 15,
          year: 2018,
          author: "Smith"
        },
        { 
          study_id: "S002", 
          study_label: "Johnson et al. (2019)", 
          effect_size: 2.1, 
          se: 0.4, 
          weight: 18,
          year: 2019,
          author: "Johnson"
        },
        { 
          study_id: "S003", 
          study_label: "Williams et al. (2020)", 
          effect_size: 0.8, 
          se: 0.25, 
          weight: 20,
          year: 2020,
          author: "Williams"
        }
      ]
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onUpload(mockData)
    } catch (err: any) {
      setError(err.message || "An error occurred while uploading the file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file">Upload Study Data</Label>
        <Input
          id="file"
          type="file"
          accept=".csv,.xlsx,.json"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleUpload} 
        disabled={!file || loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>Processing...</>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload
          </>
        )}
      </Button>

      <div className="text-sm text-muted-foreground">
        <p>Supported formats: CSV, Excel, JSON</p>
        <p>Required columns: study_id, study_label, effect_size, se</p>
      </div>
    </div>
  )
} 