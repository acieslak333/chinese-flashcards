import React, { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';

const Quiz = ({
    currentCard,
    allCards,
    onNext,
    config = { optionsCount: 4, questionType: 'chinese', answerType: 'polish' }
}) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    const optionsCount = config.optionsCount || 4;
    const questionType = config.questionType || 'chinese';
    const answerType = config.answerType || 'polish';

    // Helper to get display text based on type
    const getDisplayText = (card, type) => {
        if (!card) return '???';
        if (type === 'chinese') return card.chiński;
        if (type === 'pinyin') return card.pinyin;
        if (type === 'polish') return card.polskie_znaczenie;
        return card.chiński;
    };

    // Helper to get question label
    const getQuestionLabel = (type) => {
        if (type === 'chinese') return 'Co to znaczy?';
        if (type === 'pinyin') return 'Jaki to znak/znaczenie?';
        if (type === 'polish') return 'Jaki to znak?';
        return 'Pytanie';
    };

    // Generate options only when currentCard changes
    const options = useMemo(() => {
        // Fallback: Use allCards available, even if fewer than optionsCount
        if (!allCards || allCards.length === 0) return [];

        const count = Math.min(optionsCount - 1, allCards.length - 1); // -1 because current is distinct

        // 1. Get random distractors distinct from currentCard
        const distractors = [];
        const potentialDistractors = allCards.filter(c => c.chiński !== currentCard.chiński);

        while (distractors.length < count && potentialDistractors.length > 0) {
            const randomIndex = Math.floor(Math.random() * potentialDistractors.length);
            distractors.push(potentialDistractors[randomIndex]);
            potentialDistractors.splice(randomIndex, 1);
        }

        // 2. Combine with correct answer
        const allOptions = [currentCard, ...distractors];

        // 3. Shuffle
        return allOptions.sort(() => Math.random() - 0.5);
    }, [currentCard, allCards, optionsCount]);

    useEffect(() => {
        setSelectedOption(null);
        setIsCorrect(null);
    }, [currentCard, config]); // Reset on config change too

    const handleOptionClick = (option) => {
        if (selectedOption) return;

        setSelectedOption(option);
        const correct = option.chiński === currentCard.chiński;
        setIsCorrect(correct);

        if (navigator.vibrate) {
            if (correct) {
                navigator.vibrate([10, 30, 10]);
            } else {
                navigator.vibrate(300);
            }
        }

        if (correct) {
            setTimeout(() => {
                onNext();
            }, 1000);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 w-full max-w-2xl mx-auto">
            {/* Question Card */}
            <div className="bg-secondary rounded-3xl p-8 w-full border-4 border-secondary mb-6 flex flex-col items-center min-h-[200px] justify-center animate-fade-up">
                <div className="text-secondary bg-accent px-4 py-1 rounded-full text-sm font-bold mb-4">
                    {getQuestionLabel(questionType)}
                </div>
                <div className="text-4xl sm:text-6xl font-bold text-accent text-wrap text-center mb-2 break-words w-full">
                    {getDisplayText(currentCard, questionType)}
                </div>
                {/* Optional Hint (show pinyin if question is chinese) */}
                {questionType === 'chinese' && (
                    <div className="text-xl text-accent opacity-70 text-center">
                        {/* Maybe hide pinyin in strict mode? For now show it as hint */}
                        {/* User might want to hide it. Let's show only if config says distinct types? */}
                        {/* Actually, if Answer is Pinyin, hiding Pinyin here is key. */}
                        {answerType !== 'pinyin' ? currentCard.pinyin : ''}
                    </div>
                )}
            </div>

            {/* Options Grid */}
            <div className={`grid w-full gap-3 ${optionsCount > 2 ? 'grid-cols-1' : 'grid-cols-1'}`}>
                {/* Always 1 col looks better for text on mobile, maybe 2 cols for short text? 
                   Let's stick to 1 col based on existing design preference for clarity 
                */}
                {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isTarget = option.chiński === currentCard.chiński;

                    // THEME BASED STYLING (No standard Green/Red)
                    let buttonStyle = "bg-transparent border-2 border-primary text-primary hover:bg-primary/10";
                    let icon = null;

                    if (selectedOption) {
                        if (isTarget) {
                            // CORRECT: Primary Fill (Dark Green/Blue usually) + Secondary Text
                            buttonStyle = "bg-primary border-2 border-primary text-secondary";
                            icon = <Check size={20} />;
                        } else if (isSelected && !isTarget) {
                            // WRONG: Accent Fill (Red) + Secondary Text
                            buttonStyle = "bg-accent border-2 border-accent text-secondary opacity-90";
                            icon = <X size={20} />;
                        } else {
                            // OTHERS: Invisible border (bg color), full opacity text
                            buttonStyle = "bg-transparent border-2 border-secondary text-primary";
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(option)}
                            disabled={!!selectedOption}
                            className={`p-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-between min-h-[60px] ${buttonStyle}`}
                        >
                            <span className="text-center w-full break-words">
                                {getDisplayText(option, answerType)}
                            </span>
                            {icon && <span className="ml-2 flex-shrink-0">{icon}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Quiz;
