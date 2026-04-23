import { useState } from 'react';

export default function ProfilePage() {
    const user = localStorage.getItem('currentUser');
    const userData = user ? JSON.parse(user) : null;
    const [message, setMessage] = useState('');

    if (!userData) {
        return (
            <main className="max-w-md mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-2">Not Signed In</h2>
                    <p className="text-gray-500 mb-6">Please sign in to view your profile</p>
                    <a href="/signin" className="bg-emerald-700 text-white px-6 py-3 rounded-lg inline-block">Sign In →</a>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-emerald-700 mb-6">👤 My Profile</h2>

                <div className="space-y-4">
                    <div className="flex py-2 border-b">
                        <div className="font-semibold w-32">Full Name:</div>
                        <div>{userData.fullName}</div>
                    </div>
                    <div className="flex py-2 border-b">
                        <div className="font-semibold w-32">Email:</div>
                        <div>{userData.email}</div>
                    </div>
                    <div className="flex py-2 border-b">
                        <div className="font-semibold w-32">Age Group:</div>
                        <div>{userData.ageGroup || 'Not specified'}</div>
                    </div>
                    <div className="flex py-2 border-b">
                        <div className="font-semibold w-32">Interests:</div>
                        <div>{userData.interests?.join(', ') || 'None'}</div>
                    </div>
                    <div className="flex py-2">
                        <div className="font-semibold w-32">Member Since:</div>
                        <div>{new Date(userData.joinDate).toLocaleDateString()}</div>
                    </div>
                </div>

                {message && <div className="mt-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg">{message}</div>}
            </div>
        </main>
    );
}