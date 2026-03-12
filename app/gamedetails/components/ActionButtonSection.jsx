import React, { useState } from "react";

export const ActionButtonSection = ({ game, isInstalled, onGameAction, isDisabled = false }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleButtonClick = async () => {
        if (isDisabled) return;

        if (onGameAction) {
            await onGameAction();
        }
    };

    const handlePress = () => setIsPressed(true);
    const handleRelease = () => setIsPressed(false);

    return (
        <section className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-2 px-4 py-4">
            <div className="flex w-full max-w-[340px] items-center justify-center gap-2 px-0 py-0">
                <button
                    className={`relative w-full h-12 rounded-[12.97px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] transition-transform duration-150 ${isPressed ? "scale-95" : "scale-100"} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                    onClick={handleButtonClick}
                    onMouseDown={handlePress}
                    onMouseUp={handleRelease}
                    onMouseLeave={handleRelease}
                    aria-label="Start Playing - Redirects to App Store"
                    type="button"
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                >
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 [font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-[normal]">
                        {isInstalled ? 'Start Playing' : 'Download Now'}
                    </span>
                </button>
            </div>

            <p className="relative w-full max-w-[364px] [font-family:'Poppins',Helvetica] font-normal text-white text-[10px] text-center tracking-[0] leading-[normal]">
                *You&apos;ll be redirected to the Play Store to start testing this game
            </p>
        </section>
    );
};
