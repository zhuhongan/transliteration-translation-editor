import { useState, useEffect } from 'react'
import './App.css'
import ParallelViewer from './components/ParallelViewer'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [progress, setProgress] = useState({}) // Map of index -> true

  // Load data and progress on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/load').then(res => res.json()),
      fetch('/api/progress').then(res => res.json())
    ])
      .then(([fetchedData, fetchedProgress]) => {
        setData(fetchedData)
        setProgress(fetchedProgress)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load data or progress')
        console.error(err)
        setLoading(false)
      })
  }, [])

  // Auto-save logic (debounced)
  useEffect(() => {
    if (loading) return

    const saveData = async () => {
      setSaveStatus('Saving...')
      try {
        const response = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Save failed')

        // Save progress as well
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress)
        })

        setSaveStatus('Saved')
        setTimeout(() => setSaveStatus(''), 2000)
      } catch (err) {
        setSaveStatus('Error saving')
        console.error(err)
      }
    }

    const timeoutId = setTimeout(() => {
      // Only save if data exists
      if (data.length > 0) {
        saveData()
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [data, progress, loading])

  const handleDataChange = (newData, rowIndex) => {
    setData(newData)

    // Mark row as edited
    if (!progress[rowIndex]) {
      setProgress(prev => ({
        ...prev,
        [rowIndex]: true
      }))
    }
  }

  const handleSplit = (rowIndex, column, cursorPosition) => {
    const list = [...data]
    const row = list[rowIndex]
    const textToSplit = row[column] || ''

    // 1. Split text
    const firstPart = textToSplit.slice(0, cursorPosition)
    const secondPart = textToSplit.slice(cursorPosition)

    // 2. Update current row
    list[rowIndex] = { ...row, [column]: firstPart }

    // 3. Option 2 logic: Check if next row exists and its target cell is empty
    const nextRow = list[rowIndex + 1]
    const isNextCellEmpty = nextRow && (!nextRow[column] || nextRow[column].trim() === '')

    if (isNextCellEmpty) {
      // Smart Autofill: Drop into next row's empty cell
      list[rowIndex + 1] = { ...nextRow, [column]: secondPart }
      setData(list)

      // Mark current and next row as edited
      setProgress(prev => ({
        ...prev,
        [rowIndex]: true,
        [rowIndex + 1]: true
      }))
    } else {
      // Original logic: Create an entirely new row
      const newRow = {
        id: row.id,
        transliteration: '',
        translation: '',
        [column]: secondPart
      }

      // Insert new row after current
      list.splice(rowIndex + 1, 0, newRow)
      setData(list)

      // Update progress: shift all subsequent indices down by 1
      const newProgress = {}
      for (const idxStr in progress) {
        const idx = parseInt(idxStr)
        if (idx <= rowIndex) {
          newProgress[idx] = true
        } else {
          newProgress[idx + 1] = true
        }
      }

      // Mark the split row and the new row as edited
      newProgress[rowIndex] = true
      newProgress[rowIndex + 1] = true
      setProgress(newProgress)
    }
  }

  const handleMerge = (rowIndex) => {
    // Check if next row exists
    if (rowIndex >= data.length - 1) return

    const list = [...data]
    const currentRow = list[rowIndex]
    const nextRow = list[rowIndex + 1]

    // Merge content
    const mergedRow = {
      ...currentRow,
      transliteration: (currentRow.transliteration || '') + ' ' + (nextRow.transliteration || ''),
      translation: (currentRow.translation || '') + ' ' + (nextRow.translation || '')
    }

    // Update current and remove next
    list[rowIndex] = mergedRow
    list.splice(rowIndex + 1, 1)

    setData(list)

    // Update progress: shift keys up
    const newProgress = {}

    // Copy progress for rows up to current
    for (const idxStr in progress) {
      const idx = parseInt(idxStr)
      if (idx < rowIndex) {
        newProgress[idx] = true
      } else if (idx > rowIndex + 1) {
        // Shift rows after the deleted one up by 1
        newProgress[idx - 1] = true
      }
    }

    // Mark merged row as edited
    newProgress[rowIndex] = true

    setProgress(newProgress)
  }

  const editedCount = Object.keys(progress).length
  const totalCount = data.length

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ flex: 1 }}>
            <h1>Parallel Text Viewer</h1>
            {!loading && <div className="progress-stat">Edited: {editedCount} / {totalCount} ({Math.round(editedCount / totalCount * 100 || 0)}%)</div>}
          </div>
          <div className="status-indicator">
            {saveStatus && <span className={`status ${saveStatus === 'Error saving' ? 'error' : ''}`}>{saveStatus}</span>}
          </div>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <main>
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : (
          <ParallelViewer
            data={data}
            progress={progress}
            onDataChange={handleDataChange}
            onSplit={handleSplit}
            onMerge={handleMerge}
          />
        )}
      </main>
    </div>
  )
}

export default App
