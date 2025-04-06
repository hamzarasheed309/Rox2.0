"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit, Save, X } from "lucide-react"

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

interface StudyTableProps {
  studies: Study[]
}

export function StudyTable({ studies }: StudyTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedStudy, setEditedStudy] = useState<Study | null>(null)

  const filteredStudies = studies.filter(study => 
    study.study_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    study.study_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (study: Study) => {
    setEditingId(study.study_id)
    setEditedStudy({ ...study })
  }

  const handleSave = () => {
    if (editedStudy) {
      // In a real implementation, this would update the data in the parent component
      // For now, we'll just log the changes
      console.log("Saving edited study:", editedStudy)
      setEditingId(null)
      setEditedStudy(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedStudy(null)
  }

  const handleChange = (field: string, value: string | number) => {
    if (editedStudy) {
      setEditedStudy({
        ...editedStudy,
        [field]: value
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search studies..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Export</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Study ID</TableHead>
              <TableHead>Study Label</TableHead>
              <TableHead className="text-right">Effect Size</TableHead>
              <TableHead className="text-right">Standard Error</TableHead>
              <TableHead className="text-right">Weight (%)</TableHead>
              <TableHead className="text-right">Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No studies found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudies.map((study) => (
                <TableRow key={study.study_id}>
                  <TableCell className="font-medium">{study.study_id}</TableCell>
                  <TableCell>
                    {editingId === study.study_id ? (
                      <Input
                        value={editedStudy?.study_label || ""}
                        onChange={(e) => handleChange("study_label", e.target.value)}
                      />
                    ) : (
                      study.study_label
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === study.study_id ? (
                      <Input
                        type="number"
                        value={editedStudy?.effect_size || 0}
                        onChange={(e) => handleChange("effect_size", parseFloat(e.target.value))}
                        className="text-right"
                      />
                    ) : (
                      study.effect_size.toFixed(2)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === study.study_id ? (
                      <Input
                        type="number"
                        value={editedStudy?.se || 0}
                        onChange={(e) => handleChange("se", parseFloat(e.target.value))}
                        className="text-right"
                      />
                    ) : (
                      study.se.toFixed(2)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === study.study_id ? (
                      <Input
                        type="number"
                        value={editedStudy?.weight || 0}
                        onChange={(e) => handleChange("weight", parseFloat(e.target.value))}
                        className="text-right"
                      />
                    ) : (
                      study.weight.toFixed(1)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === study.study_id ? (
                      <Input
                        type="number"
                        value={editedStudy?.year || ""}
                        onChange={(e) => handleChange("year", parseInt(e.target.value))}
                        className="text-right"
                      />
                    ) : (
                      study.year || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === study.study_id ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={handleSave}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(study)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

