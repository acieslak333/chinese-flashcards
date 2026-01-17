import React from 'react';
import { Settings } from 'lucide-react';

const Header = ({ setShowSettings, showSettings }) => {
    return (
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-secondary rounded-full px-4 py-2 text-accent">中文学习</h1>
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-secondary text-primary hover:bg-opacity-80 transition"
                aria-label="Ustawienia"
            >
                <Settings size={24} />
            </button>
        </div>
    );
};

export default Header;
