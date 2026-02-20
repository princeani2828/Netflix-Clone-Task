import { useState } from 'react';

export default function Footer() {
    const [hoveredLink, setHoveredLink] = useState(null);

    const linkColumns = [
        [
            { label: 'Audio Description', id: 'audio-desc' },
            { label: 'Investor Relations', id: 'investor' },
            { label: 'Legal Notices', id: 'legal' },
        ],
        [
            { label: 'Help Centre', id: 'help' },
            { label: 'Jobs', id: 'jobs' },
            { label: 'Cookie Preferences', id: 'cookies' },
        ],
        [
            { label: 'Gift Cards', id: 'gift' },
            { label: 'Terms of Use', id: 'terms' },
            { label: 'Corporate Information', id: 'corp' },
        ],
        [
            { label: 'Media Centre', id: 'media' },
            { label: 'Privacy', id: 'privacy' },
            { label: 'Contact Us', id: 'contact' },
        ],
    ];

    const socials = [
        {
            label: 'Facebook',
            href: 'https://www.facebook.com/netflix',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>,
        },
        {
            label: 'Instagram',
            href: 'https://www.instagram.com/netflix',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
        },
        {
            label: 'X (Twitter)',
            href: 'https://twitter.com/netflix',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
        },
        {
            label: 'YouTube',
            href: 'https://www.youtube.com/netflix',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
        },
    ];

    return (
        <footer className="relative mt-16" id="footer">
            {/* Top gradient line */}
            <div className="h-px bg-gradient-to-r from-transparent via-netflix-red/30 to-transparent" />

            <div className="px-[4%] pt-12 pb-8">
                <div className="max-w-[980px] mx-auto">

                    {/* Social Icons */}
                    <div className="flex items-center gap-4 mb-7">
                        {socials.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={s.label}
                                className="group w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>

                    {/* Links Grid — 4 equal columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mb-7">
                        {linkColumns.map((col, ci) => (
                            <ul key={ci} className="flex flex-col gap-3">
                                {col.map((link) => (
                                    <li key={link.id}>
                                        <a
                                            href="#"
                                            className="relative inline-block text-[13px] leading-tight text-gray-500 hover:text-white transition-colors duration-200"
                                            onMouseEnter={() => setHoveredLink(link.id)}
                                            onMouseLeave={() => setHoveredLink(null)}
                                            id={`footer-${link.id}`}
                                        >
                                            {link.label}
                                            <span
                                                className={`absolute left-0 -bottom-0.5 h-px bg-gradient-to-r from-netflix-red to-[#ff6b6b] transition-all duration-300 ${hoveredLink === link.id ? 'w-full' : 'w-0'
                                                    }`}
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>

                    {/* Language + Service Code */}
                    <div className="flex items-center gap-3 mb-6">
                        <button className="flex items-center gap-2 text-[13px] text-gray-400 border border-white/15 rounded px-3 py-1.5 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            English
                            <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <button className="text-[13px] text-gray-500 border border-white/15 rounded px-3 py-1.5 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                            Service Code
                        </button>
                    </div>

                    {/* Copyright */}
                    <p className="text-[12px] text-gray-600">© 1997–2026 Netflix, Inc.</p>

                </div>
            </div>
        </footer>
    );
}
