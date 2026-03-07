export interface NavItem {
    title: string;
    href: string;
    isExternal?: boolean;
}

export interface SiteConfig {
    name: string;
    description: string;
    url: string;
}
