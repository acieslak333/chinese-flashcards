import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import Flashcard from './components/Flashcard';
import Navigation from './components/Navigation';
import Catalogue from './components/Catalogue';
import './App.css';
import chineseData from './data/chinese.json';
import themes from './data/themes.json';
import { supabase } from './supabaseClient';

const FlashcardApp = () => {
    const [flashcards] = useState(chineseData);



    const [currentIndex, setCurrentIndex] = useState(0);
    const [showExample, setShowExample] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Persistent State: Display Mode
    const [displayMode, setDisplayMode] = useState(() => {
        const saved = localStorage.getItem('displayMode');
        return saved ? JSON.parse(saved) : { chinese: true, pinyin: true, polish: true };
    });

    // Persistent State: Random Order
    const [isRandom, setIsRandom] = useState(() => {
        const saved = localStorage.getItem('isRandom');
        return saved ? JSON.parse(saved) : false;
    });

    // Persistent State: Selected Lessons
    const [selectedLessons, setSelectedLessons] = useState(() => {
        const saved = localStorage.getItem('selectedLessons');
        return saved ? JSON.parse(saved) : [];
    });

    // Persistent State: Selected Difficulties
    const [selectedDifficulties, setSelectedDifficulties] = useState(() => {
        const saved = localStorage.getItem('selectedDifficulties');
        return saved ? JSON.parse(saved) : [];
    });

    const [filteredCards, setFilteredCards] = useState([]);
    const [cardOrder, setCardOrder] = useState([]);

    // Persistent State: Card Difficulties (Progress)
    const [difficulties, setDifficulties] = useState(() => {
        const saved = localStorage.getItem('difficulties');
        return saved ? JSON.parse(saved) : {};
    });

    // Persistent State: Theme
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('currentTheme') || 'matcha-latte';
    });

    const [direction, setDirection] = useState('next');

    // Persistent State: Random Blur
    const [isRandomBlur, setIsRandomBlur] = useState(() => {
        const saved = localStorage.getItem('isRandomBlur');
        return saved ? JSON.parse(saved) : false;
    });
    const [randomDisplayMode, setRandomDisplayMode] = useState({
        chinese: true,
        pinyin: true,
        polish: true
    });

    // Lifted state for revealed fields
    const [revealedFields, setRevealedFields] = useState({
        chinese: false,
        pinyin: false,
        polish: false
    });

    // State for Cloud Sync
    const [syncCode, setSyncCode] = useState(() => {
        return localStorage.getItem('syncCode') || '';
    });

    useEffect(() => {
        localStorage.setItem('syncCode', syncCode);
    }, [syncCode]);

    const loadCloudData = async () => {
        if (!syncCode) return;
        try {
            const { data, error } = await supabase
                .from('sync_table')
                .select('json_data')
                .eq('user_id', syncCode)
                .single();

            if (error && error.code !== 'PGRST116') { 
                console.error("Error loading data:", error);
                alert("Błąd pobierania danych z chmury");
                return;
            }

            if (data?.json_data) {
                const cloudData = data.json_data;
                if (cloudData.difficulties) setDifficulties(cloudData.difficulties);
                if (cloudData.selectedLessons) setSelectedLessons(cloudData.selectedLessons);
                if (cloudData.selectedDifficulties) setSelectedDifficulties(cloudData.selectedDifficulties);
                if (cloudData.isRandom) setIsRandom(cloudData.isRandom);
                if (cloudData.isRandomBlur) setIsRandomBlur(cloudData.isRandomBlur);
                if (cloudData.displayMode) setDisplayMode(cloudData.displayMode);
                if (cloudData.currentTheme) setCurrentTheme(cloudData.currentTheme);
                
                alert("Dane pobrane z chmury!");
            } else {
                alert("Nie znaleziono danych dla tego kodu. Zapisz coś najpierw!");
            }
        } catch (e) {
            console.error("Unexpected error loading:", e);
        }
    };

    // Debounced Save Effect
    useEffect(() => {
        if (!syncCode) return;

        const saveData = async () => {
            const payload = {
                difficulties,
                selectedLessons,
                selectedDifficulties,
                isRandom,
                isRandomBlur,
                displayMode,
                currentTheme
            };

            const { error } = await supabase
                .from('sync_table')
                .upsert({ 
                    user_id: syncCode,
                    json_data: payload,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) console.error("Error saving to cloud:", error);
        };

        const timeoutId = setTimeout(saveData, 2000); // 2 second debounce

        return () => clearTimeout(timeoutId);
    }, [syncCode, difficulties, selectedLessons, selectedDifficulties, isRandom, isRandomBlur, displayMode, currentTheme]);

    const allLessons = [...new Set(flashcards.map(card => card.id_lekcji))];

    const currentCard = filteredCards[cardOrder[currentIndex]];
    const currentCardId = flashcards.indexOf(currentCard);

    // Theme Application Effect
    useEffect(() => {
        const theme = themes[currentTheme];
        if (theme) {
            const root = document.documentElement;
            root.style.setProperty('--color-primary', theme.colors.primary);
            root.style.setProperty('--color-secondary', theme.colors.secondary);
            root.style.setProperty('--color-accent', theme.colors.accent);

            // Update mobile browser theme color
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', theme.colors.secondary);
            }
        }
    }, [currentTheme]);

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('displayMode', JSON.stringify(displayMode));
        localStorage.setItem('isRandom', JSON.stringify(isRandom));
        localStorage.setItem('selectedLessons', JSON.stringify(selectedLessons));
        localStorage.setItem('selectedDifficulties', JSON.stringify(selectedDifficulties));
        localStorage.setItem('difficulties', JSON.stringify(difficulties));
        localStorage.setItem('currentTheme', currentTheme);
        localStorage.setItem('isRandomBlur', JSON.stringify(isRandomBlur));
    }, [displayMode, isRandom, selectedLessons, selectedDifficulties, difficulties, currentTheme, isRandomBlur]);

    // 1. Filtering Logic
    useEffect(() => {
        let filtered = flashcards;

        if (selectedLessons.length > 0) {
            filtered = filtered.filter(card => selectedLessons.includes(card.id_lekcji));
        }

        if (selectedDifficulties.length > 0) {
            console.log('Filtering by difficulty:', selectedDifficulties);
            console.log('Current difficulties map:', difficulties);
            filtered = filtered.filter(card => {
                const cardId = flashcards.indexOf(card);
                const cardDifficulty = difficulties[cardId] || 'średnie'; // Default to medium if not set
                console.log(`Card ${cardId}: ${cardDifficulty}`);
                return selectedDifficulties.includes(cardDifficulty);
            });
        }

        setFilteredCards(filtered);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLessons, selectedDifficulties, flashcards]);

    // 2. Ordering Logic
    useEffect(() => {
        if (isRandom) {
            const shuffled = [...Array(filteredCards.length).keys()].sort(() => Math.random() - 0.5);
            setCardOrder(shuffled);
        } else {
            setCardOrder([...Array(filteredCards.length).keys()]);
        }
    }, [filteredCards, isRandom]);

    // 3. Reset Logic - Only when Filters physically change (not just data updates)
    // Also handles Random Blur generation per card change
    useEffect(() => {
        // Removed aggressive currentIndex reset to prevent jumping to card 0 when filters change.
        // The boundary check effect below ensures we don't end up on an invalid index.
        setShowExample(false);
        setRevealedFields({ chinese: false, pinyin: false, polish: false });
    }, [selectedLessons, selectedDifficulties, isRandom]);

    // Random Blur Effect - Runs on card change
    useEffect(() => {
        if (isRandomBlur) {
            const fields = ['chinese', 'pinyin', 'polish'];
            // Determine how many to hide (1 or 2)
            const numHidden = Math.random() < 0.5 ? 1 : 2;

            // Shuffle fields
            const shuffled = [...fields].sort(() => Math.random() - 0.5);

            // Pick fields to hide
            const hiddenFields = shuffled.slice(0, numHidden);

            setRandomDisplayMode({
                chinese: !hiddenFields.includes('chinese'),
                pinyin: !hiddenFields.includes('pinyin'),
                polish: !hiddenFields.includes('polish')
            });
        }
    }, [currentIndex, isRandomBlur, cardOrder, filteredCards]);

    // 4. Boundary Check - Ensure currentIndex is valid if filteredCards shrinks
    useEffect(() => {
        if (currentIndex >= filteredCards.length && filteredCards.length > 0) {
            setCurrentIndex(0);
        }
    }, [filteredCards.length, currentIndex]);


    // State to track if example has been shown at least once for current card
    // Used for the Swipe Up cycle: Unblur -> Show Ex -> Hide Ex -> Reset
    const [hasViewedExample, setHasViewedExample] = useState(false);

    // ... (existing effects)

    // Reset hasViewedExample on card change
    useEffect(() => {
        setHasViewedExample(false);
    }, [currentIndex]);

    // Track when example is shown
    useEffect(() => {
        if (showExample) {
            setHasViewedExample(true);
        }
    }, [showExample]);

    const handleReset = () => {
        setShowExample(false);
        setRevealedFields({ chinese: false, pinyin: false, polish: false });
        setHasViewedExample(false); // Also reset the cycle
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
        onSwipedUp: () => {
            if (isAnyHidden) {
                // Stage 1: Reveal All
                revealAll();
            } else if (!showExample && !hasViewedExample) {
                // Stage 2: Show Example
                setShowExample(true);
            } else if (showExample) {
                // Stage 3: Hide Example
                setShowExample(false);
            } else if (!showExample && hasViewedExample) {
                // Stage 4: Reset
                handleReset();
            }
        },
        preventDefaultTouchmoveEvent: true, // Prevent scrolling while swiping
        trackMouse: false // Only touch for now, or true if user wants mouse swipes too
    });

    const handleNext = () => {
        setDirection('next');
        setCurrentIndex((currentIndex + 1) % filteredCards.length);
        setShowExample(false);
    };

    const handlePrev = () => {
        setDirection('prev');
        setCurrentIndex((currentIndex - 1 + filteredCards.length) % filteredCards.length);
        setShowExample(false);
    };

    const revealAll = () => {
        setRevealedFields({ chinese: true, pinyin: true, polish: true });
    };

    const setDifficulty = (level) => {
        // Toggle logic restored: clicking the same level deselects it.
        // Safe to do now because filtering is sticky (doesn't auto-update on difficulty change).
        if (difficulties[currentCardId] === level) {
            const newDifficulties = { ...difficulties };
            delete newDifficulties[currentCardId];
            setDifficulties(newDifficulties);
        } else {
            setDifficulties({ ...difficulties, [currentCardId]: level });
        }
        // revealAll();
    };

    const handleReveal = (field) => {
        if (!revealedFields[field]) {
            setRevealedFields(prev => ({ ...prev, [field]: true }));
        }
    };

    const toggleLesson = (lesson) => {
        setSelectedLessons(prev =>
            prev.includes(lesson) ? prev.filter(l => l !== lesson) : [...prev, lesson]
        );
    };

    const toggleDifficulty = (diff) => {
        setSelectedDifficulties(prev =>
            prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
        );
    };

    const selectAllLessons = () => setSelectedLessons([...allLessons]);
    const deselectAllLessons = () => setSelectedLessons([]);

    const selectAllDifficulties = () => setSelectedDifficulties(['łatwe', 'średnie', 'trudne']);
    const deselectAllDifficulties = () => setSelectedDifficulties([]);

    // handleReset is defined above with swipe handlers
    // const handleReset = ... (removed to avoid duplicate)

    const effectiveDisplayForRender = isRandomBlur ? randomDisplayMode : displayMode;
    const isAnyHidden = ['chinese', 'pinyin', 'polish'].some(
        field => !effectiveDisplayForRender[field] && !revealedFields[field]
    );

    useEffect(() => {
        setRevealedFields({ chinese: false, pinyin: false, polish: false });
    }, [currentIndex]); // Reset on card change

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore shortcuts if user is typing in an input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (filteredCards.length === 0) return;

            switch (e.key) {
                case 'd':
                case 'D':
                case 'ArrowRight':
                    handleNext();
                    break;
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case ' ':
                    e.preventDefault();
                    if (isAnyHidden) {
                        revealAll();
                    } else {
                        handleNext();
                    }
                    break;
                case 'c':
                case 'C':
                case 's':
                case 'S':
                case 'ArrowDown':
                    e.preventDefault();
                    if (isAnyHidden) {
                        revealAll();
                    } else {
                        setShowExample(prev => !prev);
                    }
                    break;
                case '1':
                    setDifficulty('łatwe');
                    break;
                case '2':
                    setDifficulty('średnie');
                    break;
                case '3':
                    setDifficulty('trudne');
                    break;
                case 'r':
                case 'R':
                    handleReset();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredCards, currentIndex, displayMode, revealedFields, difficulties, currentCardId, isRandomBlur, randomDisplayMode, isAnyHidden]); // Added isAnyHidden dependency

    // State for Catalogue View
    const [showCatalogue, setShowCatalogue] = useState(false);

    // Safety check - if no cards match filters
    if (filteredCards.length === 0) {
        return (
            <div className="h-screen bg-secondary text-primary flex flex-col overflow-hidden transition-colors duration-500">
                <Header
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                />

                <SettingsPanel
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    displayMode={displayMode}
                    setDisplayMode={setDisplayMode}
                    isRandom={isRandom}
                    setIsRandom={setIsRandom}
                    allLessons={allLessons}
                    selectedLessons={selectedLessons}
                    toggleLesson={toggleLesson}
                    selectedDifficulties={selectedDifficulties}
                    toggleDifficulty={toggleDifficulty}
                    currentTheme={currentTheme}
                    setCurrentTheme={setCurrentTheme}
                    themes={themes}
                    isRandomBlur={isRandomBlur}
                    setIsRandomBlur={setIsRandomBlur}
                    selectAllLessons={selectAllLessons}
                    deselectAllLessons={deselectAllLessons}
                    selectAllDifficulties={selectAllDifficulties}
                    deselectAllDifficulties={deselectAllDifficulties}
                    onOpenCatalogue={() => setShowCatalogue(true)}
                />

                {showCatalogue && (
                     <Catalogue 
                        cards={filteredCards} 
                        onClose={() => setShowCatalogue(false)} 
                     />
                )}

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                    <div className="text-2xl font-bold mb-4">Brak kart spełniających kryteria</div>
                    <p>Zmień ustawienia filtrów, aby zobaczyć fiszki.</p>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="mt-6 px-6 py-3 bg-secondary text-secondary rounded-full font-bold hover:opacity-90 transition"
                    >
                        Otwórz ustawienia
                    </button>
                    <button
                        onClick={() => setShowCatalogue(true)}
                        className="mt-4 text-primary underline hover:opacity-80"
                    >
                        Otwórz Katalog
                    </button>
                </div>
            </div>
        );
    }

    if (!currentCard) return null;

    return (
        <div 
            {...swipeHandlers}
            className="h-[100dvh] bg-secondary text-primary flex flex-col overflow-hidden transition-colors duration-500 relative"
        >
            {/* Main Interactive Content - Inert when settings open */}
            <div className={`flex flex-col h-full w-full ${showSettings ? 'pointer-events-none opacity-50' : ''}`}>
                <Header
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                />

                <Flashcard
                    currentCard={currentCard}
                    currentIndex={currentIndex}
                    totalCards={filteredCards.length}
                    displayMode={isRandomBlur ? randomDisplayMode : displayMode}
                    showExample={showExample}
                    setShowExample={setShowExample}
                    difficulty={difficulties[currentCardId]}
                    onDifficultyChange={setDifficulty}
                    revealedFields={revealedFields}
                    onReveal={handleReveal}
                    onRevealAll={revealAll}
                    direction={direction}
                    key={currentCardId}
                />

                <Navigation
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                    showExample={showExample}
                    setShowExample={setShowExample}
                    onRevealAll={revealAll}
                    isAnyHidden={isAnyHidden}
                    handleReset={handleReset}
                />
            </div>

            {/* Catalogue Overlay */}
            {showCatalogue && (
                <Catalogue 
                    cards={filteredCards} 
                    onClose={() => setShowCatalogue(false)}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    // New props for enhancements
                    difficulties={difficulties}
                    allCards={flashcards} // Needed to match indices for difficulty
                    displayMode={displayMode}
                    isRandomBlur={isRandomBlur}
                    isRandom={isRandom}
                />
            )}

            {/* Settings Panel - Outside the inert wrapper */}
            <SettingsPanel
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showCatalogue={showCatalogue}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                isRandom={isRandom}
                setIsRandom={setIsRandom}
                allLessons={allLessons}
                selectedLessons={selectedLessons}
                toggleLesson={toggleLesson}
                selectedDifficulties={selectedDifficulties}
                toggleDifficulty={toggleDifficulty}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                themes={themes}
                isRandomBlur={isRandomBlur}
                setIsRandomBlur={setIsRandomBlur}
                selectAllLessons={selectAllLessons}
                deselectAllLessons={deselectAllLessons}
                selectAllDifficulties={selectAllDifficulties}
                deselectAllDifficulties={deselectAllDifficulties}
                onOpenCatalogue={() => {
                    setShowCatalogue(prev => !prev);
                    setShowSettings(false);
                }}
                syncCode={syncCode}
                setSyncCode={setSyncCode}
                onForceSync={loadCloudData}
            />
        </div>
    );
};

export default FlashcardApp;