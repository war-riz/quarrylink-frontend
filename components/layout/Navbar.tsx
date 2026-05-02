"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { mainNav, siteConfig } from "@/constants/navigation";
import { mobileMenuVariants } from "@/constants/framer-variants";
import { Button } from "@/components/ui/Button";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 w-full z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white shadow-sm transition-colors">
            <div className="w-full h-15 max-w-360 mx-auto px-6 lg:px-22.25 flex items-center justify-between relative">
                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-3 lg:gap-3.75 group z-10 w-50">
                    <div className="relative flex items-center justify-center w-16.25 h-10 lg:w-16.25 lg:h-10 rounded-[7px] bg-[#ffc107] shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        <Image
                            src="/images/logo.png"
                            alt={siteConfig.name}
                            fill
                            sizes="65px"
                            className="object-cover"
                        />
                    </div>
                    <span className="font-bold text-[16px] lg:text-[18px] tracking-tight text-[#121212] leading-4.5">
                        {siteConfig.name}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-8 lg:gap-[43.5px]">
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative text-[14px] lg:text-[15px] font-bold text-[#121212] hover:text-[#ffc107] transition-colors leading-5 group"
                        >
                            {item.title}
                            <span className="absolute left-0 -bottom-1.5 w-0 h-0.5 bg-[#ffc107] transition-all duration-300 group-hover:w-full rounded-full" />
                        </Link>
                    ))}
                </nav>

                {/* Right Action: Button */}
                <div className="hidden lg:flex shrink-0 z-10 w-50 justify-end space-x-4">
                    <Button
                        className="bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] lg:text-[15px] w-40 h-11 rounded-[10px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 active:scale-95"
                    >
                        Get App
                    </Button>
                    <Link href="/login">
                        <Button
                            className="bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] lg:text-[15px] w-40 h-11 rounded-[10px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 active:scale-95 "
                        >
                            Sign in
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-[#121212] hover:bg-zinc-100 rounded-md transition-colors z-10"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={mobileMenuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-white/60 shadow-xl lg:hidden overflow-hidden"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {mainNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-xl font-bold text-[#121212] hover:text-[#ffc107] py-2 border-b border-black/10"
                                >
                                    {item.title}
                                </Link>
                            ))}
                            <div className="pt-6">
                                <Button className="w-full bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[18px] py-6 shadow-md rounded-xl">
                                    Get App
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
