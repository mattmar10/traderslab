import ComingSoon from "./_components/coming-soon";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex items-center justify-center px-6 py-12 lg:px-8">
                <ComingSoon />
            </main>
        </div>
    );
}
