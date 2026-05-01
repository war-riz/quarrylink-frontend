import { Variants } from "framer-motion";

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: "easeInOut" }
    },
};

export const slideInFromTop: Variants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    },
};

export const slideInFromBottom: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    },
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const mobileMenuVariants: Variants = {
    closed: {
        opacity: 0,
        y: -20,
        pointerEvents: "none",
        transition: { duration: 0.2, ease: "easeInOut" }
    },
    open: {
        opacity: 1,
        y: 0,
        pointerEvents: "auto",
        transition: { duration: 0.3, ease: "easeOut" }
    },
};
