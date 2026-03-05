import React, { useEffect, useRef } from 'react';

const AutoResizeTextarea = ({ value, onChange, onSplit, onMerge, className }) => {
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            // Call split with current cursor position
            if (onSplit && textareaRef.current) {
                onSplit(textareaRef.current.selectionStart);
            }
        } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'm' || e.key === 'M')) {
            e.preventDefault();
            if (onMerge) {
                onMerge();
            }
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            className={className}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ overflow: 'hidden' }}
        />
    );
};

export default AutoResizeTextarea;
