import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

// Custom plugin to handle file I/O
const csvServerPlugin = () => {
  return {
    name: 'csv-server-plugin',
    configureServer(server) {
      server.middlewares.use('/api/load', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const filePath = path.resolve(__dirname, '../train.csv')
            if (fs.existsSync(filePath)) {
              const fileContent = fs.readFileSync(filePath, 'utf-8')
              Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  res.setHeader('Content-Type', 'application/json; charset=utf-8')
                  res.end(JSON.stringify(results.data))
                },
                error: (err) => {
                  res.statusCode = 500
                  res.end(JSON.stringify({ error: err.message }))
                }
              })
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'File not found' }))
            }
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
        } else {
          next()
        }
      })

      server.middlewares.use('/api/save', (req, res, next) => {
        if (req.method === 'POST') {
          let chunks = []
          req.on('data', chunk => {
            chunks.push(chunk)
          })
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf-8')
              const data = JSON.parse(body)
              const csv = Papa.unparse(data)
              const filePath = path.resolve(__dirname, '../train.csv')
              fs.writeFileSync(filePath, csv, 'utf-8')
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ success: true }))
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } else {
          next()
        }
      })

      // Progress API
      server.middlewares.use('/api/progress', (req, res, next) => {
        const progressPath = path.resolve(__dirname, '../progress.json')

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(progressPath)) {
              const content = fs.readFileSync(progressPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(content)
            } else {
              // Default to empty object if no progress file exists
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({}))
            }
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
        } else if (req.method === 'POST') {
          let chunks = []
          req.on('data', chunk => {
            chunks.push(chunk)
          })
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf-8')
              // Ensure we just write what we get (should be JSON)
              fs.writeFileSync(progressPath, body, 'utf-8')
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ success: true }))
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), csvServerPlugin()],
})
