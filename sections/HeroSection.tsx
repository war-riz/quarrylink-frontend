"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section, Container } from "@/components/layout/Section";
import { slideInFromTop, fadeIn, staggerContainer } from "@/constants/framer-variants";
import Image from "next/image";

export function HeroSection() {
    return (
        <Section className="relative pt-25 pb-20 md:pt-35 lg:pt-40 lg:pb-40 overflow-hidden bg-[#F4F4F7] px-0" container={false}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="relative w-full h-full">
                    <Image
                        src="/images/hero/hero-bg.png"
                        alt="Quarry site overlay"
                        fill
                        sizes="100vw"
                        className="object-cover opacity-100"
                        priority
                    />
                </div>
            </div>

            <Container className="relative z-10 flex flex-col items-center justify-center text-center">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center max-w-4xl mx-auto"
                >
                    {/* Top Badge */}
                    <motion.div variants={slideInFromTop} className="mb-6">
                        <div className="bg-[#ffd54f] px-4 py-1.5 rounded-full shadow-sm">
                            <span className="text-[13px] md:text-[14px] font-medium text-[#121212]">
                                Revolutionizing Quarry Logistics In Nigeria and Beyond
                            </span>
                        </div>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        variants={slideInFromTop}
                        className="flex flex-col text-[40px] md:text-[56px] font-extrabold leading-[1.1] text-black drop-shadow-sm mb-5"
                    >
                        <span>The Smart Way To Source</span>
                        <span className="text-[#ffc107] drop-shadow-md">
                            Quarry Materials
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={fadeIn}
                        className="text-[15px] md:text-[18px] font-medium text-[#121212] leading-relaxed max-w-3xl mx-auto mb-8"
                    >
                        Connect with verified quarry suppliers, track deliveries in real-time, and pay securely. All in one AI-powered platform built for construction success.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeIn}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        {/* Primary Button */}
                        <Button
                            className="bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] lg:text-[15px] h-12 px-6 rounded-xl shadow-md transition-transform hover:scale-105"
                        >
                            Get QuarryLink
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>

                        {/* Secondary Video Button */}
                        <Button
                            variant="outline"
                            className="border-2 border-[#121212] bg-transparent! hover:bg-black/5! text-[#121212]! font-bold text-[14px] lg:text-[15px] h-12 px-6 rounded-xl transition-transform hover:scale-105"
                        >
                            <Play className="mr-2 w-4 h-4" />
                            See How It Works
                        </Button>
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
