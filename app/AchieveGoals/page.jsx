"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoalProgressSection } from "./components/GoalProgressSection";
import { TaskListSection } from "./components/TaskListSection";
import { BannerSection } from "./components/BannerSection";
import { HomeIndicator } from "@/components/HomeIndicator";
import { Header } from "./components/Header";
import SurveysSection from "../homepage/components/SurveysSection";


export default function AchieveGoalsPage() {
    const router = useRouter();

    // Preload critical images for faster rendering
    useEffect(() => {
        const criticalImages = [
            '/dollor.png',
            '/xp.svg',
            '/goalstep1.svg',
            '/goalstep2.svg',
            '/goalstep3.svg',
            '/goalstep4.svg',
            '/goalstep5.svg',
            '/trophy@2x.png',
            '/arhievegolasbanner.png',
            '/tesurebox.png',
            '/dot1.svg',
            '/dot2.svg',
            '/dot3.svg',
            '/dot4.svg',
            '/dot5.svg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = src.endsWith('.svg') ? 'image/svg+xml' : 'image';
            link.href = src;
            document.head.appendChild(link);
        });

        // Cleanup function to remove preload links
        return () => {
            criticalImages.forEach(src => {
                const links = document.head.querySelectorAll(`link[href="${src}"]`);
                links.forEach(link => link.remove());
            });
        };
    }, []);

    return (
        <div className="flex flex-col overflow-x-hidden overflow-y-auto w-full min-h-screen items-center justify-start  gap-4 px-4 pb-2 pt-1 bg-black max-w-[390px] mx-auto relative">
            <Header />
            <GoalProgressSection />
            <TaskListSection />
            <BannerSection />
            <div className="-mt-8 pb-26">
                <SurveysSection />
            </div>
            <HomeIndicator />
        </div>
    );
}