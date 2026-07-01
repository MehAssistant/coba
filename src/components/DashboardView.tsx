import React, { useState } from 'react';
import { Kategori, Transaksi } from '../types';
import { formatCurrency, isToday } from '../utils/dateHelper';
import { IconHelper } from './IconHelper';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, TrendingDown, ChevronRight, Sparkles, PlusCircle, Trash2, Archive, Pencil, X, Check, Info } from 'lucide-react';

const AVAILABLE_ICONS = ['Utensils', 'Car', 'Shirt', 'ShoppingBag', 'Sparkles', 'Home', 'HeartPulse', 'BookOpen', 'Smartphone', 'Coins'];
const AVAILABLE_COLORS = [
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Violet', hex: '#8b5cf6', bg: 'bg-violet-500' },
  { name: 'Pink', hex: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Red', hex: '#ef4444', bg: 'bg-red-500' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Orange', hex: '#f97316', bg: 'bg-orange-500' }
];

const getSmartBudgetInfo = (saldo: number) => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Milestones: 1, 7, 14, 21, 28
  let targetMilestone = 1;
  let remainingDays = 1;
  let milestoneLabel = '';

  if (day >= 1 && day < 7) {
    targetMilestone = 7;
    remainingDays = 7 - day;
    milestoneLabel = 'tgl 7';
  } else if (day >= 7 && day < 14) {
    targetMilestone = 14;
    remainingDays = 14 - day;
    milestoneLabel = 'tgl 14';
  } else if (day >= 14 && day < 21) {
    targetMilestone = 21;
    remainingDays = 21 - day;
    milestoneLabel = 'tgl 21';
  } else if (day >= 21 && day < 28) {
    targetMilestone = 28;
    remainingDays = 28 - day;
    milestoneLabel = 'tgl 28';
  } else {
    // 28 or later. Milestone is 1st of next month.
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    targetMilestone = 1;
    remainingDays = (daysInCurrentMonth - day) + 1;
    milestoneLabel = 'tgl 1 bulan depan';
  }

  const budgetHarian = remainingDays > 0 ? Math.max(0, Math.floor(saldo / remainingDays)) : 0;

  let recommendationText = '';
  let adviceType: 'info' | 'warning' | 'success' | 'danger' = 'info';

  if (saldo <= 0) {
    recommendationText = '⚠️ Saldo amplop habis atau minus. Segera lakukan Top Up amplop ini untuk mengaktifkan kembali pembagian budget harian!';
    adviceType = 'danger';
  } else {
    if (budgetHarian >= 30000) {
      recommendationText = `Budget harian Anda aman (${formatCurrency(budgetHarian)}/hari). Anda bisa makan dengan gizi seimbang. Namun jika ingin ekstra hemat untuk tabungan, disarankan membeli telur seharga Rp 3.000/butir untuk lauk pauk!`;
      adviceType = 'success';
    } else if (budgetHarian >= 15000) {
      recommendationText = `⚠️ Pengeluaran Anda beberapa hari terakhir cukup boros! Jatah harian Anda terkompresi di bawah normal menjadi ${formatCurrency(budgetHarian)}/hari hingga ${milestoneLabel} (${remainingDays} hari). Untuk menyeimbangkan anggaran, Anda harus tegas: disarankan 1 hari penuh full makan telur saja (Rp 3.000/butir, cukup Rp 9.000 untuk 3x makan) agar hari berikutnya kembali aman dan kantong stabil!`;
      adviceType = 'info';
    } else if (budgetHarian >= 4000) {
      recommendationText = `⚠️ PERINGATAN KERAS! Pengeluaran Anda sangat boros beberapa hari terakhir! Jatah harian tersisa kritis hanya ${formatCurrency(budgetHarian)}/hari. Anda harus merelakan beberapa hari dengan hemat ekstra: disarankan 2 hari penuh makan Mi Instan seharga Rp 4.000/bungkus atau lauk telur (Rp 3.000/butir) agar anggaran tidak jebol sebelum ${milestoneLabel}!`;
      adviceType = 'warning';
    } else {
      recommendationText = `🚨 SIAGA DARURAT! Pengeluaran Anda terlampau boros hingga jatah harian tersisa tidak sampai Rp 4.000/hari. Anda wajib mengorbankan kenyamanan kuliner saat ini: disarankan segera Top Up atau puasa/makan mi instan jatah minimal seharga Rp 4.000/bungkus demi menyambung hidup hingga ${milestoneLabel}!`;
      adviceType = 'danger';
    }
  }

  return {
    remainingDays,
    milestoneLabel,
    budgetHarian,
    recommendationText,
    adviceType
  };
};

