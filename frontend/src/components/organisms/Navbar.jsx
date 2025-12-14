import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src="/img/LOGO.png"
                        alt="LGIA Logo"
                        className="w-12 h-12 bg-white rounded-full p-1 shadow-md"
                    />
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight">
                            ระบบภูมิสารสนเทศชุมชน
                        </h1>
                        <p className="text-orange-100 text-xs">
                            LGIA: Local Geo-Info Application
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-white text-sm font-medium">{user.username}</p>
                                <p className="text-yellow-200 text-xs">{user.role}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-white hover:bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
                        >
                            เข้าสู่ระบบ
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
