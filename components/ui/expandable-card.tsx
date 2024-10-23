"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ExpandableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  initiallyExpanded?: boolean;
  titleBadge?: React.ReactNode;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  description,
  initiallyExpanded = false,
  children,
  titleBadge,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (isExpanded) {
      setMaxHeight(`${contentRef.current?.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [isExpanded]);

  useEffect(() => {
    if (initiallyExpanded) {
      setMaxHeight(`${contentRef.current?.scrollHeight}px`);
    }
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (isExpanded) {
        setMaxHeight(`${contentRef.current?.scrollHeight}px`);
      }
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, [isExpanded]);

  return (
    <Card {...props}>
      <CardHeader
        className="cursor-pointer px-4 lg:px-6"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle>{title}</CardTitle>
            {titleBadge}
          </div>
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
        {description && (
          <CardDescription className="pt-2">{description}</CardDescription>
        )}
      </CardHeader>
      <div
        ref={contentRef}
        className="transition-all duration-300 "
        style={{ maxHeight, opacity: isExpanded ? 1 : 0 }}
      >
        <CardContent className="px-4 lg:px-6">{children}</CardContent>
      </div>
    </Card>
  );
};

export default ExpandableCard;
