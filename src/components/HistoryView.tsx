import React, { useState } from 'react';
import { Transaksi, Kategori } from '../types';
import { formatCurrency, formatLongDateIndo, formatTimeStr } from '../utils/dateHelper';
import { IconHelper } from './IconHelper';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar, FileText, Trash2, Clock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryViewProps {
  transaksiList: Transaksi[];
  kategoriList: Kategori[];
  onSelectTransaction: (tx: Transaksi) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transaksiList,
  kategoriList,
  onSelectTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [filterCategory, setFilterCategory] = useState<string>('semua');

  // Sorted from newest to oldest
  const sortedTransactions = [...transaksiList].sort((a, b) => {
    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
  });

  // Filter transactions
  const filteredTransactions = sortedTransactions.filter(tx => {
    const matchesSearch = 
      (tx.catatan?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      tx.kategori.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      filterType === 'semua' ? true : tx.jenis === filterType;

    const matchesCategory = 
      filterCategory === 'semua' ? true : tx.kategori === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Group transactions by date
  const groupTransactionsByDate = (txs: Transaksi[]) => {
    const groups: { [dateStr: string]: Transaksi[] } = {};
    txs.forEach(tx => {
      const datePart = tx.tanggal.split('T')[0];
      if (!groups[datePart]) {
        groups[datePart] = [];
      }
      groups[datePart].push(tx);
    });
    return groups;
  };

  const groupedTx = groupTransactionsByDate(filteredTransactions);
  const groupedKeys = Object.keys(groupedTx).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Aktivitas</h1>
        <p className="text-xs text-slate-500 mt-0.5">Pantau seluruh aliran keluar-masuk dana per amplop</p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari catatan atau nama kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Filter Type Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {(['semua', 'masuk', 'keluar'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 sm:flex-initial text-[10px] font-bold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Filter Category Select */}
          <div className="relative flex-1">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              {kategoriList.map(cat => (
                <option key={cat.id} value={cat.nama}>
                  {cat.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">Tidak ada transaksi yang cocok.</p>
          <button
            onClick={() => { setSearchTerm(''); setFilterType('semua'); setFilterCategory('semua'); }}
            className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
          >
            Reset Filter Pencarian
          </button>
        </div>
      ) : (
        <div className="space-y-6 relative pl-3">
          {/* Vertical timeline backbone line */}
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 border-l border-dashed border-slate-300 pointer-events-none"></div>

          {groupedKeys.map((dateStr) => {
            const dayTransactions = groupedTx[dateStr];
            return (
              <div key={dateStr} className="space-y-3 relative">
                {/* Date header with calendar badge */}
                <div className="flex items-center space-x-2 -ml-2 sticky top-0 bg-slate-50/90 backdrop-blur-xs py-1 z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600">
                    <Calendar size={12} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-slate-500 font-mono tracking-wider uppercase">
                    {formatLongDateIndo(dateStr)}
                  </h4>
                </div>

                {/* Day's transactions list */}
                <div className="space-y-2.5 pl-5">
                  {dayTransactions.map((tx) => {
                    const isMasuk = tx.jenis === 'masuk';
                    const categoryInfo = kategoriList.find(c => c.nama === tx.kategori);
                    const accentColor = categoryInfo?.warna || (isMasuk ? '#10b981' : '#ef4444');

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => onSelectTransaction(tx)}
                        className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3.5">
                          {/* Left icon circle indicating transaction flow */}
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center relative shadow-inner"
                            style={{ backgroundColor: `${accentColor}15` }}
                          >
                            <IconHelper name={categoryInfo?.icon || 'Coins'} style={{ color: accentColor }} size={16} />
                            
                            {/* Small badges for top up vs expense */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                              isMasuk ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}>
                              {isMasuk ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span 
                              className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full"
                              style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                            >
                              {tx.kategori}
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {tx.catatan || `Transaksi ${isMasuk ? 'Top Up' : 'Keluar'}`}
                            </h5>
                            <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                              <Clock size={10} />
                              <span>{formatTimeStr(tx.tanggal)} WIB</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side displays nominal and action buttons */}
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className={`text-xs font-extrabold ${isMasuk ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {isMasuk ? '+' : '-'}{formatCurrency(tx.nominal)}
                            </p>
                            <span className="text-[9px] font-mono text-slate-400">
                              {isMasuk ? 'Masuk' : 'Keluar'}
                            </span>
                          </div>
                          
                          <div className="flex items-center pl-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTransaction(tx);
                              }}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
                              title="Lihat Detail"
                            >
                              <Eye size={12} />
                            </button>
                            {onDeleteTransaction && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Hapus pencatatan transaksi ini? Saldo amplop bersangkutan akan dipulihkan secara otomatis.')) {
                                    onDeleteTransaction(tx.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
