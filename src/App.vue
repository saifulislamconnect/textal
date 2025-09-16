<template>
  <div>
    <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-2 brand-title" href="#">
          <span class="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary fw-bold" style="width:32px;height:32px">
            Tx
          </span>
          <span>Text Analyzer Ultimate</span>
          <span class="badge text-bg-secondary ms-2">Textal</span>
        </a>
        <div class="d-flex align-items-center gap-2 ms-auto">
          <div class="dropdown me-1">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Theme</button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><button class="dropdown-item" @click="setTheme('dark')">Dark</button></li>
              <li><button class="dropdown-item" @click="setTheme('light')">Light</button></li>
              <li><button class="dropdown-item" @click="setTheme('auto')">Auto</button></li>
            </ul>
          </div>
          <button class="btn btn-sm btn-primary" @click="exportJSON">Export</button>
        </div>
      </div>
    </nav>

    <main class="container py-4">
      <div class="row g-4">
        <aside class="col-lg-4 col-xl-4 order-lg-3">
          <div class="floating-tools">
            <div class="card shadow-soft stat-card mb-3 fade-enter">
              <div class="card-header d-flex align-items-center justify-content-between">
                <span class="fw-semibold">Live Stats</span>
                <span class="badge rounded-pill text-bg-info">Realtime</span>
              </div>
              <div class="card-body grid cols-3">
                <div><div class="text-secondary">Chars</div><div class="stat-value monosmall">{{ fmt(stats.chars) }}</div></div>
                <div><div class="text-secondary">Words</div><div class="stat-value monosmall">{{ fmt(stats.words) }}</div></div>
                <div><div class="text-secondary">Lines</div><div class="stat-value monosmall">{{ fmt(stats.lines) }}</div></div>
                <div><div class="text-secondary">Graphemes</div><div class="stat-value monosmall">{{ fmt(stats.graphemes) }}</div></div>
                <div><div class="text-secondary">Sentences</div><div class="stat-value monosmall">{{ fmt(stats.sentences) }}</div></div>
                <div><div class="text-secondary">Paragraphs</div><div class="stat-value monosmall">{{ fmt(stats.paragraphs) }}</div></div>
                <div><div class="text-secondary">Avg word</div><div class="stat-value monosmall">{{ stats.avgWordLen.toFixed(2) }}</div></div>
                <div><div class="text-secondary">Unique</div><div class="stat-value monosmall">{{ fmt(stats.uniqueWords) }}</div></div>
                <div><div class="text-secondary">Reading time</div><div class="stat-value monosmall">{{ stats.readTime }}</div></div>
                <div><div class="text-secondary">Byte size</div><div class="stat-value monosmall">{{ stats.byteSize }}</div></div>
                <div><div class="text-secondary">Whitespace</div><div class="stat-value monosmall">{{ fmt(stats.whitespace) }}</div></div>
                <div><div class="text-secondary">Longest</div><div class="stat-value monosmall">{{ stats.longestWord || '–' }}</div></div>
              </div>
            </div>

            <div class="card shadow-soft stat-card mb-3 fade-enter">
              <div class="card-header d-flex align-items-center justify-content-between">
                <span class="fw-semibold">Character Classes</span>
                <span class="badge text-bg-secondary">Breakdown</span>
              </div>
              <div class="card-body grid cols-4">
                <div><div class="text-secondary">Letters</div><div class="stat-value monosmall">{{ fmt(stats.letters) }}</div></div>
                <div><div class="text-secondary">Digits</div><div class="stat-value monosmall">{{ fmt(stats.digits) }}</div></div>
                <div><div class="text-secondary">Punct.</div><div class="stat-value monosmall">{{ fmt(stats.punct) }}</div></div>
                <div><div class="text-secondary">Symbols</div><div class="stat-value monosmall">{{ fmt(stats.symbols) }}</div></div>
                <div><div class="text-secondary">Spaces</div><div class="stat-value monosmall">{{ fmt(stats.spaces) }}</div></div>
                <div><div class="text-secondary">Tabs</div><div class="stat-value monosmall">{{ fmt(stats.tabs) }}</div></div>
                <div><div class="text-secondary">Newlines</div><div class="stat-value monosmall">{{ fmt(stats.newlines) }}</div></div>
                <div><div class="text-secondary">ASCII</div><div class="stat-value monosmall">{{ fmt(stats.ascii) }}</div></div>
              </div>
            </div>

            <div class="card shadow-soft stat-card fade-enter">
              <div class="card-header d-flex align-items-center justify-content-between">
                <span class="fw-semibold">Top Words</span>
                <span class="badge text-bg-warning">Frequency</span>
              </div>
              <div class="card-body">
                <ol class="list-unstyled list-freq small" aria-live="polite">
                  <li v-for="(c, idx) in freq" :key="idx" class="d-flex justify-content-between"><code>{{ c[0] }}</code><span class="badge text-bg-secondary badge-min">{{ fmt(c[1]) }}</span></li>
                </ol>
              </div>
            </div>
          </div>
        </aside>

        <section class="col-lg-8 col-xl-8 order-lg-1">
          <div class="card shadow-soft stat-card">
            <div class="card-header d-flex flex-wrap align-items-center gap-2">
              <span class="fw-semibold"><span class="badge text-bg-secondary ms-2">Textal</span></span>
              <span class="ms-auto d-flex align-items-center gap-2">
                <span class="text-secondary quick-tip d-none d-md-inline">Tips: <span class="kbd">Ctrl/Cmd + Enter</span> inserts newline · <span class="kbd">Ctrl/Cmd + B</span> toggles theme</span>
                <button class="btn btn-sm btn-outline-secondary" @click="loadSample">Sample</button>
                <button class="btn btn-sm btn-outline-secondary" @click="clear">Clear</button>
                <label class="btn btn-sm btn-outline-secondary mb-0">
                  Import <input ref="fileInput" type="file" accept=".txt,.md,.csv,.json" hidden @change="onFileImport">
                </label>
                <button class="btn btn-sm btn-primary" @click="copy">Copy Text</button>
              </span>
            </div>
            <div class="card-body textarea-wrap">
              <textarea v-model="text" spellcheck="false" rows="8" class="form-control" placeholder="Paste or start typing…" @input="analyze" @keyup="updateCursorPos" @click="updateCursorPos" ref="inputEl"></textarea>
              <div class="d-flex justify-content-between mt-2 small text-secondary">
                <div>
                  <span class="me-3">Language guess: <span class="badge rounded-pill text-bg-secondary">{{ langGuess }}</span></span>
                  <span class="me-3">Encoding: <span class="badge rounded-pill text-bg-secondary">UTF‑8</span></span>
                  <span>Last saved: <span class="monosmall">{{ lastSaved }}</span></span>
                </div>
                <div class="monosmall">{{ cursorPos }}</div>
              </div>
            </div>
          </div>

          <div class="row g-3 mt-3">
            <div class="col-12 col-xl-6">
              <div class="card stat-card h-100 shadow-soft">
                <div class="card-header fw-semibold">Details</div>
                <div class="card-body">
                  <dl class="row mb-0 small">
                    <dt class="col-sm-5">Trimmed characters</dt><dd class="col-sm-7 monosmall">{{ fmt(details.trimmedChars) }}</dd>
                    <dt class="col-sm-5">Non-whitespace characters</dt><dd class="col-sm-7 monosmall">{{ fmt(details.nonWsChars) }}</dd>
                    <dt class="col-sm-5">Average line length</dt><dd class="col-sm-7 monosmall">{{ details.avgLineLen.toFixed(2) }}</dd>
                    <dt class="col-sm-5">Median word length</dt><dd class="col-sm-7 monosmall">{{ fmt(details.medianWordLen) }}</dd>
                    <dt class="col-sm-5">Longest line length</dt><dd class="col-sm-7 monosmall">{{ fmt(details.longestLine) }}</dd>
                    <dt class="col-sm-5">Shortest line length</dt><dd class="col-sm-7 monosmall">{{ fmt(details.shortestLine) }}</dd>
                    <dt class="col-sm-5">Estimated syllables</dt><dd class="col-sm-7 monosmall">{{ fmt(details.syllables) }}</dd>
                    <dt class="col-sm-5">Flesch Reading Ease*</dt><dd class="col-sm-7 monosmall">{{ details.fleschDisplay }}</dd>
                  </dl>
                  <p class="text-secondary small mt-2 mb-0">*English heuristic. For non-English text this may be meaningless.</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-xl-6">
              <div class="card stat-card h-100 shadow-soft">
                <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
                  <span>Word Length Distribution</span>
                  <div>
                    <button class="btn btn-sm btn-outline-secondary" @click="downloadCSV">Download CSV</button>
                  </div>
                </div>
                <div class="card-body">
                  <div class="progress" role="progressbar" aria-label="Word length distribution">
                    <div v-for="(bar, idx) in progressBars" :key="idx" class="progress-bar" :class="bar.color" :style="{width: bar.pct+'%'}" :title="bar.title"></div>
                  </div>
                  <ul class="list-inline small mt-3 mb-0">
                    <li v-for="(l, idx) in legend" :key="idx" class="list-inline-item monosmall">{{ l }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="alert alert-info mt-3" role="alert">
            <strong>Privacy:</strong> All processing is done locally in your browser. Nothing is uploaded.
          </div>
        </section>
      </div>
    </main>

    <footer class="container py-4 text-center text-secondary small">
      Built with <span class="text-danger">♥</span> with vite & bootstrap by Saiful Islam. Keyboard: <span class="kbd">Ctrl/Cmd + B</span> theme · <span class="kbd">Ctrl/Cmd + L</span> clear · <span class="kbd">Ctrl/Cmd + S</span> export.
    </footer>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAnalyzer } from './composables/useAnalyzer'

