import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Trash2, AlertTriangle, X } from 'lucide-react';
import api from '../api';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!user) return null;

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete('/auth/delete');
            logout();
        } catch (err) {
            console.error("Error deleting account", err);
            alert("Failed to delete account. Please try again.");
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 mb-6 space-y-4 md:space-y-0 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:items-end">
                            <div className="relative w-28 h-28 md:w-24 md:h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-4xl md:text-3xl font-bold text-indigo-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-4 md:mb-1">
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Personal Information</h3>

                            <div className="grid gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                                        <p className="text-gray-900 font-medium">{user.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                                        <p className="text-gray-900 font-medium">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Account Details</h3>

                            <div className="grid gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Role</p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role ? user.role.toUpperCase() : 'USER'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                                        <p className="text-gray-900 font-medium">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="font-medium text-red-900">Delete Account</h4>
                                <p className="text-sm text-red-700 mt-1">
                                    Permanently delete your account and all of your content. This action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm flex-shrink-0"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account?"
                message="Are you sure you want to delete your account? This action is irreversible and you will lose all data."
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default Profile;
