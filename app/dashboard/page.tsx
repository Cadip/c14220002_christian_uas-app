'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { Pencil, Trash2, X } from 'lucide-react';

export default function DashboardPage() {
    type Product = {
        id?: string;
        nama_produk: string;
        harga_satuan: number;
        quantity: number;
    };

    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({ nama_produk: '', harga_satuan: '', quantity: '' });
    const [showModal, setShowModal] = useState(false);

    const router = useRouter();
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        if (!storedUsername || !storedRole) {
            router.push('/login');
            return;
        }
        setUsername(storedUsername);
        setRole(storedRole);
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*');
        if (data) setProducts(data);
        setLoading(false);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setForm({
            nama_produk: product.nama_produk,
            harga_satuan: product.harga_satuan.toString(),
            quantity: product.quantity.toString(),
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nama_produk: form.nama_produk,
            harga_satuan: parseInt(form.harga_satuan),
            quantity: parseInt(form.quantity),
        };

        if (editingProduct) {
            await supabase.from('products').update(payload).eq('id', editingProduct.id);
        } else {
            await supabase.from('products').insert([payload]);
        }

        setForm({ nama_produk: '', harga_satuan: '', quantity: '' });
        setEditingProduct(null);
        setShowModal(false);
        fetchProducts();
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <div className="navbar flex justify-between items-center mb-6">
                <h1 className="text-2xl">Welcome, {role} {username}</h1>
                <button
                    onClick={() => {
                        localStorage.clear();
                        router.push('/login');
                    }}
                    className="text-sm text-red-500"
                >
                    Logout
                </button>
            </div>

            {role === 'admin' && (
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setForm({ nama_produk: '', harga_satuan: '', quantity: '' });
                        setShowModal(true);
                    }}
                    className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Tambah Produk
                </button>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border border-collapse mb-6">
                    <thead>
                        <tr className="bg-white text-black">
                            <th className="border px-4 py-2">Nama Produk</th>
                            <th className="border px-4 py-2">Harga Satuan</th>
                            <th className="border px-4 py-2">Quantity</th>
                            {role === 'admin' && <th className="border px-4 py-2">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td className="border px-4 py-2">{p.nama_produk}</td>
                                <td className="border px-4 py-2">{p.harga_satuan}</td>
                                <td className="border px-4 py-2">{p.quantity}</td>
                                {role === 'admin' && (
                                    <td className="border px-4 py-2 text-center">
                                        <button onClick={() => handleEdit(p)} className="mr-2 text-blue-500 hover:text-blue-700">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id!)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
                        <button
                            onClick={() => {
                                setShowModal(false);
                                setEditingProduct(null);
                            }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-black">
                            {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                        </h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="nama_produk"
                                placeholder="Nama Produk"
                                value={form.nama_produk}
                                onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                                required
                                className="w-full p-2 border rounded text-black"
                            />
                            <input
                                type="number"
                                name="harga_satuan"
                                placeholder="Harga Satuan"
                                value={form.harga_satuan}
                                onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })}
                                required
                                className="w-full p-2 border rounded text-black"
                            />
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Quantity"
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                required
                                className="w-full p-2 border rounded text-black"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProduct(null);
                                    }}
                                    className="bg-red-300 px-4 py-2 rounded hover:bg-red-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    {editingProduct ? 'Update' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
