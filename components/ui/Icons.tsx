import {
    Menu,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Search,
    User,
    Settings,
    Mail,
    Loader2,
    type LucideIcon,
    type LucideProps
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
    menu: Menu,
    close: X,
    right: ChevronRight,
    left: ChevronLeft,
    down: ChevronDown,
    up: ChevronUp,
    search: Search,
    user: User,
    settings: Settings,
    mail: Mail,
    spinner: Loader2,
    // Custom SVG icons can be added here easily:
    // logo: (props: LucideProps) => (
    //   <svg {...props}>...</svg>
    // )
}
