"use client";

import Link from "next/link";
import Image from "next/image";
import { footerLinks, footerLegalLinks, siteConfig } from "@/constants/navigation";
import { Container } from "@/components/layout/Section";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#121212] pt-20 pb-8 lg:pt-24 border-t border-[#1e2939]">
            <Container>
                {/* Main Footer Content */}
                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="w-full lg:max-w-115 flex flex-col items-start">
                        <Link href="/" className="flex items-center gap-3.75 group mb-6">
                            <div className="relative flex items-center justify-center w-16.25 h-10 rounded-[7px] bg-[#ffc107] overflow-hidden">
                                <Image
                                    src="/images/logo.png"
                                    alt={siteConfig.name}
                                    fill
                                    sizes="65px"
                                    className="object-contain p-1.25"
                                />
                            </div>
                            <span className="font-bold text-[24px] text-white">{siteConfig.name}</span>
                        </Link>

                        <p className="font-normal text-[14.5px] text-white/70 leading-relaxed mb-8 max-w-100">
                            Revolutionizing quarry logistics in Nigeria with AI-powered supply chain management...
                        </p>

                        {/* Contact Info */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="relative w-5 h-5 opacity-80">
                                    <Image src="/images/icon/icon-location.svg" alt="Location" fill sizes="20px" className="object-contain" />
                                </div>
                                <span className="font-normal text-[14.5px] text-[#e3f2fd]">Lagos, Nigeria</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative w-5 h-5 opacity-80">
                                    <Image src="/images/icon/icon-phone.svg" alt="Phone" fill sizes="20px" className="object-contain" />
                                </div>
                                <span className="font-normal text-[14.5px] text-[#e3f2fd]">+234 800 123 4567</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative w-5 h-5 opacity-80">
                                    <Image src="/images/icon/icon-mail.svg" alt="Email" fill sizes="20px" className="object-contain" />
                                </div>
                                <span className="font-normal text-[14.5px] text-[#e3f2fd]">hello@quarrylink.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns Container */}
                    <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-12 sm:gap-16 lg:gap-22.5">
                        {/* Product */}
                        <div className="flex flex-col gap-6">
                            <h3 className="font-bold text-[22px] lg:text-[26.5px] text-white">Product</h3>
                            <ul className="flex flex-col gap-4">
                                {footerLinks.product.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="font-normal text-[15.5px] text-white/70 hover:text-white transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="flex flex-col gap-6">
                            <h3 className="font-bold text-[22px] lg:text-[26.5px] text-white">Company</h3>
                            <ul className="flex flex-col gap-4">
                                {footerLinks.company.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="font-normal text-[15.5px] text-white/70 hover:text-white transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="flex flex-col gap-6">
                            <h3 className="font-bold text-[22px] lg:text-[26.5px] text-white">Support</h3>
                            <ul className="flex flex-col gap-4">
                                {footerLinks.support.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="font-normal text-[15.5px] text-white/70 hover:text-white transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
                    <p className="font-normal text-[14px] text-white/70 text-center md:text-left">
                        &copy; {currentYear} {siteConfig.name}. All rights reserved.
                    </p>

                    <ul className="flex items-center gap-6 flex-wrap justify-center">
                        {footerLegalLinks.map((link) => (
                            <li key={link.label}>
                                <Link href={link.href} className="font-normal text-[14px] text-white/70 hover:text-white transition-colors duration-200">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </footer>
    );
}
