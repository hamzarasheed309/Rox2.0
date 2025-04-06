"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2, Check, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DataTable() {
  const [data, setData] = useState([
    {
      id: "1",
      author: "Smith et al.",
      year: 2018,
      title: "Efficacy of Treatment A in COVID-19 Patients",
      design: "RCT",
      sampleSize: {
        treatment: 120,
        control: 115,
      },
      effectSize: 1.42,
      lowerCI: 1.12,
      upperCI: 1.79,
      pValue: 0.003,
      weight: 8.4,
      hasIssue: false,
    },
    {
      id: "2",
      author: "Johnson et al.",
      year: 2019,
      title: "Comparative Study of Treatments B and C",
      design: "Cohort",
      sampleSize: {
        treatment: 245,
        control: 240,
      },
      effectSize: 1.68,
      lowerCI: 1.35,
      upperCI: 2.09,
      pValue: 0.0001,
      weight: 12.7,
      hasIssue: false,
    },
    {
      id: "3",
      author: "Williams et al.",
      year: 2020,
      title: "Long-term Outcomes of Treatment D",
      design: "RCT",
      sampleSize: {
        treatment: 85,
        control: 82,
      },
      effectSize: 0.95,
      lowerCI: 0.72,
      upperCI: 1.25,
      pValue: 0.712,
      weight: 6.9,
      hasIssue: true,
    },
    {
      id: "4",
      author: "Brown et al.",
      year: 2021,
      title: "Multi-center Trial of Treatment E",
      design: "RCT",
      sampleSize: {
        treatment: 178,
        control: 180,
      },
      effectSize: 1.31,
      lowerCI: 1.08,
      upperCI: 1.59,
      pValue: 0.006,
      weight: 10.2,
      hasIssue: false,
    },
  ])

  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState<typeof data[0] | null>(null)

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedRows((prev) => (prev.length === data.length ? [] : data.map((row) => row.id)))
  }

  const handleDelete = () => {
    setData((prev) => prev.filter((row) => !selectedRows.includes(row.id)))
    setSelectedRows([])
  }

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const selectedRow = data.find(row => row.id === selectedRows[0])
      if (selectedRow) {
        setEditingData({...selectedRow})
        setIsEditing(true)
      }
    }
  }

  const handleSaveEdit = () => {
    if (editingData) {
      setData(prev => prev.map(row => row.id === editingData.id ? editingData : row))
      setIsEditing(false)
      setEditingData(null)
      setSelectedRows([])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Data</CardTitle>
        <CardDescription>
          View and manage your meta-analysis study data. Select multiple rows to perform bulk actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedRows.length === data.length && data.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} of {data.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <>
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleEdit} disabled={selectedRows.length !== 1}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Study</DialogTitle>
                        <DialogDescription>
                          Make changes to the selected study. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      {editingData && (
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="author" className="text-right">Author</Label>
                            <Input
                              id="author"
                              value={editingData.author}
                              onChange={e => setEditingData({...editingData, author: e.target.value})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="year" className="text-right">Year</Label>
                            <Input
                              id="year"
                              type="number"
                              value={editingData.year}
                              onChange={e => setEditingData({...editingData, year: parseInt(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="design" className="text-right">Design</Label>
                            <Input
                              id="design"
                              value={editingData.design}
                              onChange={e => setEditingData({...editingData, design: e.target.value})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sampleSizeTreatment" className="text-right">Treatment Sample Size</Label>
                            <Input
                              id="sampleSizeTreatment"
                              type="number"
                              value={editingData.sampleSize.treatment}
                              onChange={e => setEditingData({
                                ...editingData,
                                sampleSize: {
                                  ...editingData.sampleSize,
                                  treatment: parseInt(e.target.value)
                                }
                              })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sampleSizeControl" className="text-right">Control Sample Size</Label>
                            <Input
                              id="sampleSizeControl"
                              type="number"
                              value={editingData.sampleSize.control}
                              onChange={e => setEditingData({
                                ...editingData,
                                sampleSize: {
                                  ...editingData.sampleSize,
                                  control: parseInt(e.target.value)
                                }
                              })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="effectSize" className="text-right">Effect Size</Label>
                            <Input
                              id="effectSize"
                              type="number"
                              step="0.01"
                              value={editingData.effectSize}
                              onChange={e => setEditingData({...editingData, effectSize: parseFloat(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lowerCI" className="text-right">Lower CI</Label>
                            <Input
                              id="lowerCI"
                              type="number"
                              step="0.01"
                              value={editingData.lowerCI}
                              onChange={e => setEditingData({...editingData, lowerCI: parseFloat(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="upperCI" className="text-right">Upper CI</Label>
                            <Input
                              id="upperCI"
                              type="number"
                              step="0.01"
                              value={editingData.upperCI}
                              onChange={e => setEditingData({...editingData, upperCI: parseFloat(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pValue" className="text-right">P-value</Label>
                            <Input
                              id="pValue"
                              type="number"
                              step="0.001"
                              value={editingData.pValue}
                              onChange={e => setEditingData({...editingData, pValue: parseFloat(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weight" className="text-right">Weight</Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.1"
                              value={editingData.weight}
                              onChange={e => setEditingData({...editingData, weight: parseFloat(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="hasIssue" className="text-right">Has Issue</Label>
                            <Checkbox
                              id="hasIssue"
                              checked={editingData.hasIssue}
                              onCheckedChange={(checked) => setEditingData({...editingData, hasIssue: !!checked})}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false)
                          setEditingData(null)
                        }}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Studies</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedRows.length} selected studies? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="hidden md:table-cell">Design</TableHead>
                <TableHead>Sample Size</TableHead>
                <TableHead>Effect Size</TableHead>
                <TableHead className="hidden md:table-cell">95% CI</TableHead>
                <TableHead>P-value</TableHead>
                <TableHead className="hidden md:table-cell">Weight</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} className={row.hasIssue ? "bg-red-50/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={() => toggleSelectRow(row.id)}
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.author}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell className="hidden md:table-cell">{row.design}</TableCell>
                  <TableCell>{row.sampleSize.treatment + row.sampleSize.control}</TableCell>
                  <TableCell>{row.effectSize.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    [{row.lowerCI.toFixed(2)}, {row.upperCI.toFixed(2)}]
                  </TableCell>
                  <TableCell>
                    {row.pValue < 0.05 ? (
                      <span className="text-green-600 font-medium">
                        {row.pValue < 0.001 ? "< 0.001" : row.pValue.toFixed(3)}
                      </span>
                    ) : (
                      <span>{row.pValue.toFixed(3)}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{row.weight.toFixed(1)}%</TableCell>
                  <TableCell>
                    {row.hasIssue ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Issue
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Valid
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

