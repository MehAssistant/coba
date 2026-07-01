import { Kategori, Transaksi } from './types';

export const DEFAULT_CATEGORIES: Kategori[] = [
  {
    id: 'cat-makan',
    nama: 'Makan & Minum',
    saldo_saat_ini: 350000,
    warna: '#f59e0b', // Amber
    icon: 'Utensils'
  },
  {
    id: 'cat-bensin',
    nama: 'Bensin & Transport',
    saldo_saat_ini: 120000,
    warna: '#3b82f6', // Blue
    icon: 'Car'
  },
  {
    id: 'cat-laundry',
    nama: 'Laundry & Kebersihan',
    saldo_saat_ini: 45000,
    warna: '#10b981', // Emerald
    icon: 'Shirt'
  },
  {
    id: 'cat-belanja',
    nama: 'Belanja Bulanan',
    saldo_saat_ini: 500000,
    warna: '#8b5cf6', // Violet
    icon: 'ShoppingBag'
  },
  {
    id: 'cat-hiburan',
    nama: 'Hiburan & Santai',
    saldo_saat_ini: 150000,
    warna: '#ec4899', // Pink
    icon: 'Sparkles'
  }
];

export const DEFAULT_TRANSACTIONS: Transaksi[] = [
  {
    id: 'tx-1',
    jenis: 'masuk',
    nominal: 500000,
    kategori: 'Makan & Minum',
    catatan: 'Top Up awal bulan untuk jatah kuliner',
    tanggal: '2026-06-25T09:00:00'
  },
  {
    id: 'tx-2',
    jenis: 'keluar',
    nominal: 45000,
    kategori: 'Makan & Minum',
    catatan: 'Makan siang nasi padang komplit',
    tanggal: '2026-06-30T12:30:00' // Hari ini
  },
  {
    id: 'tx-3',
    jenis: 'masuk',
    nominal: 200000,
    kategori: 'Bensin & Transport',
    catatan: 'Top up bensin mobil pertamax',
    tanggal: '2026-06-26T14:00:00'
  },
  {
    id: 'tx-4',
    jenis: 'keluar',
    nominal: 80000,
    kategori: 'Bensin & Transport',
    catatan: 'Isi bensin pertalite',
    tanggal: '2026-06-30T08:15:00' // Hari ini
  },
  {
    id: 'tx-5',
    jenis: 'masuk',
    nominal: 60000,
    kategori: 'Laundry & Kebersihan',
    catatan: 'Alokasi cuci baju kiloan',
    tanggal: '2026-06-27T10:00:00'
  },
  {
    id: 'tx-6',
    jenis: 'keluar',
    nominal: 15000,
    kategori: 'Laundry & Kebersihan',
    catatan: 'Bayar laundry cuci basah + setrika',
    tanggal: '2026-06-30T17:00:00' // Hari ini
  },
  {
    id: 'tx-7',
    jenis: 'masuk',
    nominal: 600000,
    kategori: 'Belanja Bulanan',
    catatan: 'Uang belanja supermarket bulanan',
    tanggal: '2026-06-25T10:30:00'
  },
  {
    id: 'tx-8',
    jenis: 'keluar',
    nominal: 100000,
    kategori: 'Belanja Bulanan',
    catatan: 'Beli sabun, sampo, pasta gigi',
    tanggal: '2026-06-29T19:30:00'
  },
  {
    id: 'tx-9',
    jenis: 'masuk',
    nominal: 150000,
    kategori: 'Hiburan & Santai',
    catatan: 'Alokasi nonton bioskop & ngopi',
    tanggal: '2026-06-28T16:00:00'
  }
];
