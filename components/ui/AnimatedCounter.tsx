"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
    from?: number;
    to: number;
    duration?: number;
    format?: (value: number) => string;
    className?: string;
}

export function AnimatedCounter({
    from = 0,
    to,
    duration = 2,
    format = (value) => Math.round(value).toString(),
    className = "",
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [isComplete, setIsComplete] = useState(false);

    const spring = useSpring(from, {
        stiffness: 50,
        damping: 20,
        duration: duration * 1000,
    });

    const displayValue = useTransform(spring, (current) => {
        return format(current);
    });

    useEffect(() => {
        if (isInView) {
            spring.set(to);

            // Allow framer motion to trigger a render when done
            const unsubscribe = spring.on("change", (latest) => {
                if (Math.round(latest) === to) {
                    setIsComplete(true);
                }
            });
            return () => unsubscribe();
        }
    }, [isInView, spring, to]);

    return (
        <motion.span ref={ref} className={className}>
            {isComplete ? format(to) : displayValue}
        </motion.span>
    );
}
