export default function LoadingScreen() {
    return (
        <div className="loading-spinner" id="loading-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="spinner" />
                <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#E50914] to-[#ff6b6b] bg-clip-text text-transparent">
                    NETFLIX
                </span>
                <p className="text-sm text-gray-500 animate-pulse">Loading your experience...</p>
            </div>
        </div>
    );
}
