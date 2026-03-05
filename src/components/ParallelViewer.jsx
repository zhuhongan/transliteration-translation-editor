import React from 'react'
import './ParallelViewer.css'
import AutoResizeTextarea from './AutoResizeTextarea'

const ParallelViewer = ({ data, progress, onDataChange, onSplit, onMerge }) => {

    const handleCellChange = (rowIndex, column, value) => {
        const newData = [...data]
        newData[rowIndex][column] = value
        onDataChange(newData, rowIndex)
    }

    return (
        <div className="parallel-viewer">
            <div className="viewer-header">
                <div className="column-title oare-id-title">ID</div>
                <div className="column-title index-title">#</div>
                <div className="column-title">Transliteration</div>
                <div className="column-title">Translation</div>
                <div className="column-title length-title">Len</div>
            </div>
            <div className="viewer-content">
                {data.map((row, index) => {
                    const isEdited = progress[index]
                    return (
                        <div key={index} className={`row-pair ${isEdited ? 'edited-row' : ''}`}>
                            <div className="column oare-id-column">
                                {row.oare_id || '-'}
                            </div>
                            <div className="column index-column">
                                {index}
                                {isEdited && <span className="edit-indicator" title="Edited">•</span>}
                            </div>
                            <div className="column transliteration">
                                <AutoResizeTextarea
                                    className="cell-editor"
                                    value={row.transliteration || ''}
                                    onChange={(e) => handleCellChange(index, 'transliteration', e.target.value)}
                                    onSplit={(cursorPos) => onSplit && onSplit(index, 'transliteration', cursorPos)}
                                    onMerge={() => onMerge && onMerge(index)}
                                />
                            </div>
                            <div className="column translation">
                                <AutoResizeTextarea
                                    className="cell-editor"
                                    value={row.translation || ''}
                                    onChange={(e) => handleCellChange(index, 'translation', e.target.value)}
                                    onSplit={(cursorPos) => onSplit && onSplit(index, 'translation', cursorPos)}
                                    onMerge={() => onMerge && onMerge(index)}
                                />
                            </div>
                            <div className="column length-column">
                                <div>{row.transliteration ? row.transliteration.length : 0}</div>
                                <div>{row.translation ? row.translation.length : 0}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div >
    )
}

export default ParallelViewer
