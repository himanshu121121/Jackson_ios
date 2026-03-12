import React from "react";

export const FinancialMetricsSection = () => {
    return (
        <section className="w-full mt-7 mb-30 max-w-sm p-4 bg-black rounded-[10px] shadow-[2.48px_2.48px_18.58px_#a6aabc4c,-1.24px_-1.24px_16.1px_#f9faff1a]">
            <div className="flex items-start gap-2">
                <img
                    className="w-[83px] h-[83px] object-cover flex-shrink-0"
                    alt="Receipt scanning illustration"
                    src="/scanner.png"
                />
                <div className="flex flex-col items-start ">
                    <h3 className="[font-family:'Poppins',Helvetica] font-bold text-[#FFFFFF] text-[16px] tracking-[0.02px] leading-[normal]">
                        Scan Your Receipts
                    </h3>
                    <p className="self-stretch [font-family:'Poppins',Helvetica] font-normal text-[#FFFFFF] text-[13px] tracking-[-0.13px] leading-4">
                        Scan your food bills, petrol bills etc. to get more loyalty points
                    </p>
                    <button
                        className="w-[120px] h-[28px] rounded-[6px]  mt-2 flex items-center justify-center bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] hover:opacity-90 transition-opacity"
                        aria-label="Start scanning receipts"
                    >
                        <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[13px] tracking-[0] leading-[normal]">
                            Start Scanning
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
};