import React from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw } from 'lucide-react';

const Navigation = ({ handlePrev, handleNext, showExample, setShowExample, onRevealAll, isAnyHidden, handleReset }) => {
    return (
        <div className="bg-primary px-4 py-4 flex justify-between items-center gap-2">
            <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-primary rounded-full hover:bg-opacity-90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95"
            >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Poprzednia</span>
            </button>
            {isAnyHidden ? (
                <button
                    onClick={onRevealAll}
                    className="flex-2 flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-primary rounded-full hover:bg-opacity-90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95 mx-2"
                >
                    <Eye size={20} />
                    <span className="hidden sm:inline">Pokaż</span>
                </button>
            ) : (
                <div className="flex gap-2 mx-2">
                    <button
                        onClick={() => setShowExample(!showExample)}
                        className="flex items-center gap-2 px-4 py-2 sm:py-3 bg-secondary text-primary rounded-full hover:bg-opacity-90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95"
                    >
                        {showExample ? <EyeOff size={20} /> : <Eye size={20} />}
                        <span className="hidden sm:inline">{showExample ? 'Ukryj' : 'Przykład'}</span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center px-4 py-2 sm:py-3 bg-secondary text-primary rounded-full hover:bg-opacity-90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95"
                        title="Resetuj (R)"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            )}
            <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-primary rounded-full hover:bg-opacity-90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95"
            >
                <span className="hidden sm:inline">Następna</span>
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Navigation;
