import { useState, useEffect, useRef, useCallback } from 'react';
import useMovieStore from '../store/useMovieStore';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('home');
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const debounceRef = useRef(null);

    const { searchQuery, searchMovies, clearSearch } = useMovieStore();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                if (!searchQuery) {
                    setSearchOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchQuery]);

    // Focus input when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 150);
        }
    }, [searchOpen]);

    const handleSearchToggle = useCallback(() => {
        if (searchOpen && searchQuery) {
            clearSearch();
            setSearchOpen(false);
        } else {
            setSearchOpen(!searchOpen);
            if (searchOpen) {
                clearSearch();
            }
        }
    }, [searchOpen, searchQuery, clearSearch]);

    const handleSearchChange = useCallback((e) => {
        const query = e.target.value;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchMovies(query);
        }, 300);
        searchMovies(query);
    }, [searchMovies]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            clearSearch();
            setSearchOpen(false);
        }
    }, [clearSearch]);

    const handleNavClick = useCallback((e, section) => {
        e.preventDefault();
        clearSearch();
        setSearchOpen(false);
        setActiveNav(section);

        if (section === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Map nav items to section IDs  
        const sectionMap = {
            'tvshows': 'row-tv-shows',
            'movies': 'row-movies',
            'new': 'row-new-&-popular',
        };

        const targetId = sectionMap[section];
        if (targetId) {
            // Small delay to ensure search is cleared and sections are visible
            setTimeout(() => {
                const el = document.getElementById(targetId);
                if (el) {
                    const offset = 80; // navbar height
                    const top = el.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }, 50);
        }
    }, [clearSearch]);

    return (
        <>
            {/* Inline styles for liquid search animation */}
            <style>{`
                .search-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-trigger {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    color: #b3b3b3;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .search-trigger:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.08);
                }

                .search-trigger.active {
                    color: white;
                }

                .search-liquid-bar {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 40px;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    border-radius: 4px;
                    transition: all 0.45s cubic-bezier(0.23, 1, 0.32, 1);
                    pointer-events: none;
                    opacity: 0;
                    width: 36px;
                    background: transparent;
                    border: 1px solid transparent;
                }

                .search-liquid-bar.open {
                    width: 280px;
                    opacity: 1;
                    pointer-events: all;
                    background: rgba(0, 0, 0, 0.85);
                    border-color: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow:
                        0 0 0 1px rgba(229, 9, 20, 0.1),
                        0 4px 24px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                .search-liquid-bar.open:focus-within {
                    border-color: rgba(255, 255, 255, 0.7);
                    box-shadow:
                        0 0 0 1px rgba(229, 9, 20, 0.2),
                        0 0 20px rgba(229, 9, 20, 0.08),
                        0 4px 24px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                @media (min-width: 768px) {
                    .search-liquid-bar.open {
                        width: 320px;
                    }
                }

                .search-liquid-bar .search-icon-inside {
                    flex-shrink: 0;
                    width: 16px;
                    height: 16px;
                    margin-left: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    transition: color 0.3s ease;
                }

                .search-liquid-bar.open:focus-within .search-icon-inside {
                    color: rgba(255, 255, 255, 0.8);
                }

                .search-liquid-bar input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: white;
                    font-size: 14px;
                    padding: 8px 10px;
                    font-family: inherit;
                    letter-spacing: 0.01em;
                    opacity: 0;
                    transform: translateX(10px);
                    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1) 0.1s;
                }

                .search-liquid-bar.open input {
                    opacity: 1;
                    transform: translateX(0);
                }

                .search-liquid-bar input::placeholder {
                    color: rgba(255, 255, 255, 0.35);
                    font-weight: 400;
                }

                .search-clear-btn {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    margin-right: 6px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    opacity: 0;
                    transform: scale(0.5);
                }

                .search-clear-btn.visible {
                    opacity: 1;
                    transform: scale(1);
                }

                .search-clear-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
            `}</style>

            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
                {/* Netflix Logo */}
                <div className="flex items-center gap-8">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); clearSearch(); setSearchOpen(false); setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        id="netflix-logo"
                    >
                        <svg viewBox="0 0 111 30" className="h-6 md:h-8 fill-[#E50914]" aria-label="Netflix" role="img">
                            <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z" />
                        </svg>
                    </a>
                </div>

                {/* Nav Links (Desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    <a
                        href="#"
                        onClick={(e) => handleNavClick(e, 'home')}
                        className={`text-sm font-medium transition-colors cursor-pointer ${activeNav === 'home' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        id="nav-home"
                    >
                        Home
                    </a>
                    <a
                        href="#"
                        onClick={(e) => handleNavClick(e, 'tvshows')}
                        className={`text-sm font-medium transition-colors cursor-pointer ${activeNav === 'tvshows' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        id="nav-tvshows"
                    >
                        TV Shows
                    </a>
                    <a
                        href="#"
                        onClick={(e) => handleNavClick(e, 'movies')}
                        className={`text-sm font-medium transition-colors cursor-pointer ${activeNav === 'movies' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        id="nav-movies"
                    >
                        Movies
                    </a>
                    <a
                        href="#"
                        onClick={(e) => handleNavClick(e, 'new')}
                        className={`text-sm font-medium transition-colors cursor-pointer ${activeNav === 'new' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        id="nav-new"
                    >
                        New & Popular
                    </a>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Liquid Search Bar */}
                    <div className="search-wrapper" ref={searchContainerRef}>
                        {/* Expanding liquid bar */}
                        <div className={`search-liquid-bar ${searchOpen ? 'open' : ''}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="search-icon-inside"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Titles, people, genres"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                id="search-input"
                                autoComplete="off"
                                spellCheck="false"
                            />
                            <button
                                className={`search-clear-btn ${searchQuery ? 'visible' : ''}`}
                                onClick={() => { clearSearch(); searchInputRef.current?.focus(); }}
                                aria-label="Clear search"
                                tabIndex={searchQuery ? 0 : -1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search trigger icon */}
                        <button
                            className={`search-trigger ${searchOpen ? 'active' : ''}`}
                            aria-label="Search"
                            id="search-btn"
                            onClick={handleSearchToggle}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>

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
        </>
    );
}
