"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/layout/Section";
import { slideInFromBottom, fadeIn } from "@/components/ui/framer-variants";
import { Button } from "@/components/ui/Button";

export function CTASection() {
    return (
        <Section className="bg-white pt-16 pb-24 lg:pt-24 lg:pb-32">
            <Container>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                    className="bg-[#ffc107] rounded-[20px] lg:rounded-[52px] px-6 py-12 md:py-16 lg:px-20 lg:py-20 flex flex-col items-center text-center shadow-lg relative overflow-hidden"
                >
                    {/* Decorative subtle gradient/glow to make the yellow pop slightly */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-white/10 blur-[100px] pointer-events-none rounded-full" />

                    <motion.h2
                        variants={slideInFromBottom}
                        className="font-bold text-[36px] md:text-[48px] lg:text-[63px] text-black leading-[1.15] mb-6 max-w-4xl relative z-10"
                    >
                        Ready to Transform Your Quarry Operations?
                    </motion.h2>

                    <motion.p
                        variants={slideInFromBottom}
                        className="font-normal text-[18px] md:text-[22px] lg:text-[26px] text-black/80 leading-relaxed max-w-3xl mb-12 relative z-10"
                    >
                        Join hundreds of businesses already using QuarryLink to streamline their supply chain.
                    </motion.p>

                    <motion.div
                        variants={slideInFromBottom}
                        className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center w-full sm:w-auto relative z-10"
                    >
                        {/* Get Started Button */}
                        <Button
                            className="bg-black hover:bg-[#1f1f1f] shadow-none text-white font-bold text-[18px] lg:text-[21px] px-8 py-7 lg:py-8 lg:px-[45px] rounded-[13px] w-full sm:w-auto flex items-center justify-center gap-[10px] transition-all duration-300"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Button>

                        {/* Request a Demo Button */}
                        <Button
                            className="bg-transparent shadow-none border-[2.6px] border-black text-black hover:bg-black/5 font-bold text-[18px] lg:text-[21px] px-8 py-7 lg:py-8 lg:px-[45px] rounded-[13px] w-full sm:w-auto transition-all duration-300"
                        >
                            Request a Demo
                        </Button>
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
