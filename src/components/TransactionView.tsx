import React, { useState, useEffect } from 'react';
import { Kategori, JenisTransaksi } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/dateHelper';
import { IconHelper } from './IconHelper';
import { PlusCircle, Info, CheckCircle2, ChevronRight, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionViewProps {
  kategoriList: Kategori[];
  onAddTransaction: (data: {
    jenis: JenisTransaksi;
    nominal: number;
    kategoriName: string;
    catatan: string;
    tanggal: string;
  }) => void;
  onAddCategory: (data: {
    nama: string;
    saldoAwal: number;
    warna: string;
    icon: string;
    rekomendasi_aktif?: boolean;
  }) => void;
  preselectedCategory?: string;
}

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

export const TransactionView: React.FC<TransactionViewProps> = ({
  kategoriList,
  onAddTransaction,
  onAddCategory,
  preselectedCategory = ''
}) => {
  // Main form states
  const [jenis, setJenis] = useState<JenisTransaksi>('keluar');
  const [nominal, setNominal] = useState<string>('');
  const [kategoriName, setKategoriName] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [customTanggal, setCustomTanggal] = useState<string>('');
  const [useCurrentTime, setUseCurrentTime] = useState<boolean>(true);

  // Success indicator states
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Mode: 'transaction' or 'category' to add new category
  const [showAddCategoryForm, setShowAddCategoryForm] = useState<boolean>(false);

  // New Category states
  const [newCatNama, setNewCatNama] = useState<string>('');
  const [newCatSaldoAwal, setNewCatSaldoAwal] = useState<string>('');
  const [newCatWarna, setNewCatWarna] = useState<string>('#3b82f6');
  const [newCatIcon, setNewCatIcon] = useState<string>('Wallet');
  const [newCatRekomendasiAktif, setNewCatRekomendasiAktif] = useState<boolean>(false);

  // Sync preselected category
  useEffect(() => {
    if (preselectedCategory) {
      setKategoriName(preselectedCategory);
    } else if (kategoriList.length > 0 && !kategoriName) {
      setKategoriName(kategoriList[0].nama);
    }
  }, [preselectedCategory, kategoriList]);

  // Set default datetime string
  useEffect(() => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:MM local format for input type="datetime-local"
    const tzoffset = now.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    setCustomTanggal(localISOTime);
  }, []);

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedNominal = parseFloat(nominal.replace(/[^0-9]/g, ''));
    
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      alert('Masukkan nominal yang valid dan lebih besar dari 0.');
      return;
    }

    if (!kategoriName) {
      alert('Silakan pilih kategori anggaran terlebih dahulu.');
      return;
    }

    // Verify current balance for pengeluaran
    const selectedCat = kategoriList.find(c => c.nama === kategoriName);
    if (jenis === 'keluar' && selectedCat && selectedCat.saldo_saat_ini < parsedNominal) {
      const confirmSpend = window.confirm(
        `Perhatian! Saldo amplop "${kategoriName}" hanya ${formatCurrency(selectedCat.saldo_saat_ini)}. \n\nApakah Anda yakin ingin melakukan pengeluaran sebesar ${formatCurrency(parsedNominal)}? (Saldo akan menjadi negatif)`
      );
      if (!confirmSpend) return;
    }

    // Prepare datetime string
    let finalTanggal = new Date().toISOString(); // Default current datetime
    if (!useCurrentTime && customTanggal) {
      finalTanggal = new Date(customTanggal).toISOString();
    }

    onAddTransaction({
      jenis,
      nominal: parsedNominal,
      kategoriName,
      catatan: catatan.trim(),
      tanggal: finalTanggal
    });

    // Show success banner
    setSuccessMessage(`Transaksi ${jenis === 'masuk' ? 'Top Up' : 'Pengeluaran'} berhasil dicatat!`);
    
    // Reset form
    setNominal('');
    setCatatan('');
    
    // Auto clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNama.trim()) {
      alert('Nama kategori tidak boleh kosong.');
      return;
    }

    // Check duplicate
    const isDuplicate = kategoriList.some(
      cat => cat.nama.toLowerCase() === newCatNama.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert('Kategori dengan nama tersebut sudah ada.');
      return;
    }

    const parsedSaldo = parseFloat(newCatSaldoAwal.replace(/[^0-9]/g, '')) || 0;

    onAddCategory({
      nama: newCatNama.trim(),
      saldoAwal: parsedSaldo,
      warna: newCatWarna,
      icon: newCatIcon,
      rekomendasi_aktif: newCatRekomendasiAktif
    });

    // Select this category automatically in transaction form
    setKategoriName(newCatNama.trim());
    
    // Show success feedback
    setSuccessMessage(`Kategori baru "${newCatNama.trim()}" berhasil dibuat dengan saldo awal ${formatCurrency(parsedSaldo)}!`);

    // Reset fields
    setNewCatNama('');
    setNewCatSaldoAwal('');
    setNewCatRekomendasiAktif(false);
    setShowAddCategoryForm(false);

    // Auto clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Safe formatting for nominal typing
  const handleNominalChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setNominal(new Intl.NumberFormat('id-ID').format(parseFloat(numericValue)));
    } else {
      setNominal('');
    }
  };

  const handleNewCatSaldoAwalChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setNewCatSaldoAwal(new Intl.NumberFormat('id-ID').format(parseFloat(numericValue)));
    } else {
      setNewCatSaldoAwal('');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top success alert */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800 shadow-sm"
          >
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
            <p className="text-xs font-semibold">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Catat Keuangan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Catat bensin, laundry, atau isi saldo amplop dengan mudah</p>
        </div>
        
        <button
          onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <FolderPlus size={14} />
          <span>{showAddCategoryForm ? 'Batal' : 'Buat Amplop'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddCategoryForm ? (
          // ================= ADD NEW CATEGORY FORM =================
          <motion.div
            key="add-category-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-inner"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Tambah Amplop Anggaran Baru</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Metode Enveloped</span>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Amplop / Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bensin, Laundry, Netflix"
                  value={newCatNama}
                  onChange={(e) => setNewCatNama(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all shadow-sm"
                  required
                />
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Saldo Awal (Akan dicatat sebagai Top Up)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={newCatSaldoAwal}
                    onChange={(e) => handleNewCatSaldoAwalChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 font-extrabold outline-none transition-all shadow-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  *Dana awal ini akan otomatis masuk ke amplop baru ini sebagai transaksi masuk.
                </p>
              </div>

              {/* Color Chooser */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Pilih Warna Amplop
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVAILABLE_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setNewCatWarna(col.hex)}
                      className={`w-8 h-8 rounded-full ${col.bg} flex items-center justify-center border-2 transition-all cursor-pointer ${
                        newCatWarna === col.hex ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      title={col.name}
                    >
                      {newCatWarna === col.hex && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Chooser */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Pilih Icon Representasi
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setNewCatIcon(ico)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        newCatIcon === ico
                          ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <IconHelper name={ico} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Aturan & Rekomendasi Pengeluaran Toggle */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Aturan & Rekomendasi Pengeluaran</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                      Aktifkan pembagian budget merata ke milestone tanggal terdekat & resep hemat mi/telur.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={newCatRekomendasiAktif}
                      onChange={(e) => setNewCatRekomendasiAktif(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-md mt-4 cursor-pointer"
              >
                Simpan & Aktifkan Amplop
              </button>
            </form>
          </motion.div>
        ) : (
          // ================= RECORD TRANSACTION FORM =================
          <motion.div
            key="record-transaction-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-100 rounded-3xl p-5 space-y-5 shadow-sm"
          >
            {/* Transaction Type Tab Selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setJenis('keluar')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  jenis === 'keluar'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${jenis === 'keluar' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span>Transaksi Keluar (Pengeluaran)</span>
              </button>
              <button
                type="button"
                onClick={() => setJenis('masuk')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  jenis === 'masuk'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${jenis === 'masuk' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span>Transaksi Masuk (Top Up)</span>
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              {/* Nominal Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nominal Transaksi
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-lg font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={nominal}
                    onChange={(e) => handleNominalChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-2xl pl-11 pr-4 py-3.5 text-lg text-slate-800 font-extrabold outline-none transition-all shadow-inner font-mono"
                    required
                  />
                </div>
              </div>

              {/* Envelope / Category dropdown */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Amplop Anggaran Target
                  </label>
                  {kategoriName && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      Saldo Amplop Ini: {formatCurrency(kategoriList.find(c => c.nama === kategoriName)?.saldo_saat_ini || 0)}
                    </span>
                  )}
                </div>
                
                {kategoriList.length === 0 ? (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 font-medium">
                    Belum ada amplop aktif. Buat amplop terlebih dahulu dengan tombol "Buat Amplop" di atas.
                  </div>
                ) : (
                  <select
                    value={kategoriName}
                    onChange={(e) => setKategoriName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3.5 text-sm text-slate-800 font-semibold outline-none transition-all shadow-sm"
                    required
                  >
                    {kategoriList.map((cat) => (
                      <option key={cat.id} value={cat.nama}>
                        {cat.nama} (Saldo: {formatCurrency(cat.saldo_saat_ini)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Catatan Ringkas
                </label>
                <input
                  type="text"
                  placeholder="Misal: Beli pertalite di SPBU, Cuci jas bersih"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all shadow-sm"
                />
              </div>

              {/* Date selection controller */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconHelper name="Clock" size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Gunakan Tanggal & Waktu Sekarang</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCurrentTime}
                      onChange={(e) => setUseCurrentTime(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {!useCurrentTime && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-slate-200"
                  >
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Pilih Tanggal & Waktu Kustom
                    </label>
                    <input
                      type="datetime-local"
                      value={customTanggal}
                      onChange={(e) => setCustomTanggal(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono outline-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={kategoriList.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed active:scale-95 text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-md mt-6 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Catat Transaksi Baru</span>
                <ChevronRight size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper budgeting rule card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <Info size={14} className="text-slate-500" />
          <span>Aturan Aliran Dana</span>
        </h4>
        <ul className="text-[11px] text-slate-500 space-y-1.5 mt-2 ml-1 leading-relaxed list-disc list-inside">
          <li><strong>Top Up (Masuk):</strong> Menambah saldo secara terisolasi pada kategori yang dipilih.</li>
          <li><strong>Pengeluaran (Keluar):</strong> Hanya mengurangi saldo kategori target, tidak mengganggu kategori lain.</li>
          <li><strong>Tanggal & Waktu:</strong> Diisi otomatis saat menekan "Catat Transaksi Baru" secara akurat.</li>
        </ul>
      </div>
    </div>
  );
};
