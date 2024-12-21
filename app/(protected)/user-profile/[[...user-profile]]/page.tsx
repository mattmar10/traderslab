import PageContainer from "@/components/layout/page-container";
import { UserProfile } from "@clerk/nextjs";
import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});


export default function UserProfilePage() {
  return (
    <PageContainer scrollable={false}>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            Update Account Settings
          </h2>
        </div>
        <div className="w-full place-items-center pt-12">
          <UserProfile />

        </div>
      </div>
    </PageContainer>
  );
}
