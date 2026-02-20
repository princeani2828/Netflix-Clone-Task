import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
            {/* Netflix Logo */}
            <div className="flex items-center gap-8">
                <svg
                    viewBox="0 0 111 30"
                    className="h-6 md:h-8 fill-[#E50914]"
                    aria-label="Netflix"
                >
                    <path d="M105.06 1.527C103.438.547 95.93.108 93.666.108c-2.35 0-4.15.26-5.396.778l-.862.336c-.91.365-1.365.878-1.365 1.55v24.964c0 .672.455 1.185 1.365 1.55l.862.336c1.246.518 3.046.778 5.396.778 2.264 0 9.772-.44 11.394-1.42.636-.384.952-.84.952-1.38V2.907c0-.54-.316-.996-.952-1.38zM99.44 24.53c-1.4.52-3.15.78-5.25.78s-3.85-.26-5.25-.78V5.55c1.4-.52 3.15-.78 5.25-.78s3.85.26 5.25.78v18.98z" fill="currentColor" />
                    <path d="M105.062 1.527C103.44.547 95.93.108 93.668.108c-2.35 0-4.15.26-5.397.778l-.86.336c-.912.365-1.366.878-1.366 1.55v24.964c0 .672.454 1.185 1.365 1.55l.862.336c1.246.518 3.046.778 5.396.778 2.264 0 9.772-.44 11.394-1.42.636-.384.952-.84.952-1.38V2.907c0-.54-.316-.996-.952-1.38z" fill="currentColor" opacity="0" />
                </svg>
                <span className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-[#E50914] to-[#ff6b6b] bg-clip-text text-transparent">
                    NETFLIX
                </span>
            </div>

            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-white hover:text-gray-300 transition-colors">
                    Home
                </a>
                <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    TV Shows
                </a>
                <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Movies
                </a>
                <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    New & Popular
                </a>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <button
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-label="Search"
                    id="search-btn"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
                <button
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-label="Notifications"
                    id="notification-btn"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
                <div
                    className="w-8 h-8 rounded bg-gradient-to-br from-[#E50914] to-[#B20710] flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:ring-2 hover:ring-white/30 transition-all"
                    id="user-avatar"
                >
                    U
                </div>
            </div>
        </nav>
    );
}
