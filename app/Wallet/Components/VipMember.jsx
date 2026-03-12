"use client";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";



export const VipMember = ({ vipStatus, handleVipUpgrade }) => {
    const isVipActive = vipStatus?.data?.isActive && vipStatus?.data?.currentTier && vipStatus?.data?.currentTier.toLowerCase() !== "free";
    return (
        !isVipActive ? (
            <section className="relative w-full max-w-[335px] h-[127px] mx-auto mb-30">
                <Image
                    width={334}
                    height={127}
                    className="w-full h-[140px]"
                    alt="VIP background"
                    src="/vipbg.svg"
                    loading="eager"
                    priority
                />
                <Image
                    width={215}
                    height={119}
                    className="absolute w-[215px] h-[119px] top-2 left-0"
                    alt="VIP decoration"
                    src="/vipdecoration.png"
                    loading="eager"
                    priority
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
            <section className="relative w-full max-w-[335px] h-[127px] mb-30 mx-auto">
                <Image
                    width={334}
                    height={127}
                    className="w-full h-[140px]"
                    alt="VIP background"
                    src="/vipbg.svg"
                    loading="eager"
                    priority
                />
                <Image
                    width={215}
                    height={119}
                    className="absolute w-[215px] h-[119px] top-2 left-0"
                    alt="VIP decoration"
                    src="/vipdecoration.png"
                    loading="eager"
                    priority
                />
                <div className="flex flex-col w-[220px] absolute top-[21px] left-[20px]">
                    <div className="flex flex-col pb-2">
                        <h3 className="font-semibold text-white text-[32px] leading-8">
                            {vipStatus?.data?.currentTier?.charAt(0).toUpperCase() + vipStatus?.data?.currentTier?.slice(1).toLowerCase()} Member
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


    )
}
