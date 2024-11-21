"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { FmpGeneralNews, FmpGeneralNewsList, FmpStockNews, FmpStockNewsList } from "@/lib/types/news-types";
import { Newspaper } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { formatDateToEST } from "@/lib/utils/epoch-utils";

export interface HeadlinesCardProps {
    generalNews: FmpGeneralNewsList;
    stockNews: FmpStockNewsList;
}

const HeadlinesCard: React.FC<HeadlinesCardProps> = ({ generalNews, stockNews }) => {
    const [showGeneral, setShowGeneral] = useState(true);
    const [showStock, setShowStock] = useState(true);

    const isStockNews = (item: FmpGeneralNews | FmpStockNews): item is FmpStockNews => {
        return 'symbol' in item;
    };

    // Filter and sort the news based on selected toggles and published date
    const filteredNews = [
        ...(showGeneral ? generalNews : []),
        ...(showStock ? stockNews : [])
    ].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    return (
        <Card className="h-full min-h-[300px] max-h-[30vh] flex flex-col">
            <CardHeader className="flex-none pb-0">
                <div className="flex items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-xl">News Headlines</CardTitle>
                        <CardDescription>Today&apos;s top stories</CardDescription>
                    </div>
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <div className="flex space-x-4 mt-1 mb-2 ml-4">
                    <div className="flex items-center space-x-2 pl-2">
                        <Switch
                            id="showStock"
                            checked={showStock}
                            onCheckedChange={setShowStock}
                        />
                        <Label htmlFor="showStock">Symbol Specific</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="showGeneral"
                            checked={showGeneral}
                            onCheckedChange={setShowGeneral}
                        />
                        <Label htmlFor="showGeneral">General News</Label>
                    </div>
                </div>
                <ScrollArea className="h-full w-full overflow-auto">
                    <div className="divide-y divide p-4">
                        {filteredNews.map((item, index) => (
                            <Link key={index} href={item.url} target="_blank" className="block hover:bg-muted transition-colors p-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item.image!}
                                            alt=""
                                            width={120}
                                            height={120}
                                            className="rounded-md object-cover w-[120px] h-[120px]"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="space-y-1">
                                            <h2 className="text-lg font-semibold leading-tight line-clamp-2">
                                                {item.title}
                                            </h2>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <span>{formatDateToEST(item.publishedDate)}</span>
                                                <span className="mx-2">•</span>
                                                <span>{item.site}</span>
                                                {isStockNews(item) && (
                                                    <>
                                                        <span className="mx-2">•</span>
                                                        <span className="font-semibold">{item.symbol}</span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 pt-2">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default HeadlinesCard;
