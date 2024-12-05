"use client";

import { useState, useRef, useEffect } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const CollapsibleDescription: React.FC<{
    ticker: string;
    description: string;
}> = ({ ticker, description }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [isExpanded]);

    const toggleExpansion = () => setIsExpanded(!isExpanded);

    return (
        <div className="p-5 bg-accent/75 border border-foreground/5 mx-3 lg:mx-7 mb-8 shadow">
            <div
                onClick={toggleExpansion}
                className="cursor-pointer hover:text-foreground font-semibold flex justify-between items-center"
            >
                {isExpanded ? (
                    <div className="flex space-x-1 items-center">
                        <div>Hide</div>
                        <IoChevronUp />
                    </div>
                ) : (
                    <>
                        <div>{`${ticker} Overview`}</div>
                        <span className="text-foreground/70">
                            <IoChevronDown />
                        </span>
                    </>
                )}
            </div>
            <div
                ref={contentRef}
                className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
                style={{ maxHeight: isExpanded ? `${contentHeight}px` : 0 }}
            >
                <div className="mt-4">{description}</div>
            </div>
        </div>
    );
};

export default CollapsibleDescription;