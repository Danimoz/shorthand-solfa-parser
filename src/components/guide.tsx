export default function Guide() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold">Basic Symbols</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <code className="rounded bg-muted px-1">d, r, m, f, s, l, t</code> - Solfa syllables (do, re, mi, fa, sol, la, ti)
            </li>
            <li>
              <code className="rounded bg-muted px-1">dₗ, rₗ, m₂</code> - Lower octave notes
            </li>
            <li>
              <code className="rounded bg-muted px-1">d&apos;, r″, m²</code> - Upper octave notes
            </li>
            <li>
              <code className="rounded bg-muted px-1">:</code> - Separator (sep_colon)
            </li>
            <li>
              <code className="rounded bg-muted px-1">.</code> - Dot (dot)
            </li>
            <li>
              <code className="rounded bg-muted px-1">-</code> - Extend (extend)
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Special Notations</h3>
          <ul className="space-y-1 text-sm">
            <li><code className="rounded bg-muted px-1">m(word)</code> - Note with lyrics</li>
            <li><code className="rounded bg-muted px-1">~m</code> - Slur start</li>
            <li><code className="rounded bg-muted px-1">m~</code> - Slur end. If there&apos;s a lyric, put the tilde(~) after the lyric</li>
            <li><code className="rounded bg-muted px-1">[mf]d</code> - Dynamic on note (e.g., mf, p, f)</li>
            <li><code className="rounded bg-muted px-1">d(word)&#123;m&#125;</code> - Divisi: main note with lyrics and alternative note</li>
            <li><code className="rounded bg-muted px-1">*</code><em>mod*</em> - Key modulation (e.g., *G*)</li>
            <li><code className="rounded bg-muted px-1">#</code><em>num/num</em> - Meter change (e.g., #3/4)</li>
            <li><code className="rounded bg-muted px-1">@</code><em>key</em> - Key signature (e.g., @Eb)</li>
            <li><code className="rounded bg-muted px-1">+</code> - Multi line lyric m(Show + Serve)</li>
            <li><code className="rounded bg-muted px-1">|</code> - Barline</li>
            <li><code className="rounded bg-muted px-1">||</code> - Double barline</li>
          </ul>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <div>
          <h3 className="mb-2 font-semibold">Repeats</h3>
          <ul className="space-y-1 text-sm">
            <li><code className="rounded bg-muted px-1">&1</code> - First ending</li>
            <li><code className="rounded bg-muted px-1">&2</code> - Second ending</li>
            <li><code className="rounded bg-muted px-1">$</code> - Segno (return point)</li>
            <li><code className="rounded bg-muted px-1">DS</code> - Dal Segno (go to Segno)</li>
            <li><code className="rounded bg-muted px-1">DC</code> - Da Capo (go to beginning)</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Notes</h3>
          <p className="text-sm text-muted-foreground">
            Use parentheses for lyrics, brackets for dynamics, tildes (~) for slurs, and curly braces &#123;&#125; for divisi notes.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="mb-2 font-semibold">Example Notation</h3>
        <pre className="rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
          {`S.  [mf]d(see){m} : ~r(the) : m(sun)~ | f : - : [p]s : - | l : t : d ||
A.  d(shine) : - : ~m(so) | f(bright)~ : s : l : - | t : d : r ||
T.  ~m(on) : f : s(me)~ | l : - : [f]d : - | r : m : f ||
B.  d(uh) : x : mₗ(uh) : x | s : l . t : &1 d : - : $ || &2 r : m : f || #3/4 @F`}
        </pre>
      </div>
    </>
  )
}