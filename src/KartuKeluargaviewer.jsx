// KartuKeluargaviewer.jsx
import React from 'react';

const KartuKeluargaviewer = ({ dataKK, noKK, headerData }) => {
    if (!dataKK || dataKK.length === 0) {
        return <div className="text-center py-4 text-gray-500">Data Kartu Keluarga tidak ditemukan.</div>;
    }

    const kepalaKeluarga = dataKK.find(warga => warga.statusHubungan === 'Kepala Keluarga') || dataKK[0];

    return (
        <div className="font-sans text-xs border border-gray-400 p-4 mx-auto max-w-5xl bg-white" style={{ minWidth: '800px' }}>
            <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                <img src="/images/logo.png" alt="Garuda Pancasila" className="h-12 mx-auto" />
                    
                    <p className="font-bold">REPUBLIK INDONESIA</p>
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">KARTU KELUARGA</h1>
                    <p className="text-lg font-bold mt-1">NO. {noKK}</p>
                </div>
                <div className="text-right">
                    {/* Contoh QR Code placeholder - Anda bisa generate QR code asli di sini */}
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500">QR</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 mb-4">
                <div>
                    <p>Nama Kepala Keluarga: <span className="font-bold">{kepalaKeluarga?.nama || '-'}</span></p>
                    <p>Alamat: {kepalaKeluarga?.alamat || '-'}</p>
                    <p>RT/RW: {kepalaKeluarga?.rt || '-'}/{kepalaKeluarga?.rw || '-'}</p>
                    <p>Desa/Kelurahan: {headerData.namaKelurahan}</p>
                    <p>Kecamatan: {headerData.namaKecamatan}</p>
                </div>
                <div>
                    <p>Kabupaten/Kota: {headerData.kabupatenKota}</p>
                    <p>Provinsi: {headerData.provinsi}</p>
                    <p>Kode Pos: {headerData.kodePos}</p>
                    <p>Ditertibkan Tanggal: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            <table className="w-full border-collapse border border-gray-400 mb-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-400 p-1">No</th>
                        <th className="border border-gray-400 p-1">Nama Lengkap</th>
                        <th className="border border-gray-400 p-1">NIK</th>
                        <th className="border border-gray-400 p-1">Jenis Kelamin</th>
                        <th className="border border-gray-400 p-1">Tempat Lahir</th>
                        <th className="border border-gray-400 p-1">Tanggal Lahir</th>
                        <th className="border border-gray-400 p-1">Agama</th>
                        <th className="border border-gray-400 p-1">Pendidikan</th>
                        <th className="border border-gray-400 p-1">Jenis Pekerjaan</th>
                        <th className="border border-gray-400 p-1">Golongan Darah</th>
                    </tr>
                </thead>
                <tbody>
                    {dataKK.map((warga, index) => (
                        <tr key={warga.id}>
                            <td className="border border-gray-400 p-1 text-center">{index + 1}</td>
                            <td className="border border-gray-400 p-1">{warga.nama || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.nik || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.jenisKelamin || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.tempatLahir || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.tanggalLahir || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.agama || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.pendidikan || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.pekerjaan || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.golonganDarah || '-'}</td>
                        </tr>
                    ))}
                    {/* Tambahkan baris kosong jika kurang dari 10 anggota keluarga */}
                    {[...Array(Math.max(0, 10 - dataKK.length))].map((_, i) => (
                        <tr key={`empty-${i}`} className="h-6">
                            <td className="border border-gray-400 p-1 text-center">{dataKK.length + i + 1}</td>
                            {[...Array(9)].map((_, j) => <td key={`empty-cell-${j}`} className="border border-gray-400 p-1"></td>)}
                        </tr>
                    ))}
                </tbody>
            </table>

            <table className="w-full border-collapse border border-gray-400">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-400 p-1">No</th>
                        <th className="border border-gray-400 p-1">Status Perkawinan</th>
                        <th className="border border-gray-400 p-1">Tanggal Perkawinan</th>
                        <th className="border border-gray-400 p-1">Status Hubungan Dalam Keluarga</th>
                        <th className="border border-gray-400 p-1">Kewarganegaraan</th>
                        <th className="border border-gray-400 p-1">No. Dokumen Imigrasi</th>
                        <th className="border border-gray-400 p-1">No. KITAP</th>
                        <th className="border border-gray-400 p-1">Nama Ayah</th>
                        <th className="border border-gray-400 p-1">Nama Ibu</th>
                    </tr>
                </thead>
                <tbody>
                    {dataKK.map((warga, index) => (
                        <tr key={`detail-${warga.id}`}>
                            <td className="border border-gray-400 p-1 text-center">{index + 1}</td>
                            <td className="border border-gray-400 p-1">{warga.statusPernikahan || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.tanggalPerkawinan || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.statusHubungan || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.kewarganegaraan || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.noPassport || '-'}</td> {/* Asumsi ada field noPassport */}
                            <td className="border border-gray-400 p-1">{warga.noKitap || '-'}</td> {/* Asumsi ada field noKitap */}
                            <td className="border border-gray-400 p-1">{warga.namaAyah || '-'}</td>
                            <td className="border border-gray-400 p-1">{warga.namaIbu || '-'}</td>
                        </tr>
                    ))}
                    {/* Tambahkan baris kosong jika kurang dari 10 anggota keluarga */}
                    {[...Array(Math.max(0, 10 - dataKK.length))].map((_, i) => (
                        <tr key={`empty-detail-${i}`} className="h-6">
                            <td className="border border-gray-400 p-1 text-center">{dataKK.length + i + 1}</td>
                            {[...Array(8)].map((_, j) => <td key={`empty-detail-cell-${j}`} className="border border-gray-400 p-1"></td>)}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end items-end mt-8">
                <div className="text-center">
                    <p>KEPALA DINAS KEPENDUDUKAN DAN</p>
                    <p>PENCATATAN SIPIL KAB. {headerData.kabupatenKota.toUpperCase()}</p>
                    {/* Placeholder untuk QR Code kepala dinas */}
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-500 mx-auto my-2">QR</div>
                    <p>Dr. H. CARWINDA, M.Si</p>
                    <p>NIP. 19670101987101001</p>
                </div>
            </div>
            <p className="text-gray-600 text-[8px] mt-4">Dokumen ini ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN</p>
        </div>
    );
};

export default KartuKeluargaviewer;
