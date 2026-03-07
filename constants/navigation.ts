import { NavItem, SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
    name: "QuarryLink",
    description: "Professional production-grade Next.js application",
    url: "http://localhost:3000",
};

export const mainNav: NavItem[] = [
    {
        title: "Services",
        href: "/services",
    },
    {
        title: "How It Works",
        href: "/how-it-works",
    },
    {
        title: "For Business",
        href: "/for-business",
    },
    {
        title: "Contact",
        href: "/contact",
    },
];
