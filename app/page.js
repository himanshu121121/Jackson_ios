"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function AppLoader() {
  const router = useRouter();

  useEffect(() => {
    const storedUserString = localStorage.getItem("user");
    const hasCompletedOnboarding =
      localStorage.getItem("onboardingComplete") === "true";
    const onboardingInProgressData = localStorage.getItem("onboarding-storage");
    const permissionsAccepted =
      localStorage.getItem("permissionsAccepted") === "true";
    const locationCompleted =
      localStorage.getItem("locationCompleted") === "true";
    const faceVerificationCompleted =
      localStorage.getItem("faceVerificationCompleted") === "true";
    const faceVerificationSkipped =
      localStorage.getItem("faceVerificationSkipped") === "true";

    if (storedUserString) {
      try {
        const user = JSON.parse(storedUserString);

        // Check if this is a new signup (onboarding not complete) or existing user login
        const isNewSignup = !hasCompletedOnboarding;

        // Use profile fields as ground truth, fall back to localStorage flags
        const permissionsAcceptedFinal =
          permissionsAccepted || user.permissionStatus === true;
        const locationCompletedFinal =
          locationCompleted ||
          !!(user.location?.city || user.location?.latitude);
        const faceVerificationCompletedFinal =
          faceVerificationCompleted || user.faceVerificationStatus === true;

        // Sync localStorage from profile to prevent future mismatches
        if (permissionsAcceptedFinal && !permissionsAccepted)
          localStorage.setItem("permissionsAccepted", "true");
        if (locationCompletedFinal && !locationCompleted)
          localStorage.setItem("locationCompleted", "true");
        if (faceVerificationCompletedFinal && !faceVerificationCompleted)
          localStorage.setItem("faceVerificationCompleted", "true");

        // For new signups, check if the onboarding questionnaire is complete before
        // moving on to permissions/location/face-verification
        if (isNewSignup && onboardingInProgressData) {
          try {
            const onboardingState = JSON.parse(onboardingInProgressData);
            const state = onboardingState?.state;

            if (state) {
              if (!state.ageRange) {
                router.replace("/select-age");
                return;
              } else if (!state.gender) {
                router.replace("/select-gender");
                return;
              } else if (
                !state.gamePreferences ||
                state.gamePreferences.length === 0
              ) {
                router.replace("/game-preferences");
                return;
              } else if (!state.gameStyle) {
                router.replace("/game-styles");
                return;
              } else if (!state.gameHabit) {
                router.replace("/player-type");
                return;
              }
              // All questionnaire fields filled — fall through to permissions check
            }
          } catch (e) {
            // Parsing failed — start questionnaire from beginning
            router.replace("/select-age");
            return;
          }
        }

        if (!permissionsAcceptedFinal) {
          router.replace("/permissions");
          return;
        }

        // Condition 2: Accepted permissions, but has not completed the location step.
        if (!locationCompletedFinal) {
          router.replace("/location");
          return;
        }

        // Condition 3: Only show face verification for NEW SIGNUPS, not for login
        if (
          isNewSignup &&
          !faceVerificationCompletedFinal &&
          !faceVerificationSkipped
        ) {
          router.replace("/face-verification");
          return;
        }

        router.replace("/homepage");
        return;
      } catch (e) {
        // If parsing fails, redirect to login
        router.replace("/login");
      }
    } else if (onboardingInProgressData) {
      try {
        const onboardingState = JSON.parse(onboardingInProgressData);
        const state = onboardingState?.state;

        // Check if there's valid state to resume from.
        if (state) {
          if (!state.ageRange) {
            router.replace("/select-age");
          } else if (!state.gender) {
            router.replace("/select-gender");
          } else if (
            !state.gamePreferences ||
            state.gamePreferences.length === 0
          ) {
            router.replace("/game-preferences"); // Step 3
          } else if (!state.gameStyle) {
            router.replace("/game-styles"); // Step 4
          } else if (!state.gameHabit) {
            router.replace("/player-type"); // Step 5
          } else {
            router.replace("/player-type");
          }
          return;
        }
      } catch (e) {
        // If parsing fails, it's safer to start over.
        console.error("Failed to parse onboarding data, starting over.", e);
        router.replace("/welcome");
      }
    } else if (hasCompletedOnboarding) {
      router.replace("/login");
    } else {
      // Default for brand new users.
      router.replace("/welcome");
    }
  }, [router]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#272052]">
      <Image
        src="/loadingimage.jpg"
        alt="Loading"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
