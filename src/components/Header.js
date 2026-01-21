import React from 'react';
import { Settings, GraduationCap, ArrowLeft } from 'lucide-react';

const Header = ({ setShowSettings, showSettings, isQuizMode, setIsQuizMode }) => {
    return (
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-secondary rounded-full px-4 py-2 text-accent">中文学习</h1>
            <div className="flex gap-2">

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-full bg-secondary text-primary hover:scale-105 transition-all duration-300 font-semibold active:scale-95"
                    aria-label="Ustawienia"
                >
                    <Settings size={24} />
                </button>
            </div>
        </div>
    );
};

export default Header;
