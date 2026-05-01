"use client";

import { motion } from "framer-motion";
import { Section, Container } from "@/components/layout/Section";
import { slideInFromBottom, fadeIn, staggerContainer } from "@/constants/framer-variants";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";

import { services } from "@/constants/services";

export function ServiceSection() {
    return (
        <Section id="services" className="bg-[#F4F4F7] pt-5 pb-24 md:pt-5 lg:pt-5 lg:pb-24">
            <Container className="flex flex-col items-center">
                {/* Headers */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="flex flex-col items-center text-center max-w-200 mx-auto mb-12"
                >
                    <motion.span
                        variants={slideInFromBottom}
                        className="font-bold text-[14px] md:text-[16px] uppercase tracking-wider text-[#1565c0] mb-3"
                    >
                        Our Services
                    </motion.span>
                    <motion.h2
                        variants={slideInFromBottom}
                        className="font-bold text-[32px] md:text-[40px] lg:text-[46px] text-[#121212] leading-[1.2] mb-5"
                    >
                        Everything You Need for Quarry Logistics
                    </motion.h2>
                    <motion.p
                        variants={fadeIn}
                        className="font-normal text-[16px] md:text-[20px] text-[#636366] max-w-3xl"
                    >
                        From sourcing materials to delivery tracking, we&apos;ve built the complete solution for Nigeria&apos;s construction industry.
                    </motion.p>
                </motion.div>

                {/* Service Cards Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="flex flex-wrap justify-center gap-6 lg:gap-8 w-full max-w-300"
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={slideInFromBottom}
                            className="bg-white rounded-t-[10px] rounded-b-3xl shadow-sm hover:shadow-md w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)] max-w-75 flex flex-col hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="p-1 pb-0 relative">
                                <ImageWithSkeleton
                                    containerClassName="w-full aspect-3/2 rounded-[8px]"
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-col gap-2 lg:gap-3 px-5 py-5 lg:px-6 lg:pt-4 lg:pb-6 flex-1">
                                <h3 className="font-semibold text-[18px] lg:text-[20px] text-[#121212] leading-tight">
                                    {service.title}
                                </h3>
                                <p className="font-normal text-[14px] text-[#636366] leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </Section>
    );
}
