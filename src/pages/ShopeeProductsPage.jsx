import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, DollarSign, Package, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import productsData from '../data/shopee_products.json';

const baseKeywords = [
  "Vacuum Frying", "Pirolisis", "Retort", "Pelet Apung", "Destilasi", "Sterilisasi UHT", 
  "Giling Bumbu", "Ekstraktor", "Ekstrak", "Mixer", "Sortasi", "Pengering", "Sablon", "Presto", "Spray Dryer", 
  "Power Shreder", "Sangrai Kopi", "Cetak Bakso", "Packaging", "Press Kemiri", "Dimensi", "Pendingin Susu", "Rotary Dryer"
];

function getCategory(title) {
  if (!title) return "Lainnya";
  const upper = title.toUpperCase();
  for (const kw of baseKeywords) {
    if (upper.includes(kw.toUpperCase())) {
      return `Mesin ${kw}`;
    }
  }
  
  // Jika tidak cocok dengan keyword umum, kelompokkan berdasarkan 3 kata pertama (dibersihkan)
  const cleanTitle = title.replace(/CV ASIANINDO|ASIANINDO/gi, '').trim();
  const words = cleanTitle.split(' ').slice(0, 3).join(' ');
  return words || "Lainnya";
}

const ShopeeProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const groupedProducts = useMemo(() => {
    const groups = {};
    
    // Filter produk berdasarkan pencarian
    const filtered = productsData.filter(product => 
      (product.judul && product.judul.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (product.deskripsi && product.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Melakukan Grouping
    filtered.forEach(product => {
      const category = getCategory(product.judul);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });
    
    // Urutkan Keys dan urutkan Items berdasarkan harga (Termurah - Termahal)
    return Object.keys(groups).sort().map(key => ({
      category: key,
      items: groups[key].sort((a, b) => Number(a.harga) - Number(b.harga))
    }));
  }, [searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            Database Produk Shopee
          </h1>
          <p className="text-gray-500 mt-1">Mengelola {productsData.length} produk dari CV Asianindo</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari produk / kapasitas..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="py-4 px-6 w-12"></th>
                <th className="py-4 px-6 w-1/3">Kategori Mesin</th>
                <th className="py-4 px-6 w-48">Rentang Harga</th>
                <th className="py-4 px-6">Informasi Umum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {groupedProducts.map((group, groupIdx) => {
                const isExpanded = expandedGroups[group.category];
                const minPrice = Math.min(...group.items.map(i => Number(i.harga)));
                const maxPrice = Math.max(...group.items.map(i => Number(i.harga)));
                
                return (
                  <React.Fragment key={groupIdx}>
                    {/* Baris Utama (Parent Row) */}
                    <tr 
                      className={`transition-colors cursor-pointer group ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleGroup(group.category)}
                    >
                      <td className="py-4 px-6 text-gray-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-600" /> : <ChevronRight className="w-5 h-5 group-hover:text-blue-500" />}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Layers className={`w-4 h-4 ${isExpanded ? 'text-blue-600' : 'text-gray-400'} opacity-80`} />
                          <span className={`font-semibold text-base ${isExpanded ? 'text-blue-900' : 'text-gray-900'}`}>
                            {group.category}
                          </span>
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {group.items.length} Variasi
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-gray-700">
                          {minPrice === maxPrice 
                            ? `Rp ${minPrice.toLocaleString('id-ID')}`
                            : `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-500 line-clamp-1">{group.items[0].deskripsi}</span>
                      </td>
                    </tr>

                    {/* Baris Rincian Kapasitas (Children Rows) */}
                    {isExpanded && group.items.map((product, idx) => (
                      <tr key={`${groupIdx}-${idx}`} className="bg-gray-50/80 hover:bg-white transition-colors border-l-4 border-l-blue-400 shadow-inner">
                        <td className="py-3 px-6"></td>
                        <td className="py-3 px-6 pl-8">
                          <div className="font-medium text-sm text-gray-800">{product.judul}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">Kode: {product.id}</div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap shadow-sm border border-green-200">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Rp {Number(product.harga).toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <p className="text-sm text-gray-600 line-clamp-2" title={product.deskripsi}>
                            {product.deskripsi}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              
              {groupedProducts.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Tidak ada produk yang cocok dengan pencarian "{searchTerm}"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopeeProductsPage;
