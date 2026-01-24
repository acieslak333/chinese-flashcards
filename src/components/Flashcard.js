import React from 'react';
import SelectableText from './SelectableText';

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
    onSelectionChange, // New prop
    isActiveSelection, // New prop
    direction,
    onIndexChange,
    shouldAnimate = true
}) => {
    // Fast Scroll Scrubber State
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [initialIndex, setInitialIndex] = React.useState(0);
    const [fractionalIndex, setFractionalIndex] = React.useState(currentIndex);
    const [isScrubbing, setIsScrubbing] = React.useState(false);

    // Physics State
    const velocityRef = React.useRef(0);
    const lastXRef = React.useRef(0);
    const lastTimeRef = React.useRef(0);
    const requestRef = React.useRef();
    const lastVibratedIndexRef = React.useRef(currentIndex);

    const applyMomentum = () => {
        // Friction factor (0.95 = slippery, 0.8 = rough)
        const friction = 0.98;

        // Apply friction
        velocityRef.current *= friction;

        if (Math.abs(velocityRef.current) < 0.005) {
            // Stop
            cancelAnimationFrame(requestRef.current);
            setIsScrubbing(false);
            // Snap to nearest integer when stopping for clean view?
            // User requested "scroll when let go", so let's let it drift. 
            // We can snap only if very slow or let it be continuous.
            // Let's snap lightly at the very end to align.
            setFractionalIndex(prev => {
                const target = Math.round(prev);
                if (onIndexChange) onIndexChange(target, { isScrubbing: true });
                return target;
            });
            return;
        }

        setFractionalIndex(prev => {
            let next = prev + velocityRef.current;
            // Clamp
            if (next < 0) {
                next = 0;
                velocityRef.current = 0;
            }
            if (next > totalCards - 1) {
                next = totalCards - 1;
                velocityRef.current = 0;
            }

            // Update drag index roughly
            const rounded = Math.round(next);
            if (rounded !== lastVibratedIndexRef.current) {
                if (onIndexChange) onIndexChange(rounded, { isScrubbing: true });
                if (navigator.vibrate) navigator.vibrate(5);
                lastVibratedIndexRef.current = rounded;
            }
            return next;
        });

        requestRef.current = requestAnimationFrame(applyMomentum);
    };

    const handlePointerDown = (e) => {
        // Stop any ongoing momentum
        cancelAnimationFrame(requestRef.current);

        setIsDragging(true);
        setIsScrubbing(true);
        setStartX(e.clientX || e.touches[0].clientX);
        lastXRef.current = e.clientX || e.touches[0].clientX;
        lastTimeRef.current = Date.now();
        velocityRef.current = 0;
        lastVibratedIndexRef.current = currentIndex;

        setInitialIndex(fractionalIndex); // Start from current fractional pos

        setInitialIndex(fractionalIndex); // Start from current fractional pos
        // setFractionalIndex(currentIndex); // Keep existing fractional index to avoid jump?
        // Actually if we stop momentum, we are at fractionalIndex.
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        if (!x) return;

        const now = Date.now();
        const dt = now - lastTimeRef.current;

        // Calculate instantaneous velocity (cards per frame approx)
        if (dt > 0) {
            const dx = x - lastXRef.current;
            // Negative dx means moving Left. 
            // Moving Left means we want index to Increase (next cards).
            // So velocity is -dx. 
            // Scale it: threshold 15px = 1 card.
            const threshold = 15;
            const newVelocity = -dx / threshold;

            // Smooth velocity (simple low-pass filter)
            velocityRef.current = newVelocity * 0.5 + velocityRef.current * 0.5;
        }

        lastXRef.current = x;
        lastTimeRef.current = now;

        const deltaX = x - startX;
        const threshold = 15;

        let rawFraction = initialIndex - (deltaX / threshold);

        if (rawFraction < 0) rawFraction = 0;
        if (rawFraction > totalCards - 1) rawFraction = totalCards - 1;

        setFractionalIndex(rawFraction);

        const newIndex = Math.round(rawFraction);

        if (newIndex !== lastVibratedIndexRef.current) {
            if (onIndexChange) onIndexChange(newIndex, { isScrubbing: true });

            if (navigator.vibrate) {
                navigator.vibrate(5);
            }
            lastVibratedIndexRef.current = newIndex;
        }
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);

        // Start momentum if velocity is significant
        if (Math.abs(velocityRef.current) > 0.01) {
            requestRef.current = requestAnimationFrame(applyMomentum);
        } else {
            // Snap if stopped
            setFractionalIndex(prev => Math.round(prev));
            setIsScrubbing(false);
        }
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
    const DOT_SPACING = 16; // px (width + gap)

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
                    <span className="bg-secondary text-accent px-1 rounded-sm mx-0.5 font-bold">
                        {keyword}
                    </span>
                )}
            </React.Fragment>
        ));
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 overflow-y-auto w-full">
            <div
                key={shouldAnimate ? currentIndex : 'scrubbing-view'}
                className={`bg-secondary rounded-3xl p-8 max-w-2xl w-full border-4 border-secondary ${shouldAnimate ? animationClass : ''}`}
            >
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
                        >
                            {currentIndex + 1} / {totalCards}
                        </span>
                    </div>

                    {/* Dots overlay - visible only when dragging */}
                    {/* Dots overlay - visible when scrubbing with transition */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-0 transition-all duration-100 ease-out origin-center ${isScrubbing ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
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
                                            className="bg-accent rounded-full transition-transform duration-100"
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
                </div>

                <div className="min-h-[250px] sm:min-h-[300px] flex flex-col justify-center items-center space-y-4 sm:space-y-6">
                    <div
                        onMouseEnter={() => onReveal('chinese')}
                        className={`text-5xl sm:text-7xl font-bold text-accent ${getContentStyle('chinese', displayMode.chinese)}`}
                    >
                        {/* replaced standard div with SelectableText */}
                        <SelectableText
                            text={currentCard.chiński}
                            onSelectionChange={onSelectionChange}
                            isActiveSelection={isActiveSelection}
                        />
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
                        <div className="bg-accent p-4 sm:p-6 rounded-3xl w-full space-y-2 border-2 border-accent">
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
