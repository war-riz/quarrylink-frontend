import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode
    container?: boolean
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
    ({ className, children, container = true, ...props }, ref) => {
        return (
            <section
                ref={ref}
                className={cn("py-16 md:py-24", className)}
                {...props}
            >
                {container ? (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                ) : (
                    children
                )}
            </section>
        )
    }
)
Section.displayName = "Section"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
Container.displayName = "Container"

export { Section, Container }
