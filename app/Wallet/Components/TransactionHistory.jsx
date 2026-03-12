"use client";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchWalletTransactions } from "@/lib/redux/slice/walletTransactionsSlice";
import { useAuth } from "@/contexts/AuthContext";
import { HighestTransctionCard } from "./HighestTransctionCard";

const SCALE_CONFIG = [
    { minWidth: 0, scaleClass: "scale-90" },
    { minWidth: 320, scaleClass: "scale-90" },
    { minWidth: 375, scaleClass: "scale-100" },
    { minWidth: 480, scaleClass: "scale-125" },
    { minWidth: 640, scaleClass: "scale-120" },
    { minWidth: 768, scaleClass: "scale-150" },
    { minWidth: 1024, scaleClass: "scale-175" },
    { minWidth: 1280, scaleClass: "scale-200" },
    { minWidth: 1536, scaleClass: "scale-225" },
];




export default function TransactionHistory() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useAuth();
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");

    // Get wallet transactions from Redux store
    const { transactions, status } = useSelector((state) => state.walletTransactions);

    // BEST PRACTICE: Fetch once when idle; slice uses cache (SWR). No duplicate 100ms refresh.
    useEffect(() => {
        if (!token) return;
        if (status === 'idle') {
            dispatch(fetchWalletTransactions({ token, limit: 5 }));
        }
    }, [token, status, dispatch]);

    // Auto-refresh transactions when app comes to foreground (in background, non-blocking)
    useEffect(() => {
        if (!token) return;

        const handleFocus = () => {
            // Refresh in background when user returns to app
            dispatch(fetchWalletTransactions({ token, limit: 5, background: true }));
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [token, dispatch]);

    // Ensure transactions is always an array (safety check)
    const transactionsArray = Array.isArray(transactions) ? transactions : [];

    // Sort transactions by date (newest first) to ensure latest transactions appear at top
    // This ensures that after completing daily challenge, the new transaction appears first
    const sortedTransactions = [...transactionsArray].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateB - dateA; // Newest first
    });

    // Display only the first 5 transactions (newest first)
    const displayedData = sortedTransactions.slice(0, 5);

    const handleSeeAll = () => {
        // Smooth navigation to full transaction history
        router.push('/Wallet/full-transaction-history');
    };

    const getScaleClass = useCallback((width) => {
        for (let i = SCALE_CONFIG.length - 1; i >= 0; i--) {
            if (width >= SCALE_CONFIG[i].minWidth) {
                return SCALE_CONFIG[i].scaleClass;
            }
        }
        return "scale-100";
    }, []);

    useEffect(() => {
        const updateScale = () => {
            setCurrentScaleClass(getScaleClass(window.innerWidth));
        };
        updateScale();
    }, [getScaleClass]);

    return (
        <section className="flex flex-col items-center px-2 pb-2 w-full max-w-[335px]">
            <div
                className={`flex flex-col gap-4 items-center transition-transform duration-200 ease-in-out`}
            >
                <div className="w-[335px] flex items-center justify-between  mt-[24px] ">
                    <div className="[font-family:'Poppins',Helvetica] font-semibold  text-[#F4F3FC] text-[16px] tracking-[-0.17px] leading-[18px] opacity-[100%]">
                        Transaction History
                    </div>
                    {displayedData.length > 0 && (
                        <button
                            onClick={handleSeeAll}
                            className="[font-family:'Poppins',Helvetica] font-medium text-[#8B92DF] text-[16px] tracking-[-0.17px] leading-[18px] bg-transparent border-none cursor-pointer hover:underline"
                        >
                            See All
                        </button>
                    )}
                </div >
                {displayedData.length > 0 ? (
                    displayedData.map((data) => (
                        <HighestTransctionCard
                            key={data.id}
                            {...data}
                        />
                    ))
                ) : (
                    <div className="w-[335px] flex flex-col items-center justify-center py-12 px-6">
                        <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-[#8B92DF] to-[#201f59] shadow-lg">
                            <Image
                                src="/dollor.png"
                                alt="Coin icon"
                                width={40}
                                height={40}
                                className="opacity-80"
                                loading="eager"
                            />
                        </div>
                        <h3 className="[font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-[18px] tracking-[-0.17px] leading-[22px] text-center mb-3">
                            No Transactions Yet
                        </h3>
                        <p className="[font-family:'Poppins',Helvetica] font-normal text-white text-[14px] tracking-[-0.17px] leading-[20px] text-center mb-4 opacity-90">
                            Start playing games to earn coins and see your transaction history here!
                        </p>
                        <div className="flex items-center gap-2 text-white text-[12px] font-medium">
                            <span>💎</span>
                            <span>Play games to earn rewards</span>
                        </div>
                    </div>
                )}
            </div>
        </section >
    );
}