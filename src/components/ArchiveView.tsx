import React, { useState } from 'react';
import { Arsip } from '../types';
import { formatCurrency } from '../utils/dateHelper';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, Trash2, ChevronDown, ChevronUp, Calendar, Folder, ListCollapse, FileText } from 'lucide-react';
import { IconHelper } from './IconHelper';

interface ArchiveViewProps {
  arsipList: Arsip[];
  onDeleteArchive: (archiveId: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ arsipList, onDeleteArchive }) => {
  const [expandedArchiveId, setExpandedArchiveId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedArchiveId === id) {
      setExpandedArchiveId(null);
    } else {
      setExpandedArchiveId(id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">Arsip Keuangan</p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">Arsip Bulanan Anda 📂</h1>
        <p className="text-xs text-slate-500 mt-1">
          Simpan histori pos anggaran bulanan Anda untuk perbandingan berkala.
        </p>
      </div>

      {arsipList.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Archive size={20} />
          </div>
          <p className="text-sm font-bold text-slate-700">Belum Ada Data Arsip</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Gunakan tombol "Arsipkan" di Dashboard untuk mengunci dan menyimpan rekap keuangan bulan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {arsipList.map((archive) => {
            const isExpanded = expandedArchiveId === archive.id;
            const totalSaldoArchive = archive.kategoriList.reduce((acc, cat) => acc + cat.saldo_saat_ini, 0);
            const totalMasukTx = archive.transaksiList
              .filter((tx) => tx.jenis === 'masuk')
              .reduce((acc, tx) => acc + tx.nominal, 0);
            const totalKeluarTx = archive.transaksiList
              .filter((tx) => tx.jenis === 'keluar')
              .reduce((acc, tx) => acc + tx.nominal, 0);

            return (
              <div
                key={archive.id}
                className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Header Card */}
                <div
                  onClick={() => toggleExpand(archive.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 select-none"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{archive.bulan}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Diarsipkan pada: {new Date(archive.tanggalArsip).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-700">
                        {formatCurrency(totalSaldoArchive)}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono block">Sisa Total</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteArchive(archive.id);
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all cursor-pointer"
                      title="Hapus Arsip"
                    >
                      <Trash2 size={13} className="stroke-[2.5px]" />
                    </button>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-50 bg-slate-50/40"
                    >
                      <div className="p-4 space-y-4">
                        {/* Quick Statistics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-emerald-50/40 border border-emerald-100/30 rounded-xl p-2.5">
                            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Total Masuk / Top Up</p>
                            <p className="text-xs font-bold text-emerald-700 mt-0.5">
                              {formatCurrency(totalMasukTx)}
                            </p>
                          </div>
                          <div className="bg-rose-50/40 border border-rose-100/30 rounded-xl p-2.5">
                            <p className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">Total Keluar</p>
                            <p className="text-xs font-bold text-rose-700 mt-0.5">
                              {formatCurrency(totalKeluarTx)}
                            </p>
                          </div>
                        </div>

                        {/* List of Envelopes / Categories */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Folder size={11} />
                            <span>Sisa Amplop Kategori</span>
                          </h4>
                          <div className="grid grid-cols-1 gap-1.5">
                            {archive.kategoriList.map((cat) => (
                              <div
                                key={cat.id}
                                className="bg-white border border-slate-100/60 rounded-xl p-2.5 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                                    style={{ backgroundColor: cat.warna || '#4F46E5' }}
                                  >
                                    <IconHelper name={cat.icon || 'Folder'} size={12} />
                                  </div>
                                  <span className="font-bold text-slate-700">{cat.nama}</span>
                                </div>
                                <span className="font-bold text-slate-800 font-mono">
                                  {formatCurrency(cat.saldo_saat_ini)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* List of Transactions */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <FileText size={11} />
                            <span>Histori Transaksi Bulan Ini ({archive.transaksiList.length})</span>
                          </h4>
                          {archive.transaksiList.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">Tidak ada transaksi tercatat.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                              {archive.transaksiList.map((tx) => (
                                <div
                                  key={tx.id}
                                  className="bg-white border border-slate-100/60 rounded-xl p-2.5 flex items-center justify-between text-[11px]"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 leading-tight">
                                      {tx.catatan || `Transaksi di ${tx.kategori}`}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                      {tx.kategori} • {new Date(tx.tanggal).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-bold font-mono ${
                                      tx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-500'
                                    }`}
                                  >
                                    {tx.jenis === 'masuk' ? '+' : '-'} {formatCurrency(tx.nominal)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