export default {
  setup(){
    const text = ref('')
    const { analyzeText, collectAll, helpers } = useAnalyzer()
    const stats = reactive({ ...helpers.emptyStats })
    const details = reactive({ trimmedChars:0, nonWsChars:0, avgLineLen:0, medianWordLen:0, longestLine:0, shortestLine:0, syllables:0, fleschDisplay:'–' })
    const freq = ref([])
    const progressBars = ref([])
    const legend = ref([])
    const lastSaved = ref('—')
    const langGuess = ref('n/a')
    const cursorPos = ref('Ln 1, Col 1')
    const inputEl = ref(null)
    const fileInput = ref(null)

    function fmt(n){ return new Intl.NumberFormat().format(n) }

    function updateUI(result){
      Object.assign(stats, result.stats)
      details.trimmedChars = result.details.trimmedChars
      details.nonWsChars = result.details.nonWsChars
      details.avgLineLen = result.details.avgLineLen
      details.medianWordLen = result.details.medianWordLen
      details.longestLine = result.details.longestLine
      details.shortestLine = result.details.shortestLine
      details.syllables = result.details.syllables
      details.fleschDisplay = result.details.flesch === null ? '–' : result.details.flesch.toFixed(1)
      freq.value = result.top
      progressBars.value = result.progressBars
      legend.value = result.legend
      langGuess.value = result.langGuess
      lastSaved.value = new Date().toLocaleString()
      localStorage.setItem('textAnalyzer.content', text.value)
    }

    function analyze(){
      const result = analyzeText(text.value)
      updateUI(result)
      updateCursorPos()
    }

    function updateCursorPos(){
      const el = inputEl.value
      if(!el) return
      const pos = el.selectionStart || 0
      const till = el.value.slice(0, pos)
      const line = (till.match(/\n/g)||[]).length + 1
      const col = pos - till.lastIndexOf('\n')
      cursorPos.value = `Ln ${line}, Col ${col}`
    }

    function copy(){
      navigator.clipboard.writeText(text.value).then(()=> helpers.flash('Copied to clipboard'))
    }

    function clear(){ text.value = ''; analyze(); helpers.flash('Cleared') }
    function loadSample(){ text.value = `Highly-powered, privacy-friendly text analyzer.\n\n• Counts: characters, words, lines, sentences, paragraphs, graphemes (emoji-safe).\n• Breakdown: letters, digits, punctuation, symbols, spaces, tabs, newlines, ASCII.\n• Extras: reading time, byte size, averages, medians, word-length distribution, top words.\n\nবাংলা, العربية, русский — mixed scripts supported (basic heuristics).`; analyze() }

    function exportJSON(){
      const data = collectAll(text.value)
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'text-analysis.json'; a.click(); URL.revokeObjectURL(url)
    }

    function downloadCSV(){ helpers.downloadWordLenCSV(text.value) }

    function onFileImport(e){
      const file = e.target.files && e.target.files[0]
      if(!file) return
      const reader = new FileReader()
      reader.onload = ev => { text.value = ev.target.result; analyze(); helpers.flash('File imported') }
      reader.readAsText(file)
      e.target.value = ''
    }

    onMounted(()=>{
      const saved = localStorage.getItem('textAnalyzer.content')
      if(saved) text.value = saved
      const theme = localStorage.getItem('textAnalyzer.theme') || 'dark'
      setTheme(theme)
      analyze()

      // keyboard shortcuts
      window.addEventListener('keydown', (e)=>{
        const cmd = e.ctrlKey || e.metaKey
        if(cmd && e.key.toLowerCase()==='b'){ e.preventDefault(); const cur = localStorage.getItem('textAnalyzer.theme') || 'light'; setTheme(cur==='dark' ? 'light' : 'dark') }
        if(cmd && e.key.toLowerCase()==='l'){ e.preventDefault(); text.value=''; analyze() }
        if(cmd && e.key.toLowerCase()==='s'){ e.preventDefault(); exportJSON() }
        if(cmd && e.key === 'Enter'){ e.preventDefault(); const start = inputEl.value.selectionStart; inputEl.value.setRangeText('\n', start, start, 'end'); text.value = inputEl.value.value; analyze() }
      })
    })

    function setTheme(mode){
      document.documentElement.setAttribute('data-bs-theme', mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode)
      localStorage.setItem('textAnalyzer.theme', mode)
    }

    return { text, stats, details, fmt, freq, progressBars, legend, lastSaved, langGuess, cursorPos, inputEl, fileInput, analyze, updateCursorPos, copy, clear, loadSample, onFileImport, exportJSON, downloadCSV, setTheme }
  }
}
</script>
