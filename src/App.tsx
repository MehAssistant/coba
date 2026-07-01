import React, { useState, useEffect } from 'react';
import { Kategori, Transaksi, JenisTransaksi, Arsip } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_TRANSACTIONS } from './initialData';
import { DashboardView } from './components/DashboardView';
import { TransactionView } from './components/TransactionView';
import { HistoryView } from './components/HistoryView';
import { ArchiveView } from './components/ArchiveView';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { IconHelper } from './components/IconHelper';
import { Wallet, PlusCircle, History, RotateCcw, Smartphone, Coins, Download, Upload, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'home' | 'add' | 'history' | 'archive';

export default function App() {
  // 1. Core state initialized from localStorage or defaults
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [arsipList, setArsipList] = useState<Arsip[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [preselectedCategory, setPreselectedCategory] = useState<string>('');

  // Selected transaction for details sheet modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaksi | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    const savedKategori = localStorage.getItem('kb_kategori_list');
    const savedTransaksi = localStorage.getItem('kb_transaksi_list');
    const savedArsip = localStorage.getItem('kb_arsip_list');

    if (savedKategori && savedTransaksi) {
      setKategoriList(JSON.parse(savedKategori));
      setTransaksiList(JSON.parse(savedTransaksi));
    } else {
      // Use standard default seeds
      setKategoriList(DEFAULT_CATEGORIES);
      setTransaksiList(DEFAULT_TRANSACTIONS);
      localStorage.setItem('kb_kategori_list', JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem('kb_transaksi_list', JSON.stringify(DEFAULT_TRANSACTIONS));
    }

    if (savedArsip) {
      setArsipList(JSON.parse(savedArsip));
    } else {
      setArsipList([]);
      localStorage.setItem('kb_arsip_list', JSON.stringify([]));
    }
  }, []);

  // Persist state changes
  const saveState = (
    updatedCats: Kategori[],
    updatedTxs: Transaksi[],
    updatedArsip: Arsip[] = arsipList
  ) => {
    setKategoriList(updatedCats);
    setTransaksiList(updatedTxs);
    setArsipList(updatedArsip);
    localStorage.setItem('kb_kategori_list', JSON.stringify(updatedCats));
    localStorage.setItem('kb_transaksi_list', JSON.stringify(updatedTxs));
    localStorage.setItem('kb_arsip_list', JSON.stringify(updatedArsip));
  };

  // 2. Action Handlers
  // Record standard top up / expense transactions
  const handleAddTransaction = (data: {
    jenis: JenisTransaksi;
    nominal: number;
    kategoriName: string;
    catatan: string;
    tanggal: string;
  }) => {
    const newTx: Transaksi = {
      id: `tx-${Date.now()}`,
      jenis: data.jenis,
      nominal: data.nominal,
      kategori: data.kategoriName,
      catatan: data.catatan,
      tanggal: data.tanggal
    };

    // Update the categories balance
    const updatedCats = kategoriList.map(cat => {
      if (cat.nama === data.kategoriName) {
        if (data.jenis === 'masuk') {
          return { ...cat, saldo_saat_ini: cat.saldo_saat_ini + data.nominal };
        } else {
          return { ...cat, saldo_saat_ini: cat.saldo_saat_ini - data.nominal };
        }
      }
      return cat;
    });

    const updatedTxs = [newTx, ...transaksiList];
    saveState(updatedCats, updatedTxs);
  };

  // Add category dynamically (with automatic top-up transaction if initial balance > 0)
  const handleAddCategory = (data: {
    nama: string;
    saldoAwal: number;
    warna: string;
    icon: string;
  }) => {
    const newCat: Kategori = {
      id: `cat-${Date.now()}`,
      nama: data.nama,
      saldo_saat_ini: data.saldoAwal,
      warna: data.warna,
      icon: data.icon
    };

    const updatedCats = [...kategoriList, newCat];
    let updatedTxs = [...transaksiList];

    // If initial balance is added, log it as an income transaction
    if (data.saldoAwal > 0) {
      const initialTx: Transaksi = {
        id: `tx-init-${Date.now()}`,
        jenis: 'masuk',
        nominal: data.saldoAwal,
        kategori: data.nama,
        catatan: `Saldo awal untuk amplop baru "${data.nama}"`,
        tanggal: new Date().toISOString()
      };
      updatedTxs = [initialTx, ...updatedTxs];
    }

    saveState(updatedCats, updatedTxs);
  };

  // Delete transaction (revert categories balance)
  const handleDeleteTransaction = (id: string) => {
    const targetTx = transaksiList.find(t => t.id === id);
    if (!targetTx) return;

    // Revert category balance adjustment
    const updatedCats = kategoriList.map(cat => {
      if (cat.nama === targetTx.kategori) {
        if (targetTx.jenis === 'masuk') {
          // Subtract top up value
          return { ...cat, saldo_saat_ini: Math.max(0, cat.saldo_saat_ini - targetTx.nominal) };
        } else {
          // Return expense value back to envelope
          return { ...cat, saldo_saat_ini: cat.saldo_saat_ini + targetTx.nominal };
        }
      }
      return cat;
    });

    const updatedTxs = transaksiList.filter(t => t.id !== id);
    saveState(updatedCats, updatedTxs);
  };

  // Delete category and all associated transactions
  const handleDeleteCategory = (categoryId: string) => {
    const targetCat = kategoriList.find(c => c.id === categoryId);
    if (!targetCat) return;

    if (confirm(`Apakah Anda yakin ingin menghapus amplop "${targetCat.nama}"? Semua transaksi yang berhubungan dengan amplop ini akan ikut terhapus secara permanen.`)) {
      const updatedCats = kategoriList.filter(c => c.id !== categoryId);
      const updatedTxs = transaksiList.filter(tx => tx.kategori !== targetCat.nama);
      saveState(updatedCats, updatedTxs);
    }
  };

  // Archive current month's data
  const handleArchiveCurrentMonth = () => {
    const targetBulan = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

    if (arsipList.some((a) => a.bulan === targetBulan)) {
      alert(`Tidak bisa mengarsipkan 2x di bulan yang sama (${targetBulan}), kecuali yang lama dihapus di menu arsip.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin mengarsipkan seluruh data bulan ini (${targetBulan})? Semua transaksi akan dipindahkan ke dalam arsip bulanan, saldo kategori Anda akan dikosongkan kembali menjadi nol untuk memulai bulan baru.`)) {
      const newArchive: Arsip = {
        id: `archive-${Date.now()}`,
        bulan: targetBulan,
        kategoriList: JSON.parse(JSON.stringify(kategoriList)), // deep copy
        transaksiList: JSON.parse(JSON.stringify(transaksiList)), // deep copy
        tanggalArsip: new Date().toISOString()
      };

      const updatedArsip = [newArchive, ...arsipList];
      // Reset current state for new month
      const updatedCats = kategoriList.map(cat => ({ ...cat, saldo_saat_ini: 0 }));
      const updatedTxs: Transaksi[] = [];

      saveState(updatedCats, updatedTxs, updatedArsip);
      alert(`Data bulan ini berhasil dimasukkan ke dalam arsip ${targetBulan}! Mulai catat bulan baru dengan amplop kosong.`);
      setActiveTab('archive');
    }
  };

  // Delete an archive item
  const handleDeleteArchive = (archiveId: string) => {
    const targetArsip = arsipList.find((a) => a.id === archiveId);
    if (!targetArsip) return;

    if (confirm(`Apakah Anda yakin ingin menghapus arsip bulan "${targetArsip.bulan}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      const updatedArsip = arsipList.filter((a) => a.id !== archiveId);
      saveState(kategoriList, transaksiList, updatedArsip);
    }
  };

  // Clear or reset all storage to default seed
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang data kembali ke setelan default? Seluruh perubahan kustom Anda akan dihapus.')) {
      setKategoriList(DEFAULT_CATEGORIES);
      setTransaksiList(DEFAULT_TRANSACTIONS);
      setArsipList([]);
      localStorage.setItem('kb_kategori_list', JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem('kb_transaksi_list', JSON.stringify(DEFAULT_TRANSACTIONS));
      localStorage.setItem('kb_arsip_list', JSON.stringify([]));
      setActiveTab('home');
    }
  };

  // Backup data to JSON file
  const handleBackupData = () => {
    const dataStr = JSON.stringify({
      kategoriList,
      transaksiList,
      arsipList,
      version: '1.1.0',
      timestamp: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `KantongKu_Full_Backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Restore data from JSON file
  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsedData.kategoriList) && Array.isArray(parsedData.transaksiList)) {
          const restoredArsip = Array.isArray(parsedData.arsipList) ? parsedData.arsipList : [];
          saveState(parsedData.kategoriList, parsedData.transaksiList, restoredArsip);
          alert('Data fungsional berhasil dipulihkan dari file backup!');
          setActiveTab('home');
        } else {
          alert('Format file backup tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file backup. Pastikan file berformat JSON yang valid.');
      }
    };
    fileReader.readAsText(file);
    event.target.value = ''; // clear input value so it can be re-uploaded if needed
  };

  const handleSelectCategoryFromDashboard = (categoryName: string) => {
    setPreselectedCategory(categoryName);
    setActiveTab('add');
  };

  const handleOpenDetails = (tx: Transaksi) => {
    setSelectedTransaction(tx);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center py-0 md:py-10 px-0 md:px-4 font-sans antialiased text-slate-800 overflow-hidden">
      {/* Dynamic desktop smartphone wrap frame to emphasize the Mobile-First UI approach */}
      <div className="w-full max-w-md h-screen md:h-[850px] max-h-screen md:max-h-[850px] md:rounded-[40px] bg-slate-50 md:shadow-2xl md:border-[10px] md:border-slate-800 flex flex-col overflow-hidden relative">
        
        {/* Dynamic Notch / Status indicator for mobile screen flavor */}
        <div className="hidden md:flex justify-between items-center bg-slate-50 px-8 pt-3 pb-1 text-[11px] font-bold text-slate-400 font-mono select-none">
          <span>09:41 AM</span>
          <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto -mt-1.5 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-950 ml-auto mr-1 border border-slate-700"></div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-slate-400 rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-slate-400 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Dynamic header title line */}
        <header className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              $
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800">KantongKu</span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Backup Button */}
            <button
              onClick={handleBackupData}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition-all cursor-pointer shadow-xs border border-indigo-100/30"
              title="Backup Data ke file JSON"
            >
              <Download size={11} />
              <span>Backup</span>
            </button>

            {/* Restore Button */}
            <label
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition-all cursor-pointer shadow-xs border border-slate-200/40 relative"
              title="Restore Data dari file JSON"
            >
              <Upload size={11} />
              <span>Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreData}
                className="hidden absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>

            {/* Reset Fallback Button */}
            <button
              onClick={handleResetData}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all cursor-pointer"
              title="Setel Ulang Data ke Default"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </header>

        {/* Content Area - Scrollable with custom styling */}
        <main className="flex-1 overflow-y-auto px-6 pt-5 pb-28 no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardView
                  kategoriList={kategoriList}
                  transaksiList={transaksiList}
                  onSelectCategory={handleSelectCategoryFromDashboard}
                  onNavigateToAddTransaction={() => {
                    setPreselectedCategory('');
                    setActiveTab('add');
                  }}
                  onDeleteCategory={handleDeleteCategory}
                  onArchiveCurrentMonth={handleArchiveCurrentMonth}
                />
              </motion.div>
            )}

            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <TransactionView
                  kategoriList={kategoriList}
                  onAddTransaction={handleAddTransaction}
                  onAddCategory={handleAddCategory}
                  preselectedCategory={preselectedCategory}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryView
                  transaksiList={transaksiList}
                  kategoriList={kategoriList}
                  onSelectTransaction={handleOpenDetails}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </motion.div>
            )}

            {activeTab === 'archive' && (
              <motion.div
                key="archive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ArchiveView
                  arsipList={arsipList}
                  onDeleteArchive={handleDeleteArchive}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Bottom Navigation Bar */}
        <nav className="absolute bottom-4 left-3 right-3 bg-white/90 backdrop-blur-md border border-slate-100/80 py-2 px-3 flex items-center justify-around rounded-2xl shadow-xl z-30">
          {/* Tab 1: Home Dashboard */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'home' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wallet size={19} className={activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[9px] font-bold">Dashboard</span>
            {activeTab === 'home' && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-600"
              />
            )}
          </button>

          {/* Tab 2: Add Transaction / Category */}
          <button
            onClick={() => {
              setPreselectedCategory('');
              setActiveTab('add');
            }}
            className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'add' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <PlusCircle size={19} className={activeTab === 'add' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[9px] font-bold">Catat</span>
            {activeTab === 'add' && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-600"
              />
            )}
          </button>

          {/* Tab 3: History Timeline */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'history' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History size={19} className={activeTab === 'history' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[9px] font-bold">Riwayat</span>
            {activeTab === 'history' && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-600"
              />
            )}
          </button>

          {/* Tab 4: Archive */}
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'archive' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Archive size={19} className={activeTab === 'archive' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[9px] font-bold">Arsip</span>
            {activeTab === 'archive' && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-600"
              />
            )}
          </button>
        </nav>

        {/* Popup Detail Transaction (Bottom Sheet Modal) */}
        <AnimatePresence>
          {isDetailsOpen && (
            <TransactionDetailsModal
              isOpen={isDetailsOpen}
              onClose={() => {
                setIsDetailsOpen(false);
                setSelectedTransaction(null);
              }}
              transaction={selectedTransaction}
              kategoriList={kategoriList}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
