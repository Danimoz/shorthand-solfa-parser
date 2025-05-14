import { Measures, SimpleSymbol, SolfaSymbol } from "@/types/interfaces"
import { partMap, repeatMap, validSolfaRegex } from "./constants"


/**
 * Parses shorthand solfa notation into structured JSON
 * @param input The shorthand solfa notation as a string
 * @param startingMeasure The starting measure number
 * @returns An array of measures
 */
export function parseShorthandSolfa(input: string, startingMeasure = 1) {
  const measuresMap: Map<number, Measures> = new Map()
  const allLines = input.split("\n\n")
  let currentMeasure = startingMeasure

  for (const line of allLines) {
    const parts = line.split("\n")

    for (const part of parts) {
      if (!part || part.trim().length === 0) continue
      // Extract part label and content
      const partMatch = part.match(/^(MS|S1|S2|S3|A1|A2|A3|T1|T2|T3|B1|B2|B3|Bar|S|A|T|B)\.(.+)$/)
      if (!partMatch) {
        throw new Error(`Invalid part format: ${part}`)
      }
      const [, partLabel, partContent] = partMatch
      const partName = partMap[partLabel]
      if (!partName) {
        throw new Error(`Invalid part label: ${partLabel}`)
      }
      const { measureContent } = parsePartContentByMeasure(partContent, partName, currentMeasure)

      for (const [measureIdx, content] of Object.entries(measureContent)) {
        const measureNumber = parseInt(measureIdx)
        if (!measuresMap.has(measureNumber)) {
          measuresMap.set(measureNumber, {
            number: measureNumber,
            barline: { symbol_type: "barline", value: "|" },
            parts: {}
          })
        }

        const measure = measuresMap.get(measureNumber)
        measure!.parts[partName] = content.symbols;

        if (content.barlineType) measure!.barline = { symbol_type: content.barlineType.symbol_type, value: content.barlineType.value }
        if (content.meter)  measure!.meter = content.meter
        if (content.key) measure!.key = content.key
        if (content.repeats) measure!.repeats = content.repeats
      }
    }
    // update the current measure number
    const lastMeasure = Array.from(measuresMap.keys()).pop()
    if (lastMeasure !== undefined) {
      currentMeasure = lastMeasure + 1
    }
  }
  const measures = Array.from(measuresMap.values()).sort((a, b) => a.number - b.number);
  return measures
}


/**
 * Parses the content of a single part into measures
 * @param content The content of the part
 * @param partName The name of the part
 * @param startingMeasure The starting measure number
 * @returns An object containing the measure content
 */
