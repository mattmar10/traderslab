import Header from "@/components/sections/header";
import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex justify-center px-6 lg:px-8 no-scrollbar mt-16">
        <UserProfile path="/user-profile" />
      </main>
    </>
  );
}
