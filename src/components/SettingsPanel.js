import React, { useState } from 'react';
import { X, ListOrdered, Shuffle, Search } from 'lucide-react';

const SettingsPanel = ({
    showSettings,
    setShowSettings,
    displayMode,
    setDisplayMode,
    isRandom,
    setIsRandom,
    allLessons,
    selectedLessons,
    toggleLesson,
    selectedDifficulties,
    toggleDifficulty,
    currentTheme,
    setCurrentTheme,
    themes,
    isRandomBlur,
    setIsRandomBlur,
    selectAllLessons,
    deselectAllLessons,
    selectAllDifficulties,
    deselectAllDifficulties
}) => {
    const [lessonSearch, setLessonSearch] = useState('');
    const [lessonView, setLessonView] = useState('all'); // 'all' or 'selected'

    // Helper to parse DD.MM.YYYY
    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        return new Date(0);
    };

    // Extract Years and Months from allLessons
    const uniqueYears = [...new Set(allLessons.map(l => parseDate(l).getFullYear()))].sort((a, b) => b - a);
    const months = [
        { val: '1', name: 'Styczeń' }, { val: '2', name: 'Luty' }, { val: '3', name: 'Marzec' },
        { val: '4', name: 'Kwiecień' }, { val: '5', name: 'Maj' }, { val: '6', name: 'Czerwiec' },
        { val: '7', name: 'Lipiec' }, { val: '8', name: 'Sierpień' }, { val: '9', name: 'Wrzesień' },
        { val: '10', name: 'Październik' }, { val: '11', name: 'Listopad' }, { val: '12', name: 'Grudzień' }
    ];

    // State for filtering - Initialize with ALL selected by default (or effectively all)
    // We'll use arrays. If empty, maybe treat as none? Or should we init with all?
    // Let's init with all available years and all months for convenience.
    // However, since years can change dynamically based on data, maybe better to store selected values.
    const [selectedYears, setSelectedYears] = useState(uniqueYears);
    const [selectedMonths, setSelectedMonths] = useState(months.map(m => m.val));

    // Update selectedYears if uniqueYears changes (e.g. data load) - simplified for now
    // In a real app we might need useEffect to sync, but here allLessons is prop.
    // For simplicity, we won't auto-sync if uniqueYears grows, relying on user action.
    // But to ensure initial render is correct if state is empty/stale from HMR:
    React.useEffect(() => {
        if (selectedYears.length === 0 && uniqueYears.length > 0) {
            setSelectedYears(uniqueYears);
        }
    }, [uniqueYears.length]);


    const toggleYear = (year) => {
        if (selectedYears.includes(year)) {
            setSelectedYears(selectedYears.filter(y => y !== year));
        } else {
            setSelectedYears([...selectedYears, year]);
        }
    };

    const toggleMonth = (monthVal) => {
        if (selectedMonths.includes(monthVal)) {
            setSelectedMonths(selectedMonths.filter(m => m !== monthVal));
        } else {
            setSelectedMonths([...selectedMonths, monthVal]);
        }
    };

    const sortedAllLessons = [...allLessons].sort((a, b) => parseDate(b) - parseDate(a)); // Newest first

    const filteredLessons = sortedAllLessons.filter(lesson => {
        const matchesSearch = lesson.toString().includes(lessonSearch);
        const matchesView = lessonView === 'all' ? true : selectedLessons.includes(lesson);

        const date = parseDate(lesson);
        const matchesYear = selectedYears.includes(date.getFullYear());
        const matchesMonth = selectedMonths.includes((date.getMonth() + 1).toString());

        return matchesSearch && matchesView && matchesYear && matchesMonth;
    });

    return (
        <>
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-secondary transform transition-transform duration-300 z-50 border-l-4 border-accent ${showSettings ? 'translate-x-0' : 'translate-x-full'
                    }`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
            >
                <div className="p-6 h-full overflow-y-auto text-primary custom-scrollbar">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-primary">Ustawienia</h2>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="p-1 rounded-full hover:bg-accent hover:text-secondary transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">

                        <div>
                            <h3 className="font-semibold mb-3 text-primary">Tryb wyświetlania:</h3>
                            <div className="space-y-4">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border transition flex items-center justify-center ${isRandomBlur ? 'bg-primary border-primary' : 'border-primary group-hover:border-accent'}`}>
                                        {isRandomBlur && <div className="w-2.5 h-2.5 bg-secondary rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isRandomBlur}
                                        onChange={(e) => setIsRandomBlur(e.target.checked)}
                                        className="hidden"
                                    />
                                    <span className={`transition ${isRandomBlur ? 'font-bold' : ''} group-hover:text-accent`}>Losowe ukrywanie (1-2 pola)</span>
                                </label>

                                <div className={`space-y-2 pl-2 border-l-2 border-primary border-opacity-20 transition-opacity duration-300 ${isRandomBlur ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                    {['chinese', 'pinyin', 'polish'].map(field => (
                                        <label key={field} className="flex items-center space-x-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border transition flex items-center justify-center ${displayMode[field] ? 'bg-primary border-primary' : 'border-primary group-hover:border-accent'}`}>
                                                {displayMode[field] && <div className="w-2 h-2 bg-secondary rounded-sm" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={displayMode[field]}
                                                onChange={(e) => setDisplayMode({ ...displayMode, [field]: e.target.checked })}
                                                className="hidden"
                                            />
                                            <span className="group-hover:text-accent capitalize">
                                                {field === 'chinese' ? 'Chiński' : field === 'pinyin' ? 'Pinyin' : 'Polski'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-primary">Tryb nauki:</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsRandom(false)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm transition font-semibold ${!isRandom ? 'bg-primary text-secondary' : 'bg-transparent border border-primary text-primary hover:bg-accent hover:border-accent hover:text-secondary'
                                        }`}
                                >
                                    <ListOrdered size={16} />
                                    Kolejność
                                </button>
                                <button
                                    onClick={() => setIsRandom(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm transition font-semibold ${isRandom ? 'bg-primary text-secondary' : 'bg-transparent border border-primary text-primary hover:bg-accent hover:border-accent hover:text-secondary'
                                        }`}
                                >
                                    <Shuffle size={16} />
                                    Losowo
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-primary">Lekcje:</h3>
                                <div className="flex gap-2 text-xs">
                                    <button onClick={selectAllLessons} className="text-accent hover:underline hover:text-accent font-bold">Zaznacz wszystkie</button>
                                    <button onClick={deselectAllLessons} className="text-secondary opacity-60 hover:opacity-100 hover:text-accent">Odznacz</button>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="mb-4 space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary opacity-50" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Szukaj lekcji..."
                                        value={lessonSearch}
                                        onChange={(e) => setLessonSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-transparent border border-primary rounded-full text-sm text-primary placeholder-primary placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                    />
                                </div>

                                {/* Years Multi-Select */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-semibold opacity-70 mb-1">Filtruj wg roku:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueYears.map(year => (
                                            <label key={year} className="flex items-center space-x-2 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border transition flex items-center justify-center ${selectedYears.includes(year) ? 'bg-primary border-primary' : 'border-primary group-hover:border-accent'}`}>
                                                    {selectedYears.includes(year) && <div className="w-2 h-2 bg-secondary rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedYears.includes(year)}
                                                    onChange={() => toggleYear(year)}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm group-hover:text-accent ${selectedYears.includes(year) ? 'font-bold' : ''}`}>{year}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Months Multi-Select */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-semibold opacity-70 mb-1">Filtruj wg miesiąca:</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {months.map(m => (
                                            <label key={m.val} className="flex items-center space-x-2 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border transition flex items-center justify-center ${selectedMonths.includes(m.val) ? 'bg-primary border-primary' : 'border-primary group-hover:border-accent'}`}>
                                                    {selectedMonths.includes(m.val) && <div className="w-2 h-2 bg-secondary rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMonths.includes(m.val)}
                                                    onChange={() => toggleMonth(m.val)}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm group-hover:text-accent ${selectedMonths.includes(m.val) ? 'font-bold' : ''}`}>{m.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>


                                <div className="flex p-1 bg-primary bg-opacity-10 rounded-full mt-2">
                                    <button
                                        onClick={() => setLessonView('all')}
                                        className={`flex-1 py-1 text-xs font-bold rounded-full transition ${lessonView === 'all' ? 'bg-primary text-secondary' : 'text-primary hover:bg-accent hover:text-secondary'}`}
                                    >
                                        Wszystkie
                                    </button>
                                    <button
                                        onClick={() => setLessonView('selected')}
                                        className={`flex-1 py-1 text-xs font-bold rounded-full transition ${lessonView === 'selected' ? 'bg-primary text-secondary' : 'text-primary hover:bg-accent hover:text-secondary'}`}
                                    >
                                        Wybrane ({selectedLessons.length})
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {filteredLessons.length > 0 ? (
                                    filteredLessons.map(lesson => (
                                        <button
                                            key={lesson}
                                            onClick={() => toggleLesson(lesson)}
                                            className={`px-3 py-1 rounded-full text-sm transition font-semibold ${selectedLessons.includes(lesson)
                                                ? 'bg-primary text-secondary border border-transparent'
                                                : 'bg-transparent border border-primary text-primary hover:bg-accent hover:border-accent hover:text-secondary'
                                                }`}
                                        >
                                            {lesson}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-sm text-primary opacity-50 w-full text-center py-4">
                                        Brak lekcji
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-primary">Trudność:</h3>
                                <div className="flex gap-2 text-xs">
                                    <button onClick={selectAllDifficulties} className="text-accent hover:underline hover:text-accent font-bold">Zaznacz wszystkie</button>
                                    <button onClick={deselectAllDifficulties} className="text-secondary opacity-60 hover:opacity-100 hover:text-accent">Odznacz</button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['łatwe', 'średnie', 'trudne'].map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => toggleDifficulty(diff)}
                                        className={`px-3 py-1 rounded-full text-sm transition font-semibold capitalize ${selectedDifficulties.includes(diff)
                                            ? 'bg-primary text-secondary border border-primary'
                                            : 'bg-transparent border border-primary text-primary hover:bg-accent hover:border-accent hover:text-secondary'
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-primary">Motyw:</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(themes).map(([key, theme]) => (
                                <button
                                    key={key}
                                    onClick={() => setCurrentTheme(key)}
                                    className={`px-3 py-2 rounded-full text-sm transition font-semibold flex items-center justify-between ${currentTheme === key
                                        ? 'bg-primary text-secondary'
                                        : 'bg-transparent border border-primary text-primary hover:bg-accent hover:border-accent hover:text-secondary'
                                        }`}
                                >
                                    <span>{theme.name}</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showSettings && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-40"
                    onClick={() => setShowSettings(false)}
                />
            )}
        </>
    );
};

export default SettingsPanel;
