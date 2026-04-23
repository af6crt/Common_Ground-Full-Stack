import { useState } from 'react';

export default function SignUpPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.some((u: any) => u.email === email)) {
            setError('Email already registered');
            return;
        }

        const newUser = {
            id: Date.now(),
            fullName,
            email,
            password,
            ageGroup: '',
            interests: [],
            joinDate: new Date().toISOString(),
            joinedEvents: [],
            requestedMeals: [],
            joinedClubs: []
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        window.location.href = '/dashboard';
    };

    return (
        <main className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold text-emerald-700 mb-2">Join Common Ground</h1>
                <p className="text-gray-500 mb-6">Create your account to connect with neighbours</p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-lg mb-4" required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg mb-4" required />
                    <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg mb-6" required />
                    <button type="submit" className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800">Create Account →</button>
                </form>

                <p className="text-center text-gray-500 mt-6">Already have an account? <a href="/signin" className="text-emerald-700">Sign In</a></p>
            </div>
        </main>
    );
}