"use client";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { fetchFinancialGoals } from "@/lib/redux/slice/cashCoachSlice";
import { EarningsOverviewSection } from "./EarningsOverviewSection";
import { GoalsAndTargetsSection } from "./GoalsAndTargetsSection";
import { HomeIndicator } from "@/components/HomeIndicator";
import { PageHeader } from "@/components/PageHeader";

// Defined outside the component so React never treats it as a new type on re-render
const CoinBalance = ({ coinBalance, onClick }) => (
    <button
        onClick={onClick}
        className="h-9 rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center px-2.5 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
        type="button"
        aria-label="Navigate to Wallet"
    >
        <div className="flex items-center gap-2 min-w-0">
            <span className="text-white text-lg [font-family:'Poppins',Helvetica] font-semibold leading-[normal] break-all">
                {coinBalance || 0}
            </span>
            <img
                className="w-[23px] h-6 flex-shrink-0"
                alt="Coin"
                src="/dollor.png"
            />
        </div>
    </button>
);

export default function CashCoachPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useAuth();
    const { status, error } = useSelector((state) => state.cashCoach);

    // Audio ref for coin sound effect
    const audioRef = useRef(null);

    // Get wallet screen data from Redux store for coin balance
    const { walletScreen } = useSelector((state) => state.walletTransactions);
    const coinBalance = walletScreen?.wallet?.balance || 0;

    useEffect(() => {
        if (token && status === 'idle') {
            dispatch(fetchFinancialGoals(token));
        }
    }, [dispatch, token, status]);

    // Initialize audio element when component mounts
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.7;
            audioRef.current.load();
        }
    }, []);

    if (status === 'loading' || status === 'idle') {
        return (
            <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
                <div className="text-white text-center text-lg font-medium">
                    Loading Your Coach...
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
                <div className="text-white text-center text-lg font-medium">
                    Error: {error}
                </div>
            </div>
        );
    }

    // Function to play coin sound effect
    const playCoinSound = () => {
        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Retry once silently after autoplay prevention
                        audioRef.current?.play().catch(() => {});
                    });
                }
            }
        } catch {
            // Sound effect unavailable — ignore silently
        }
    };

    // Handle coin balance click to navigate to Wallet
    const handleCoinBalanceClick = () => {
        playCoinSound();
        router.push("/Wallet");
    };

    return (
        <div className="flex flex-col overflow-x-hidden overflow-y-auto w-full min-h-screen items-center justify-start px-4 pb-2 pt-1 bg-black max-w-[390px] mx-auto relative">
            {/* App Version */}
            <div className="absolute top-[1px] left-3 w-full h-[40px] z-10">
                <div className="absolute top-[10px] left-1 [font-family:'Poppins',Helvetica] font-light text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                    App Version: V0.0.1
                </div>
            </div>
            <div className="mt-[26px] w-full">
                <PageHeader
                    title="Cash Coach"
                    rightElement={<CoinBalance coinBalance={coinBalance} onClick={handleCoinBalanceClick} />}
                    showBack={false}
                />
            </div>
            <EarningsOverviewSection />
            <div className="mb-2">
                <GoalsAndTargetsSection />
            </div>
            <HomeIndicator />

            {/* Audio element for coin sound effect */}
            <audio
                ref={audioRef}
                preload="auto"
                src="/spinning-coin-on-table-352448.mp3"
            />
        </div>
    );
}
