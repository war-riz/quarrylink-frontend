"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/layout/Section";
import { slideInFromBottom, fadeIn, staggerContainer } from "@/constants/framer-variants";
import { showcaseData } from "@/constants/showcase";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";
import { register } from "module";
import { LOGIN_COPY } from "@/constants/loginConstants";

export function ShowcaseSection() {
    return (
        <Section id="showcase" className="bg-[#121212] pt-20 pb-24 lg:pt-16 lg:pb-20">
            <Container>
                {/* Headers */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="flex flex-col items-center text-center max-w-225 mx-auto mb-16 lg:mb-20"
                >
                    <motion.span
                        variants={slideInFromBottom}
                        className="font-bold text-[14px] md:text-[16px] uppercase tracking-wider text-[#ffc107] mb-4 lg:mb-6"
                    >
                        For Business
                    </motion.span>
                    <motion.h2
                        variants={slideInFromBottom}
                        className="font-bold text-[36px] md:text-[44px] lg:text-[50px] text-white leading-[1.2] mb-6"
                    >
                        Built for Every Player in the Value Chain
                    </motion.h2>
                    <motion.p
                        variants={fadeIn}
                        className="font-medium text-[18px] md:text-[22px] lg:text-[24px] text-[#e5e5ea] leading-relaxed max-w-4xl"
                    >
                        Whether you supply materials, build projects, or move cargo, QuarryLink has the tools you need.
                    </motion.p>
                </motion.div>

                {/* 2x2 Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-300 mx-auto"
                >
                    {showcaseData.map((spec, index) => (
                        <motion.div
                            key={index}
                            variants={slideInFromBottom}
                            className="bg-[#1a1a1a] border border-[#1e2939] rounded-xl p-6 lg:p-10 flex flex-col hover:-translate-y-2 hover:border-[#3a3a3a] transition-all duration-300"
                        >
                            {/* Card Icon */}
                            <div className="w-15 h-15 rounded-[10px] bg-[#2a2a2a] flex items-center justify-center mb-6 lg:mb-8 shrink-0">
                                <ImageWithSkeleton
                                    containerClassName="w-[30px] h-[30px]"
                                    src={spec.icon}
                                    alt={`${spec.title} Icon`}
                                    fill
                                    sizes="30px"
                                    className="object-contain"
                                />
                            </div>

                            {/* Card Content */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-semibold text-[22px] lg:text-[26px] text-white mb-3 leading-tight">
                                    {spec.title}
                                </h3>
                                <p className="font-normal text-[16px] lg:text-[17px] text-[#99a1af] leading-relaxed mb-8">
                                    {spec.description}
                                </p>

                                {/* Feature Tags */}
                                <div className="flex flex-wrap gap-3 mb-10">
                                    {spec.features.map((feature, featureIndex) => (
                                        <div
                                            key={featureIndex}
                                            className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-[361px] px-3.5 py-1.5 flex items-center gap-2"
                                        >
                                            <div className="w-1 h-1 bg-[#f59e0b] rounded-full shrink-0" />
                                            <span className="font-normal text-[13px] text-[#f59e0b] leading-tight">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Link Button */}
                                <Link
                                    href= {LOGIN_COPY.formSubLinkHref}
                                    className="mt-auto inline-flex items-center gap-2 font-normal text-[17px] text-[#f59e0b] hover:text-[#ffc107] hover:gap-3 transition-all duration-300 w-fit"
                                >
                                    {spec.linkText}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </Section>
    );
}
