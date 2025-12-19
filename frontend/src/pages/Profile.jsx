import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/organisms/Navbar';
import { AlertModal } from '../components/molecules';
import { IoSave, IoKey } from 'react-icons/io5';
import { BackButton } from '../components/atoms';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', variant: 'info' });

    // Get cookie value helper
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Load user profile data
        loadProfile();
    }, [user, navigate]);

    const loadProfile = async () => {
        try {
            const token = getCookie('lgiatoken');
            if (!token) {
                console.error('No auth token found');
                setFormData({
                    username: user?.username || '',
                    email: '',
                    full_name: '',
                });
                return;
            }

            const response = await fetch('/api/get_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({
                    username: data.username || user?.username || '',
                    email: data.email || '',
                    full_name: data.full_name || '',
                });
            } else {
                // If profile endpoint fails, use user from auth context
                console.warn('Failed to load profile from API');
                setFormData({
                    username: user?.username || '',
                    email: '',
                    full_name: '',
                });
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            setFormData({
                username: user?.username || '',
                email: '',
                full_name: '',
            });
        }
    };

    const showAlert = (message, variant = 'info', title = '') => {
        setAlertModal({ isOpen: true, title, message, variant });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const token = getCookie('lgiatoken');
            const response = await fetch('/api/update_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showAlert('อัปเดตโปรไฟล์สำเร็จ', 'success', 'สำเร็จ');
            } else {
                const error = await response.json();
                showAlert(error.detail || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์', 'error', 'ผิดพลาด');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            showAlert('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์', 'error', 'ผิดพลาด');
        }
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            showAlert('รหัสผ่านใหม่ไม่ตรงกัน', 'error', 'ผิดพลาด');
            return;
        }

        if (passwordData.new_password.length < 6) {
            showAlert('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error', 'ผิดพลาด');
            return;
        }

        setLoading(true);
        try {
            const token = getCookie('lgiatoken');
            const response = await fetch('/api/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                }),
            });

            if (response.ok) {
                showAlert('เปลี่ยนรหัสผ่านสำเร็จ', 'success', 'สำเร็จ');
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                setShowPasswordForm(false);
            } else {
                const error = await response.json();
                showAlert(error.detail || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error', 'ผิดพลาด');
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            showAlert('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error', 'ผิดพลาด');
        }
        setLoading(false);
    };

    // Get first letter of username for avatar
    const getInitial = (username) => {
        if (!username) return '?';
        return username.charAt(0).toUpperCase();
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Back Button */}
                <BackButton className="mb-6" />

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header with Avatar */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center">
                        <div className="w-24 h-24 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-4xl shadow-lg mx-auto mb-4">
                            {getInitial(user.username)}
                        </div>
                        <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                        <p className="text-orange-100 capitalize">{user.role}</p>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">ข้อมูลส่วนตัว</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ชื่อผู้ใช้
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ชื่อ-นามสกุล
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="ระบุชื่อ-นามสกุล"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                        >
                            <IoSave />
                            <span>บันทึกข้อมูล</span>
                        </button>

                        {/* Change Password Section */}
                        <div className="pt-4 border-t">
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
                            >
                                <IoKey />
                                <span>{showPasswordForm ? 'ยกเลิก' : 'เปลี่ยนรหัสผ่าน'}</span>
                            </button>

                            {showPasswordForm && (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            รหัสผ่านปัจจุบัน
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            รหัสผ่านใหม่
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ยืนยันรหัสผ่านใหม่
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
                                    >
                                        <IoKey />
                                        <span>เปลี่ยนรหัสผ่าน</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                variant={alertModal.variant}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
            />
        </div>
    );
};

export default Profile;