function parsePartContentByMeasure(content: string, partName: string, startingMeasure: number) {
  let currentMeasure = startingMeasure
  const  measureContent: Record<number, 
    { symbols: SolfaSymbol[], barlineType: SimpleSymbol | null, meter?: string | null, key?: string | null, repeats?: SimpleSymbol }
  > = {}
  let currentSymbols: SolfaSymbol[] = []
  let i = 0
  let pendingSlurStart = false
  let applySlurStartToUpcomingNote = false
  let pendingDynamic: string | null = null
  let pendingModulation: string | null = null
  let currentRepeat: SimpleSymbol | undefined = undefined
  let currentMeter: string | null = null
  let currentKey: string | null = null

  while (i < content.length) {
    const char = content[i]
    // Skip Whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }

    // Check for barline
    if (char === "|") {
      let barlineType = { symbol_type: "barline", value: "|" }
      if (i + 1 < content.length && content[i + 1] === "|") {
        barlineType = { symbol_type: "double_barline", value: "||" }
        i += 2
      } else {
        i++
      }

      measureContent[currentMeasure] = {
        symbols: currentSymbols,
        barlineType: barlineType,
        repeats: currentRepeat,
        meter: currentMeter,
        key: currentKey
      };

      // Reset for next measure
      currentSymbols = []
      currentRepeat = undefined
      currentMeter = null
      currentKey = null
      currentMeasure++
      continue
    }

    if ([":", "/"].includes(char)) {
      const type = char === ":" ? "sep_colon" : "sep_slash"
      currentSymbols.push({ symbol_type: type, value: char })
      i++
      continue
    }

    if (["-", ".", ","].includes(char)) {
      const type = char === '-' ? "extend" : char === '.' ? "dot" : "comma"
      currentSymbols.push({ symbol_type: type, value: char })
      i++
      continue
    }

    if (char === 'x') {
      currentSymbols.push({ symbol_type: "blank", value: "x" })
      i++
      continue
    }

    // Check for slurs
    if (char === "~") {
      i++;
      if (pendingSlurStart) {
        const lastSymbol = currentSymbols[currentSymbols.length - 1]
        if (!lastSymbol || lastSymbol.symbol_type !== "note") {
          throw new Error(`Unmatched ~ in ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`)
        }
        lastSymbol.slurEnd = true
        pendingSlurStart = false
        applySlurStartToUpcomingNote = false
        continue
      } else {  
        pendingSlurStart = true
        applySlurStartToUpcomingNote = true
        continue
      }
    }

    // Check for Dynamics
    if (char === "[") {
      const endIdx = content.indexOf("]", i)
      if (endIdx === -1) {
        throw new Error(`Unmatched [ in dynamics: at ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`)
      }
      pendingDynamic = content.slice(i + 1, endIdx)
      i = endIdx + 1
      continue
    }

    // Check for time signature
    if (char === "#") {
      const meterMatch = content.slice(i + 1).match(/^(\d+)\/(\d+)/)
      if (!meterMatch) {
        throw new Error(`Invalid time signature format in ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`)
      }
      const meterChange = meterMatch[0]
      currentMeter = meterChange
      i += meterChange.length + 1
      continue
    }

    // Check for key signature
    if (char === "@") {
      let keyEnd = i + 1
      while (keyEnd < content.length && /[A-Gb#]/.test(content[keyEnd])) {
        keyEnd++
      }
      const keySignature = content.slice(i + 1, keyEnd)
      currentKey = keySignature
      i = keyEnd
      continue
    }

    // Check for 1st, 2nd ,... repeats
    if (char === '&'){
      const endIdx = i + 1
      if(endIdx < content.length && /^\d$/.test(content[i+1])){
        const digit = content[i+1]
        console.log(measureContent[currentMeasure])
        if (digit === '1' || digit === '2' || digit === '3'){
          currentRepeat = { symbol_type: repeatMap[digit], value: `&${digit}` }
          i = endIdx + 1
          continue
        }
      } 
      throw new Error(`Expected digit after & in repeat ending at ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`);
    }

    // Check for repeat
    if (char === "$") {
      currentRepeat = { symbol_type: "segno", value: "$" }
      i++
      continue
    }

    // Check for dal_segno and dal_capo
    if (char === "D") {
      if (content[i + 1] === "S") {
        currentRepeat = { symbol_type: "dal_segno", value: "DS" }
        i += 2
        continue
      }
      if (content[i + 1] === "C") {
        currentRepeat = { symbol_type: "dal_capo", value: "DC" }
        i += 2
        continue
      }
    }

    // Check for modulation
    if (char === '*'){
      const endIdx = content.indexOf("*", i)
      if (endIdx === -1) {
        throw new Error(`Unmatched * in modulation: at ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`)
      }
      pendingModulation = content.slice(i + 1, endIdx)
      i = endIdx + 1
      continue
    }

    // Check for Note
    if (isSolfaStart(char)) {
      const noteData = parseNote(i, content, partName)
      if (applySlurStartToUpcomingNote) {
        if (!pendingSlurStart) {
          // This is a sanity check; if applySlurStartToUpcomingNote is true, pendingSlurStart should also be true.
          throw new Error(`Internal parser error: applySlurStartToUpcomingNote is true, but pendingSlurStart (slur active flag) is false. Part: ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`);
        }
        noteData.slurStart = true;
        applySlurStartToUpcomingNote = false; 
      }

      if (pendingDynamic) {
        noteData.dynamic = pendingDynamic
        pendingDynamic = null
      }
      if (pendingModulation) {
        noteData.mod_note = pendingModulation
        pendingModulation = null
      }
      const { end, ...noteDataWithoutEnd } = noteData
      currentSymbols.push(noteDataWithoutEnd)

      i = end
      continue
    }

    // Check for divisi
    if (char === "{") {
      const endIdx = content.indexOf("}", i)
      if (endIdx === -1) {
        throw new Error(`Unmatched { in ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`)
      }
      const lastSymbol = currentSymbols[currentSymbols.length - 1]
      if (lastSymbol.symbol_type !== "note") {
        throw new Error(`Unmatched { in ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`)
      }
      const divNote = content.slice(i + 1, endIdx)
      lastSymbol.div_note = divNote
      i = endIdx + 1
      continue
    }

    // If we reach here, character isn't recognized
    throw new Error(`Unrecognized character "${char}" in ${partName}, Context: ${content.substring(Math.max(0, i - 10), i + 10)}`)
    //console.warn(`Unrecognized character "${char}" in ${partName} : ${content}`)
  }

  
  // Handle any remaining symbols after the last barline
  if (currentSymbols.length > 0 || currentKey || currentMeter || currentRepeat) {
    measureContent[currentMeasure] = {
      symbols: currentSymbols,
      barlineType: null,
      meter: currentMeter,
      key: currentKey,
      repeats: currentRepeat
    }
  }

  return { measureContent }
}

function parseNote(charIdx: number, content: string, partName: string): SolfaSymbol & { end: number } {
  let end = charIdx
  let note = ""
  let lyrics: string[] | null = null
  // check for two character solfa symbols
  while (end < content.length && /[a-zA-Z0-9'₂ₗ²″]/.test(content[end])) {
    note += content[end]
    end++
  }

  // check for whitespace
  while (end < content.length && /\s/.test(content[end])) {
    end++
  }

  if (content[end] === "(") {
    const endIdx = content.indexOf(")", end)
    if (endIdx === -1) {
      throw new Error(`Unmatched ( in ${partName} : ${content.slice(charIdx, end)}`)
    }
    const lyricString = content.slice(end + 1, endIdx)
    lyrics = lyricString.split("+")
    end = endIdx + 1
  }

  return {
    symbol_type: "note",
    value: note,
    lyrics: lyrics ? lyrics.reduce((acc, lyric, idx) => {
      acc[(idx + 1).toString()] = lyric;
      return acc
    }, {} as { [key: string]: string }) : undefined,
    end
  }
}

function isSolfaStart(char: string): boolean {
  return validSolfaRegex.test(char)
}