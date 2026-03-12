"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { SurveyListSection } from "./components/SurveyListSection";
import { HomeIndicator } from "../../components/HomeIndicator";

export default function SurveysPage() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    const handleSurveyClick = (survey) => {
        console.log('Survey clicked:', survey.title);
        // Directly redirect to clickUrl from survey response
        if (survey.clickUrl) {
            // Open in new tab/window
            window.open(survey.clickUrl, '_blank', 'noopener,noreferrer');
        } else {
            console.error('❌ Survey has no clickUrl');
        }
    };

    return (
        <div className="flex justify-center ">
            <div
                className="relative overflow-x-hidden w-full min-h-screen bg-black pb-[250px] mx-auto"
                data-model-id="289:1500"
                style={{ paddingBottom: '250px' }}
            >
                {/* App version */}
                <div className="absolute top-[10px] left-5 font-normal text-white text-[10px] leading-3 z-10 [font-family:'Poppins',Helvetica]">
                    App Version: V0.0.1
                </div>

                <div className="flex flex-col w-full justify-center items-start gap-2 px-5 py- absolute top-[50px] left-0">
                    <div className="flex h-12 items-center justify-between w-full max-w-sm mx-auto rounded-[32px]">
                        <button
                            onClick={handleGoBack}
                            className="py-2 pr-2 -ml-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                            aria-label="Go back"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6 text-white"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <h1 className="font-semibold text-white text-xl ml-2 tracking-[0] leading-5 [font-family:'Poppins',Helvetica] flex-1">
                            Surveys
                        </h1>
                    </div>
                </div>

                <SurveyListSection
                    onSurveyClick={handleSurveyClick}
                />

                <HomeIndicator activeTab="home" />
            </div>
        </div>
    );
}


