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
    direction
}) => {



    const getContentStyle = (field, isVisible) => {
        if (isVisible || revealedFields[field]) return '';
        return 'blur-md hover:blur-none transition-all duration-300 cursor-pointer select-none';
    };

    const animationClass = direction === 'next' ? 'animate-slide-right' : 'animate-slide-left';

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 overflow-y-auto w-full">
            <div className={`bg-secondary rounded-3xl p-8 max-w-2xl w-full border-4 border-secondary ${animationClass}`}>
                <div className="text-center mb-6">
                    <span className="text-sm font-semibold text-secondary bg-accent bg-opacity-100 px-3 py-1 rounded-full">
                        {currentIndex + 1} / {totalCards}
                    </span>
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
                        className={`transition-all duration-500 ease-in-out overflow-hidden w-full ${
                            showExample ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
                        }`}
                    >
                        <div className="bg-accent backdrop-blur-sm p-4 sm:p-6 rounded-3xl w-full space-y-2 border-2 border-accent">
                            <div className="text-xl sm:text-2xl text-center text-secondary font-bold">{currentCard.przykład.chiński}</div>
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
