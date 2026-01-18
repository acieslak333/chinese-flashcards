import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import Header from './Header';

const CatalogueItem = ({ card, difficulty, displayMode, isRandomBlur }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    // Determine which fields to blur for Random Blur mode
    // We do this once on mount (or if isRandomBlur changes) to keep it stable
    const randomBlurMask = useMemo(() => {
        if (!isRandomBlur) return { chinese: false, pinyin: false, polish: false };
        
        const mask = { chinese: false, pinyin: false, polish: false };
        const fields = ['chinese', 'pinyin', 'polish'];
        const numHidden = Math.floor(Math.random() * 2) + 1; // Hide 1 or 2 fields
        
        // Shuffle and pick fields to hide
        const shuffled = [...fields].sort(() => 0.5 - Math.random());
        for (let i = 0; i < numHidden; i++) {
            mask[shuffled[i]] = true;
        }
        return mask;
    }, [isRandomBlur]);

    const shouldBlur = (field) => {
        if (isRevealed) return false;
        
        if (isRandomBlur) {
            return randomBlurMask[field];
        }
        
        return !displayMode[field]; // If displayMode is false (unchecked), we blur/hide? 
        // Wait, standard displayMode logic in main app: checkbox checked = VISIBLE.
        // So passed displayMode={chinese: true...}
        // logical NOT !displayMode[field] means if it is NOT checked, we hide it.
        // But usually in Flashcard app, unchecked often means "hidden" or "blurred".
        // Let's assume unchecked = blurred for Catalogue to allow peeking.
    };

    // Helper for blur style
    const blurStyle = (field) => shouldBlur(field) ? 'filter blur-sm select-none opacity-50' : '';

    // Difficulty Dots helper
    const getDifficultyDots = () => {
        let count = 0;
        if (difficulty === 'łatwe') count = 1;
        if (difficulty === 'średnie') count = 2;
        if (difficulty === 'trudne') count = 3;
        
        if (count === 0) return null;

        return (
            <div className="flex gap-1 mt-1 justify-center">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-accent" />
                ))}
            </div>
        );
    };

    return (
        <div 
            onClick={() => setIsRevealed(!isRevealed)}
            className="bg-secondary border-2 border-accent rounded-lg p-2 flex flex-col items-center justify-center text-center aspect-square hover:border-accent transition-colors cursor-pointer relative overflow-hidden group"
        >
            <div className={`text-[32px] font-bold text-primary text-wrap w-full transition-all duration-300 ${blurStyle('chinese')}`}>{card.chiński}</div>
            <div className={`text-[14px] text-accent text-wrap w-full leading-tight transition-all duration-300 ${blurStyle('pinyin')}`}>{card.pinyin}</div>
            <div className={`text-[14px] text-primary mt-1 text-wrap w-full opacity-80 transition-all duration-300 ${blurStyle('polish')}`}>{card.polskie_znaczenie}</div>
            
            {getDifficultyDots()}
        </div>
    );
};

const Catalogue = ({ 
    cards, 
    onClose, 
    showSettings, 
    setShowSettings,
    difficulties, // { "index": "difficulty" }
    allCards, // Original array to find index 
    displayMode = { chinese: true, pinyin: true, polish: true },
    isRandomBlur = false,
    isRandom = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Normalize string to remove accents/tones for search
    // e.g., "nǐ hǎo" -> "ni hao"
    const normalizeText = (text) => {
        return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    };

    // 1. Filter Logic
    const filteredBase = useMemo(() => {
        if (!searchTerm) return cards;

        const normalizedSearch = normalizeText(searchTerm);

        return cards.filter(card => {
            const chinese = normalizeText(card.chiński);
            const pinyin = normalizeText(card.pinyin);
            const polish = normalizeText(card.polskie_znaczenie);
            
            return chinese.includes(normalizedSearch) || 
                   pinyin.includes(normalizedSearch) || 
                   polish.includes(normalizedSearch);
        });
    }, [cards, searchTerm]);

    // 2. Random Sort Logic
    // We memoize the shuffled result so it doesn't re-shuffle on every render (like typing in search)
    // unless the base filtered list changes or isRandom toggles.
    const finalCards = useMemo(() => {
        let result = [...filteredBase];
        if (isRandom) {
            result.sort(() => Math.random() - 0.5);
        }
        return result;
    }, [filteredBase, isRandom]); 

    // Helper to find difficulty for a filtered card
    const getDifficulty = (card) => {
        if (!allCards || !difficulties) return null;
        // Optimization: Create a map if array is huge, but here findIndex is okay for <1000 items
        const originalIndex = allCards.findIndex(c => 
            c.chiński === card.chiński && 
            c.pinyin === card.pinyin && 
            c.polskie_znaczenie === card.polskie_znaczenie
        );
        if (originalIndex === -1) return null;
        return difficulties[originalIndex];
    };


    return (
        <div className="fixed inset-0 bg-secondary z-40 flex flex-col animate-fade-up">
            {/* Header */}
            <Header showSettings={showSettings} setShowSettings={setShowSettings} />

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-2 pb-20">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-4">
                    {finalCards.map((card, index) => (
                        <CatalogueItem 
                            key={index}
                            card={card}
                            difficulty={getDifficulty(card)}
                            displayMode={displayMode}
                            isRandomBlur={isRandomBlur}
                        />
                    ))}
                </div>
                {finalCards.length === 0 && (
                    <div className="text-center text-primary opacity-50 mt-10">
                        Brak wyników
                    </div>
                )}
            </div>

            {/* Search Bar Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-secondary p-4 border-t-2 border-primary">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary opacity-50" size={20} />
                    <input
                        type="text"
                        placeholder="Szukaj (np. 'e' znajdzie 'ē')..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-primary rounded-full bg-secondary text-primary placeholder-primary/50 focus:outline-none focus:border-accent transition-colors"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

export default Catalogue;
