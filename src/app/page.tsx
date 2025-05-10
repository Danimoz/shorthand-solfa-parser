'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/text-area";
import { parseShorthandSolfa } from "@/lib/parser";
import { Info, Clipboard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Guide from "@/components/guide";

export default function Home() {
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [input, setInput] = useState(`S. d(God) : r(you) . m(take) : - . r(a) : m(way) . s(the)
A. d : x : tₗ : x
T. s : x : s : x
B. d(uh) : x : mₗ(uh) : x`
  )

  function handleParse(){
    try {
      setError('')
      const parsed = parseShorthandSolfa(input)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch(err) {
      setError('Error parsing the input. Please check the format and try again.')
      toast.error(err instanceof Error ? err.message : String(err))
      console.error(err)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast.success("Copied to clipboard", {
      description: "The JSON has been copied to your clipboard",
    })
  }
  
  return (
    <main className="py-8">
      <h1 className="text-center text-4xl font-bold mb-8">Solfa Notation Parser</h1>

      <div className="mb-6">
        <Alert className="gap-x-4">
          <Info className="h-5 w-5" />
          <AlertTitle>How to Use</AlertTitle>
          <AlertDescription>
            Enter shorthand solfa notation with parts labeled as S., A., T., or B. at the beginning of each line. Notes
            are represented as solfa syllables (d, r, m, etc.), lyrics in parentheses, and special symbols like colons
            (:), dots (.), and extends (-).
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter your shorthand solfa notation here</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter solfa notation..."
              className="min-h-[500px] font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              wrap="off"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleParse} className="w-full">
              Parse Notation
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Structured JSON representation</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="relative">
                <pre className="max-h-[500px] overflow-auto rounded-md bg-muted p-4 font-mono text-sm">
                  {output || "JSON output will appear here"}
                </pre>
                {output && (
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
          </CardContent>
          <CardFooter className="justify-end">
            {output && (
              <Button variant="outline" onClick={copyToClipboard}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy JSON
              </Button>
            )}
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
      
    </main>
  );
}
