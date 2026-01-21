import React from 'react';

const Flashcard = ({
    currentCard,
    currentIndex,
    totalCards,
    displayMode,
    showExample,
    setShowExample,
    difficulty, // 'łatwe', 'średnie', 'trudne' or undefined
    onDifficultyChange, // function to set difficulty
    revealedFields,
    onReveal,
    onRevealAll,
    direction,
    onIndexChange
}) => {
    // Fast Scroll Scrubber State
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [initialIndex, setInitialIndex] = React.useState(0);
    const [dragIndex, setDragIndex] = React.useState(currentIndex);
    const [fractionalIndex, setFractionalIndex] = React.useState(currentIndex);

    const handlePointerDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX || e.touches[0].clientX);
        setInitialIndex(currentIndex);
        setDragIndex(currentIndex);
        setFractionalIndex(currentIndex);
        e.currentTarget.setPointerCapture(e.pointerId); // Capture pointer for smooth dragging outside element
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        if (!x) return;

        const deltaX = x - startX;
        const threshold = 30; // Pixels per card increment - visually matching expected drag speed

        // Calculate smooth fractional index
        // Inverse direction: Drag Left (negative delta) -> Increase Index (move to next)
        // Standard swipe logic: Pull content left to see what's on the right.
        let rawFraction = initialIndex + (deltaX / threshold); // Try direct mapping first (Right -> Increase) as per previous build
        // If user says "move in direction of scroll", usually if I drag LEFT, I want dots to move LEFT.
        // If dots move LEFT, index INCREASES.
        // So (deltaX < 0) -> Index Incr.
        // Let's invert:
        rawFraction = initialIndex - (deltaX / threshold);

        // Clamp
        if (rawFraction < 0) rawFraction = 0;
        if (rawFraction > totalCards - 1) rawFraction = totalCards - 1;

        setFractionalIndex(rawFraction);

        const newIndex = Math.round(rawFraction);

        if (newIndex !== dragIndex) {
            setDragIndex(newIndex);
            if (onIndexChange) onIndexChange(newIndex);

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(5);
            }
        }
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // Calculate dots window
    const dotsWindow = 31;
    let startDot = Math.floor(fractionalIndex) - Math.floor(dotsWindow / 2);
    // Ensure we render enough overlap
    startDot = Math.max(0, Math.min(startDot, totalCards - dotsWindow));

    // Safety check for small totals
    if (totalCards < dotsWindow) startDot = 0;

    const visibleDots = Array.from({ length: Math.min(dotsWindow, totalCards) }, (_, i) => startDot + i);

    // Visual Constants
    const DOT_SPACING = 48; // px (width + gap)

    const getContentStyle = (field, isVisible) => {
        if (isVisible || revealedFields[field]) return '';
        return 'blur-md hover:blur-none transition-all duration-300 cursor-pointer select-none';
    };

    const animationClass = direction === 'next' ? 'animate-slide-right' : 'animate-slide-left';

    const highlightText = (text, keyword) => {
        if (!text || !keyword) return text;
        const parts = text.split(keyword);
        return parts.map((part, index) => (
            <React.Fragment key={index}>
                {part}
                {index < parts.length - 1 && (
                    <span className="bg-secondary text-accent px-1 rounded-sm mx-0.5 font-bold shadow-sm">
                        {keyword}
                    </span>
                )}
            </React.Fragment>
        ));
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 overflow-y-auto w-full">
            <div className={`bg-secondary rounded-3xl p-8 max-w-2xl w-full border-4 border-secondary ${animationClass}`}>
                <div className="text-center mb-6 relative h-10 flex items-center justify-center overflow-hidden">

                    {/* Container for the pill shape to hold directional pulses */}
                    <div className="relative z-20">
                        {/* Always visible text */}
                        <span
                            className="relative block text-sm font-semibold text-secondary bg-accent bg-opacity-100 px-3 py-1 rounded-full cursor-ew-resize select-none touch-none transition-all duration-200"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        >
                            {currentIndex + 1} / {totalCards}
                        </span>
                    </div>

                    {/* Dots overlay - visible only when dragging */}
                    {isDragging && (
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                        >
                            <div
                                className="flex items-center gap-0 will-change-transform"
                                style={{
                                    // Shift logic ensures the fractional index is exactly at the center
                                    // Subtracting DOT_SPACING / 2 centers the 'gap' or the dot itself depending on box model
                                    // Here we center the dot (width 24px centered in 48px slot)
                                    transform: `translateX(${- (fractionalIndex - startDot) * DOT_SPACING + (visibleDots.length * DOT_SPACING / 2) - (DOT_SPACING / 2)}px)`
                                }}
                            >
                                {visibleDots.map(idx => {
                                    const rawDistance = Math.abs(idx - fractionalIndex);
                                    // Plateau: Keep scale 1.0 for a small area around center (under the text)
                                    // Text is approx 80-100px wide. Spacing is 48px.
                                    // So roughly +/- 1.0 unit should be max scale.
                                    const effectiveDistance = Math.max(0, rawDistance - 0.8);

                                    // Scale Logic: Fisheye with plateau
                                    let scale = Math.max(0.0, 1 - Math.pow(effectiveDistance * 0.2, 2));

                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-center"
                                            style={{ width: DOT_SPACING, height: DOT_SPACING }}
                                        >
                                            <div
                                                className="bg-accent rounded-full shadow-sm transition-transform duration-100"
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    transform: `scale(${scale})`,
                                                    opacity: 1
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="min-h-[250px] sm:min-h-[300px] flex flex-col justify-center items-center space-y-4 sm:space-y-6">
                    <div
                        onMouseEnter={() => onReveal('chinese')}
                        className={`text-5xl sm:text-7xl font-bold text-accent ${getContentStyle('chinese', displayMode.chinese)}`}
                    >
                        {currentCard.chiński}
                    </div>
                    <div
                        onMouseEnter={() => onReveal('pinyin')}
                        className={`text-xl sm:text-2xl text-accent font-medium ${getContentStyle('pinyin', displayMode.pinyin)}`}
                    >
                        {currentCard.pinyin}
                    </div>
                    <div
                        onMouseEnter={() => onReveal('polish')}
                        className={`text-lg sm:text-xl text-accent font-semibold ${getContentStyle('polish', displayMode.polish)}`}
                    >
                        {currentCard.polskie_znaczenie}
                    </div>



                    <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden w-full ${showExample ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
                            }`}
                    >
                        <div className="bg-accent backdrop-blur-sm p-4 sm:p-6 rounded-3xl w-full space-y-2 border-2 border-accent">
                            <div className="text-xl sm:text-2xl text-center text-secondary font-bold">{highlightText(currentCard.przykład.chiński, currentCard.chiński)}</div>
                            <div className="text-base sm:text-lg text-center text-secondary">{currentCard.przykład.pinyin}</div>
                            <div className="text-sm sm:text-base text-center text-secondary font-semibold">{currentCard.przykład.polski}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-center gap-2 sm:gap-3">
                        <button
                            onClick={() => {
                                onDifficultyChange('łatwe');
                                // onRevealAll();
                            }}
                            className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 rounded-full font-bold transition-all duration-300 border-2 ${difficulty === 'łatwe'
                                ? 'bg-accent text-secondary border-accent scale-105 hover:bg-primary hover:border-primary hover:text-secondary'
                                : 'bg-transparent text-accent border-accent hover:bg-primary hover:border-primary hover:text-secondary'
                                }`}
                        >
                            Łatwe
                        </button>
                        <button
                            onClick={() => {
                                onDifficultyChange('średnie');
                                // onRevealAll();
                            }}
                            className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 rounded-full font-bold transition-all duration-300 border-2 ${difficulty === 'średnie'
                                ? 'bg-accent text-secondary border-accent scale-105 hover:bg-primary hover:border-primary hover:text-secondary'
                                : 'bg-transparent text-accent border-accent hover:bg-primary hover:border-primary hover:text-secondary'
                                }`}
                        >
                            Średnie
                        </button>
                        <button
                            onClick={() => {
                                onDifficultyChange('trudne');
                                // onRevealAll();
                            }}
                            className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 rounded-full font-bold transition-all duration-300 border-2 ${difficulty === 'trudne'
                                ? 'bg-accent text-secondary border-accent scale-105 hover:bg-primary hover:border-primary hover:text-secondary'
                                : 'bg-transparent text-accent border-accent hover:bg-primary hover:border-primary hover:text-secondary'
                                }`}
                        >
                            Trudne
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Flashcard;
