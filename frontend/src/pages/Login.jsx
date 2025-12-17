import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (data.status === 'success') {
                // Set cookies like the old version
                document.cookie = `lgiatoken=${data.token}; path=/`;
                document.cookie = `lgiausername=${data.username}; path=/`;
                document.cookie = `lgiaauth=${data.role}; path=/`;

                // Redirect to home
                window.location.href = '/';
            } else {
                setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
            }
        } catch (err) {
            setError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/img/LOGO.png" alt="LGIA Logo" className="w-20 h-20 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h1>
                    <p className="text-gray-500 text-sm">ระบบภูมิสารสนเทศชุมชน (LGIA)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อผู้ใช้
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            placeholder="กรอกชื่อผู้ใช้"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            placeholder="กรอกรหัสผ่าน"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-gray-600 text-sm">
                        ยังไม่มีบัญชี?{" "}
                        <Link
                            to="/register"
                            className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                            ลงทะเบียนที่นี่
                        </Link>
                    </p>
                    <a href="/" className="block text-gray-500 hover:text-gray-700 text-sm">
                        กลับหน้าหลัก
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
