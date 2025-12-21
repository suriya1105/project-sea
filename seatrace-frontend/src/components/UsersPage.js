import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, MoreVertical, Edit, Trash2, Eye, Mail, Building, Calendar, CheckCircle, XCircle, Crown, Anchor } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const [newUser, setNewUser] = useState({
        email: '',
        name: '',
        password: '',
        company: '',
        role: 'viewer',
        phone: ''
    });

    // Mock data - replace with actual API calls
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                const mockUsers = [
                    {
                        id: 1,
                        name: 'John Smith',
                        email: 'john.smith@maritime.com',
                        role: 'admin',
                        company: 'Maritime Corp',
                        phone: '+1 (555) 123-4567',
                        status: 'active',
                        lastLogin: '2025-12-19T10:30:00Z',
                        emailVerified: true,
                        phoneVerified: true
                    },
                    {
                        id: 2,
                        name: 'Sarah Johnson',
                        email: 'sarah.j@oceanwatch.com',
                        role: 'operator',
                        company: 'Ocean Watch Inc',
                        phone: '+1 (555) 234-5678',
                        status: 'active',
                        lastLogin: '2025-12-18T15:45:00Z',
                        emailVerified: true,
                        phoneVerified: false
                    },
                    {
                        id: 3,
                        name: 'Mike Davis',
                        email: 'mike.davis@seatrace.com',
                        role: 'viewer',
                        company: 'SeaTrace Analytics',
                        phone: '+1 (555) 345-6789',
                        status: 'inactive',
                        lastLogin: '2025-12-15T09:20:00Z',
                        emailVerified: false,
                        phoneVerified: false
                    },
                    {
                        id: 4,
                        name: 'Emma Wilson',
                        email: 'emma.w@navalops.com',
                        role: 'operator',
                        company: 'Naval Operations Ltd',
                        phone: '+1 (555) 456-7890',
                        status: 'active',
                        lastLogin: '2025-12-19T08:15:00Z',
                        emailVerified: true,
                        phoneVerified: true
                    }
                ];
                setUsers(mockUsers);
                setLoading(false);
            }, 1000);
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
            case 'operator': return <Anchor className="w-4 h-4 text-blue-500" />;
            case 'viewer': return <Eye className="w-4 h-4 text-green-500" />;
            default: return <Users className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'operator': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'viewer': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusBadgeColor = (status) => {
        return status === 'active'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20';
    };

    const handleAddUser = async () => {
        // Simulate API call
        const newUserData = {
            ...newUser,
            id: users.length + 1,
            status: 'active',
            lastLogin: null,
            emailVerified: false,
            phoneVerified: false
        };
        setUsers([...users, newUserData]);
        setShowAddModal(false);
        setNewUser({
            email: '',
            name: '',
            password: '',
            company: '',
            role: 'viewer',
            phone: ''
        });
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    const formatLastLogin = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                            <p className="text-slate-400">Manage user accounts and permissions</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Add User</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-cyan-500/10 rounded-lg">
                                <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{users.length}</div>
                                <div className="text-sm text-slate-400">Total Users</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {users.filter(u => u.status === 'active').length}
                                </div>
                                <div className="text-sm text-slate-400">Active Users</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-yellow-500/10 rounded-lg">
                                <Crown className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {users.filter(u => u.role === 'admin').length}
                                </div>
                                <div className="text-sm text-slate-400">Administrators</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Anchor className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {users.filter(u => u.role === 'operator').length}
                                </div>
                                <div className="text-sm text-slate-400">Operators</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name, email, or company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="sm:w-48">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Administrators</option>
                                <option value="operator">Operators</option>
                                <option value="viewer">Viewers</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-slate-400">Loading users...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Login</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Verification</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-700/20 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-10 h-10">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold text-sm">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">{user.name}</div>
                                                        <div className="text-sm text-slate-400 flex items-center">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                    <span className="capitalize">{user.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-slate-300">
                                                    <Building className="w-4 h-4 mr-2 text-slate-400" />
                                                    {user.company}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.status)}`}>
                                                    {user.status === 'active' ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    <span className="capitalize">{user.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                    {formatLastLogin(user.lastLogin)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-2 h-2 rounded-full ${user.emailVerified ? 'bg-green-400' : 'bg-red-400'}`} title="Email Verified"></div>
                                                    <div className={`w-2 h-2 rounded-full ${user.phoneVerified ? 'bg-green-400' : 'bg-red-400'}`} title="Phone Verified"></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button className="text-slate-400 hover:text-cyan-400 transition-colors duration-200">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="relative">
                                                        <button className="text-slate-400 hover:text-slate-300 transition-colors duration-200">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredUsers.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-300 mb-2">No users found</h3>
                            <p className="text-slate-400">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-6">Add New User</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Enter password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={newUser.company}
                                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="operator">Operator</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;