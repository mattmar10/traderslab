import { FmpStockNewsList } from "@/lib/types/news-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import Link from "next/link";

export interface OverviewNewsCardProps {
    news: FmpStockNewsList
}

const OverviewNewsCard: React.FC<OverviewNewsCardProps> = ({ news }) => {

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Latest Headlines</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-full w-full overflow-auto">
                    <div className=" grid grid-cols-2 gap-4">
                        {news.map((item, index) => (
                            <Link
                                key={index}
                                href={item.url}
                                target="_blank"
                                className="block hover:bg-muted transition-colors p-4 border rounded"
                            >
                                <div className="flex gap-4 h-full">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt=""
                                            width={100}
                                            height={100}
                                            className="rounded-md object-cover w-[100px] h-[100px]"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="space-y-1">
                                            <h2 className="text-base font-semibold leading-tight line-clamp-2">
                                                {item.title}
                                            </h2>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <span>{formatDateToEST(item.publishedDate)}</span>
                                                <span className="mx-2">•</span>
                                                <span>{item.site}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
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
    )
}

export default OverviewNewsCard