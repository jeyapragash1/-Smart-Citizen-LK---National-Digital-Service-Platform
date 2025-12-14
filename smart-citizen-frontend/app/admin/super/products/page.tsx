'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Search, Edit, Trash2, X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { getAllProducts, addProduct } from '@/lib/api'; // Import API helpers

export default function ProductAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Baby Care',
    price: '',
    stock: '',
    event_trigger: 'Birth',
    image: '' 
  });

  // 1. Fetch Products on Load
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 2. Handle Form Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare payload matching Backend Model
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        event_trigger: formData.event_trigger,
        image: formData.image || "https://placehold.co/400" // Default placeholder if empty
      };

      await addProduct(payload);
      
      alert("Product Added Successfully!");
      setIsModalOpen(false);
      setFormData({ name: '', category: 'Baby Care', price: '', stock: '', event_trigger: 'Birth', image: '' }); // Reset form
      loadProducts(); // Refresh list

    } catch (error) {
      alert("Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace Manager</h1>
            <p className="text-sm text-gray-500">Manage products shown to citizens based on life events.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md"
        >
            <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
            <div className="p-10 text-center text-gray-500">Loading products...</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price (LKR)</th>
                        <th className="px-6 py-4">Trigger Event</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {products.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 overflow-hidden">
                                    {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : <ShoppingBag size={14}/>}
                                </div>
                                {p.name}
                            </td>
                            <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{p.category}</span></td>
                            <td className="px-6 py-4 font-mono">Rs. {p.price}</td>
                            <td className="px-6 py-4 text-xs text-blue-600">{p.event_trigger}</td>
                            <td className="px-6 py-4 font-medium">{p.stock}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-red-600 mx-2"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                No products found. Add one to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingBag size={20}/> Add New Product</h3>
                    <button onClick={() => setIsModalOpen(false)}><X/></button>
                </div>
                
                <form className="p-6 space-y-4" onSubmit={handleAddProduct}>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Name</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" 
                            placeholder="e.g. Baby Milk Powder" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (LKR)</label>
                            <input 
                                required 
                                type="number" 
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" 
                                placeholder="0.00" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Qty</label>
                            <input 
                                required 
                                type="number" 
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" 
                                placeholder="100" 
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option>Baby Care</option>
                                <option>Housing</option>
                                <option>Insurance</option>
                                <option>Education</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Life Event Trigger</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                value={formData.event_trigger}
                                onChange={(e) => setFormData({...formData, event_trigger: e.target.value})}
                            >
                                <option value="Birth">Birth Registration</option>
                                <option value="Marriage">Marriage Registration</option>
                                <option value="Vehicle">Vehicle Transfer</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm" 
                            placeholder="https://example.com/image.jpg" 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">* Paste a link to an image (optional)</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-700 disabled:opacity-70"
                        >
                            {submitting ? <Loader2 className="animate-spin"/> : <><Save size={16}/> Save Product</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}