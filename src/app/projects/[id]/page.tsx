'use client';

import db from "@/lib/storage";
import { useLiveQuery } from "dexie-react-hooks";
import { use, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/text-area";
import { parseShorthandSolfa } from "@/lib/parser";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Measures } from "@/types/interfaces";
import { Label } from "@/components/ui/label";
import Guide from "@/components/guide";
import { Clipboard, Download, Info, Save, Trash } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const id = use(params).id
  const project = useLiveQuery(
    async () => await db.projects.get({ id: Number(id) })
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [jsonOutput, setJsonOutput] = useState("")
  const [rawOutput, setRawOutput] = useState<Measures[]>([])
  const [startingMeasure, setStartingMeasure] = useState(1);
  const [jsonVisualizer, setJsonVisualizer] = useState(false)

  useEffect(() => {
    if (project) {
      setStartingMeasure(project.measures?.length ? project.measures[project.measures.length - 1].number + 1 : 1)
    }
  }, [project])

  function handleParse() {
    try {
      setError('')
      const parsed = parseShorthandSolfa(input, startingMeasure)
      setJsonVisualizer(true)
      setRawOutput(parsed)
      setJsonOutput(JSON.stringify(parsed, null, 2))
    } catch (err) {
      setError('Error parsing the input. Please check the format and try again.')
      toast.error(err instanceof Error ? err.message : String(err))
      console.error(err)
    }
  }

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.title || 'project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON downloaded")
  }
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput)
    toast.success("Copied to clipboard", {
      description: "The JSON has been copied to your clipboard",
    })
  }

  async function handleAddMeasuresToProject() {
    if (!project) {
      toast.error("Project not found")
      return
    }
    if (rawOutput.length <= 0 ){
      toast.error("Please parse the input first")
      return
    }

    const newMeasures = [...(project.measures || []), ...rawOutput]
    try {
      await db.projects.update(project, { measures: newMeasures })
      setRawOutput([])
      toast.success("Measures added to project")
    } catch (error) {
      console.error("Error updating project:", error)
      toast.error("Error updating project")
    }
  }

  if (!project) return null
    
  return (
    <main className="relative">
      <h1 className="text-center text-4xl font-bold mb-1">{project?.title || 'Loading...'}</h1>
      <p className="text-center text-lg mb-4">
        {project?.composer ? `by ${project.composer}` : 'Composer not specified'}
        {project.measures?.length ? ` - ${project.measures.length} measures` : ''}
      </p>
      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row justify-between gap-x-4">
            <div className="space-y-3">
              <CardTitle>Input</CardTitle>
              <CardDescription>Enter your shorthand solfa notation here</CardDescription>
            </div>
            <div className="space-y-2">
              <Label htmlFor="starting-measure" className="text-sm font-medium">Starting Measure</Label>
              <Input 
                placeholder="Starting measure" 
                type="number" 
                value={startingMeasure} 
                onChange={(e) => setStartingMeasure(Number(e.target.value))} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="Enter solfa notation..."
                className="min-h-[500px] font-mono pr-8"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                wrap="off"
              />
              {input && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute right-2.5 top-2 cursor-pointer"
                  onClick={() => setInput("")}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button onClick={handleParse} className="w-full">
              Parse Notation
            </Button>
            <Button onClick={handleAddMeasuresToProject} className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <Save className="mr-2 h-4 w-4" />
              Add to Project
            </Button>
            <Button onClick={handleDownloadJSON} className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700" >
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Notation Guide</CardTitle>
            <CardDescription>Reference for shorthand solfa notation symbols</CardDescription>
          </CardHeader>
          <CardContent>
            <Guide />
          </CardContent>
        </Card>
      </div>
      <Sheet open={jsonVisualizer} onOpenChange={setJsonVisualizer}>
        <SheetContent side="right" className="w-[400px]">
          {error ? (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="relative">
              <pre className="max-h-[92vh] mt-8 overflow-auto rounded-md bg-muted p-4 font-mono text-sm">
                {jsonOutput || "JSON output will appear here"}
              </pre>
              {jsonOutput && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute right-8 top-2"
                  onClick={copyToClipboard}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
      <div className="absolute top-0 right-0">
        <Button variant="outline" onClick={() => setJsonVisualizer(!jsonVisualizer)}>
          <Info className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}