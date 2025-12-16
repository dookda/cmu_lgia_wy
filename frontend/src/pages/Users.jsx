import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/organisms/Navbar';
import { Card, Text, Button, Input, Select } from '../components/atoms';
import { Alert, Spinner } from '../components/molecules';
import { IoPeople, IoAdd, IoPencil, IoTrash, IoSearch, IoShield } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const roles = [
    { value: 'admin', label: 'ผู้ดูแลระบบ (Admin)' },
    { value: 'editor', label: 'ผู้แก้ไข (Editor)' },
    { value: 'user', label: 'ผู้ใช้ทั่วไป (User)' },
  ];

  const divisions = [
    { value: 'กองการศึกษา', label: 'กองการศึกษา' },
    { value: 'กองคลัง', label: 'กองคลัง' },
    { value: 'กองช่าง', label: 'กองช่าง' },
    { value: 'กองยุทธศาสตร์', label: 'กองยุทธศาสตร์' },
    { value: 'กองสาธารณสุข', label: 'กองสาธารณสุข' },
    { value: 'กองสวัสดิการสังคม', label: 'กองสวัสดิการสังคม' },
    { value: 'สำนักปลัด', label: 'สำนักปลัด' },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/listuser');
      setUsers(response.data || []);
      setError('');
    } catch (err) {
      setError('ไม่สามารถโหลดรายการผู้ใช้ได้');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userData) => {
    setEditingUser({ ...userData });
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/edituser', {
        id: editingUser.id,
        username: editingUser.username,
        email: editingUser.email,
        division: editingUser.division,
        auth: editingUser.auth,
      });

      setSuccess('บันทึกข้อมูลผู้ใช้สำเร็จ');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`ต้องการลบผู้ใช้ "${username}" หรือไม่?`)) {
      return;
    }

    try {
      await axios.post('/api/deleteuser', { id: userId });
      setSuccess(`ลบผู้ใช้ "${username}" สำเร็จ`);
      loadUsers();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
    };
    const labels = {
      admin: 'Admin',
      editor: 'Editor',
      user: 'User',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role] || badges.user}`}>
        {labels[role] || role}
      </span>
    );
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.division?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <IoShield className="text-6xl text-red-500 mx-auto mb-4" />
          <Text variant="h3" className="mb-2">ไม่มีสิทธิ์เข้าถึง</Text>
          <Text color="secondary">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <IoPeople className="text-3xl text-orange-600" />
            <Text variant="h2" color="primary">จัดการผู้ใช้</Text>
          </div>
          <Text color="secondary">
            จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึงระบบ
          </Text>
        </div>

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Search and Add */}
        <Card variant="default" padding="lg" className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหาผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </div>
            <Button variant="primary" onClick={() => alert('เพิ่มผู้ใช้ใหม่ (เชื่อมต่อกับฟอร์ม)')}>
              <IoAdd className="mr-2" />
              เพิ่มผู้ใช้
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card variant="default" padding="none" className="overflow-hidden">
          {loading ? (
            <div className="p-12">
              <Spinner size="lg" message="กำลังโหลดข้อมูลผู้ใช้..." />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อผู้ใช้
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หน่วยงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สิทธิ์
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สร้างเมื่อ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Text weight="medium">{userData.username}</Text>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.division || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(userData.auth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.ts ? new Date(userData.ts).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(userData)}
                          >
                            <IoPencil className="mr-1" />
                            แก้ไข
                          </Button>
                          {userData.username !== 'admin' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(userData.id, userData.username)}
                            >
                              <IoTrash />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-gray-50 px-6 py-3 border-t">
                <Text size="sm" color="secondary">
                  แสดง {filteredUsers.length} จาก {users.length} ผู้ใช้
                </Text>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <IoSearch className="text-5xl text-gray-300 mx-auto mb-3" />
              <Text variant="h5" color="secondary" className="mb-2">
                {searchTerm ? 'ไม่พบผู้ใช้ที่ค้นหา' : 'ยังไม่มีผู้ใช้'}
              </Text>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card variant="elevated" padding="lg" className="max-w-md w-full">
            <Text variant="h4" className="mb-6">แก้ไขข้อมูลผู้ใช้</Text>

            <div className="space-y-4">
              <Input
                label="ชื่อผู้ใช้"
                value={editingUser.username}
                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                fullWidth
              />

              <Input
                label="อีเมล"
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                fullWidth
              />

              <Select
                label="หน่วยงาน"
                options={divisions}
                value={editingUser.division || ''}
                onChange={(e) => setEditingUser({ ...editingUser, division: e.target.value })}
                fullWidth
              />

              <Select
                label="สิทธิ์การใช้งาน"
                options={roles}
                value={editingUser.auth}
                onChange={(e) => setEditingUser({ ...editingUser, auth: e.target.value })}
                fullWidth
              />

              <div className="flex gap-3 pt-4">
                <Button variant="outline" fullWidth onClick={() => setEditingUser(null)}>
                  ยกเลิก
                </Button>
                <Button variant="primary" fullWidth onClick={handleSave}>
                  บันทึก
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Users;
