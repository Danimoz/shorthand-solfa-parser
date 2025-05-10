export const partMap : {[key: string]: string }  = {
  S: "Soprano",
  A: "Alto",
  T: "Tenor",
  B: "Bass",
  S1 : "Soprano 1",
  S2 : "Soprano 2",
  S3 : "Soprano 3",
  MS : "Mezzo Soprano",
  A1 : "Alto 1",
  A2 : "Alto 2",
  A3 : "Alto 3",
  T1 : "Tenor 1",
  T2 : "Tenor 2",
  T3 : "Tenor 3",
  B1 : "Bass 1",
  B2 : "Bass 2",
  B3 : "Bass 3",
  Bar : "Baritone",
}

// Regexes
export const octaveRegex = /['₂ₗ²″]/;
export const validSolfaRegex = /^(d|de|ra|r|re|ma|m|f|fe|ba|s|se|sa|l|le|la|t|ta)(['₂ₗ²″]*)?$/i;

// Repeat Map
export const repeatMap = {
  "1" : "first",
  "2" : "second",
  "3" : "third"
}
