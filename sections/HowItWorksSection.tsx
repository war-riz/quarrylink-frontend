"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Section, Container } from "@/components/layout/Section";
import { slideInFromBottom, fadeIn, staggerContainer } from "@/constants/framer-variants";
import { howItWorksSteps } from "@/constants/how-it-works";

export function HowItWorksSection() {
    return (
        <Section id="how-it-works" className="bg-white pt-8 pb-16 md:pt-10 md:pb-20 lg:pt-20 lg:pb-5">
            <Container>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16 w-full">

                    {/* Left Side: Phone Mockup Image */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                        className="w-full lg:w-1/2 flex justify-center lg:justify-start lg:sticky lg:top-24 items-center"
                    >
                        <div className="relative w-70 h-140 md:w-[320px] md:h-160 lg:w-115 lg:h-230">
                            <Image
                                src="/images/howitwork/how-it-works-phone.png"
                                alt="QuarryLink Mobile App Interface"
                                fill
                                sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 460px"
                                className="object-contain drop-shadow-2xl scale-[1.2] lg:scale-[1.3] origin-center"
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
                                className="font-bold text-[14px] md:text-[16px] uppercase tracking-wider text-[#1565c0] mb-3 block text-center lg:text-left"
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
                                    <div className="shrink-0 flex items-center justify-center w-15 h-15 lg:w-17.5 lg:h-17.5 bg-[#ffc107] rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                                        <span className="font-extrabold text-[28px] lg:text-[32px] text-[#121212]">
                                            {step.number}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-center pt-1 lg:pt-2">
                                        <h3 className="font-semibold text-[20px] lg:text-[24px] text-[#121212] leading-tight mb-2">
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