interface DashboardViewProps {
  kategoriList: Kategori[];
  transaksiList: Transaksi[];
  onSelectCategory: (categoryName: string) => void;
  onNavigateToAddTransaction: () => void;
  onDeleteCategory: (categoryId: string) => void;
  onArchiveCurrentMonth: () => void;
  onUpdateCategory: (categoryId: string, data: {
    nama: string;
    warna: string;
    icon: string;
    rekomendasi_aktif: boolean;
  }) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kategoriList,
  transaksiList,
  onSelectCategory,
  onNavigateToAddTransaction,
  onDeleteCategory,
  onArchiveCurrentMonth,
  onUpdateCategory
}) => {
  // Editing state
  const [editingCategory, setEditingCategory] = useState<Kategori | null>(null);
  const [editNama, setEditNama] = useState<string>('');
  const [editWarna, setEditWarna] = useState<string>('');
  const [editIcon, setEditIcon] = useState<string>('');
  const [editRekomendasiAktif, setEditRekomendasiAktif] = useState<boolean>(false);

  const startEditCategory = (cat: Kategori) => {
    setEditingCategory(cat);
    setEditNama(cat.nama);
    setEditWarna(cat.warna || '#3b82f6');
    setEditIcon(cat.icon || 'Wallet');
    setEditRekomendasiAktif(cat.rekomendasi_aktif || false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editNama.trim()) return;

    onUpdateCategory(editingCategory.id, {
      nama: editNama.trim(),
      warna: editWarna,
      icon: editIcon,
      rekomendasi_aktif: editRekomendasiAktif
    });

    setEditingCategory(null);
  };

  // 1. Total Semua Kategori: Gabungan/penjumlahan dari semua saldo di seluruh kategori saat ini
  const totalSaldo = kategoriList.reduce((acc, cat) => acc + cat.saldo_saat_ini, 0);

  // 2. Total Pengeluaran Harian: Akumulasi khusus untuk transaksi "keluar" hari ini
  const totalPengeluaranHariIni = transaksiList
    .filter(tx => tx.jenis === 'keluar' && isToday(tx.tanggal))
    .reduce((acc, tx) => acc + tx.nominal, 0);

  // Helper to calculate total allocated / top ups in category
  const getCategoryStats = (categoryName: string) => {
    const txCategory = transaksiList.filter(tx => tx.kategori === categoryName);
    const totalMasuk = txCategory.filter(tx => tx.jenis === 'masuk').reduce((acc, tx) => acc + tx.nominal, 0);
    const totalKeluar = txCategory.filter(tx => tx.jenis === 'keluar').reduce((acc, tx) => acc + tx.nominal, 0);
    const totalKeluarHariIni = txCategory
      .filter(tx => tx.jenis === 'keluar' && isToday(tx.tanggal))
      .reduce((acc, tx) => acc + tx.nominal, 0);
    return { totalMasuk, totalKeluar, totalKeluarHariIni };
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header section with profile greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">Dompet Digital PWA</p>
          <h1 id="dashboard-greeting" className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">Hai, Pengelola Pintar 👋</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
          KU
        </div>
      </div>

      {/* Main Total Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-indigo-600 text-white p-6 shadow-xl shadow-indigo-100"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 40%)'
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Wallet size={14} className="text-white" />
            <span className="text-[10px] font-semibold tracking-wider uppercase">Saldo Kumulatif</span>
          </div>
          <span className="text-xs font-mono text-indigo-200">Enveloped Budgeting</span>
        </div>

        <div className="mt-5">
          <p className="text-xs text-indigo-100 font-medium">Total Dana Semua Kategori</p>
          <h2 id="total-balance" className="text-3xl font-extrabold tracking-tight mt-1 text-white">
            {formatCurrency(totalSaldo)}
          </h2>
        </div>

        <div className="mt-6 pt-4 border-t border-indigo-400/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <TrendingDown size={14} />
            </div>
            <div>
              <p className="text-[10px] text-indigo-200 font-medium leading-none">Keluar Hari Ini</p>
              <p id="total-expense" className="text-sm font-bold text-white mt-1 leading-none">
                {formatCurrency(totalPengeluaranHariIni)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onArchiveCurrentMonth}
              className="flex items-center space-x-1 bg-indigo-500 hover:bg-indigo-400 active:scale-95 border border-indigo-400 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Arsipkan data bulan ini"
            >
              <Archive size={13} />
              <span>Arsipkan</span>
            </button>
            <button
              onClick={onNavigateToAddTransaction}
              className="flex items-center space-x-1.5 bg-white text-indigo-700 hover:bg-slate-50 active:scale-95 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Top Up / Catat</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Breakdown per Kategori Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles size={16} className="text-indigo-600" />
            <span>Sisa Saldo Kategori</span>
          </h3>
          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
            {kategoriList.length} Pos
          </span>
        </div>

        {kategoriList.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-sm text-slate-500">Belum ada kategori anggaran.</p>
            <button
              onClick={onNavigateToAddTransaction}
              className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
            >
              Tambah kategori baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {kategoriList.map((cat, index) => {
              const stats = getCategoryStats(cat.nama);
              const progressPercentage = stats.totalMasuk > 0 
                ? Math.min(100, Math.round((cat.saldo_saat_ini / stats.totalMasuk) * 100)) 
                : 100;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => onSelectCategory(cat.nama)}
                  className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                        style={{ backgroundColor: cat.warna || '#475569' }}
                      >
                        <IconHelper name={cat.icon || 'Wallet'} className="text-white" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {cat.nama}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {stats.totalKeluarHariIni > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-1"></span>
                              Hari Ini: -{formatCurrency(stats.totalKeluarHariIni)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-50 text-slate-400 border border-slate-100">
                              Hari Ini: {formatCurrency(0)}
                            </span>
                          )}
                          {cat.rekomendasi_aktif && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100/40">
                              💡 Pintar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-1">
                        <p className="text-sm font-extrabold text-slate-800">
                          {formatCurrency(cat.saldo_saat_ini)}
                        </p>
                        <span className="text-[9px] text-slate-400 font-mono block">Sisa Saldo</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditCategory(cat);
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-all border border-slate-100 hover:border-indigo-100/30 cursor-pointer flex items-center justify-center shrink-0 self-center"
                        title="Edit Amplop"
                      >
                        <Pencil size={12} className="stroke-[2.5px]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat.id);
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 transition-all border border-rose-100/30 cursor-pointer flex items-center justify-center shrink-0 self-center"
                        title="Hapus Amplop"
                      >
                        <Trash2 size={12} className="stroke-[2.5px]" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar representing remaining budget proportion to total allocated */}
                  {stats.totalMasuk > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Terpakai: {formatCurrency(stats.totalKeluar)}</span>
                        <span className="font-semibold" style={{ color: cat.warna || '#475569' }}>
                          {progressPercentage}% Tersisa
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${progressPercentage}%`, 
                            backgroundColor: cat.warna || '#475569' 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Smart Recommendation Block */}
                  {cat.rekomendasi_aktif && (() => {
                    const rec = getSmartBudgetInfo(cat.saldo_saat_ini);
                    const bgClass = 
                      rec.adviceType === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                      rec.adviceType === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                      rec.adviceType === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                      'bg-indigo-50 border-indigo-100/80 text-indigo-900';
                    const badgeColor = 
                      rec.adviceType === 'success' ? 'bg-emerald-500 text-white' :
                      rec.adviceType === 'warning' ? 'bg-amber-500 text-white' :
                      rec.adviceType === 'danger' ? 'bg-rose-500 text-white animate-pulse' :
                      'bg-indigo-600 text-white';

                    return (
                      <div className={`mt-3 p-3 rounded-xl border text-[10px] ${bgClass} space-y-1`}>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold tracking-wide uppercase text-[9px] flex items-center gap-1">
                            <span>🎯 Rekomendasi Belanja</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${badgeColor}`}>
                            Limit: {formatCurrency(rec.budgetHarian)} / hari
                          </span>
                        </div>
                        <p className="leading-relaxed font-medium">
                          {rec.recommendationText}
                        </p>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-slate-100 text-[10px] text-slate-400">
                    <span className="font-mono">Top Up: {formatCurrency(stats.totalMasuk || cat.saldo_saat_ini)}</span>
                    <span className="flex items-center text-blue-600 group-hover:translate-x-1 transition-transform font-bold">
                      Lihat Transaksi <ChevronRight size={10} className="ml-0.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Banner on Enveloped Budgeting Methodology */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <IconHelper name="Info" size={16} />
        </div>
        <div>
          <h5 className="text-xs font-bold text-indigo-900">Tentang Enveloped Budgeting</h5>
          <p className="text-[11px] text-indigo-800/85 mt-0.5 leading-relaxed">
            Metode ini mengisolasi dana per kategori (seperti amplop fisik). Pengeluaran di kategori <strong>Makan</strong> tidak akan pernah mengurangi amplop <strong>Bensin</strong>. Disiplin keuangan dimulai dengan memisahkan uang Anda!
          </p>
        </div>
      </div>

      {/* Category Editor Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCategory(null)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: editWarna }} />
                  <span>Edit Amplop Anggaran</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Amplop / Kategori
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3 text-sm text-slate-800 font-bold outline-none transition-all shadow-xs"
                    required
                  />
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pilih Warna Amplop
                  </label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {AVAILABLE_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setEditWarna(col.hex)}
                        className={`w-7 h-7 rounded-full ${col.bg} flex items-center justify-center border-2 transition-all cursor-pointer ${
                          editWarna === col.hex ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                        }`}
                        title={col.name}
                      >
                        {editWarna === col.hex && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pilih Icon Representasi
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_ICONS.map((ico) => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setEditIcon(ico)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          editIcon === ico
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconHelper name={ico} size={15} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendation Toggle */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">Aturan & Rekomendasi Pengeluaran</h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                        Sistem cerdas membagi sisa budget ke milestone terdekat dan memberi saran belanja telur (Rp 3rb) / Mi (Rp 4rb) jika boros.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={editRekomendasiAktif}
                        onChange={(e) => setEditRekomendasiAktif(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
