import React from 'react';
import { Transaksi, Kategori } from '../types';
import { formatCurrency, formatLongDateIndo, formatTimeStr } from '../utils/dateHelper';
import { IconHelper } from './IconHelper';
import { X, Calendar, Clock, FileText, Wallet, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaksi | null;
  kategoriList: Kategori[];
  onDeleteTransaction?: (id: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  kategoriList,
  onDeleteTransaction
}) => {
  if (!isOpen || !transaction) return null;

  const isMasuk = transaction.jenis === 'masuk';
  const categoryInfo = kategoriList.find(c => c.nama === transaction.kategori);
  const accentColor = categoryInfo?.warna || (isMasuk ? '#10b981' : '#ef4444');

  const handleDelete = () => {
    if (onDeleteTransaction && confirm('Apakah Anda yakin ingin menghapus transaksi ini? Saldo amplop terkait akan disesuaikan kembali secara otomatis.')) {
      onDeleteTransaction(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Slide-up bottom sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative bg-white w-full max-w-md rounded-t-[32px] p-6 pb-8 shadow-2xl z-10 border-t border-slate-100 flex flex-col space-y-5"
      >
        {/* Handle for slide effect */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-2 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Detail Aliran Dana</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card visualization representing a receipt or ticket */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative overflow-hidden">
          {/* Wave effect or receipt outline design */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-r border-slate-100"></div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-l border-slate-100"></div>

          <div className="flex flex-col items-center text-center space-y-2.5">
            {/* Category icon circle */}
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold relative shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <IconHelper name={categoryInfo?.icon || 'Coins'} className="text-white" size={24} />
              
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-slate-50 ${
                isMasuk ? 'bg-emerald-500' : 'bg-rose-500'
              }`}>
                {isMasuk ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
              </div>
            </div>

            <div className="space-y-1">
              <span 
                className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ color: accentColor, backgroundColor: `${accentColor}12` }}
              >
                {transaction.kategori}
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Amplop Anggaran Target</p>
            </div>

            <div className="py-2">
              <h2 className={`text-2xl font-extrabold tracking-tight ${isMasuk ? 'text-emerald-600' : 'text-slate-800'}`}>
                {isMasuk ? '+' : '-'}{formatCurrency(transaction.nominal)}
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                {isMasuk ? 'Transaksi Masuk (Top Up)' : 'Transaksi Keluar (Belanja)'}
              </span>
            </div>
          </div>
        </div>

        {/* Detail specifics list */}
        <div className="space-y-3.5 px-1">
          {/* Date */}
          <div className="flex items-start space-x-3 text-slate-700">
            <Calendar size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Tanggal Pencatatan</p>
              <p className="text-xs font-bold text-slate-800 mt-1">{formatLongDateIndo(transaction.tanggal)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start space-x-3 text-slate-700">
            <Clock size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Waktu Presisi</p>
              <p className="text-xs font-bold text-slate-800 mt-1">{formatTimeStr(transaction.tanggal)} WIB</p>
            </div>
          </div>

          {/* Notes */}
          <div className="flex items-start space-x-3 text-slate-700">
            <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Catatan / Deskripsi</p>
              <p className="text-xs font-medium text-slate-700 mt-1 leading-relaxed bg-slate-50 border border-slate-100 p-2.5 rounded-xl block w-full italic">
                {transaction.catatan || 'Tidak ada catatan atau deskripsi transaksi.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
          {onDeleteTransaction && (
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center space-x-1.5 py-3 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Hapus Transaksi</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </motion.div>
    </div>
  );
};
