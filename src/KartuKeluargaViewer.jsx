// src/KartuKeluargaViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas'; // Untuk konversi HTML ke JPG/gambar

// Mengimpor db dan createLog dari App.jsx
import { db, createLog } from './App'; 

// Mengimpor ikon dari App.jsx (pastikan mereka diekspor di App.jsx)
import { DatabaseIcon, PdfIcon, WhatsAppIcon, ImportIcon, ExportIcon, CloseIcon } from './App';

function KartuKeluargaViewer({ userProfile }) {
    const [noKkInput, setNoKkInput] = useState('');
    const [kepalaKeluarga, setKepalaKeluarga] = useState(null);
    const [anggotaKeluarga, setAnggotaKeluarga] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const kkRef = useRef(null); // Ref untuk elemen HTML Kartu Keluarga yang akan di-render

    const fetchKartuKeluarga = async () => {
        if (!noKkInput) {
            setError("Mohon masukkan Nomor Kartu Keluarga.");
            return;
        }
        setLoading(true);
        setError('');
        setKepalaKeluarga(null);
        setAnggotaKeluarga([]);

        try {
            const wargaCollectionRef = collection(db, 'warga');
            const q = query(wargaCollectionRef, where("kk", "==", noKkInput));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(`Data Kartu Keluarga dengan No KK "${noKkInput}" tidak ditemukan.`);
                setLoading(false);
                return;
            }

            const wargaData = querySnapshot.docs.map(doc => doc.data());

            // Pisahkan Kepala Keluarga dan anggota lainnya
            const kepala = wargaData.find(w => w.statusHubungan === 'Kepala Keluarga');
            const anggota = wargaData
                .filter(w => w.statusHubungan !== 'Kepala Keluarga')
                .sort((a, b) => {
                    // Urutkan berdasarkan status hubungan dan nama jika perlu
                    if (a.statusHubungan === 'Istri' && b.statusHubungan !== 'Istri') return -1;
                    if (b.statusHubungan === 'Istri' && a.statusHubungan !== 'Istri') return 1;
                    return (a.nama || '').localeCompare(b.nama || '');
                });

            setKepalaKeluarga(kepala);
            setAnggotaKeluarga(anggota);
            createLog(userProfile.email, `Melihat Kartu Keluarga No KK: ${noKkInput}.`);

        } catch (err) {
            console.error("Error fetching KK:", err);
            setError("Terjadi kesalahan saat mengambil data Kartu Keluarga.");
        } finally {
            setLoading(false);
        }
    };

    const getFormattedDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        } catch (e) {
            return dateString; // Fallback if date is invalid
        }
    };

    const handleDownloadPdf = async () => {
        if (!kepalaKeluarga) {
            alert("Tidak ada data Kartu Keluarga untuk diunduh.");
            return;
        }

        const doc = new jsPDF('landscape', 'mm', 'a4'); // A4 landscape for KK
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const startY = 10;

        // Header Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("KARTU KELUARGA", pageWidth / 2, startY + 5, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`No. ${noKkInput}`, pageWidth / 2, startY + 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        let currentY = startY + 18;

        // Bagian Header Kartu Keluarga (Kiri)
        doc.setFontSize(8);
        doc.text("PEMERINTAH KABUPATEN/KOTA", margin, currentY);
        doc.text("PROVINSI", margin, currentY + 4);
        doc.text("KODE POS", margin, currentY + 8);
        doc.text("KECAMATAN", margin, currentY + 12);
        doc.text("KELURAHAN", margin, currentY + 16);
        doc.text("ALAMAT", margin, currentY + 20);
        doc.text("RT/RW", margin, currentY + 24);

        doc.text(":", margin + 40, currentY); doc.text(kepalaKeluarga.kabupatenKota?.toUpperCase() || '-', margin + 42, currentY);
        doc.text(":", margin + 40, currentY + 4); doc.text(kepalaKeluarga.provinsi?.toUpperCase() || '-', margin + 42, currentY + 4);
        doc.text(":", margin + 40, currentY + 8); doc.text(kepalaKeluarga.kodePos || '-', margin + 42, currentY + 8);
        doc.text(":", margin + 40, currentY + 12); doc.text(kepalaKeluarga.kecamatan?.toUpperCase() || '-', margin + 42, currentY + 12);
        doc.text(":", margin + 40, currentY + 16); doc.text(kepalaKeluarga.kelurahan?.toUpperCase() || '-', margin + 42, currentY + 16);
        doc.text(":", margin + 40, currentY + 20); doc.text(kepalaKeluarga.alamat || '-', margin + 42, currentY + 20);
        doc.text(":", margin + 40, currentY + 24); doc.text(`${kepalaKeluarga.rt || '-'} / ${kepalaKeluarga.rw || '-'}`, margin + 42, currentY + 24);
        
        // Gambar Garuda (Placeholder)
        // Anda bisa menambahkan gambar Garuda di sini jika punya base64 atau URL
        // doc.addImage('URL_OR_BASE64_GARUDA_IMAGE', 'PNG', margin + 10, currentY + 2, 20, 20); 

        // Bagian Header Kartu Keluarga (Kanan)
        doc.text("NAMA KEPALA KELUARGA", pageWidth / 2, currentY);
        doc.text("NIK", pageWidth / 2, currentY + 4);

        doc.text(":", pageWidth / 2 + 40, currentY); doc.text(kepalaKeluarga.nama || '-', pageWidth / 2 + 42, currentY);
        doc.text(":", pageWidth / 2 + 40, currentY + 4); doc.text(kepalaKeluarga.nik || '-', pageWidth / 2 + 42, currentY + 4);

        currentY += 30; // Pindah ke bawah untuk tabel

        // Tabel Anggota Keluarga (Bagian Atas)
        const table1Headers = [
            ["No", "Nama Lengkap", "NIK", "Jenis Kelamin", "Tempat Lahir", "Tanggal Lahir", "Agama", "Pendidikan", "Jenis Pekerjaan", "Golongan Darah"]
        ];
        const table1Data = [kepalaKeluarga, ...anggotaKeluarga].map((warga, idx) => [
            idx + 1,
            warga.nama || '',
            warga.nik || '',
            warga.jenisKelamin || '',
            warga.tempatLahir || '',
            getFormattedDate(warga.tanggalLahir),
            warga.agama || '',
            warga.pendidikan || '',
            warga.pekerjaan || '',
            warga.golonganDarah || ''
        ]);

        doc.autoTable({
            startY: currentY,
            head: table1Headers,
            body: table1Data,
            theme: 'grid',
            styles: { fontSize: 6, cellPadding: 0.8, overflow: 'linebreak', halign: 'center', valign: 'middle' },
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { textColor: [0, 0, 0], halign: 'center' },
            margin: { left: margin, right: margin },
            columnStyles: {
                0: { cellWidth: 8 },  // No
                1: { cellWidth: 30 }, // Nama Lengkap
                2: { cellWidth: 25 }, // NIK
                3: { cellWidth: 15 }, // Jenis Kelamin
                4: { cellWidth: 20 }, // Tempat Lahir
                5: { cellWidth: 20 }, // Tanggal Lahir
                6: { cellWidth: 15 }, // Agama
                7: { cellWidth: 20 }, // Pendidikan
                8: { cellWidth: 20 }, // Jenis Pekerjaan
                9: { cellWidth: 15 }, // Golongan Darah
            },
            didDrawPage: function(data) {
                // Footer atau watermark jika diperlukan
            }
        });

        currentY = doc.autoTable.previous.finalY + 5; // Jeda antar tabel

        // Tabel Anggota Keluarga (Bagian Bawah)
        const table2Headers = [
            ["No", "Status Perkawinan", "Tanggal Perkawinan", "Status Hubungan Dalam Keluarga", "Kewarganegaraan", "No. Paspor", "No. KITAP", "Nama Orang Tua (Ayah)", "Nama Orang Tua (Ibu)"]
        ];
        const table2Data = [kepalaKeluarga, ...anggotaKeluarga].map((warga, idx) => [
            idx + 1,
            warga.statusPernikahan || '',
            getFormattedDate(warga.tanggalPerkawinan),
            warga.statusHubungan || '',
            warga.kewarganegaraan || '',
            warga.noPaspor || '-', // Anda perlu memastikan field ini ada di Firestore jika ingin menampilkan
            warga.noKitap || '-', // Anda perlu memastikan field ini ada di Firestore jika ingin menampilkan
            warga.namaAyah || '',
            warga.namaIbu || ''
        ]);

        doc.autoTable({
            startY: currentY,
            head: table2Headers,
            body: table2Data,
            theme: 'grid',
            styles: { fontSize: 6, cellPadding: 0.8, overflow: 'linebreak', halign: 'center', valign: 'middle' },
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { textColor: [0, 0, 0], halign: 'center' },
            margin: { left: margin, right: margin },
            columnStyles: {
                0: { cellWidth: 8 }, // No
                1: { cellWidth: 20 },// Status Perkawinan
                2: { cellWidth: 20 },// Tanggal Perkawinan
                3: { cellWidth: 20 },// Status Hubungan
                4: { cellWidth: 15 },// Kewarganegaraan
                5: { cellWidth: 15 },// No. Paspor
                6: { cellWidth: 15 },// No. KITAP
                7: { cellWidth: 30 },// Nama Orang Tua (Ayah)
                8: { cellWidth: 30 },// Nama Orang Tua (Ibu)
            }
        });

        currentY = doc.autoTable.previous.finalY + 10; // Pindah ke bawah untuk tanda tangan

        // Bagian Tanda Tangan dan Footer
        doc.setFontSize(8);
        doc.text(`Dikeluarkan Tanggal: ${getFormattedDate(new Date())}`, margin, currentY);
        doc.text("KEPALA KELUARGA", margin + 50, currentY + 10);
        doc.text("(                                        )", margin + 45, currentY + 25);
        doc.text(kepalaKeluarga.nama?.toUpperCase() || '_______________________', margin + 45, currentY + 30);
        
        doc.text("KEPALA DINAS KEPENDUDUKAN DAN", pageWidth - margin - 60, currentY + 5);
        doc.text("PENCATATAN SIPIL KAB. BEKASI", pageWidth - margin - 60, currentY + 9);
        // Placeholder QR Code
        doc.rect(pageWidth - margin - 50, currentY + 15, 30, 30); // Kotak untuk QR Code
        doc.text("QR Code Placeholder", pageWidth - margin - 35, currentY + 30, { align: 'center' });
        
        // NIP Placeholder
        doc.text("NIP. 196701091987101001", pageWidth - margin - 60, currentY + 50); // Anda bisa membuatnya dinamis jika punya data NIP

        doc.save(`KK_${noKkInput}.pdf`);
        createLog(userProfile.email, `Mengunduh Kartu Keluarga No KK: ${noKkInput} ke PDF.`);
    };

    const handleDownloadJpg = async () => {
        if (!kepalaKeluarga || !kkRef.current) {
            alert("Tidak ada data Kartu Keluarga atau elemen yang tidak ditemukan untuk diunduh.");
            return;
        }

        setLoading(true);
        try {
            const canvas = await html2canvas(kkRef.current, {
                scale: 2, // Meningkatkan resolusi gambar
                useCORS: true, // Penting jika ada gambar dari domain lain (misal Cloudinary)
                logging: false, // Kurangi log di konsol
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.9); // Kualitas 0.9

            const link = document.createElement('a');
            link.href = imgData;
            link.download = `KK_${noKkInput}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            createLog(userProfile.email, `Mengunduh Kartu Keluarga No KK: ${noKkInput} ke JPG.`);

        } catch (error) {
            console.error("Error generating JPG:", error);
            alert("Gagal mengunduh Kartu Keluarga sebagai JPG.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Cetak Kartu Keluarga</h2>
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-4">
                <InputField 
                    label="Nomor Kartu Keluarga (No KK)" 
                    name="noKk" 
                    value={noKkInput} 
                    onChange={(e) => setNoKkInput(e.target.value)} 
                    placeholder="Masukkan No KK..." 
                    required 
                    className="flex-1"
                />
                <button 
                    onClick={fetchKartuKeluarga} 
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center gap-2"
                >
                    {loading ? 'Mencari...' : 'Cari KK'}
                    <DatabaseIcon />
                </button>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}
            {loading && <LoadingScreen text="Memuat Kartu Keluarga..." />}

            {kepalaKeluarga && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Hasil Pencarian KK: {noKkInput}</h3>
                    <div className="flex justify-end gap-2 mb-4">
                        <button onClick={handleDownloadPdf} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 flex items-center gap-2">
                            <PdfIcon /> Unduh PDF
                        </button>
                        <button onClick={handleDownloadJpg} className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 flex items-center gap-2">
                            <ImportIcon /> Unduh JPG
                        </button>
                    </div>

                    {/* Tampilan Kartu Keluarga di dalam aplikasi (untuk dirender ke JPG) */}
                    {/* Styling di sini perlu sangat mirip dengan output PDF agar JPG juga akurat */}
                    <div ref={kkRef} className="p-4 border border-gray-300 bg-white shadow-lg overflow-x-auto text-xs relative" style={{ width: '297mm', height: '210mm', fontFamily: 'Arial, sans-serif' }}>
                        {/* Header Kartu Keluarga */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="w-1/2 pr-4">
                                {/* Placeholder Gambar Garuda */}
                                <div className="float-left mr-2 mt-1">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm">KARTU KELUARGA</p>
                                    <p className="text-xs">REPUBLIK INDONESIA</p>
                                </div>
                                <div className="mt-2">
                                    <p>PEMERINTAH KABUPATEN/KOTA: {kepalaKeluarga.kabupatenKota?.toUpperCase() || '-'}</p>
                                    <p>PROVINSI: {kepalaKeluarga.provinsi?.toUpperCase() || '-'}</p>
                                    <p>KODE POS: {kepalaKeluarga.kodePos || '-'}</p>
                                    <p>KECAMATAN: {kepalaKeluarga.kecamatan?.toUpperCase() || '-'}</p>
                                    <p>KELURAHAN: {kepalaKeluarga.kelurahan?.toUpperCase() || '-'}</p>
                                    <p>ALAMAT: {kepalaKeluarga.alamat || '-'}</p>
                                    <p>RT/RW: {kepalaKeluarga.rt || '-'} / {kepalaKeluarga.rw || '-'}</p>
                                </div>
                            </div>
                            <div className="w-1/2 pl-4 text-right">
                                <p className="font-bold text-lg">No. {noKkInput}</p>
                                <div className="mt-4">
                                    <p>Nama Kepala Keluarga: {kepalaKeluarga.nama || '-'}</p>
                                    <p>NIK: {kepalaKeluarga.nik || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabel Anggota Keluarga - Bagian 1 */}
                        <table className="w-full border-collapse mt-4">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border px-1 py-1 text-center" rowSpan="2">No</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Nama Lengkap</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">NIK</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Jenis Kelamin</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Tempat Lahir</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Tanggal Lahir</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Agama</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Pendidikan</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Jenis Pekerjaan</th>
                                    <th className="border px-1 py-1 text-center" rowSpan="2">Golongan Darah</th>
                                    <th className="border px-1 py-1 text-center" colSpan="2">Dokumen Imigrasi</th> {/* Kolom tambahan */}
                                </tr>
                                <tr className="bg-gray-200">
                                    <th className="border px-1 py-1 text-center">No. Paspor</th>
                                    <th className="border px-1 py-1 text-center">No. KITAP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[kepalaKeluarga, ...anggotaKeluarga].map((warga, index) => (
                                    <tr key={warga.nik || index}>
                                        <td className="border px-1 py-1 text-center">{index + 1}</td>
                                        <td className="border px-1 py-1">{warga.nama || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.nik || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.jenisKelamin || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.tempatLahir || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{getFormattedDate(warga.tanggalLahir)}</td>
                                        <td className="border px-1 py-1 text-center">{warga.agama || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.pendidikan || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.pekerjaan || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.golonganDarah || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.noPaspor || '-'}</td> {/* Kolom tambahan */}
                                        <td className="border px-1 py-1 text-center">{warga.noKitap || '-'}</td> {/* Kolom tambahan */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Tabel Anggota Keluarga - Bagian 2 */}
                        <table className="w-full border-collapse mt-4">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border px-1 py-1 text-center">No</th>
                                    <th className="border px-1 py-1 text-center">Status Perkawinan</th>
                                    <th className="border px-1 py-1 text-center">Tanggal Perkawinan</th>
                                    <th className="border px-1 py-1 text-center">Status Hubungan Dalam Keluarga</th>
                                    <th className="border px-1 py-1 text-center">Kewarganegaraan</th>
                                    <th className="border px-1 py-1 text-center" colSpan="2">Nama Orang Tua</th>
                                </tr>
                                <tr className="bg-gray-200">
                                    <th className="border px-1 py-1 text-center"></th> {/* Kosongkan untuk keselarasan No */}
                                    <th className="border px-1 py-1 text-center"></th>
                                    <th className="border px-1 py-1 text-center"></th>
                                    <th className="border px-1 py-1 text-center"></th>
                                    <th className="border px-1 py-1 text-center"></th>
                                    <th className="border px-1 py-1 text-center">Ayah</th>
                                    <th className="border px-1 py-1 text-center">Ibu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[kepalaKeluarga, ...anggotaKeluarga].map((warga, index) => (
                                    <tr key={warga.nik || index}>
                                        <td className="border px-1 py-1 text-center">{index + 1}</td>
                                        <td className="border px-1 py-1 text-center">{warga.statusPernikahan || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{getFormattedDate(warga.tanggalPerkawinan)}</td>
                                        <td className="border px-1 py-1 text-center">{warga.statusHubungan || '-'}</td>
                                        <td className="border px-1 py-1 text-center">{warga.kewarganegaraan || '-'}</td>
                                        <td className="border px-1 py-1">{warga.namaAyah || '-'}</td>
                                        <td className="border px-1 py-1">{warga.namaIbu || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Kartu Keluarga */}
                        <div className="mt-8 flex justify-between items-end text-sm">
                            <div>
                                <p>Dikeluarkan Tanggal: {getFormattedDate(new Date())}</p>
                                <div className="mt-8">
                                    <p className="font-bold">KEPALA KELUARGA</p>
                                    <p className="mt-12">( {kepalaKeluarga.nama?.toUpperCase() || '_______________________'} )</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">KEPALA DINAS KEPENDUDUKAN DAN</p>
                                <p className="font-bold">PENCATATAN SIPIL KAB. BEKASI</p>
                                <div className="border border-black w-24 h-24 mx-auto my-2 flex items-center justify-center text-xs">
                                    QR Code Placeholder
                                </div>
                                <p className="mt-2">NIP. 196701091987101001</p> {/* NIP placeholder */}
                            </div>
                        </div>

                        <p className="absolute bottom-2 left-4 text-xs text-gray-600 w-2/3">
                            Dokumen ini ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Komponen InputField dan SelectField (disalin dari App.jsx jika belum global)
// Asumsi sudah ada di App.jsx atau Anda akan menambahkannya secara lokal di sini
function InputField({ label, name, type = 'text', value, onChange, required = false, className = '', disabled = false, accept = '', placeholder = '' }) {
    return (
        <div className={className}>
            {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input 
                type={type} 
                id={name} 
                name={name} 
                value={value || ''} 
                onChange={onChange} 
                required={required} 
                disabled={disabled} 
                accept={accept}
                placeholder={placeholder}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
        </div>
    );
}

// LoadingScreen juga diasumsikan ada di App.jsx
function LoadingScreen({ text = "Memuat aplikasi..." }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">{text}</p>
        </div>
    );
}


export default KartuKeluargaViewer;
