import React from 'react';
import chineseData from '../data/chinese.json'; // Importing data to look up definitions

const SelectionPopup = ({ selection, onClose }) => {
    if (!selection || !selection.text) return null;

    // Filter dictionary for the selected text
    // Exact match first, then partial matches?
    // For now, let's find exact match or contains.
    // The flashcards data is `chineseData`. 
    // Structure: { chiński, pinyin, polskie_znaczenie, ... }

    const matches = chineseData.filter(card =>
        card.chiński === selection.text ||
        // Also useful to show if the selection is a substring of a word? 
        // Or if the selection *contains* a word?
        // Usually dictionary looks up the exact term selected.
        card.chiński.includes(selection.text)
    ).slice(0, 3); // Limit to 3 matches

    // If no exact/partial matches in card phrases, maybe it's just a single char?
    // The generic dictionary might be needed, but we only have `chinese.json` which are flashcards.
    // If no matches found in flashcards, we can't show much unless we have a dictionary API.
    // For this task, we'll display what we find in `chinese.json` or just the selected text info.

    // Positioning logic
    // We want it above the selection.
    // selection.rect properties: top, left, width, height, bottom, right.

    const style = {
        position: 'fixed',
        top: `${selection.rect.top - 12}px`, // Just above coordinates
        left: `${selection.rect.left + (selection.rect.width / 2)}px`,
        transform: 'translate(-50%, -100%)', // Centered horizontally, moves upwards
        zIndex: 100, // Ensure strictly on top
    };

    return (
        <div
            style={{ ...style, overscrollBehavior: 'contain', touchAction: 'pan-y' }}
            className="bg-secondary text-primary p-3 rounded-2xl border-2 border-primary min-w-[220px] max-w-[300px] animate-zoom-in origin-bottom"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => { e.stopPropagation(); }}
            onTouchMove={(e) => { e.stopPropagation(); }}
            onTouchEnd={(e) => { e.stopPropagation(); }}
            onWheel={(e) => e.stopPropagation()}
        >
            {/* <div className="font-bold text-xl mb-3 text-primary text-center px-2 pb-2 border-b-2 border-primary">
                {selection.text}
            </div> */}

            <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar px-1">
                {matches.length > 0 ? matches.map((card, idx) => (
                    <div key={idx} className="bg-primary/5 p-2 rounded-xl border-2 border-transparent hover:border-primary/20 transition-colors">
                        <div className="text-xl font-bold text-primary mb-0.5 leading-none">{card.chiński}</div>
                        <div className="text-accent font-bold text-sm leading-tight mb-0.5">{card.pinyin}</div>
                        <div className="text-primary font-medium text-xs leading-snug">{card.polskie_znaczenie}</div>
                    </div>
                )) : (
                    <div className="text-sm italic text-center py-2">
                        Brak definicji
                    </div>
                )}
            </div>

            {/* Arrow at bottom - consistent style */}
            <div
                className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary border-r-2 border-b-2 border-primary rotate-45"
            ></div>
        </div>
    );
};

export default SelectionPopup;
