'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Star, Loader2, PackageX } from 'lucide-react';
import { getAllProducts } from '@/lib/api'; // Import API

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    Smart Marketplace
                </h1>
                <p className="text-gray-500 text-sm">Recommended products based on your life events</p>
            </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg">
            <ShoppingBag className="w-4 h-4" /> Cart (0)
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <Loader2 size={40} className="animate-spin mb-2 text-blue-600"/>
            <p>Loading Best Offers...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <PackageX size={48} className="mb-2"/>
            <p>No products available right now.</p>
        </div>
      )}

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform">
                    {/* If image is a URL, show img tag, else show emoji placeholder */}
                    {item.image.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-xl"/>
                    ) : (
                        <span>🛍️</span>
                    )}
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{item.category}</span>
                    <div className="flex items-center text-yellow-500 text-xs font-bold gap-1">
                        <Star className="w-3 h-3 fill-current" /> 4.8
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-xl font-bold text-gray-700 mb-4">Rs. {item.price.toLocaleString()}</p>
                <button className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
                    Add to Cart
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}