import React from 'react';
import { Kategori, Transaksi } from '../types';
import { formatCurrency, isToday } from '../utils/dateHelper';
import { IconHelper } from './IconHelper';
import { motion } from 'motion/react';
import { Wallet, TrendingDown, ChevronRight, Sparkles, PlusCircle, Trash2, Archive } from 'lucide-react';

interface DashboardViewProps {
  kategoriList: Kategori[];
  transaksiList: Transaksi[];
  onSelectCategory: (categoryName: string) => void;
  onNavigateToAddTransaction: () => void;
  onDeleteCategory: (categoryId: string) => void;
  onArchiveCurrentMonth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kategoriList,
  transaksiList,
  onSelectCategory,
  onNavigateToAddTransaction,
  onDeleteCategory,
  onArchiveCurrentMonth
}) => {
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
                        <div className="flex items-center space-x-1.5 mt-0.5">
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
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2.5">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-800">
                          {formatCurrency(cat.saldo_saat_ini)}
                        </p>
                        <span className="text-[9px] text-slate-400 font-mono block">Sisa Saldo</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat.id);
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 transition-all border border-rose-100/30 cursor-pointer flex items-center justify-center shrink-0 self-center"
                        title="Hapus Amplop"
                      >
                        <Trash2 size={13} className="stroke-[2.5px]" />
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
    </div>
  );
};
