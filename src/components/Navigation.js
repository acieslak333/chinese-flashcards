import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Navigation = ({ handlePrev, handleNext }) => {
    return (
        <div className="bg-primary px-4 py-4 flex justify-between items-center">
            <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-primary rounded-full hover:bg-primary hover:text-secondary transition-all duration-300 font-semibold"
            >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Poprzednia</span>
            </button>
            <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-primary rounded-full hover:bg-primary hover:text-secondary transition-all duration-300 font-semibold"
            >
                <span className="hidden sm:inline">Następna</span>
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Navigation;
