import { Skeleton } from "@/components/ui/Skeleton";

export function ServiceCardSkeleton() {
    return (
        <div className="bg-white rounded-t-[10px] rounded-b-[24px] shadow-sm w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)] max-w-[300px] flex flex-col p-1 pb-6 border border-zinc-100">
            {/* Image Placeholder */}
            <Skeleton className="w-full aspect-3/2 rounded-[8px]" />

            {/* Content Placeholders */}
            <div className="flex flex-col gap-3 px-5 pt-5">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 rounded-md" />

                {/* Description lines */}
                <div className="space-y-2 mt-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-[90%] rounded-md" />
                    <Skeleton className="h-4 w-[60%] rounded-md" />
                </div>
            </div>
        </div>
    );
}

export function ShowcaseCardSkeleton() {
    return (
        <div className="bg-[#1a1a1a] border border-[#1e2939] rounded-[12px] p-6 lg:p-10 flex flex-col w-full h-[320px]">
            {/* Card Icon */}
            <Skeleton className="w-[60px] h-[60px] rounded-[10px] bg-[#2a2a2a] mb-6 lg:mb-8" />

            {/* Content Placeholders */}
            <div className="flex-1 flex flex-col gap-4">
                <Skeleton className="h-7 w-2/3 rounded-md bg-[#2a2a2a]" />

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-md bg-[#2a2a2a]" />
                    <Skeleton className="h-4 w-[80%] rounded-md bg-[#2a2a2a]" />
                </div>

                {/* Tags */}
                <div className="flex gap-2 mt-4">
                    <Skeleton className="h-6 w-20 rounded-full bg-[#2a2a2a]" />
                    <Skeleton className="h-6 w-24 rounded-full bg-[#2a2a2a]" />
                </div>
            </div>
        </div>
    );
}
