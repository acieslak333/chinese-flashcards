import React, { useState, useRef, useEffect } from 'react';

const SelectableText = ({ text, onSelectionChange, className = '', isActiveSelection }) => {
    const [selection, setSelection] = useState(null); // { start: number, end: number }
    const containerRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartIndex = useRef(null);
    const componentId = useRef(Math.random().toString(36).substr(2, 9));

    // Reset selection when text changes or when external selection mismatches
    useEffect(() => {
        // If there is no global active selection, OR if the active selection is not from this component, clear local.
        if (!isActiveSelection || isActiveSelection.componentId !== componentId.current) {
            setSelection(null);
        }
    }, [text, isActiveSelection]);

    const getIndexFromPoint = (x, y) => {
        const element = document.elementFromPoint(x, y);
        if (element && element.dataset.index !== undefined) {
            return parseInt(element.dataset.index, 10);
        }
        return null;
    };

    const handlePointerDown = (e) => {
        // Only left click or touch
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        e.preventDefault(); // Prevent native selection
        e.stopPropagation(); // Prevent parent swipe handlers

        const index = getIndexFromPoint(e.clientX, e.clientY);

        if (index !== null) {
            isDragging.current = true;
            dragStartIndex.current = index;
            setSelection({ start: index, end: index });
            e.currentTarget.setPointerCapture(e.pointerId);

            // Notify clear previous selection if any
            if (onSelectionChange) onSelectionChange(null);
        }
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        e.stopPropagation(); // Prevent parent swipe handlers

        const index = getIndexFromPoint(e.clientX, e.clientY);
        if (index !== null) {
            const start = Math.min(dragStartIndex.current, index);
            const end = Math.max(dragStartIndex.current, index);

            // Only update if changed prevents unnecessary renders, but React handles this mostly
            setSelection({ start, end });
        }
    };

    const handlePointerUp = (e) => {
        if (!isDragging.current) return;
        e.stopPropagation(); // Prevent parent swipe handlers

        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);

        if (selection && onSelectionChange) {
            // Calculate rect for popup positioning
            // We use the end character's rect or the middle of selection? 
            // Usually popup is over the selection.
            // Let's get the range of elements.

            // However, usually we want to send the text selection to the parent.
            const selectedText = text.substring(selection.start, selection.end + 1);

            // Get the bounding box of the selection
            // We can approximate it by getting the rect of the start and end indices, 
            // but for multi-line logic it's complex.
            // For flashcards, it's usually single line or wrapped.
            // Let's get the rect of the last selected character for simple popup positioning.

            // Calculate rect for popup positioning based on the entire selection
            // We want the visual center of the selected block.
            // Since we use spans, we can find all selected spans and calculate the union rect.

            const selectedSpans = containerRef.current.querySelectorAll(`span[data-index]`);
            let minTop = Infinity;
            let maxBottom = -Infinity;
            let minLeft = Infinity;
            let maxRight = -Infinity;
            let found = false;

            selectedSpans.forEach(span => {
                const idx = parseInt(span.dataset.index, 10);
                if (idx >= selection.start && idx <= selection.end) {
                    const r = span.getBoundingClientRect();
                    if (r.top < minTop) minTop = r.top;
                    if (r.bottom > maxBottom) maxBottom = r.bottom;
                    if (r.left < minLeft) minLeft = r.left;
                    if (r.right > maxRight) maxRight = r.right;
                    found = true;
                }
            });

            if (found && selectedText) {
                const unionRect = {
                    top: minTop,
                    bottom: maxBottom,
                    left: minLeft,
                    right: maxRight,
                    width: maxRight - minLeft,
                    height: maxBottom - minTop
                };

                onSelectionChange({
                    text: selectedText,
                    rect: unionRect,
                    selectionRange: selection,
                    componentId: componentId.current
                });
            } else {
                onSelectionChange(null);
                setSelection(null); // Clicked but no valid selection? 
            }
        }
    };

    // Allow parent to clear selection passed via prop or ref?
    // Actually, usually parent controls single source of truth, 
    // but here we keep local state for performance during drag, 
    // and notify parent on completion. 
    // If parent wants to clear, we might need a way.
    // Let's just expose a ref or effect if needed. 
    // For now, if we want to clear from outside (clicking background), 
    // we can pass a prop `externalSelection`? 
    // Start simple: this component manages the drag visualization.
    // If the global app clears selection, this component should probably reflect that.
    // But implementation plan says "Clear Selection: In App.js... set customSelection to null".
    // Does SelectableText need to know? Yes, to remove the highlights.

    // Let's add a `forceClear` prop or just use a ref method. 
    // Or simpler: lift state entirely? No, performance on drag might suffer.
    // Better: `isActive` prop? 
    // Or just expose a method via `useImperativeHandle` or watch a `resetTrigger` prop.

    // Let's try watching a prop `isSelected`.
    // If we have multiple SelectableTexts, valid point.
    // But strict requirement: "Click-to-Clear".

    // Maybe we just assume if the parent selection is null, we should clear?
    // Let's add a prop `clearSelectionTrigger` (timestamp or bool toggle).

    return (
        <div
            ref={containerRef}
            data-component="selectable-text"
            className={`cursor-text select-none touch-none inline-flex flex-wrap justify-center font-bold no-swipe ${className}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            // Explicitly stop touch propagation to prevent react-swipeable from seeing these events
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            {text.split('').map((char, i) => {
                const isSelected = selection && i >= selection.start && i <= selection.end;
                const isSelectionStart = selection && i === selection.start;
                const isSelectionEnd = selection && i === selection.end;

                // Determine rounded corners for merged, contiguous look
                let roundedClass = 'rounded-none';
                if (isSelected) {
                    if (selection.start === selection.end) {
                        roundedClass = 'rounded-md';
                    } else if (isSelectionStart) {
                        roundedClass = 'rounded-l-md';
                    } else if (isSelectionEnd) {
                        roundedClass = 'rounded-r-md';
                    }
                }

                return (
                    <span
                        key={i}
                        data-index={i}
                        className={`inline-block transition-colors duration-300 px-0.5 leading-snug ${isSelected
                            ? `bg-accent text-secondary relative z-10 ${roundedClass}`
                            : ''
                            }`}
                        style={{
                            // Ensure spaces function correctly but don't break the block heavily
                            minWidth: char === ' ' ? '0.3em' : 'auto'
                        }}
                    >
                        {char}
                    </span>
                );
            })}
        </div>
    );
};

export default SelectableText;
