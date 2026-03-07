"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Section, Container } from "@/components/layout/Section";
import { slideInFromBottom, fadeIn, staggerContainer } from "@/animations/framer-variants";
import { howItWorksSteps } from "@/constants/how-it-works";

export function HowItWorksSection() {
    return (
        <Section className="bg-white pt-8 pb-16 md:pt-10 md:pb-20 lg:pt-24 lg:pb-32">
            <Container>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16 w-full">

                    {/* Left Side: Phone Mockup Image */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                        className="w-full lg:w-1/2 flex justify-center lg:justify-start lg:sticky lg:top-24"
                    >
                        <div className="relative w-[220px] h-[440px] md:w-[260px] md:h-[520px] lg:w-[380px] lg:h-[760px]">
                            <Image
                                src="/images/how-it-works-phone.png"
                                alt="QuarryLink Mobile App Interface"
                                fill
                                sizes="(max-width: 768px) 220px, (max-width: 1024px) 260px, 380px"
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>
                    </motion.div>

                    {/* Right Side: Content & Steps */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="w-full lg:w-1/2 flex flex-col items-center lg:items-start"
                    >
                        {/* Headers */}
                        <div className="mb-8 lg:mb-14 text-center lg:text-left w-full">
                            <motion.span
                                variants={slideInFromBottom}
                                className="font-bold text-[18px] md:text-[22px] text-[#1565c0] mb-3 block text-center lg:text-left"
                            >
                                How It Works
                            </motion.span>
                            <motion.h2
                                variants={slideInFromBottom}
                                className="font-bold text-[32px] md:text-[40px] lg:text-[46px] text-[#121212] leading-[1.2] mb-5 text-center lg:text-left"
                            >
                                Get Started in Minutes
                            </motion.h2>
                            <motion.p
                                variants={fadeIn}
                                className="font-normal text-[16px] md:text-[20px] text-[#636366] leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
                            >
                                Our platform simplifies the entire quarry materials supply chain, from order placement to delivery confirmation.
                            </motion.p>
                        </div>

                        {/* Steps List */}
                        <div className="flex flex-col gap-6 lg:gap-10 w-full max-w-xl mx-auto lg:mx-0">
                            {howItWorksSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    variants={slideInFromBottom}
                                    className="flex items-start gap-6 lg:gap-8 group"
                                >
                                    <div className="shrink-0 flex items-center justify-center w-[60px] h-[60px] lg:w-[70px] lg:h-[70px] bg-[#ffc107] rounded-[12px] shadow-sm transition-transform duration-300 group-hover:scale-110">
                                        <span className="font-extrabold text-[28px] lg:text-[32px] text-[#121212]">
                                            {step.number}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-center pt-1 lg:pt-2">
                                        <h3 className="font-bold text-[20px] lg:text-[24px] text-[#121212] leading-tight mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="font-normal text-[15px] lg:text-[17px] text-[#636366] leading-relaxed max-w-md">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </Container>
        </Section>
    );
}
