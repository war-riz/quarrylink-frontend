import { NavItem, SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
    name: "QuarryLink",
    description: "Professional production-grade Next.js application",
    url: "http://localhost:3000",
};

export const navLinks: NavItem[] = [
    { title: "Home", href: "/" },
    { title: "Features", href: "/#features" },
    { title: "Services", href: "/#services" },
    { title: "How it Works", href: "/#how-it-works" },
    { title: "Showcase", href: "/#showcase" },
];

export const footerLinks = {
    product: [
        { label: "Features", href: "/#features" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Pricing", href: "/pricing" },
        { label: "API Documentation", href: "/docs" },
    ],
    company: [
        { label: "About us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Blog", href: "/blog" },
    ],
    support: [
        { label: "Help Center", href: "/help" },
        { label: "Contact Us", href: "/contact" },
        { label: "FAQs", href: "/faqs" },
        { label: "Terms of Service", href: "/terms" },
    ]
};

export const footerLegalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
];

export const mainNav: NavItem[] = [
    {
        title: "Services",
        href: "/#services",
    },
    {
        title: "How It Works",
        href: "/#how-it-works",
    },
    {
        title: "For Business",
        href: "/#showcase",
    },
    {
        title: "Contact",
        href: "/contact",
    },
];
