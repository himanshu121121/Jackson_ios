import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const Settings = ({ profile, themeLabel, notificationsEnabled, handleToggleNotifications, signOut }) => {
    const router = useRouter()

    const handleContactUs = () => {
        router.push('/contact-us')
    }

    const handlePrivacyPolicy = () => {
        router.push('/privacy-policy')
    }

    // Fast navigation to Ticket form for Android
    const handleTicketsComplaints = () => {
        // Prefetch for faster navigation
        router.prefetch('/Ticket')
        // Navigate with scroll disabled for Android performance
        router.push('/Ticket', { scroll: false })
    }
    return (
        <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
            <h3 className="font-semibold text-white text-base">Settings</h3>

            <div className="w-full bg-[#141414] rounded-lg border border-[#494949] shadow p-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <Image
                            width={24}
                            height={24}
                            alt="Notifications"
                            src="https://c.animaapp.com/V1uc3arn/img/line-media-notification-3-line.svg"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                        <span className="text-white text-base">Notifications</span>
                    </div>
                    <button
                        className={`w-[42px] h-[22px] rounded-[10px] relative transition-all ${notificationsEnabled ? "bg-[#8b92de]" : "bg-gray-500"
                            }`}
                        onClick={handleToggleNotifications}
                        aria-label="Toggle Notifications"
                    >
                        <span
                            className={`absolute top-[3px] w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled ? "left-[22px]" : "left-[3px]"
                                }`}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between w-full mt-6">
                    <div className="flex items-center gap-4">
                        <Image
                            width={24}
                            height={24}
                            alt="Language"
                            src="https://c.animaapp.com/V1uc3arn/img/line-editor-translate-2.svg"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                        <span className="text-white text-base">Language</span>
                    </div>
                    <span className="text-[#8b92de] text-sm">English</span>
                </div>
            </div>

            <div className="w-full bg-[#141414] rounded-lg border border-[#494949] shadow p-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <Image
                            width={24}
                            height={24}
                            alt="Security"
                            src="https://c.animaapp.com/V1uc3arn/img/line-business-projector-2-line.svg"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                        <span className="text-white text-base">Security</span>
                    </div>
                    <button
                        className="text-[#8b92de] text-sm hover:underline focus:outline-none"
                        onClick={() => router.push('/forgotpassword')}
                        aria-label="Forgot Password"
                        type="button"
                    >
                        Forgot Password?
                    </button>
                </div>

                <div className="flex items-center justify-between w-full mt-6">
                    <div className="flex items-center gap-4">
                        <Image
                            width={24}
                            height={24}
                            alt="Theme"
                            src="https://c.animaapp.com/V1uc3arn/img/line-health-mental-health-line.svg"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                        <span className="text-white text-base">Theme</span>
                    </div>
                    <span className="text-[#8b92de] text-sm">{themeLabel}</span>
                </div>
            </div>

            <div className="w-full mb-8 bg-[#141414] rounded-lg border border-[#494949] shadow p-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <Image
                            width={24}
                            height={24}
                            alt="Tickets / Complaints"
                            src="https://c.animaapp.com/V1uc3arn/img/line-user-contacts-line.svg"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                        <span className="text-white text-base">
                            Tickets / Complaints
                        </span>
                    </div>
                    <button
                        className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        aria-label="Go to Tickets / Complaints"
                        onClick={handleTicketsComplaints}
                    >
                        <Image
                            width={24}
                            height={24}
                            alt="Arrow"
                            src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between w-full mt-6">
                    <div className="flex items-center gap-4">
                        <Image
                            width={24}
                            height={24}
                            alt="Contact us"
                            src="https://c.animaapp.com/V1uc3arn/img/line-communication-chat-quote-line.svg"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                        <span className="text-white text-base">Contact us</span>
                    </div>
                    <button
                        className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        aria-label="Go to Contact us"
                        onClick={handleContactUs}
                    >
                        <Image
                            width={24}
                            height={24}
                            alt="Arrow"
                            src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between w-full mt-6">
                    <div className="flex items-center gap-4">
                        <Image
                            width={24}
                            height={24}
                            alt="Privacy policy"
                            src="https://c.animaapp.com/V1uc3arn/img/line-system-lock-2-line.svg"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                        <span className="text-white text-base">Privacy policy</span>
                    </div>
                    <button
                        className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        aria-label="Go to Privacy policy"
                        onClick={handlePrivacyPolicy}
                    >
                        <Image
                            width={24}
                            height={24}
                            alt="Arrow"
                            src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                    </button>
                </div>
                <div className="flex items-center justify-between w-full mt-6">
                    <div className="flex items-center gap-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 text-white"
                            onClick={signOut}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                            />
                        </svg>
                        <span onClick={signOut} className="text-white text-base">Log out</span>
                    </div>
                    <button
                        className="w-6 h-6"
                        aria-label="Log out of your account"
                        onClick={signOut}
                    >
                        <Image
                            width={24}
                            height={24}
                            alt="Perform action"
                            src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                            className="w-6 h-6"
                            loading="eager"
                            decoding="async"
                            priority
                        />
                    </button>
                </div>

            </div>
        </section>
    )
}

export default Settings
