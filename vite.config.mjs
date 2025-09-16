import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// When deploying to GitHub Pages at https://<user>.github.io/<repo>/
// set base to the repository name. This project is 'textal'.
export default defineConfig({
  base: '/textal/',
  plugins: [vue()]
})
