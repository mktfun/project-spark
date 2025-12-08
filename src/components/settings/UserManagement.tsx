import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Trash2, Edit2, Shield, User as UserIcon } from 'lucide-react';
import Modal from '../ui/Modal';

const fetcher = (url: string) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());
};

export default function UserManagement() {
    const { data: users, error, mutate } = useSWR('/api/users', fetcher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');
        const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
        const method = editingUser ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save user');
            }

            await mutate();
            handleClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete user');
            await mutate();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({ username: user.username, password: '', role: user.role });
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'user' });
    };

    if (error) return <div className="text-red-400">Failed to load users. Are you an admin?</div>;
    if (!users) return <div className="text-gray-400">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-white">User Management</h2>
                    <p className="text-sm text-gray-400">Manage system access and roles</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            <div className="bg-[#0a0e27] rounded-lg border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900/50 text-gray-400 font-medium border-b border-gray-800">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Created At</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map((user: any) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                        <UserIcon size={14} />
                                    </div>
                                    {user.username}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingUser ? 'Edit User' : 'Add New User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-[#0a0e27] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            disabled={!!editingUser} // Prevent changing username for simplicity
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            {editingUser ? 'New Password (leave empty to keep)' : 'Password'}
                        </label>
                        <input
                            type="password"
                            required={!editingUser}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-[#0a0e27] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-[#0a0e27] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save User'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
