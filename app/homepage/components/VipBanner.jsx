"use client";
import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";

const VipBanner = () => {
    const router = useRouter();

    // OPTIMIZED: Memoize selector to prevent unnecessary re-renders
    const vipStatus = useSelector((state) => state.profile.vipStatus);

    // OPTIMIZED: Memoize VIP status calculation
    const vipData = useMemo(() => {
        const isVipActive = vipStatus?.data?.isActive && vipStatus?.data?.currentTier && vipStatus?.data?.currentTier.toLowerCase() !== "free";
        const currentTier = vipStatus?.data?.currentTier;

        return {
            isVipActive,
            currentTier
        };
    }, [vipStatus]);

    // OPTIMIZED: Memoize event handler
    const handleVipClick = useCallback(() => {
        if (typeof window !== "undefined") sessionStorage.setItem("buySubscriptionFrom", "/homepage");
        router.push("/BuySubscription");
    }, [router]);

    // OPTIMIZED: Memoize VIP upgrade handler
    const handleVipUpgrade = useCallback(() => {
        if (typeof window !== "undefined") sessionStorage.setItem("buySubscriptionFrom", "/homepage");
        router.push("/BuySubscription");
    }, [router]);

    return (
        !vipData.isVipActive ? (
            <section className="relative w-full max-w-[335px] h-[127px]   mx-auto mb-4">
                <Image
                    width={334}
                    height={127}
                    className="w-full h-[140px]"
                    alt="VIP background"
                    src="/vipbg.svg"
                />
                <Image
                    width={215}
                    height={119}
                    className="absolute w-[215px] h-[119px] top-2 left-0"
                    alt="VIP decoration"
                    src="/vipdecoration.png"
                />
                <div className="flex flex-col w-[220px] absolute top-[21px] left-[20px]">
                    <div className="flex flex-col pb-2">
                        <div className="font-bold text-white text-sm">Become a</div>
                        <h3 className="font-semibold text-white text-[32px] leading-8">
                            VIP Member
                        </h3>
                    </div>
                    <button
                        onClick={handleVipUpgrade}
                        className="w-fit px-4 py-2 bg-[#ffdd8f] rounded-xl hover:opacity-90 transition-transform active:scale-95 [font-family:'Poppins',Helvetica] font-semibold text-[#736de8] text-[13px] tracking-[0] leading-[normal]"
                    >
                        Check Plans
                    </button>
                </div>
            </section>
        ) : (
            <section className="relative w-full max-w-[335px] h-[127px] mx-auto  mb-4">
                <Image
                    width={334}
                    height={127}
                    className="w-full h-[140px]"
                    alt="VIP background"
                    src="/vipbg.svg"
                />
                <Image
                    width={215}
                    height={119}
                    className="absolute w-[215px] h-[119px] top-2 left-0"
                    alt="VIP decoration"
                    src="/vipdecoration.png"
                />
                <div className="flex flex-col w-[220px] absolute top-[21px] left-[20px]">
                    <div className="flex flex-col pb-2">
                        <h3 className="font-semibold text-white text-[32px] leading-8">
                            {vipData.currentTier?.charAt(0).toUpperCase() + vipData.currentTier?.slice(1).toLowerCase()} Member
                        </h3>
                    </div>
                    <button
                        onClick={handleVipUpgrade}
                        className="w-fit px-4 py-2 bg-[#ffdd8f] rounded-xl hover:opacity-90 transition-transform active:scale-95 [font-family:'Poppins',Helvetica] font-semibold text-[#736de8] text-[13px] tracking-[0] leading-[normal]"
                    >
                        Upgrade Plan
                    </button>
                </div>
            </section>
        )
    );
};

export default VipBanner;
``