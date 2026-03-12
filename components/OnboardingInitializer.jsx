'use client'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOnboardingOptions } from '@/lib/redux/slice/onboardingSlice'

export default function OnboardingInitializer({ children }) {
  const loadFromStorage = useOnboardingStore((s) => s.loadFromStorage)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const { ageOptions } = useSelector((state) => state.onboarding)

  useEffect(() => {
    async function hydrate() {
      await loadFromStorage()
      setIsLoaded(true)
    }
    hydrate()
  }, [loadFromStorage])

  // Fetch onboarding options if Redux store is empty (e.g. app resumed mid-onboarding)
  useEffect(() => {
    if (ageOptions.length === 0) {
      Promise.all([
        dispatch(fetchOnboardingOptions("age_range")),
        dispatch(fetchOnboardingOptions("gender")),
        dispatch(fetchOnboardingOptions("game_preferences")),
        dispatch(fetchOnboardingOptions("game_style")),
        dispatch(fetchOnboardingOptions("dealy_game")),
      ])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) {
    return null
  }

  return children
}
