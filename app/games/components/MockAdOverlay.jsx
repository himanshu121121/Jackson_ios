"use client";
import React, { useState, useEffect } from 'react';

/**
 * Mock Ad Overlay Component
 * Displays a visual mock ad for web browser testing
 * This simulates what a real AppLovin MAX ad would look like
 */
const MockAdOverlay = ({ 
  isVisible, 
  onComplete, 
  onClose,
  duration = 15 // seconds
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setTimeRemaining(duration);
      setCanClose(false);
      return;
    }

    // Countdown timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center" style={{ zIndex: 99999 }}>
      {/* Mock Ad Container */}
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-white text-sm font-semibold">Rewarded Ad</span>
          </div>
          <div className="flex items-center gap-2">
            {!canClose && (
              <span className="text-white/80 text-xs">
                {timeRemaining}s
              </span>
            )}
            {canClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close ad"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mock Ad Content */}
        <div className="relative aspect-video bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Ad Content */}
          <div className="relative z-10 text-center px-6">
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-2">Mock Rewarded Ad</h3>
            <p className="text-white/70 text-sm mb-4">
              This is a mock ad for web browser testing
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((duration - timeRemaining) / duration) * 100}%` }}
              ></div>
            </div>

            {/* Timer */}
            {timeRemaining > 0 && (
              <p className="text-white/60 text-xs">
                Please wait {timeRemaining} second{timeRemaining !== 1 ? 's' : ''} to earn your reward
              </p>
            )}
            
            {canClose && (
              <button
                onClick={onComplete}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                Claim Reward
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-4 py-2 text-center">
          <p className="text-white/50 text-xs">
            Powered by AppLovin MAX (Mock)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockAdOverlay;
