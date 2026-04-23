import { useState } from 'react';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            window.location.href = '/dashboard';
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <main className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold text-emerald-700 mb-2">Welcome back</h1>
                <p className="text-gray-500 mb-6">Sign in to continue to Common Ground</p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg mb-4" required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg mb-6" required />
                    <button type="submit" className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800">Sign In →</button>
                </form>

                <p className="text-center text-gray-500 mt-6">Don't have an account? <a href="/signup" className="text-emerald-700">Sign up</a></p>
            </div>
        </main>
    );
}