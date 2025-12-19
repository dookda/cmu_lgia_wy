import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoPersonCircle, IoLogOut, IoChevronDown } from 'react-icons/io5';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const panelRef = useRef(null);

    // Get first letter of username for avatar
    const getInitial = (username) => {
        if (!username) return '?';
        return username.charAt(0).toUpperCase();
    };

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowProfilePanel(false);
            }
        };

        if (showProfilePanel) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfilePanel]);

    const handleLogout = () => {
        setShowProfilePanel(false);
        logout();
        navigate('/login');
    };

    const handleEditProfile = () => {
        setShowProfilePanel(false);
        // Navigate to profile edit page or open modal
        navigate('/profile');
    };

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
                        <div className="relative" ref={panelRef}>
                            {/* Avatar Button */}
                            <button
                                onClick={() => setShowProfilePanel(!showProfilePanel)}
                                className="flex items-center gap-2 focus:outline-none group"
                            >
                                {/* Circular Avatar with Initial */}
                                <div className="w-10 h-10 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                                    {getInitial(user.username)}
                                </div>
                                <IoChevronDown
                                    className={`text-white transition-transform duration-200 ${showProfilePanel ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Profile Dropdown Panel */}
                            {showProfilePanel && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-[1100] animate-fadeIn">
                                    {/* User Info Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-xl shadow-md">
                                                {getInitial(user.username)}
                                            </div>
                                            <div className="text-white">
                                                <p className="font-semibold">{user.username}</p>
                                                <p className="text-sm text-orange-100 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <button
                                            onClick={handleEditProfile}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors"
                                        >
                                            <IoPersonCircle className="text-xl text-orange-500" />
                                            <span>แก้ไขโปรไฟล์</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <IoLogOut className="text-xl" />
                                            <span>ออกจากระบบ</span>
                                        </button>
                                    </div>
                                </div>
                            )}
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
