export type SolfaSymbol = {
  symbol_type: string
  value: string
  lyrics?: { [key: string]: string }
  slurStart?: boolean
  slurEnd?: boolean
  dynamic?: string
  div_note?: string
  mod_note?: string
  fermata?: boolean
}

export interface SimpleSymbol {
  symbol_type: string
  value: string
}

export interface Parts {
  [key: string]: SolfaSymbol[]
}

export interface Measures {
  number: number
  parts: Parts
  repeats?: SimpleSymbol
  barline: SimpleSymbol
  meter?: string
  key?: string
}

export interface Project {
  id?: number
  title: string
  composer?: string
  key?: string
  time?: string
  tempoText?: string
  tempoBpm?: string
  measures?: Measures[]
}