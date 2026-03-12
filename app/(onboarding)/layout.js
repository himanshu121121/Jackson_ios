"use client";
import OnboardingInitializer from "@/components/OnboardingInitializer";
import useOnboardingStore from "@/stores/useOnboardingStore";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

const TOTAL_STEPS = 5;

// Step number → route to go back to (step 1 has no back)
const PREV_ROUTES = {
  2: "/select-age",
  3: "/select-gender",
  4: "/game-preferences",
  5: "/game-styles",
};

const OnboardingLayout = ({ children }) => {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const router = useRouter();

  // Intercept Android hardware back button during onboarding.
  // Navigate to the previous step within the flow — never outside it.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle;
    App.addListener("backButton", () => {
      const step = useOnboardingStore.getState().currentStep;
      const prevRoute = PREV_ROUTES[step];
      if (prevRoute) {
        router.replace(prevRoute);
      }
      // Step 1: block back — user cannot exit onboarding
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      listenerHandle?.remove();
    };
  }, [router]);

  return (
    <div className="relative w-full h-screen bg-[#272052] overflow-hidden">
      <OnboardingInitializer>{children}</OnboardingInitializer>
    </div>
  );
};

export default OnboardingLayout;
