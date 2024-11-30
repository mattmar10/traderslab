"use client"

import { FullFMPProfile } from "@/lib/types/fmp-types"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Building2, Globe, Users, Calendar, BarChart } from "lucide-react"

export interface OverviewAboutProps {
    profile: FullFMPProfile
}

const OverviewAbout: React.FC<OverviewAboutProps> = ({ profile }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className="w-full bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center space-x-3">
                    {profile.image && (
                        <img
                            src={profile.image}
                            alt={profile.companyName}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    )}
                    <CardTitle className="text-xl font-semibold">
                        {profile.companyName}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-foreground/60 leading-relaxed border-b pb-4">
                    {profile.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    {profile.sector && (
                        <div className="flex items-center space-x-2">
                            <BarChart className="h-4 w-4 text-foreground/40" />
                            <span className="text-sm text-foreground/60">{profile.sector}</span>
                        </div>
                    )}
                    {profile.industry && (
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-foreground/40" />
                            <span className="text-sm  text-foreground/60">{profile.industry}</span>
                        </div>
                    )}
                    {profile.fullTimeEmployees && (
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-foreground/40" />
                            <span className="text-sm  text-foreground/60">{profile.fullTimeEmployees} employees</span>
                        </div>
                    )}
                    {profile.ipoDate && (
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4  text-foreground/40" />
                            <span className="text-sm  text-foreground/60">IPO: {formatDate(profile.ipoDate)}</span>
                        </div>
                    )}
                </div>

                {profile.website && (
                    <Link
                        href={profile.website}
                        target="_blank"
                        className="inline-flex items-center space-x-2 text-sm text-foreground/60 hover:text-foreground/80 transition-colors mt-2"
                    >
                        <Globe className="h-4 w-4 text-foreground/40" />
                        <span>{profile.website}</span>
                    </Link>
                )}
            </CardContent>
        </Card>
    )
}

export default OverviewAbout