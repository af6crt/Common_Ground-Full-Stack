import { getCurrentUser, logout } from './services/api';

function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-700 no-underline">
                        <span className="text-2xl">🌱</span><span>Common Ground</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-emerald-700 no-underline">Home</Link>
                        <Link to="/events" className="text-gray-600 hover:text-emerald-700 no-underline">Events</Link>
                        <Link to="/meals" className="text-gray-600 hover:text-emerald-700 no-underline">Meals</Link>
                        <Link to="/about" className="text-gray-600 hover:text-emerald-700 no-underline">About</Link>
                        <Link to="/dashboard" className="text-gray-600 hover:text-emerald-700 no-underline">Dashboard</Link>
                        <Link to="/profile" className="text-gray-600 hover:text-emerald-700 no-underline">Profile</Link>
                        {user ? (
                            <>
                                <span className="text-gray-500">👋 {user.fullName.split(' ')[0]}</span>
                                <button onClick={handleLogout} className="border border-gray-300 px-4 py-2 rounded-lg hover:border-emerald-700 hover:text-emerald-700 cursor-pointer">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="border border-gray-300 px-4 py-2 rounded-lg hover:border-emerald-700 hover:text-emerald-700 no-underline">Sign In</Link>
                                <Link to="/signup" className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 no-underline">Join Free</Link>
                            </>
                        )}
                    </div>
                    <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 mt-4 pt-4 flex flex-col gap-3">
                        <Link to="/" className="text-gray-600 py-2">Home</Link>
                        <Link to="/events" className="text-gray-600 py-2">Events</Link>
                        <Link to="/meals" className="text-gray-600 py-2">Meals</Link>
                        <Link to="/about" className="text-gray-600 py-2">About</Link>
                        <Link to="/dashboard" className="text-gray-600 py-2">Dashboard</Link>
                        <Link to="/profile" className="text-gray-600 py-2">Profile</Link>
                        {user ? (
                            <>
                                <span className="text-gray-500 py-2">👋 {user.fullName.split(' ')[0]}</span>
                                <button onClick={handleLogout} className="border px-4 py-2 rounded-lg text-left">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="border px-4 py-2 rounded-lg text-center">Sign In</Link>
                                <Link to="/signup" className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-center">Join Free</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}