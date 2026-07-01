export type JenisTransaksi = 'masuk' | 'keluar';

export interface Transaksi {
  id: string;
  jenis: JenisTransaksi;
  nominal: number;
  kategori: string;
  catatan?: string;
  tanggal: string; // ISO string or format YYYY-MM-DDTHH:mm:ss
}

export interface Kategori {
  id: string;
  nama: string;
  saldo_saat_ini: number;
  warna?: string; // Tailwind color class or hex code
  icon?: string;  // Lucide icon name representation
}

export interface AppState {
  kategoriList: Kategori[];
  transaksiList: Transaksi[];
}
