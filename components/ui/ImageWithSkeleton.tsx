"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps extends ImageProps {
    containerClassName?: string;
}

export function ImageWithSkeleton({ className, containerClassName, alt, ...props }: ImageWithSkeletonProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            {!isLoaded && <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none" />}
            <Image
                {...props}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={cn(className, "transition-opacity duration-300", !isLoaded ? "opacity-0" : "opacity-100")}
            />
        </div>
    );
}
