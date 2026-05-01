"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Section, Container } from "@/components/layout/Section";
import { slideInFromBottom, fadeIn } from "@/constants/framer-variants";

export function FeatureSection() {
    return (
        <Section id="features" className="bg-[#F4F4F7] pt-12 pb-10 md:pt-15 md:pb-10 lg:pt-20 lg:pb-15 px-0 lg:px-6 md:px-6">
            <Container>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                    className="relative w-full aspect-4/3 md:aspect-video max-h-179.25 rounded-[30px] md:rounded-[60px] overflow-hidden"
                >
                    <Image
                        src="/images/feature/feature-bg.png"
                        alt="Quarry site logistics"
                        fill
                        sizes="(max-width: 1024px) 100vw, 1200px"
                        className="object-cover"
                    />

                    {/* Floating Card */}
                    <motion.div
                        variants={slideInFromBottom}
                        className="absolute bottom-4 right-4 md:bottom-10 md:right-10 bg-white rounded-2xl md:rounded-[25px] p-4 md:p-6 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center w-auto max-w-[90%] md:w-65 h-auto md:h-33.25 origin-bottom-right max-md:scale-90 max-sm:scale-75"
                    >
                        <div className="flex flex-col gap-2 md:gap-2.25 w-full">
                            <div className="flex items-center gap-2 md:gap-2.25 justify-center">
                                <div className="relative shrink-0 w-8 h-8 md:w-11.5 md:h-11.5">
                                    <Image
                                        src="/images/feature/checkmark-circle.svg"
                                        alt="Success Checkmark"
                                        fill
                                        sizes="50px"
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="font-bold text-[16px] md:text-[20px] text-[#121212] leading-tight md:leading-6 whitespace-nowrap">
                                        Order Delivered
                                    </span>
                                    <span className="font-normal text-[12px] md:text-[14.5px] text-[#636366] leading-tight md:leading-5">
                                        15 tons of granite
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 justify-center w-full mt-1">
                                <span className="font-light text-[10px] md:text-[12.66px] text-[#636366]">
                                    Just now
                                </span>
                                <div className="w-1 h-1 md:w-1.25 md:h-1.25 rounded-full bg-[#636366]/50 mx-0.5" />
                                <span className="font-light text-[10px] md:text-[12.66px] text-[#636366]">
                                    Abuja, Nigeria
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
