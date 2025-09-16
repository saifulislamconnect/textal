// Analyzer composable - ported from original index.html logic
export function useAnalyzer(){
  const helpers = {
    emptyStats: { chars:0, words:0, lines:0, graphemes:0, sentences:0, paragraphs:0, avgWordLen:0, longestWord:'', uniqueWords:0, readTime:'0s', byteSize:'0 B', whitespace:0, letters:0, digits:0, punct:0, symbols:0, spaces:0, tabs:0, newlines:0, ascii:0 },
    fmt: n => new Intl.NumberFormat().format(n),
    flash: msg => {
      const toast = document.createElement('div')
      toast.className = 'toast align-items-center text-bg-success border-0 position-fixed start-50 translate-middle-x mt-3 z-3'
      toast.setAttribute('role', 'alert')
      toast.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`
      document.body.appendChild(toast)
      const t = new bootstrap.Toast(toast, { delay: 1500 })
      t.show()
      toast.addEventListener('hidden.bs.toast', ()=> toast.remove())
    },
    downloadWordLenCSV: (text) => {
      const WORD_RE = /[\p{L}\p{N}]+(?:[\-''][\p{L}\p{N}]+)*/gu
      const words = text.match(WORD_RE) || []
      const wordLens = words.map(w => [...w].length)
      const dist = {}
      for (const len of wordLens){ dist[len] = (dist[len]||0)+1 }
      const rows = Object.entries(dist).sort((a,b)=>a[0]-b[0]).map(([len,count])=>({length: len, count}))
      const keys = Object.keys(rows[0]||{length:'length',count:'count'})
      const esc = v => '"'+String(v).replace(/"/g,'""')+'"'
      const csv = rows.length ? [keys.join(','), ...rows.map(r=> keys.map(k=>esc(r[k])).join(','))].join('\n') : ''
      const blob = new Blob([csv], {type:'text/csv'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'word-length-distribution.csv'; a.click(); URL.revokeObjectURL(url)
    }
  }

  const WORD_RE = /[\p{L}\p{N}]+(?:[\-''][\p{L}\p{N}]+)*/gu
  const LETTER_RE = /\p{L}/gu
  const DIGIT_RE = /\p{N}/gu
  const PUNCT_RE = /\p{P}/gu
  const SYMBOL_RE = /\p{S}/gu

  function graphemesOf(str){
    if (typeof Intl !== 'undefined' && Intl.Segmenter){
      const seg = new Intl.Segmenter(undefined, {granularity:'grapheme'})
      return Array.from(seg.segment(str), s => s.segment)
    }
    return Array.from(str)
  }

  function sentencesOf(str){
    const abbr = /(e\.g\.|i\.e\.|mr\.|mrs\.|dr\.|vs\.|etc\.|u\.s\.)/i
    // Simplified sentence splitter: split on sentence ending punctuation followed by whitespace and uppercase
    return str
      .replace(/([?!\.]+)(\s+)(?=[A-ZА-ЯЁÑÖÜÍÁÉÍÓÚÄÔİ])/g, '$1\n')
      .split(/\n+/)
      .map(s => s.trim())
      .filter(s => s.length && !abbr.test(s))
  }

  function paragraphsOf(str){ return str.split(/\n{2,}/).map(p => p.trim()).filter(Boolean) }

  function median(arr){ if(!arr.length) return 0; const s = [...arr].sort((a,b)=>a-b); const mid = Math.floor(s.length/2); return s.length%2 ? s[mid] : (s[mid-1]+s[mid])/2 }

  function syllableEstimate(word){ if(!word) return 0; const w = word.toLowerCase(); const m = w.replace(/e$/,'').match(/[aeiouy]+/g); return Math.max(1, m ? m.length : 0) }

  function detectLanguageLite(text){ const scripts = { Bengali: /[\u0980-\u09FF]/, Latin: /[A-Za-z]/, Cyrillic: /[\u0400-\u04FF]/, Arabic: /[\u0600-\u06FF]/, Devanagari: /[\u0900-\u097F]/ }; for (const [name, re] of Object.entries(scripts)){ if (re.test(text)) return name } return text.trim() ? 'Unknown' : 'n/a' }

  function humanBytes(n){ if (n < 1024) return `${n} B`; const units = ['KB','MB','GB']; let u = -1; do { n = n/1024; u++ } while (n >= 1024 && u < units.length-1); return `${n.toFixed(2)} ${units[u]}` }

  function analyzeText(text){
    const lines = text.split(/\n/)
    const words = text.match(WORD_RE) || []
    const wordLens = words.map(w => [...w].length)
    const graphemes = graphemesOf(text)
    const sentences = sentencesOf(text)
    const paragraphs = paragraphsOf(text)

    const letters = (text.match(LETTER_RE)||[]).length
    const digits = (text.match(DIGIT_RE)||[]).length
    const punct = (text.match(PUNCT_RE)||[]).length
    const symbols = (text.match(SYMBOL_RE)||[]).length
    const spaces = (text.match(/ /g)||[]).length
    const tabs = (text.match(/\t/g)||[]).length
    const newlines = lines.length - 1
    const ascii = (text.match(/[\x00-\x7F]/g)||[]).length
    const nonWs = (text.replace(/\s/g,'').length)

    const longestWord = words.reduce((a,b)=> b.length>a.length?b:a, '')
    const avgWordLen = words.length ? (wordLens.reduce((a,b)=>a+b,0)/words.length) : 0
    const medWordLen = median(wordLens)

    const lineLens = lines.map(l => l.length)
    const avgLineLen = lines.length ? (lineLens.reduce((a,b)=>a+b,0)/lines.length) : 0
    const longestLine = Math.max(0, ...lineLens)
    const shortestLine = lines.length ? Math.min(...lineLens) : 0

    const byteSize = new Blob([text]).size
    const readTimeSeconds = Math.round((words.length / 200) * 60)

    const freq = new Map()
    for(const w of words){ const key = w.toLowerCase(); freq.set(key, (freq.get(key)||0)+1) }
    const top = [...freq.entries()].sort((a,b)=> b[1]-a[1]).slice(0,10)

    const syllables = words.reduce((sum, w)=> sum + syllableEstimate(w), 0)
    const sentCount = Math.max(1, sentences.length)
    const flesch = words.length && sentences.length ? (206.835 - 1.015 * (words.length / sentCount) - 84.6 * (syllables / words.length)) : null

    // distribution
    const dist = {}
    for (const len of wordLens){ dist[len] = (dist[len]||0)+1 }
    const entries = Object.entries(dist).sort((a,b)=> Number(a[0])-Number(b[0]))
    const total = wordLens.length || 1
    const progressBars = []
    const legend = []
    entries.forEach(([len,count], idx)=>{
      const pct = Math.max(0.5, (count/total)*100)
      const color = ['bg-primary','bg-success','bg-info','bg-warning','bg-danger','bg-secondary'][idx % 6]
      progressBars.push({ pct, color, title: `${count} words of length ${len}` })
      legend.push(`${len}: ${new Intl.NumberFormat().format(count)}`)
    })

    return {
      stats: {
        chars: text.length,
        words: words.length,
        lines: lines.length,
        graphemes: graphemes.length,
        sentences: sentences.length,
        paragraphs: paragraphs.length,
        avgWordLen,
        longestWord,
        uniqueWords: freq.size,
        readTime: readTimeSeconds ? (readTimeSeconds<60 ? `${readTimeSeconds}s` : `${(readTimeSeconds/60).toFixed(1)} min`) : '0s',
        byteSize: humanBytes(byteSize),
        whitespace: text.length - nonWs,
        letters, digits, punct, symbols, spaces, tabs, newlines, ascii
      },
      top,
      details: {
        trimmedChars: text.trim().length,
        nonWsChars: nonWs,
        avgLineLen,
        medianWordLen: medWordLen,
        longestLine,
        shortestLine,
        syllables,
        flesch
      },
      progressBars,
      legend,
      langGuess: detectLanguageLite(text)
    }
  }

  function collectAll(text){
    const lines = text.split(/\n/)
    const words = text.match(WORD_RE) || []
    const graphemes = graphemesOf(text)
    return {
      chars: text.length,
      words: words.length,
      lines: lines.length,
      graphemes: graphemes.length,
      sentences: sentencesOf(text).length,
      paragraphs: paragraphsOf(text).length,
      byteSize: new Blob([text]).size,
      letters: (text.match(LETTER_RE)||[]).length,
      digits: (text.match(DIGIT_RE)||[]).length,
      punctuation: (text.match(PUNCT_RE)||[]).length,
      symbols: (text.match(SYMBOL_RE)||[]).length,
      spaces: (text.match(/ /g)||[]).length,
      tabs: (text.match(/\t/g)||[]).length,
      newlines: lines.length-1,
      ascii: (text.match(/[\x00-\x7F]/g)||[]).length,
      languageGuess: detectLanguageLite(text),
      sample: text.slice(0, 120)
    }
  }

  return { analyzeText, collectAll, helpers }
}
