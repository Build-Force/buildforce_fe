"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";

export default function ProfilePage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Change Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    // Edit Profile state
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', companyName: '', taxCode: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    // Avatar upload state
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const avatarInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }
            try {
                const response = await api.get('/api/auth/profile');
                if (response.data.success) {
                    setProfileData(response.data.data);
                    const d = response.data.data;
                    setEditForm({
                        firstName: d.firstName || '',
                        lastName: d.lastName || '',
                        phone: d.phone || '',
                        companyName: d.companyName || '',
                        taxCode: d.taxCode || '',
                    });
                } else {
                    router.push('/signin');
                }
            } catch (error: any) {
                console.error("Failed to fetch profile", error);
                if (error?.response?.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/signin');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('userLoggedIn'));
        router.push('/signin');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError('');
        setEditSuccess('');
        setEditLoading(true);
        try {
            const res = await api.put('/api/auth/profile', editForm);
            if (res.data.success) {
                setProfileData(res.data.data);
                setEditSuccess('Profile updated successfully!');
                window.dispatchEvent(new Event('userLoggedIn'));
                setTimeout(() => setEditSuccess(''), 3000);
            }
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setAvatarError('Only image files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError('File too large. Max 5MB.');
            return;
        }

        setAvatarError('');
        setAvatarUploading(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await api.post('/api/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setProfileData((prev: any) => ({ ...prev, avatar: res.data.data.avatar }));
                // Also update header avatar
                window.dispatchEvent(new Event('userLoggedIn'));
            }
        } catch (err: any) {
            setAvatarError(err.response?.data?.message || 'Failed to upload avatar.');
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');

        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('New passwords do not match.');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwError('New password must be at least 6 characters.');
            return;
        }

        setPwLoading(true);
        try {
            const res = await api.put('/api/auth/change-password', {
                oldPassword: pwForm.oldPassword,
                newPassword: pwForm.newPassword,
            });
            if (res.data.success) {
                setPwSuccess('Password changed successfully! Please log in again.');
                setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    setShowPasswordForm(false);
                    setPwSuccess('');
                }, 2500);
            }
        } catch (err: any) {
            setPwError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'hr': return 'HR Manager';
            case 'user': return 'Worker / Contractor';
            case 'admin': return 'Administrator';
            default: return role || 'Member';
        }
    };

    const getAvatarContent = () => {
        if (profileData?.avatar) {
            return <img src={profileData.avatar} alt="avatar" className="w-full h-full object-cover" />;
        }
        const initials = profileData?.firstName && profileData?.lastName
            ? `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase()
            : profileData?.email?.[0]?.toUpperCase() || '?';
        return <span className="text-3xl font-black">{initials}</span>;
    };

    const profileStrength = () => {
        let score = 0;
        if (profileData?.firstName) score += 20;
        if (profileData?.lastName) score += 10;
        if (profileData?.email) score += 20;
        if (profileData?.phone) score += 20;
        if (profileData?.avatar) score += 15;
        if (profileData?.isVerified) score += 15;
        return score;
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-slate-900 gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-bold">Loading your profile...</p>
            </div>
        );
    }

    const strength = profileStrength();

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pt-28">

            {/* Cover Banner */}
            <div className="relative h-52 w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
                />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT SIDEBAR */}
                    <div className="lg:w-72 flex-shrink-0 space-y-5">

                        {/* Identity Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                            {/* Avatar — click to upload */}
                            <div className="relative inline-block mb-5">
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="group relative w-28 h-28 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                                    title="Click to change avatar"
                                >
                                    {avatarUploading ? (
                                        <span className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        getAvatarContent()
                                    )}
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                    </div>
                                </button>
                                {/* Hidden file input */}
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                {profileData?.isVerified && (
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-white dark:border-slate-900">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                    </div>
                                )}
                            </div>
                            {avatarError && (
                                <p className="text-red-500 text-xs font-bold mb-3">{avatarError}</p>
                            )}
                            {!avatarUploading && (
                                <p className="text-xs text-slate-400 font-medium mb-4">Click avatar to change photo</p>
                            )}

                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                {profileData?.firstName && profileData?.lastName
                                    ? `${profileData.firstName} ${profileData.lastName}`
                                    : profileData?.email || 'BuildForce User'}
                            </h1>
                            <p className="text-primary font-bold text-sm mb-1">{getRoleLabel(profileData?.role)}</p>
                            {profileData?.companyName && (
                                <p className="text-slate-500 text-sm font-medium mb-4 flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">business</span>
                                    {profileData.companyName}
                                </p>
                            )}

                            {/* Info lines */}
                            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 mt-4 mb-6 text-left bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                {profileData?.email && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-primary">email</span>
                                        <span className="truncate">{profileData.email}</span>
                                    </div>
                                )}
                                {profileData?.phone ? (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                                        <span>{profileData.phone}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                        <span className="italic">No phone added</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                                    <span>Joined {new Date(profileData?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-[16px] ${profileData?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {profileData?.isVerified ? 'verified_user' : 'pending'}
                                    </span>
                                    <span className={profileData?.isVerified ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400'}>
                                        {profileData?.isVerified ? 'Email Verified' : 'Email Not Verified'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-[16px] ${profileData?.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {profileData?.isActive ? 'check_circle' : 'cancel'}
                                    </span>
                                    <span className={profileData?.isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-600'}>
                                        {profileData?.isActive ? 'Account Active' : 'Account Suspended'}
                                    </span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setActiveTab('account')}
                                    className="bg-primary hover:bg-sky-500 text-white w-full py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-600 dark:text-slate-300 hover:text-red-500 w-full py-3 rounded-xl text-sm font-black border border-slate-200 dark:border-slate-700 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Profile Strength */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Profile Strength</h3>
                                <span className="text-primary font-black text-sm">{strength}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${strength >= 80 ? 'bg-emerald-500' : strength >= 50 ? 'bg-primary' : 'bg-amber-500'}`}
                                    style={{ width: `${strength}%` }}
                                />
                            </div>
                            <div className="space-y-2 text-xs">
                                {[
                                    { label: 'Name filled', done: !!(profileData?.firstName && profileData?.lastName) },
                                    { label: 'Email added', done: !!profileData?.email },
                                    { label: 'Phone added', done: !!profileData?.phone },
                                    { label: 'Avatar uploaded', done: !!profileData?.avatar },
                                    { label: 'Email verified', done: !!profileData?.isVerified },
                                ].map(item => (
                                    <div key={item.label} className={`flex items-center gap-2 font-semibold ${item.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                        <span className="material-symbols-outlined text-[14px]">{item.done ? 'check_circle' : 'radio_button_unchecked'}</span>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-grow space-y-6">

                        {/* Tab Navigation */}
                        <div className="flex gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            {['overview', 'account', 'security'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-black capitalize transition-all ${activeTab === tab
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-5">
                                {/* Real User Info */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">person</span>
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {[
                                            { label: 'First Name', value: profileData?.firstName, icon: 'badge' },
                                            { label: 'Last Name', value: profileData?.lastName, icon: 'badge' },
                                            { label: 'Email', value: profileData?.email, icon: 'email' },
                                            { label: 'Phone', value: profileData?.phone || '—', icon: 'call' },
                                            { label: 'Role', value: getRoleLabel(profileData?.role), icon: 'work' },
                                            { label: 'Account Status', value: profileData?.isActive ? 'Active' : 'Suspended', icon: 'verified_user' },
                                        ].map(field => (
                                            <div key={field.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                                    <span className="material-symbols-outlined text-[14px]">{field.icon}</span>
                                                    {field.label}
                                                </div>
                                                <p className="text-slate-900 dark:text-white font-bold truncate">{field.value || '—'}</p>
                                            </div>
                                        ))}
                                        {profileData?.role === 'hr' && (
                                            <>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Company Name</div>
                                                    <p className="text-slate-900 dark:text-white font-bold">{profileData?.companyName || '—'}</p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Tax Code</div>
                                                    <p className="text-slate-900 dark:text-white font-bold">{profileData?.taxCode || '—'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Raw DB data section for transparency */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">database</span>
                                        Account Details
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">User ID</div>
                                            <p className="text-slate-700 dark:text-slate-300 font-mono text-xs break-all">{profileData?._id || '—'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Authentication</div>
                                            <p className="text-slate-700 dark:text-slate-300 font-bold capitalize">{profileData?.provider || 'local'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Created At</div>
                                            <p className="text-slate-700 dark:text-slate-300 font-bold">
                                                {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleString() : '—'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Last Updated</div>
                                            <p className="text-slate-700 dark:text-slate-300 font-bold">
                                                {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleString() : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Update Profile</h2>
                                {editError && (
                                    <div className="flex items-center gap-3 p-4 mb-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {editError}
                                    </div>
                                )}
                                {editSuccess && (
                                    <div className="flex items-center gap-3 p-4 mb-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        {editSuccess}
                                    </div>
                                )}
                                <form className="space-y-4" onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                            <input type="text" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                            <input type="text" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                        <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Enter your phone number" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    {profileData?.role === 'hr' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                                                <input type="text" value={editForm.companyName} onChange={e => setEditForm(f => ({ ...f, companyName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Tax Code</label>
                                                <input type="text" value={editForm.taxCode} onChange={e => setEditForm(f => ({ ...f, taxCode: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Email <span className="text-slate-400 font-normal">(read-only)</span></label>
                                        <input type="email" defaultValue={profileData?.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold cursor-not-allowed" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="bg-primary hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
                                    >
                                        {editLoading ? (
                                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />&nbsp;Saving...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-[18px]">save</span>&nbsp;Save Changes</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-5">
                                {/* Email Verification status */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Security Settings</h2>
                                    <div className="space-y-4">
                                        {/* Email Verification */}
                                        <div className={`flex items-center justify-between p-5 rounded-2xl border ${profileData?.isVerified ? 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10' : 'border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className={`material-symbols-outlined text-2xl ${profileData?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {profileData?.isVerified ? 'verified_user' : 'warning'}
                                                </span>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-slate-200">Email Verification</p>
                                                    <p className="text-sm text-slate-500">{profileData?.email}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-black px-3 py-1 rounded-full ${profileData?.isVerified ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                                {profileData?.isVerified ? '✓ Verified' : '⚠ Pending'}
                                            </span>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-4">
                                                <span className="material-symbols-outlined text-2xl text-slate-400">phone_android</span>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-slate-200">Phone Number</p>
                                                    <p className="text-sm text-slate-500">{profileData?.phone || 'Not added yet'}</p>
                                                </div>
                                            </div>
                                            <button className="text-sm font-black text-primary hover:underline">{profileData?.phone ? 'Change' : 'Add'}</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Change Password Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">lock</span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Change Password</h2>
                                                <p className="text-sm text-slate-500">Update your account password</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setShowPasswordForm(!showPasswordForm); setPwError(''); setPwSuccess(''); }}
                                            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${showPasswordForm
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                : 'bg-primary text-white shadow-lg shadow-sky-500/20 hover:bg-sky-500'
                                                }`}
                                        >
                                            {showPasswordForm ? 'Cancel' : 'Change Password'}
                                        </button>
                                    </div>

                                    {showPasswordForm && (
                                        <form onSubmit={handleChangePassword} className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                            {pwError && (
                                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold">
                                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                                    {pwError}
                                                </div>
                                            )}
                                            {pwSuccess && (
                                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                    {pwSuccess}
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={pwForm.oldPassword}
                                                    onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))}
                                                    placeholder="Enter your current password"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    value={pwForm.newPassword}
                                                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                                    placeholder="At least 6 characters"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={pwForm.confirmPassword}
                                                    onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                                    placeholder="Re-enter your new password"
                                                    required
                                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary ${pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                                                        ? 'border-red-400'
                                                        : 'border-slate-200 dark:border-slate-700'
                                                        }`}
                                                />
                                                {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">Passwords do not match</p>
                                                )}
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={pwLoading}
                                                className="w-full bg-primary hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                                            >
                                                {pwLoading ? (
                                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />&nbsp;Changing...</>
                                                ) : (
                                                    <><span className="material-symbols-outlined text-[18px]">lock_reset</span>&nbsp;Confirm Change Password</>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
