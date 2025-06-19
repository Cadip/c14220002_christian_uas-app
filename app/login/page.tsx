'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            setErrorMsg('Username tidak ditemukan');
            setLoading(false);
            return;
        }

        if (user.password !== password) {
            setErrorMsg('Password salah');
            setLoading(false);
            return;
        }

        localStorage.setItem('user_id', user.id);
        localStorage.setItem('username', user.username);
        localStorage.setItem('role', user.role);

        router.push('/dashboard');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-semibold text-center mb-6 text-black">Login</h2>
                <form onSubmit={handleLogin}>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />

                    <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {errorMsg && <p className="mt-4 text-red-500 text-center">{errorMsg}</p>}
            </div>
        </div>
    );
}
