"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchFullWalletTransactions } from '@/lib/redux/slice/walletTransactionsSlice';
import { useAuth } from '@/contexts/AuthContext';
import { HighestTransctionCard } from './HighestTransctionCard';

const FullTransactionHistroy = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useAuth();

    // Get full transactions from Redux store
    const { fullTransactions, fullTransactionsStatus, pagination } = useSelector((state) => state.walletTransactions);

    // Fetch full transactions on mount if not already loaded (stale-while-revalidate pattern)
    // Shows cached data immediately, fetches fresh data in background
    useEffect(() => {
        if (!token) return;

        // Only fetch if status is idle (not already loading/fetched)
        // The stale-while-revalidate pattern in the slice will handle cache checking
        if (fullTransactionsStatus === 'idle') {
            dispatch(fetchFullWalletTransactions({
                token,
                page: 1,
                limit: 20,
                type: "all"
            }));
        } else if (fullTransactionsStatus === 'succeeded' && fullTransactions.length > 0) {
            // If we have cached data, trigger background refresh to get latest
            setTimeout(() => {
                dispatch(fetchFullWalletTransactions({
                    token,
                    page: 1,
                    limit: 20,
                    type: "all",
                    background: true
                }));
            }, 100);
        }
    }, [token, fullTransactionsStatus, dispatch]);

    // Auto-refresh transactions when app comes to foreground (in background, non-blocking)
    useEffect(() => {
        if (!token) return;

        const handleFocus = () => {
            // Refresh in background when user returns to app
            dispatch(fetchFullWalletTransactions({
                token,
                page: 1,
                limit: 20,
                type: "all",
                background: true
            }));
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [token, dispatch]);

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <section className="flex flex-col items-center p-3 w-full max-w-[335px] mx-auto">
                {/* App Version */}
                <div className="w-full max-w-[335px] mx-auto px-2   mb-1    flex flex-col">
                    <span className="[font-family:'Poppins',Helvetica] font-normal text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                        App Version: {process.env.NEXT_PUBLIC_APP_VERSION || "V0.1.1"}
                    </span>
                </div>
                <div className="flex flex-col gap-2 items-center w-full">
                    <header className="flex flex-col w-full items-start gap-2 px-0 py-3 mb-4 mt-4">
                        <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex items-center gap-4">
                                <button
                                    className="flex items-center justify-center w-6 h-6 flex-shrink-0"
                                    aria-label="Go back"
                                    onClick={handleBack}
                                >
                                    <svg
                                        className="w-6 h-6 text-white cursor-pointer transition-transform duration-150 active:scale-95"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M15 18L9 12L15 6"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                <h1 className="font-semibold text-white text-xl leading-5">
                                    Full Transaction History
                                </h1>
                            </div>
                        </div>
                    </header>
                    <div className="w-full flex flex-col items-center gap-4">
                        {fullTransactions.length > 0 ? (
                            fullTransactions.map((data) => (
                                <HighestTransctionCard
                                    key={data.id}
                                    {...data}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-400 mt-8">
                                <p>No transactions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FullTransactionHistroy
