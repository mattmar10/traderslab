"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Raleway } from 'next/font/google';
import React from 'react';
import { EmailForm } from './email-form';
import { createPrereleaseUser } from '@/actions/prerelease/actions';

const raleway = Raleway({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

const ease: number[] = [0.16, 1, 0.3, 1];


const HeroTitles = React.memo(function HeroTitles(): JSX.Element {
    return (
        <section>
            <div
                className={`flex w-full max-w-2xl flex-col space-y-4 overflow-hidden  ${raleway.className}`}
            >
                <motion.h1
                    className="text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl"
                    initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                        duration: 1,
                        ease,
                        staggerChildren: 0.2,
                    }}
                >
                    {[
                        "Elevate",
                        "your trading",
                        "with",
                        <span className="text-traderslabblue" key={"tl"}>
                            TradersLab
                        </span>,
                    ].map((text, index) => (
                        <motion.span
                            key={index}
                            className="inline-block px-1 md:px-2 text-balance font-bold"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.2,
                                ease,
                            }}
                        >
                            {text}
                        </motion.span>
                    ))}
                </motion.h1>
                <motion.p
                    className="mx-auto max-w-3xl text-center leading-7 text-muted-foreground sm:leading-9 text-balance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.6,
                        duration: 0.8,
                        ease,
                    }}
                >
                    TradersLab is still in development, but exciting things are on the way! Be the first to know when we launch and get access to exclusive early-bird offers.

                    Sign up now to stay updated, and we’ll send you a special launch announcement and early access perks once the app is ready to go live!
                </motion.p>
            </div>
        </section>
    );
});
export default function ComingSoon(): JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const result = await createPrereleaseUser(email);
            setIsError(!result.success);
            setMessage(result.message);
            if (result.success) {
                setEmail('');
            }
        } catch (error) {
            console.log(error)
            setIsError(true);
            setMessage('Something went wrong. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex w-full flex-col items-center justify-start px-4 sm:px-6  lg:px-8">

            <HeroTitles />
            <EmailForm
                email={email}
                setEmail={setEmail}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
            />
            {message && (
                <motion.p
                    className={`mt-4 ${isError ? 'text-red-500' : 'text-traderslabblue'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {message}
                </motion.p>


            )}
            <motion.div className=' mt-64' initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                <img
                    src={"/tl-light-theme-nav-logo.png"}
                    alt="TradersLab Logo"
                    className={`w-auto  transition-opacity duration-300`} />
            </motion.div>
        </div>
    );
}