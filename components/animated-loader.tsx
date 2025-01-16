const BuildingContentLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
            <div className="flex gap-1 items-center">
                <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                />
                <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                />
                <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                />
            </div>
            <span className=" text-muted-foreground">Building Dashboard</span>
        </div>
    );
};

export default BuildingContentLoader;