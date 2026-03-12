import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { spinForChallenge } from "../../../lib/api";

export const SimpleSpinWheel = ({ onSpinComplete, isSpinning, disabled, onSpinStart, token, onSpinSuccess, onSpinError }) => {
    const [rotation, setRotation] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [spinMessage, setSpinMessage] = useState("");
    const spinSuccessRef = useRef(false);
    const onSpinCompleteCalledRef = useRef(false);

    const handleSpin = async () => {
        if (disabled || isAnimating || isSpinning) return;

        setIsAnimating(true);
        setSpinMessage("");
        if (onSpinStart) {
            onSpinStart();
        }

        // Random rotation between 1080 (3 full spins) and 2160 (6 full spins) degrees
        const minSpins = 1080;
        const maxSpins = 2160;
        const randomRotation = minSpins + Math.random() * (maxSpins - minSpins);
        const finalRotation = rotation + randomRotation;

        setRotation(finalRotation);
        spinSuccessRef.current = false;
        onSpinCompleteCalledRef.current = false;

        // Call spin API and retry until successful (during the animation)
        let attempts = 0;
        const maxAttempts = 10; // Maximum retry attempts

        // Start the API call immediately (non-blocking for animation)
        const spinApiCall = async () => {
            while (!spinSuccessRef.current && attempts < maxAttempts) {
                try {
                    attempts++;

                    const spinResult = await spinForChallenge(token);
                    const success = spinResult?.success === true || spinResult?.data?.success === true;

                    if (success) {
                        spinSuccessRef.current = true;
                        setSpinMessage("✅ Spin successful!");
                        setIsAnimating(false);
                        if (onSpinSuccess) {
                            onSpinSuccess(spinResult);
                        }
                        if (onSpinComplete && !onSpinCompleteCalledRef.current) {
                            onSpinCompleteCalledRef.current = true;
                            onSpinComplete(true);
                        }
                        return;
                    } else {
                        setSpinMessage(`Retrying... (${attempts}/${maxAttempts})`);

                        // Wait a bit before retrying (except on last attempt)
                        if (attempts < maxAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                } catch (error) {
                    setSpinMessage(`Retrying... (${attempts}/${maxAttempts})`);

                    if (onSpinError) {
                        onSpinError(error);
                    }

                    // Wait a bit before retrying (except on last attempt)
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        };

        // Start the API call
        spinApiCall();

        // After animation completes (3 seconds), call onSpinComplete
        setTimeout(async () => {
            // Wait longer for API to complete (up to 10 seconds total)
            let waitCount = 0;
            while (!spinSuccessRef.current && waitCount < 14) { // 7 * 500ms = 3.5s extra wait
                await new Promise(resolve => setTimeout(resolve, 500));
                waitCount++;
            }

            setIsAnimating(false);

            // Only call onSpinComplete if we haven't already (e.g. when API succeeded early)
            if (onSpinComplete && !onSpinCompleteCalledRef.current) {
                onSpinCompleteCalledRef.current = true;
                onSpinComplete(spinSuccessRef.current);
            }

            if (!spinSuccessRef.current) {
                setSpinMessage("❌ Spin failed. Please try again.");
            }
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            {/* Small Spin Wheel */}
            <div className="relative w-32 h-32 mb-4">
                {/* Wheel Container */}
                <motion.div
                    className="relative w-full h-full"
                    animate={{
                        rotate: rotation,
                    }}
                    transition={{
                        duration: 3,
                        ease: [0.43, 0.13, 0.23, 0.96], // Ease out cubic
                    }}
                >
                    {/* Spin Wheel Image */}
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full relative">
                                {/* Wheel segments - simple 8 segment design */}
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-full h-full"
                                        style={{
                                            transform: `rotate(${i * 45}deg)`,
                                        }}
                                    >
                                        <div
                                            className="absolute top-0 left-1/2 w-1/2 h-full origin-left"
                                            style={{
                                                backgroundColor: i % 2 === 0 ? '#FFD700' : '#FF8C00',
                                                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                                            }}
                                        />
                                    </div>
                                ))}
                                {/* Center circle */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full border-2 border-white shadow-lg z-10" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Pointer/Arrow at top */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
                </div>
            </div>

            {/* Spin Message */}
            {spinMessage && (
                <div className="mb-2 text-sm font-medium">
                    <div className={`${spinMessage.includes('✅') ? 'text-green-400' : 'text-yellow-400'}`}>
                        {spinMessage}
                    </div>
                </div>
            )}

            {/* Spin Button */}
            <button
                onClick={handleSpin}
                disabled={disabled || isAnimating || isSpinning}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 ${disabled || isAnimating || isSpinning
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
            >
                {isAnimating || isSpinning ? 'Spinning...' : 'Spin the Wheel'}
            </button>
        </div>
    );
};

