export default function Footer() {
    return (
        <footer className="px-[4%] py-12 border-t border-white/5" id="footer">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Navigation</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Home</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">TV Shows</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Movies</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">New & Popular</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Support</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">FAQ</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Account</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms of Use</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Cookie Preferences</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Corporate Info</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Tech Stack</h4>
                        <ul className="space-y-2">
                            <li><span className="text-xs text-gray-500">React + Vite</span></li>
                            <li><span className="text-xs text-gray-500">Tailwind CSS</span></li>
                            <li><span className="text-xs text-gray-500">Zustand</span></li>
                            <li><span className="text-xs text-gray-500">Express.js API</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-600">
                        © 2026 Netflix Clone. Built as an interview task prototype.
                    </p>
                    <p className="text-xs text-gray-600">
                        Videos sourced from Google's open-source sample videos (Blender Foundation & others)
                    </p>
                </div>
            </div>
        </footer>
    );
}
