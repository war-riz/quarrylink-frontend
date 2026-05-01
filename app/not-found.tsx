"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Construction } from "lucide-react";
import { Container } from "@/components/layout/Section";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F4F4F7] flex flex-col justify-center relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#ffc107]/10 blur-[120px] rounded-full pointer-events-none" />

            <Container className="flex flex-col items-center justify-center text-center relative z-10 py-20">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-24 h-24 bg-[#ffc107]/20 rounded-2xl flex items-center justify-center mb-8"
                >
                    <Construction className="w-12 h-12 text-[#ffc107]" />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-bold text-[80px] md:text-[120px] text-black leading-none mb-4"
                >
                    404
                </motion.h1>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="font-bold text-[28px] md:text-[36px] text-zinc-800 mb-6"
                >
                    Under Construction
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="font-normal text-[18px] text-zinc-500 max-w-125 mx-auto mb-12 leading-relaxed"
                >
                    Looks like this page is still being excavated! The link you clicked may be broken, or the page has been moved.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Button
                        onClick={() => router.back()}
                        className="bg-black hover:bg-zinc-800 text-white font-bold text-[18px] px-8 py-7 rounded-xl flex items-center justify-center gap-3"
                    >
                        <ArrowLeft className="w-5 h-5 shrink-0" />
                        <span>Return Back</span>
                    </Button>
                </motion.div>
            </Container>
        </div>
    );
}
