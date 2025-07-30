import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc,
    setDoc,
    [span_0](start_span)getDoc, // Pastikan getDoc diimpor[span_0](end_span)
    [span_1](start_span)getDocs, // Import getDocs untuk query snapshot[span_1](end_span)
    query,
    where,
    orderBy,
    Timestamp,
    writeBatch,
    setLogLevel
} from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Asumsi Anda sudah memiliki komponen ini di KartuKeluargaviewer.jsx
// Anda perlu memastikan jalur impor ini benar
import KartuKeluargaviewer from './KartuKeluargaviewer'; 

// --- IKON (SVG) ---
[span_2](start_span)const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;[span_2](end_span)
[span_3](start_span)const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;[span_3](end_span)
[span_4](start_span)const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>;[span_4](end_span)
[span_5](start_span)const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;[span_5](end_span)
[span_6](start_span)const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;[span_6](end_span)
[span_7](start_span)const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;[span_7](end_span)
[span_8](start_span)const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;[span_8](end_span)
[span_9](start_span)const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;[span_9](end_span)
[span_10](start_span)const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;[span_10](end_span)
[span_11](start_span)const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;[span_11](end_span)
[span_12](start_span)const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;[span_12](end_span)
[span_13](start_span)const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;[span_13](end_span)
[span_14](start_span)const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;[span_14](end_span)
[span_15](start_span)const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;[span_15](end_span)
[span_16](start_span)const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;[span_16](end_span)

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAQ9jtfpBlGesndnBWpsZ79PqB2gKF3evM",
  authDomain: "data-kependudukan-fc3b2.firebaseapp.com",
  projectId: "data-kependudukan-fc3b2",
  storageBucket: "data-kependudukan-fc3b2.appspot.com",
  messagingSenderId: "707474702116",
  appId: "1:707474702116:web:a428bd252f9072e0477db1"
};
[span_17](start_span)const mainApp = initializeApp(firebaseConfig);[span_17](end_span)
[span_18](start_span)const mainAuth = getAuth(mainApp);[span_18](end_span)
[span_19](start_span)const db = getFirestore(mainApp);[span_19](end_span)
setLogLevel('debug');

[span_20](start_span)const secondaryApp = initializeApp(firebaseConfig, "secondary");[span_20](end_span)
[span_21](start_span)const secondaryAuth = getAuth(secondaryApp);[span_21](end_span)


// --- DATA KONSTAN ---
const OPSI = {
    [span_22](start_span)agama: ["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Khonghucu", "Lainnya"],[span_22](end_span)
    [span_23](start_span)jenisKelamin: ["Laki-laki", "Perempuan"],[span_23](end_span)
    [span_24](start_span)statusPernikahan: ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"],[span_24](end_span)
    [span_25](start_span)pendidikan: ["Tidak/Belum Sekolah", "SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "Diploma I/II", "Akademi/Diploma III/S. Muda", "Diploma IV/Strata I", "Strata II", "Strata III"],[span_25](end_span)
    [span_26](start_span)statusTinggal: ["Milik Sendiri", "Kontrak/Sewa", "Bebas Sewa", "Dinas", "Lainnya"],[span_26](end_span)
    [span_27](start_span)rt: Array.from({ length: 15 }, (_, i) => `00${i + 1}`.slice(-3)),[span_27](end_span)
    [span_28](start_span)rw: Array.from({ length: 5 }, (_, i) => `00${i + 1}`.slice(-3)),[span_28](end_span)
    [span_29](start_span)roles: ['superadmin', 'operator'],[span_29](end_span)
    [span_30](start_span)statusHubungan: ["Kepala Keluarga", "Istri", "Anak", "Famili Lain", "Lainnya"],[span_30](end_span)
    [span_31](start_span)golonganDarah: ["A", "B", "AB", "O", "Tidak Tahu"],[span_31](end_span)
    // New fields
    [span_32](start_span)provinsi: ["DKI Jakarta", "Jawa Barat"], // Tambahkan provinsi[span_32](end_span)
    kecamatan: { // Struktur objek untuk kelurahan per kecamatan
        "Cipayung": ["Bambu Apus", "Ceger", "Cilangkap", "Lubang Buaya", "Munjul", "Pondok Ranggon", "Cipayung", "Setu"],
        "Ciracas": ["Cibubur", "Ciracas", "Kelapa Dua Wetan", "Rambutan", "Susukan"],
        "Duren Sawit": ["Duren Sawit", "Klender", "Malaka Jaya", "Malaka Sari", "Pondok Bambu", "Pondok Kelapa", "Pondok Kopi"],
        "Jatinegara": ["Bali Mester", "Bidara Cina", "Cipinang Besar Selatan", "Cipinang Besar Utara", "Cipinang Cempedak", "Cipinang Muara", "Kampung Melayu", "Rawa Bunga"],
        "Kramat Jati": ["Balekambang", "Batu Ampar", "Cawang", "Cililitan", "Dukuh", "Kramat Jati", "Tengah"],
        "Makasar": ["Cipinang Melayu", "Halim Perdana Kusuma", "Kebon Pala", "Makasar", "Pinang Ranti"]
    },
    get daftarKecamatan() { return Object.keys(this.kecamatan); }, // Helper untuk mendapatkan daftar nama kecamatan
    get daftarKelurahan() { // Helper untuk mendapatkan semua kelurahan (opsional, bisa juga filter per kecamatan)
        return Object.values(this.kecamatan).flat();
    }
};

// --- FUNGSI BANTU ---
const calculateAge = (birthDate) => {
    [span_33](start_span)if (!birthDate) return null;[span_33](end_span)
    [span_34](start_span)const today = new Date();[span_34](end_span)
    [span_35](start_span)const birthDateObj = new Date(birthDate);[span_35](end_span)
    [span_36](start_span)let age = today.getFullYear() - birthDateObj.getFullYear();[span_36](end_span)
    [span_37](start_span)const monthDifference = today.getMonth() - birthDateObj.getMonth();[span_37](end_span)
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
        [span_38](start_span)age--;[span_38](end_span)
    }
    [span_39](start_span)return age;[span_39](end_span)
};

const createLog = async (userEmail, action) => {
    try {
        await addDoc(collection(db, "logs"), {
            userEmail,
            action,
            timestamp: Timestamp.now()
        [span_40](start_span)});[span_40](end_span)
    } catch (error) {
        [span_41](start_span)console.error("Error creating log:", error);[span_41](end_span)
    }
};

// --- KOMPONEN UTAMA: App ---
export default function App() {
    const [authState, setAuthState] = useState({
        loading: true,
        user: null,
        userProfile: null,
    [span_42](start_span)});[span_42](end_span)
    [span_43](start_span)const [currentPage, setCurrentPage] = useState('dashboard');[span_43](end_span)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(mainAuth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                let profileData = null;
    
                [span_44](start_span)if (userDocSnap.exists()) {[span_44](end_span)
                    profileData = userDocSnap.data();
                } else {
                    console.log("User profile not found in Firestore, creating default superadmin profile.");
                    [span_45](start_span)profileData = { email: user.email, role: 'superadmin' };[span_45](end_span)
                    await setDoc(userDocRef, profileData);
                }
                setAuthState({ loading: false, user, userProfile: profileData });
            } else {
                [span_46](start_span)setAuthState({ loading: false, user: null, userProfile: null });[span_46](end_span)
            }
        });
        return () => unsubscribe();
    }, []);
    [span_47](start_span)if (authState.loading) {[span_47](end_span)
        [span_48](start_span)return <LoadingScreen text="Mengautentikasi..." />;[span_48](end_span)
    }

    [span_49](start_span)if (!authState.user) {[span_49](end_span)
        [span_50](start_span)return <LoginScreen />;[span_50](end_span)
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col md:flex-row">
            <Sidebar user={authState.user} userProfile={authState.userProfile} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex-1 flex flex-col">
                <Header user={authState.user} userProfile={authState.userProfile} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-100">
                    [span_51](start_span){currentPage === 'dashboard' && <Dashboard userProfile={authState.userProfile} />}[span_51](end_span)
                    [span_52](start_span){currentPage === 'data-warga' && <DataWarga userProfile={authState.userProfile} />}[span_52](end_span)
                    [span_53](start_span){currentPage === 'manajemen-user' && authState.userProfile?.role === 'superadmin' && <ManajemenUser userProfile={authState.userProfile} />}[span_53](end_span)
                    [span_54](start_span){currentPage === 'log-aktivitas' && authState.userProfile?.role === 'superadmin' && <AktivitasLog />}[span_54](end_span)
                    {currentPage === 'kartu-keluarga' && <KartuKeluarga userProfile={authState.userProfile} />} {/* Halaman Kartu Keluarga Baru */}
                    [span_55](start_span){currentPage === 'pengaturan' && <Pengaturan />}[span_55](end_span)
                </main>
                <Footer />
            </div>
        </div>
    [span_56](start_span));[span_56](end_span)
}

// --- KOMPONEN LAYOUT ---
function Header({ user, userProfile }) {
    const handleLogout = () => {
        [span_57](start_span)signOut(mainAuth).catch(error => console.error("Logout error:", error));[span_57](end_span)
    };

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-700">Sistem Administrasi Kependudukan</h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm hidden md:block">
                    [span_58](start_span){user.email} (<span className="font-semibold capitalize text-blue-600">{userProfile?.role} {userProfile?.role === 'operator' && `RT ${userProfile.rt}`}</span>)[span_58](end_span)
                </span>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors">
                    <LogoutIcon />
                    <span className="hidden md:block">Logout</span>
                [span_59](start_span)</button>[span_59](end_span)
            </div>
        </header>
    [span_60](start_span));[span_60](end_span)
}

function Sidebar({ user, userProfile, currentPage, setCurrentPage }) {
    const navItems = [
        [span_61](start_span){ id: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, roles: ['superadmin', 'operator'] },[span_61](end_span)
        [span_62](start_span){ id: 'data-warga', label: 'Data Warga', icon: <DatabaseIcon />, roles: ['superadmin', 'operator'] },[span_62](end_span)
        { id: 'kartu-keluarga', label: 'Kartu Keluarga', icon: <DatabaseIcon />, roles: ['superadmin', 'operator'] }, {/* Tambah item navigasi KK */}
        [span_63](start_span){ id: 'manajemen-user', label: 'Manajemen User', icon: <UsersIcon />, roles: ['superadmin'] },[span_63](end_span)
        [span_64](start_span){ id: 'log-aktivitas', label: 'Log Aktivitas', icon: <ActivityIcon />, roles: ['superadmin'] },[span_64](end_span)
        [span_65](start_span){ id: 'pengaturan', label: 'Pengaturan', icon: <SettingsIcon />, roles: ['superadmin', 'operator'] },[span_65](end_span)
    ];
    return (
        [span_66](start_span)<nav className="bg-white border-r border-gray-200 w-full md:w-64 p-4 flex-shrink-0">[span_66](end_span)
            [span_67](start_span)<div className="flex flex-col items-center mb-8">[span_67](end_span)
                [span_68](start_span)<div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">[span_68](end_span)
                    <UserIcon />
                </div>
                [span_69](start_span)<p className="font-semibold text-center text-sm">{user.email}</p>[span_69](end_span)
                [span_70](start_span)<p className="text-xs text-gray-500 text-center break-all">ID: {user.uid}</p>[span_70](end_span)
            </div>
            <ul>
                {navItems.map(item => (
                    item.roles.includes(userProfile?.role) && (
                        [span_71](start_span)<li key={item.id}>[span_71](end_span)
                            <button
                                onClick={() => setCurrentPage(item.id)}
                                className={`w-full flex items-center space-x-3 p-3 my-1 rounded-lg text-left transition-colors ${
                                    currentPage === item.id 
                                        ? 'bg-blue-500 text-white shadow' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                [span_72](start_span)}`}[span_72](end_span)
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        [span_73](start_span)</li>[span_73](end_span)
                    )
                ))}
            </ul>
        </nav>
    [span_74](start_span));[span_74](end_span)
}

function Footer() {
    return (
        [span_75](start_span)<footer className="text-center p-4 text-xs text-gray-500 bg-white border-t border-gray-200 mt-auto">[span_75](end_span)
            © {new Date().getFullYear()} Aplikasi Kependudukan Kelurahan. Dibuat dengan ❤️.
        </footer>
    [span_76](start_span));[span_76](end_span)
}

// --- HALAMAN BARU: PENGATURAN ---
function Pengaturan() {
    [span_77](start_span)const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');[span_77](end_span)
    [span_78](start_span)const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');[span_78](end_span)
    [span_79](start_span)const [namaKelurahan, setNamaKelurahan] = useState('');[span_79](end_span)
    [span_80](start_span)const [alamatKelurahan, setAlamatKelurahan] = useState('');[span_80](end_span)
    const [namaKecamatan, setNamaKecamatan] = useState('');
    const [kabupatenKota, setKabupatenKota] = useState('');
    const [provinsi, setProvinsi] = useState('');
    const [kodePos, setKodePos] = useState('');
    [span_81](start_span)const [message, setMessage] = useState('');[span_81](end_span)

    useEffect(() => {
        [span_82](start_span)const savedCloudName = localStorage.getItem('cloudinaryCloudName');[span_82](end_span)
        [span_83](start_span)const savedUploadPreset = localStorage.getItem('cloudinaryUploadPreset');[span_83](end_span)
        [span_84](start_span)const savedNamaKelurahan = localStorage.getItem('namaKelurahan');[span_84](end_span)
        [span_85](start_span)const savedAlamatKelurahan = localStorage.getItem('alamatKelurahan');[span_85](end_span)
        const savedNamaKecamatan = localStorage.getItem('namaKecamatan');
        const savedKabupatenKota = localStorage.getItem('kabupatenKota');
        const savedProvinsi = localStorage.getItem('provinsi');
        const savedKodePos = localStorage.getItem('kodePos');

        if (savedCloudName) setCloudinaryCloudName(savedCloudName);
        if (savedUploadPreset) setCloudinaryUploadPreset(savedUploadPreset);
        if (savedNamaKelurahan) setNamaKelurahan(savedNamaKelurahan);
        if (savedAlamatKelurahan) setAlamatKelurahan(savedAlamatKelurahan);
        if (savedNamaKecamatan) setNamaKecamatan(savedNamaKecamatan);
        if (savedKabupatenKota) setKabupatenKota(savedKabupatenKota);
        if (savedProvinsi) setProvinsi(savedProvinsi);
        if (savedKodePos) setKodePos(savedKodePos);
    }, []);

    const handleSave = () => {
        [span_86](start_span)localStorage.setItem('cloudinaryCloudName', cloudinaryCloudName);[span_86](end_span)
        [span_87](start_span)localStorage.setItem('cloudinaryUploadPreset', cloudinaryUploadPreset);[span_87](end_span)
        [span_88](start_span)localStorage.setItem('namaKelurahan', namaKelurahan);[span_88](end_span)
        [span_89](start_span)localStorage.setItem('alamatKelurahan', alamatKelurahan);[span_89](end_span)
        localStorage.setItem('namaKecamatan', namaKecamatan);
        localStorage.setItem('kabupatenKota', kabupatenKota);
        localStorage.setItem('provinsi', provinsi);
        localStorage.setItem('kodePos', kodePos);
        setMessage('Pengaturan berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        [span_90](start_span)<div className="space-y-6">[span_90](end_span)
            [span_91](start_span)<h2 className="text-3xl font-bold text-gray-800">Pengaturan Aplikasi</h2>[span_91](end_span)
            [span_92](start_span)<div className="bg-white p-6 rounded-xl shadow-md max-w-2xl space-y-8">[span_92](end_span)
                <div>
                    <h3 className="text-xl font-semibold mb-4">Header Laporan</h3>
                    [span_93](start_span)<p className="text-sm text-gray-600 mb-4">Informasi ini akan ditampilkan di Dashboard dan setiap laporan PDF.</p>[span_93](end_span)
                    <div className="space-y-4">
                        <SelectField 
                            label="Provinsi" 
                            name="provinsi" 
                            value={provinsi} 
                            onChange={(e) => {
                                setProvinsi(e.target.value);
                                setNamaKecamatan(''); // Reset kecamatan ketika provinsi berubah
                                setNamaKelurahan(''); // Reset kelurahan
                            }} 
                            options={['Pilih Provinsi', ...OPSI.provinsi]}
                        />
                        <SelectField 
                            label="Nama Kecamatan" 
                            name="namaKecamatan" 
                            value={namaKecamatan} 
                            onChange={(e) => {
                                setNamaKecamatan(e.target.value);
                                setNamaKelurahan(''); // Reset kelurahan ketika kecamatan berubah
                            }} 
                            options={['Pilih Kecamatan', ...(OPSI.kecamatan[namaKecamatan] ? OPSI.daftarKecamatan : [])]} // Tampilkan kecamatan berdasarkan provinsi jika ada, atau semua
                            disabled={!provinsi || provinsi === 'Pilih Provinsi'}
                        />
                         <SelectField 
                            label="Nama Kelurahan / Desa" 
                            name="namaKelurahan" 
                            value={namaKelurahan} 
                            onChange={(e) => setNamaKelurahan(e.target.value)} 
                            options={['Pilih Kelurahan', ...(namaKecamatan && OPSI.kecamatan[namaKecamatan] ? OPSI.kecamatan[namaKecamatan] : [])]}
                            disabled={!namaKecamatan || namaKecamatan === 'Pilih Kecamatan'}
                        />
                        <InputField label="Kabupaten/Kota" name="kabupatenKota" value={kabupatenKota} onChange={(e) => setKabupatenKota(e.target.value)} placeholder="Contoh: Kota Bekasi" />
                        <InputField label="Kode Pos" name="kodePos" value={kodePos} onChange={(e) => setKodePos(e.target.value)} placeholder="Contoh: 12345" />
                        [span_94](start_span)<InputField label="Alamat" name="alamatKelurahan" value={alamatKelurahan} onChange={(e) => setAlamatKelurahan(e.target.value)} placeholder="Contoh: Jl. Raya Sejahtera No. 1" />[span_94](end_span)
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Pengaturan Cloudinary</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        [span_95](start_span)Masukkan informasi dari akun Cloudinary Anda untuk mengaktifkan fitur upload foto.[span_95](end_span)
                        [span_96](start_span)Pastikan Upload Preset diatur ke mode **"Unsigned"**.[span_96](end_span)
                    </p>
                    <div className="space-y-4">
                        <InputField label="Cloud Name" name="cloudName" value={cloudinaryCloudName} onChange={(e) => setCloudinaryCloudName(e.target.value)} placeholder="Contoh: daxxxxxxx" />
                        <InputField label="Upload Preset" name="uploadPreset" value={cloudinaryUploadPreset} onChange={(e) => setCloudinaryUploadPreset(e.target.value)} placeholder="Contoh: ml_default" />
                    [span_97](start_span)</div>[span_97](end_span)
                </div>
                <div className="pt-4 border-t">
                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600">
                        [span_98](start_span)Simpan Pengaturan[span_98](end_span)
                    </button>
                    {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
                </div>
            </div>
        </div>
    [span_99](start_span));[span_99](end_span)
}


// --- HALAMAN BARU: LOG AKTIVITAS ---
function AktivitasLog() {
    [span_100](start_span)const [logs, setLogs] = useState([]);[span_100](end_span)
    [span_101](start_span)const [loading, setLoading] = useState(true);[span_101](end_span)

    useEffect(() => {
        const logsCollectionRef = collection(db, "logs");
        const q = query(logsCollectionRef, orderBy("timestamp", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logsList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp.toDate()
                [span_102](start_span)};[span_102](end_span)
            });
            [span_103](start_span)setLogs(logsList);[span_103](end_span)
            [span_104](start_span)setLoading(false);[span_104](end_span)
        });
        return () => unsubscribe();
    }, []);
    [span_105](start_span)if (loading) return <LoadingScreen text="Memuat log aktivitas..." />;[span_105](end_span)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Log Aktivitas Sistem</h2>
            <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        [span_106](start_span)<tr>[span_106](end_span)
                            <th className="px-6 py-3">Waktu</th>
                            <th className="px-6 py-3">User</th>
                            [span_107](start_span)<th className="px-6 py-3">Aktivitas</th>[span_107](end_span)
                        </tr>
                    </thead>
                    <tbody>
                        [span_108](start_span){logs.map(log => ([span_108](end_span)
                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    [span_109](start_span){log.timestamp.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}[span_109](end_span)
                                </td>
                                <td className="px-6 py-4 font-medium">{log.userEmail}</td>
                                [span_110](start_span)<td className="px-6 py-4">{log.action}</td>[span_110](end_span)
                            </tr>
                        ))}
                    </tbody>
                </table>
            [span_111](start_span)</div>[span_111](end_span)
        </div>
    [span_112](start_span));[span_112](end_span)
}


// --- HALAMAN MANAJEMEN USER ---
function ManajemenUser({ userProfile }) {
    [span_113](start_span)const [users, setUsers] = useState([]);[span_113](end_span)
    [span_114](start_span)const [loading, setLoading] = useState(true);[span_114](end_span)
    [span_115](start_span)const [isModalOpen, setIsModalOpen] = useState(false);[span_115](end_span)
    useEffect(() => {
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
            setLoading(false);
        });
        [span_116](start_span)return () => unsubscribe();[span_116](end_span)
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Fitur hapus user memerlukan implementasi Cloud Function untuk keamanan. Ini hanya simulasi.")) {
            [span_117](start_span)console.log(`Simulasi menghapus user dengan ID: ${userId}`);[span_117](end_span)
        }
    }

    [span_118](start_span)if (loading) return <LoadingScreen text="Memuat data user..." />;[span_118](end_span)
    return (
        [span_119](start_span)<div className="space-y-6">[span_119](end_span)
            <div className="flex justify-between items-center">
                [span_120](start_span)<h2 className="text-3xl font-bold text-gray-800">Manajemen User</h2>[span_120](end_span)
                <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600">
                    <PlusIcon />
                    <span>Tambah User Baru</span>
                [span_121](start_span)</button>[span_121](end_span)
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        [span_122](start_span)<tr>[span_122](end_span)
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            [span_123](start_span)<th className="px-6 py-3">Penugasan</th>[span_123](end_span)
                            <th className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    [span_124](start_span)<tbody>[span_124](end_span)
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                [span_125](start_span)<td className="px-6 py-4 font-medium">{user.email}</td>[span_125](end_span)
                                <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full capitalize">{user.role}</span></td>
                                <td className="px-6 py-4">{user.role === 'operator' ? [span_126](start_span)`RT ${user.rt}` : 'Semua Akses'}</td>[span_126](end_span)
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                [span_127](start_span)</td>[span_127](end_span)
                            </tr>
                        ))}
                    </tbody>
                [span_128](start_span)</table>[span_128](end_span)
            </div>
            {isModalOpen && <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentUserProfile={userProfile} />}
        </div>
    [span_129](start_span));[span_129](end_span)
}

function AddUserModal({ isOpen, onClose, currentUserProfile }) {
    const [email, setEmail] = useState('');
    [span_130](start_span)const [password, setPassword] = useState('');[span_130](end_span)
    [span_131](start_span)const [role, setRole] = useState(OPSI.roles[1]);[span_131](end_span)
    [span_132](start_span)const [rt, setRt] = useState(OPSI.rt[0]);[span_132](end_span)
    const [error, setError] = useState('');
    [span_133](start_span)const [submitting, setSubmitting] = useState(false);[span_133](end_span)
    const handleSubmit = async (e) => {
        [span_134](start_span)e.preventDefault();[span_134](end_span)
        [span_135](start_span)setError('');[span_135](end_span)
        [span_136](start_span)setSubmitting(true);[span_136](end_span)
        try {
            [span_137](start_span)const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);[span_137](end_span)
            [span_138](start_span)const newUser = userCredential.user;[span_138](end_span)
            [span_139](start_span)const userProfileData = { email: newUser.email, role: role };[span_139](end_span)
            [span_140](start_span)if (role === 'operator') {[span_140](end_span)
                [span_141](start_span)userProfileData.rt = rt;[span_141](end_span)
            }
            [span_142](start_span)await setDoc(doc(db, "users", newUser.uid), userProfileData);[span_142](end_span)
            [span_143](start_span)await createLog(currentUserProfile.email, `Menambah user baru: ${email} (${role})`);[span_143](end_span)
            await signOut(secondaryAuth);
            onClose();
        [span_144](start_span)} catch (err) {[span_144](end_span)
            [span_145](start_span)setError(err.message.replace('Firebase: ', ''));[span_145](end_span)
        [span_146](start_span)} finally {[span_146](end_span)
            [span_147](start_span)setSubmitting(false);[span_147](end_span)
        }
    };
    [span_148](start_span)if (!isOpen) return null;[span_148](end_span)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Tambah User Baru</h3>
                    [span_149](start_span)<button onClick={onClose}><CloseIcon /></button>[span_149](end_span)
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <InputField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <InputField label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    [span_150](start_span)<SelectField label="Role" name="role" value={role} onChange={(e) => setRole(e.target.value)} options={OPSI.roles} />[span_150](end_span)
                    {role === 'operator' && (
                        <SelectField label="Penugasan RT" name="rt" value={rt} onChange={(e) => setRt(e.target.value)} options={OPSI.rt} />
                    [span_151](start_span))}[span_151](end_span)
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2">Batal</button>
                        <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300">
                            {submitting ? [span_152](start_span)'Menyimpan...' : 'Simpan User'}[span_152](end_span)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    [span_153](start_span));[span_153](end_span)
}

// --- HALAMAN BARU: KARTU KELUARGA ---
function KartuKeluarga({ userProfile }) {
    const [noKK, setNoKK] = useState('');
    const [wargaDalamKK, setWargaDalamKK] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ref untuk komponen KartuKeluargaviewer agar bisa di-capture oleh html2canvas
    const kkViewerRef = useRef(null);

    const headerData = {
        namaKelurahan: localStorage.getItem('namaKelurahan') || 'Kelurahan Tidak Diketahui',
        alamatKelurahan: localStorage.getItem('alamatKelurahan') || 'Alamat Tidak Diketahui',
        namaKecamatan: localStorage.getItem('namaKecamatan') || 'Kecamatan Tidak Diketahui',
        kabupatenKota: localStorage.getItem('kabupatenKota') || 'Kabupaten/Kota Tidak Diketahui',
        provinsi: localStorage.getItem('provinsi') || 'Provinsi Tidak Diketahui',
        kodePos: localStorage.getItem('kodePos') || 'Kode Pos Tidak Diketahui',
    };

    const handleSearchKK = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setWargaDalamKK([]); // Reset data sebelumnya

        if (!noKK) {
            setError("Nomor KK tidak boleh kosong.");
            setLoading(false);
            return;
        }

        try {
            const wargaCollectionRef = collection(db, 'warga');
            // Query untuk mencari warga dengan nomor KK yang cocok
            const q = query(wargaCollectionRef, where("kk", "==", noKK));
            const querySnapshot = await getDocs(q); // Gunakan getDocs untuk mendapatkan data saat ini

            if (querySnapshot.empty) {
                setError(`Tidak ditemukan data warga untuk No. KK: ${noKK}`);
            } else {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Urutkan anggota keluarga agar Kepala Keluarga muncul pertama
                data.sort((a, b) => {
                    if (a.statusHubungan === "Kepala Keluarga") return -1;
                    if (b.statusHubungan === "Kepala Keluarga") return 1;
                    return 0;
                });
                setWargaDalamKK(data);
                await createLog(userProfile.email, `Mencari Kartu Keluarga dengan No. KK: ${noKK}`);
            }
        } catch (err) {
            console.error("Error searching KK:", err);
            setError("Terjadi kesalahan saat mencari data Kartu Keluarga.");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (wargaDalamKK.length === 0) {
            setError("Tidak ada data Kartu Keluarga untuk diunduh.");
            return;
        }
        
        if (kkViewerRef.current) {
            // Menggunakan html2canvas untuk menangkap tampilan KK sebagai gambar
            const canvas = await html2canvas(kkViewerRef.current, { scale: 2 }); // Scale untuk kualitas lebih baik
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Kualitas 1.0

            const pdf = new jsPDF('landscape', 'mm', 'a4'); // Buat PDF A4 lanskap
            const imgWidth = 280; // Lebar gambar di PDF (mendekati lebar A4 lanskap)
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Hitung tinggi proporsional

            // Tambahkan gambar ke PDF
            pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight); // Posisi (x, y, width, height)
            pdf.save(`Kartu_Keluarga_${noKK}.pdf`);
            await createLog(userProfile.email, `Mengunduh PDF Kartu Keluarga No. KK: ${noKK}`);
        } else {
            setError("Elemen Kartu Keluarga tidak ditemukan untuk diunduh.");
        }
    };

    const downloadJPG = async () => {
        if (wargaDalamKK.length === 0) {
            setError("Tidak ada data Kartu Keluarga untuk diunduh.");
            return;
        }

        if (kkViewerRef.current) {
            const canvas = await html2canvas(kkViewerRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            const link = document.createElement('a');
            link.href = imgData;
            link.download = `Kartu_Keluarga_${noKK}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            await createLog(userProfile.email, `Mengunduh JPG Kartu Keluarga No. KK: ${noKK}`);
        } else {
            setError("Elemen Kartu Keluarga tidak ditemukan untuk diunduh.");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Cetak Kartu Keluarga</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <form onSubmit={handleSearchKK} className="flex flex-col md:flex-row gap-4 items-center">
                    <InputField 
                        label="Nomor Kartu Keluarga (KK)" 
                        name="noKK" 
                        value={noKK} 
                        onChange={(e) => setNoKK(e.target.value)} 
                        placeholder="Masukkan Nomor KK" 
                        required 
                        className="flex-grow"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? 'Mencari...' : 'Cari KK'}
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>

            {wargaDalamKK.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-end gap-2 mb-4">
                        <button onClick={downloadPDF} className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-red-700 transition-colors">
                            <PdfIcon />
                            <span>Unduh PDF</span>
                        </button>
                        <button onClick={downloadJPG} className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-purple-700 transition-colors">
                            <ExportIcon /> {/* Menggunakan ExportIcon sebagai placeholder untuk JPG */}
                            <span>Unduh JPG</span>
                        </button>
                    </div>
                    {/* Render KartuKeluargaviewer dan attach ref */}
                    <div ref={kkViewerRef} className="border p-4 rounded-md overflow-x-auto">
                        <KartuKeluargaviewer dataKK={wargaDalamKK} noKK={noKK} headerData={headerData} />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- KOMPONEN HALAMAN LAINNYA (sama seperti sebelumnya) ---
function Dashboard({ userProfile }) {
    [span_154](start_span)const [wargaList, setWargaList] = useState([]);[span_154](end_span)
    [span_155](start_span)const [loading, setLoading] = useState(true);[span_155](end_span)
    [span_156](start_span)const [namaKelurahan, setNamaKelurahan] = useState('');[span_156](end_span)
    [span_157](start_span)const [alamatKelurahan, setAlamatKelurahan] = useState('');[span_157](end_span)
    const [namaKecamatan, setNamaKecamatan] = useState('');
    const [kabupatenKota, setKabupatenKota] = useState('');
    const [provinsi, setProvinsi] = useState('');
    const [kodePos, setKodePos] = useState('');

    useEffect(() => {
        const savedNamaKelurahan = localStorage.getItem('namaKelurahan') || 'Kelurahan Anda';
        const savedAlamatKelurahan = localStorage.getItem('alamatKelurahan') || 'Alamat kelurahan belum diatur';
        const savedNamaKecamatan = localStorage.getItem('namaKecamatan') || 'Kecamatan Anda';
        const savedKabupatenKota = localStorage.getItem('kabupatenKota') || 'Kabupaten/Kota Anda';
        const savedProvinsi = localStorage.getItem('provinsi') || 'Provinsi Anda';
        const savedKodePos = localStorage.getItem('kodePos') || 'Kode Pos Anda';

        setNamaKelurahan(savedNamaKelurahan);
        setAlamatKelurahan(savedAlamatKelurahan);
        setNamaKecamatan(savedNamaKecamatan);
        setKabupatenKota(savedKabupatenKota);
        setProvinsi(savedProvinsi);
        setKodePos(savedKodePos);

        if (!userProfile) return;
        const wargaCollectionRef = collection(db, 'warga');
        const q = userProfile.role === 'operator' ? query(wargaCollectionRef, where("rt", "==", userProfile.rt)) : query(wargaCollectionRef);
        [span_158](start_span)const unsubscribe = onSnapshot(q, (snapshot) => {[span_158](end_span)
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWargaList(data);
            [span_159](start_span)setLoading(false);[span_159](end_span)
        }, (error) => {
            console.error("Error fetching data for dashboard:", error);
            setLoading(false);
        });
        [span_160](start_span)return () => unsubscribe();[span_160](end_span)
    }, [userProfile]);
    [span_161](start_span)const dashboardData = useMemo(() => {[span_161](end_span)
        const totalWarga = wargaList.length;
        const totalKK = new Set(wargaList.map(w => w.kk)).size;
        const lakiLaki = wargaList.filter(w => w.jenisKelamin === 'Laki-laki').length;
        const perempuan = totalWarga - lakiLaki;
        const janda = wargaList.filter(w => w.jenisKelamin === 'Perempuan' && (w.statusPernikahan === 'Cerai Hidup' || w.statusPernikahan === 'Cerai Mati')).length;
        [span_162](start_span)const duda = wargaList.filter(w => w.jenisKelamin === 'Laki-laki' && (w.statusPernikahan === 'Cerai Hidup' || w.statusPernikahan === 'Cerai Mati')).length;[span_162](end_span)

        const genderData = [{ name: 'Laki-laki', value: lakiLaki }, { name: 'Perempuan', value: perempuan }];
        const ageGroups = { '0-17': 0, '18-35': 0, '36-60': 0, '60+': 0, 'N/A': 0 };
        wargaList.forEach(w => {
            const age = calculateAge(w.tanggalLahir);
            if (age === null) ageGroups['N/A']++;
            [span_163](start_span)else if (age <= 17) ageGroups['0-17']++;[span_163](end_span)
            [span_164](start_span)else if (age <= 35) ageGroups['18-35']++;[span_164](end_span)
            [span_165](start_span)else if (age <= 60) ageGroups['36-60']++;[span_165](end_span)
            else ageGroups['60+']++;
        });
        [span_166](start_span)const ageData = Object.keys(ageGroups).map(key => ({ name: key, jumlah: ageGroups[key] }));[span_166](end_span)
        [span_167](start_span)const wargaPerRT = {};[span_167](end_span)
        wargaList.forEach(warga => {
            const rt = warga.rt || "N/A";
            wargaPerRT[rt] = (wargaPerRT[rt] || 0) + 1;
        });
        [span_168](start_span)const rtData = Object.keys(wargaPerRT).map(rt => ({ name: `RT ${rt}`, jumlah: wargaPerRT[rt] })).sort((a, b) => a.name.localeCompare(b.name));[span_168](end_span)
        [span_169](start_span)return { totalWarga, totalKK, lakiLaki, perempuan, janda, duda, genderData, ageData, rtData };[span_169](end_span)
    }, [wargaList]);

    [span_170](start_span)const GENDER_COLORS = ['#3b82f6', '#ec4899'];[span_170](end_span)
    [span_171](start_span)if (loading) return <LoadingScreen text="Memuat data dashboard..." />;[span_171](end_span)

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800">{namaKelurahan}</h2>
                <p className="text-sm text-gray-500">{alamatKelurahan}</p>
                <p className="text-sm text-gray-500">Kecamatan {namaKecamatan}, {kabupatenKota}, {provinsi} {kodePos}</p>
            </div>
            
            [span_172](start_span)<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">[span_172](end_span)
                <StatCard title="Total Warga" value={dashboardData.totalWarga} />
                <StatCard title="Total Kepala Keluarga" value={dashboardData.totalKK} />
                <StatCard title="Jumlah Laki-laki" value={dashboardData.lakiLaki} />
                <StatCard title="Jumlah Perempuan" value={dashboardData.perempuan} />
                [span_173](start_span)<StatCard title="Jumlah Janda" value={dashboardData.janda} />[span_173](end_span)
                <StatCard title="Jumlah Duda" value={dashboardData.duda} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    [span_174](start_span)<h3 className="text-xl font-semibold mb-4">Jumlah Warga per RT</h3>[span_174](end_span)
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={dashboardData.rtData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            [span_175](start_span)<CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="jumlah" fill="#8884d8" name="Jumlah Warga" />[span_175](end_span)
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md flex flex-col">
                    [span_176](start_span)<h3 className="text-xl font-semibold mb-4">Distribusi Jenis Kelamin</h3>[span_176](end_span)
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie data={dashboardData.genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                [span_177](start_span){dashboardData.genderData.map((entry, index) => (<Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />))}[span_177](end_span)
                            </Pie>
                            <Tooltip /><Legend />
                        [span_178](start_span)</PieChart>[span_178](end_span)
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                [span_179](start_span)<h3 className="text-xl font-semibold mb-4">Distribusi Kelompok Usia</h3>[span_179](end_span)
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dashboardData.ageData}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="jumlah" fill="#82ca9d" name="Jumlah Warga" />
                    [span_180](start_span)</BarChart>[span_180](end_span)
                </ResponsiveContainer>
            </div>
        </div>
    [span_181](start_span));[span_181](end_span)
}

function StatCard({ title, value }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow">
            <h4 className="text-gray-500 font-medium">{title}</h4>
            <p className="text-4xl font-bold text-blue-600">{value}</p>
        </div>
    [span_182](start_span));[span_182](end_span)
}

function DataWarga({ userProfile }) {
    [span_183](start_span)const [wargaList, setWargaList] = useState([]);[span_183](end_span)
    [span_184](start_span)const [filteredWarga, setFilteredWarga] = useState([]);[span_184](end_span)
    [span_185](start_span)const [loading, setLoading] = useState(true);[span_185](end_span)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    [span_186](start_span)const [infoModalMessage, setInfoModalMessage] = useState('');[span_186](end_span)
    [span_187](start_span)const [editingWarga, setEditingWarga] = useState(null);[span_187](end_span)
    [span_188](start_span)const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);[span_188](end_span)
    [span_189](start_span)const [deletingId, setDeletingId] = useState(null);[span_189](end_span)
    const [filters, setFilters] = useState({
        nama: '', nik: '', kk: '', jenisKelamin: 'semua', statusPernikahan: 'semua', rt: 'semua', rw: 'semua'
    [span_190](start_span)});[span_190](end_span)
    useEffect(() => {
        if (!userProfile) return;
        const wargaCollectionRef = collection(db, 'warga');
        const q = userProfile.role === 'operator' ? query(wargaCollectionRef, where("rt", "==", userProfile.rt)) : query(wargaCollectionRef);
        [span_191](start_span)const unsubscribe = onSnapshot(q, (snapshot) => {[span_191](end_span)
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWargaList(data);
            [span_192](start_span)setLoading(false);[span_192](end_span)
        }, (error) => {
            console.error("Error fetching data warga:", error);
            setLoading(false);
        });
        [span_193](start_span)return () => unsubscribe();[span_193](end_span)
    }, [userProfile]);
    [span_194](start_span)useEffect(() => {[span_194](end_span)
        let data = [...wargaList];
        if (filters.nama) data = data.filter(w => w.nama?.toLowerCase().includes(filters.nama.toLowerCase()));
        if (filters.nik) data = data.filter(w => w.nik?.includes(filters.nik));
        if (filters.kk) data = data.filter(w => w.kk?.includes(filters.kk));
        if (filters.jenisKelamin !== 'semua') data = data.filter(w => w.jenisKelamin === filters.jenisKelamin);
        if (filters.statusPernikahan !== 'semua') data = data.filter(w => w.statusPernikahan === filters.statusPernikahan);
        [span_195](start_span)if (userProfile.role === 'superadmin') {[span_195](end_span)
            if (filters.rt !== 'semua') data = data.filter(w => w.rt === filters.rt);
            if (filters.rw !== 'semua') data = data.filter(w => w.rw === filters.rw);
        }
        setFilteredWarga(data);
    }, [filters, wargaList, userProfile]);
    [span_196](start_span)const handleFilterChange = (e) => {[span_196](end_span)
        const { name, value } = e.target;
        [span_197](start_span)setFilters(prev => ({ ...prev, [name]: value }));[span_197](end_span)
    };

    const openAddModal = () => {
        setEditingWarga(null);
        [span_198](start_span)setIsModalOpen(true);[span_198](end_span)
    };

    const openEditModal = (warga) => {
        setEditingWarga(warga);
        setIsModalOpen(true);
    };
    [span_199](start_span)const confirmDelete = async (id) => {[span_199](end_span)
        [span_200](start_span)const docRef = doc(db, "warga", id);[span_200](end_span)
        [span_201](start_span)const docSnap = await getDoc(docRef);[span_201](end_span)
        if (docSnap.exists()) {
            [span_202](start_span)setDeletingId({ id, nama: docSnap.data().nama });[span_202](end_span)
            [span_203](start_span)setShowDeleteConfirm(true);[span_203](end_span)
        }
    };

    const handleDelete = async () => {
        if (deletingId) {
            try {
                [span_204](start_span)await deleteDoc(doc(db, "warga", deletingId.id));[span_204](end_span)
                [span_205](start_span)await createLog(userProfile.email, `Menghapus data warga: ${deletingId.nama}`);[span_205](end_span)
            } catch (error) {
                [span_206](start_span)console.error("Error deleting document: ", error);[span_206](end_span)
            [span_207](start_span)} finally {[span_207](end_span)
                setShowDeleteConfirm(false);
                [span_208](start_span)setDeletingId(null);[span_208](end_span)
            }
        }
    };
    [span_209](start_span)const handleExport = () => {[span_209](end_span)
        const dataToExport = filteredWarga.map(w => ({
            'Nama Lengkap': w.nama, 'NIK': w.nik, 'No KK': w.kk, 'Tempat Lahir': w.tempatLahir,
            'Tanggal Lahir': w.tanggalLahir, 'Jenis Kelamin': w.jenisKelamin, 'Agama': w.agama,
            'Pendidikan': w.pendidikan, 'Pekerjaan': w.pekerjaan, 'Status Pernikahan': w.statusPernikahan,
            'Alamat': w.alamat, 'RT': w.rt, 'RW': w.rw,
      
        [span_210](start_span)}));[span_210](end_span)
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga");
        XLSX.writeFile(workbook, "DataWarga.xlsx");
        [span_211](start_span)createLog(userProfile.email, `Mengekspor ${dataToExport.length} data warga ke Excel.`);[span_211](end_span)
    };

    [span_212](start_span)const handleShare = () => {[span_212](end_span)
        if (filteredWarga.length === 0) {
            [span_213](start_span)setInfoModalMessage("Tidak ada data untuk dibagikan. Silakan filter data terlebih dahulu.");[span_213](end_span)
            return;
        }

        [span_214](start_span)let reportText = `Laporan Data Warga (Total: ${filteredWarga.length} orang)\n\n`;[span_214](end_span)
        [span_215](start_span)filteredWarga.slice(0, 20).forEach((w, index) => { // Batasi 20 data pertama untuk WhatsApp[span_215](end_span)
            reportText += `${index + 1}. ${w.nama} - NIK: ${w.nik} - RT/RW: ${w.rt}/${w.rw}\n`;
        });
        [span_216](start_span)if (filteredWarga.length > 20) {[span_216](end_span)
            [span_217](start_span)reportText += "\n...dan data lainnya.";[span_217](end_span)
        }

        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
        [span_218](start_span)window.open(whatsappUrl, '_blank');[span_218](end_span)
        [span_219](start_span)createLog(userProfile.email, `Membagikan laporan ${filteredWarga.length} warga via WhatsApp.`);[span_219](end_span)
    };
    
    [span_220](start_span)const handleDownloadPdf = () => {[span_220](end_span)
        if (filteredWarga.length === 0) {
            [span_221](start_span)setInfoModalMessage("Tidak ada data untuk diunduh. Silakan filter data terlebih dahulu.");[span_221](end_span)
            return;
        }

        const doc = new jsPDF();
        [span_222](start_span)doc.text("Laporan Data Warga", 14, 16);[span_222](end_span)
        [span_223](start_span)doc.setFontSize(10);[span_223](end_span)
        [span_224](start_span)doc.text(`Total: ${filteredWarga.length} warga`, 14, 22);[span_224](end_span)
        
        [span_225](start_span)const tableColumn = ["No", "Nama", "NIK", "No KK", "Jenis Kelamin", "Pekerjaan", "Pendidikan", "Status Nikah", "RT/RW"];[span_225](end_span)
        [span_226](start_span)const tableRows = [];[span_226](end_span)

        filteredWarga.forEach((warga, index) => {
            const wargaData = [
                index + 1,
                warga.nama || '',
                warga.nik || '',
                warga.kk || '',
      
                [span_227](start_span)warga.jenisKelamin || '',[span_227](end_span)
                warga.pekerjaan || '',
                warga.pendidikan || '',
                warga.statusPernikahan || '',
                `${warga.rt || ''}/${warga.rw || ''}`
            ];
  
            [span_228](start_span)tableRows.push(wargaData);[span_228](end_span)
        });
        [span_229](start_span)autoTable(doc, {[span_229](end_span)
            head: [tableColumn],
            body: tableRows,
            startY: 28,
        });
        [span_230](start_span)doc.save("laporan_warga.pdf");[span_230](end_span)
        [span_231](start_span)createLog(userProfile.email, `Mengunduh laporan PDF berisi ${filteredWarga.length} data warga.`);[span_231](end_span)
    };

    [span_232](start_span)if (loading) return <LoadingScreen text="Memuat data warga..." />;[span_232](end_span)
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Manajemen Data Warga {userProfile.role === 'operator' && `RT ${userProfile.rt}`}</h2>
                <div className="flex flex-wrap gap-2">
                    [span_233](start_span)<button onClick={() => setIsImportModalOpen(true)} className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-gray-700 transition-colors">[span_233](end_span)
                        <ImportIcon />
                        <span>Import</span>
                    </button>
                    
                    [span_234](start_span)<button onClick={handleExport} className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-green-700 transition-colors">[span_234](end_span)
                        <ExportIcon />
                        <span>Export</span>
                    </button>
                    [span_235](start_span)<button onClick={handleDownloadPdf} className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-red-700 transition-colors">[span_235](end_span)
                        <PdfIcon />
                        <span>PDF</span>
                    </button>
                
                    [span_236](start_span)<button onClick={handleShare} className="flex items-center space-x-2 bg-teal-500 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-teal-600 transition-colors">[span_236](end_span)
                        <WhatsAppIcon />
                        <span>Share</span>
                    </button>
              
                    [span_237](start_span)<button onClick={openAddModal} className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-blue-600 transition-colors">[span_237](end_span)
                        <PlusIcon />
                        <span>Tambah Warga</span>
                    </button>
           
                </div>
            </div>

            <FilterSection filters={filters} onFilterChange={handleFilterChange} userProfile={userProfile} />

            <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        [span_238](start_span)<tr>[span_238](end_span)
                            <th className="px-6 py-3">Nama</th><th className="px-6 py-3">NIK</th><th className="px-6 py-3">Pekerjaan</th>
                            <th className="px-6 py-3">Pendidikan</th><th className="px-6 py-3">Alamat</th><th className="px-6 py-3">RT/RW</th>
                            [span_239](start_span)<th className="px-6 py-3">Aksi</th>[span_239](end_span)
                        </tr>
                    </thead>
                    <tbody>
                        [span_240](start_span){filteredWarga.length > 0 ? filteredWarga.map(warga => ([span_240](end_span)
                            <tr key={warga.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{warga.nama}</td>
                                [span_241](start_span)<td className="px-6 py-4">{warga.nik}</td><td className="px-6 py-4">{warga.pekerjaan}</td>[span_241](end_span)
                                <td className="px-6 py-4">{warga.pendidikan}</td><td className="px-6 py-4">{warga.alamat}</td>
                                <td className="px-6 py-4">{warga.rt}/{warga.rw}</td>
               
                                [span_242](start_span)<td className="px-6 py-4 flex items-center space-x-2">[span_242](end_span)
                                    <button onClick={() => openEditModal(warga)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon /></button>
                                  
                                    [span_243](start_span)<button onClick={() => confirmDelete(warga.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>[span_243](end_span)
                                </td>
                            </tr>
                        )) : (
                            [span_244](start_span)<tr><td colSpan="7" className="text-center py-8 text-gray-500">Tidak ada data yang cocok dengan filter.</td></tr>[span_244](end_span)
                        )}
                    </tbody>
                </table>
      
            </div>

            {isModalOpen && <WargaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} wargaData={editingWarga} userProfile={userProfile} />}
            {isImportModalOpen && <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} userProfile={userProfile} />}
            {infoModalMessage && <InfoModal message={infoModalMessage} onClose={() => setInfoModalMessage('')} />}
            [span_245](start_span){showDeleteConfirm && <ConfirmModal onConfirm={handleDelete} onCancel={() => setShowDeleteConfirm(false)} message={`Apakah Anda yakin ingin menghapus data warga: ${deletingId?.nama}?`} />}[span_245](end_span)
        </div>
    );
}

function FilterSection({ filters, onFilterChange, userProfile }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" name="nama" placeholder="Cari Nama..." value={filters.nama} onChange={onFilterChange} className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                <input type="text" name="nik" placeholder="Cari NIK..." value={filters.nik} onChange={onFilterChange} className="w-full p-2 
[span_246](start_span)border rounded-lg focus:ring-blue-500 focus:border-blue-500" />[span_246](end_span)
                <input type="text" name="kk" placeholder="Cari No. KK..." value={filters.kk} onChange={onFilterChange} className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                {userProfile.role === 'superadmin' && (
                    <>
                        <select name="rt" 
[span_247](start_span)value={filters.rt} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">[span_247](end_span)
                            <option value="semua">Semua RT</option>{OPSI.rt.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                        </select>
                        <select name="rw" value={filters.rw} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 
[span_248](start_span)focus:border-blue-500">[span_248](end_span)
                            <option value="semua">Semua RW</option>{OPSI.rw.map(rw => <option key={rw} value={rw}>{rw}</option>)}
                        </select>
                    </>
                )}
      
                [span_249](start_span)<select name="jenisKelamin" value={filters.jenisKelamin} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">[span_249](end_span)
                    <option value="semua">Semua Jenis Kelamin</option>{OPSI.jenisKelamin.map(jk => <option key={jk} value={jk}>{jk}</option>)}
                </select>
                <select name="statusPernikahan" value={filters.statusPernikahan} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
           
                    [span_250](start_span)<option value="semua">Semua Status Pernikahan</option>{OPSI.statusPernikahan.map(sp => <option key={sp} value={sp}>{sp}</option>)}[span_250](end_span)
                </select>
            </div>
        </div>
    [span_251](start_span));[span_251](end_span)
}

function WargaModal({ isOpen, onClose, wargaData, userProfile }) {
    [span_252](start_span)const [formData, setFormData] = useState({});[span_252](end_span)
    const [selectedPhoto, setSelectedPhoto] = useState(null); // State untuk file foto yang dipilih
    const [photoPreview, setPhotoPreview] = useState(''); // State untuk preview foto
    [span_253](start_span)const [submitting, setSubmitting] = useState(false);[span_253](end_span)

    [span_254](start_span)useEffect(() => {[span_254](end_span)
        const defaultRt = userProfile?.role === 'operator' ? userProfile.rt : OPSI.rt[0];
        const initialData = {
            nama: '', nik: '', kk: '', tempatLahir: '', tanggalLahir: '', tanggalPerkawinan: '', 
            jenisKelamin: OPSI.jenisKelamin[0], statusPernikahan: OPSI.statusPernikahan[0], 
            agama: OPSI.agama[0], pekerjaan: '', pendidikan: OPSI.pendidikan[0],
            alamat: '', rt: defaultRt, rw: OPSI.rw[0], statusTinggal: OPSI.statusTinggal[0], 
            kewarganegaraan: 'WNI', statusHubungan: OPSI.statusHubungan[0],
            golonganDarah: OPSI.golonganDarah[0], namaAyah: '', namaIbu: '', photoUrl: '' // Tambahkan photoUrl
        };
        [span_255](start_span)setFormData(wargaData || initialData);[span_255](end_span)
        // Set photo preview if editing existing data with a photo
        if (wargaData?.photoUrl) {
            setPhotoPreview(wargaData.photoUrl);
        } else {
            setPhotoPreview('');
        }
        setSelectedPhoto(null); // Reset selected file on modal open/data change
    }, [wargaData, userProfile]);

    [span_256](start_span)const handleChange = (e) => {[span_256](end_span)
        const { name, value } = e.target;
        [span_257](start_span)setFormData(prev => ({ ...prev, [name]: value }));[span_257](end_span)
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedPhoto(file);
            setPhotoPreview(URL.createObjectURL(file)); // Create a preview URL
        } else {
            setSelectedPhoto(null);
            setPhotoPreview('');
        }
    };

    const uploadPhotoToCloudinary = async (file) => {
        // Ini adalah bagian konseptual. Anda perlu mengganti ini dengan implementasi
        // nyata untuk mengunggah gambar ke Cloudinary.
        // Contoh: Menggunakan Fetch API atau Cloudinary SDK
        const cloudName = localStorage.getItem('cloudinaryCloudName');
        const uploadPreset = localStorage.getItem('cloudinaryUploadPreset');

        if (!cloudName || !uploadPreset) {
            console.error("Cloudinary credentials are not set in localStorage.");
            alert("Pengaturan Cloudinary belum lengkap. Harap lengkapi di halaman Pengaturan.");
            return null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                console.log("Photo uploaded to Cloudinary:", data.secure_url);
                return data.secure_url;
            } else {
                console.error("Cloudinary upload error:", data);
                alert("Gagal mengunggah foto ke Cloudinary.");
                return null;
            }
        } catch (error) {
            console.error("Error during Cloudinary upload:", error);
            alert("Terjadi kesalahan saat mengunggah foto. Periksa koneksi atau kredensial Cloudinary Anda.");
            return null;
        }
    };

    const handleSubmit = async (e) => {
        [span_258](start_span)e.preventDefault();[span_258](end_span)
        [span_259](start_span)setSubmitting(true);[span_259](end_span)
        try {
            let finalPhotoUrl = formData.photoUrl; // Gunakan URL yang sudah ada jika tidak ada foto baru
            if (selectedPhoto) {
                finalPhotoUrl = await uploadPhotoToCloudinary(selectedPhoto);
                if (!finalPhotoUrl) {
                    setSubmitting(false);
                    return; // Gagal upload, batalkan simpan
                }
            }

            const updatedFormData = { ...formData, photoUrl: finalPhotoUrl };
            [span_260](start_span)const wargaCollectionRef = collection(db, `warga`);[span_260](end_span)
            [span_261](start_span)if (wargaData?.id) {[span_261](end_span)
                [span_262](start_span)const docRef = doc(db, `warga`, wargaData.id);[span_262](end_span)
                [span_263](start_span)await updateDoc(docRef, updatedFormData);[span_263](end_span)
                [span_264](start_span)await createLog(userProfile.email, `Memperbarui data warga: ${formData.nama}`);[span_264](end_span)
            } else {
                [span_265](start_span)await addDoc(wargaCollectionRef, updatedFormData);[span_265](end_span)
                [span_266](start_span)await createLog(userProfile.email, `Menambah warga baru: ${formData.nama}`);[span_266](end_span)
            }
            [span_267](start_span)onClose();[span_267](end_span)
        [span_268](start_span)} catch (error) {[span_268](end_span)
            [span_269](start_span)console.error("Error saving document: ", error);[span_269](end_span)
        [span_270](start_span)} finally {[span_270](end_span)
            [span_271](start_span)setSubmitting(false);[span_271](end_span)
        }
    };
    [span_272](start_span)if (!isOpen) return null;[span_272](end_span)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">{wargaData ? 'Edit Data Warga' : 'Tambah Data Warga'}</h3>
                    [span_273](start_span)<button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button>[span_273](end_span)
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        [span_274](start_span)<InputField label="Nama Lengkap" name="nama" value={formData.nama} onChange={handleChange} required />[span_274](end_span)
                        <InputField label="NIK" name="nik" value={formData.nik} onChange={handleChange} required />
                        [span_275](start_span)<InputField label="No. KK" name="kk" value={formData.kk} onChange={handleChange} required />[span_275](end_span)
                        <InputField label="Tempat Lahir" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} />
                        <InputField label="Tanggal Lahir" name="tanggalLahir" type="date" value={formData.tanggalLahir} onChange={handleChange} />
                        <InputField label="Tanggal Perkawinan" name="tanggalPerkawinan" type="date" value={formData.tanggalPerkawinan} onChange={handleChange} />
                        <SelectField label="Jenis Kelamin" name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} options={OPSI.jenisKelamin} />
                        [span_276](start_span)<SelectField label="Agama" name="agama" value={formData.agama} onChange={handleChange} options={OPSI.agama} />[span_276](end_span)
                        <SelectField label="Status Pernikahan" name="statusPernikahan" value={formData.statusPernikahan} onChange={handleChange} options={OPSI.statusPernikahan} />
                        <SelectField label="Pendidikan Terakhir" name="pendidikan" value={formData.pendidikan} onChange={handleChange} options={OPSI.pendidikan} />
                        [span_277](start_span)<InputField label="Pekerjaan" name="pekerjaan" value={formData.pekerjaan} onChange={handleChange} />[span_277](end_span)
                        <SelectField label="Status Hubungan Keluarga" name="statusHubungan" value={formData.statusHubungan} onChange={handleChange} options={OPSI.statusHubungan} />
                        <SelectField label="Golongan Darah" name="golonganDarah" value={formData.golonganDarah} onChange={handleChange} options={OPSI.golonganDarah} />
                        <InputField label="Nama Ayah" name="namaAyah" value={formData.namaAyah} onChange={handleChange} />
                        <InputField label="Nama Ibu" name="namaIbu" value={formData.namaIbu} onChange={handleChange} />
                        <InputField label="Alamat Lengkap" name="alamat" value={formData.alamat} onChange={handleChange} className="md:col-span-2" />
                        [span_278](start_span)<SelectField label="RT" name="rt" value={formData.rt} onChange={handleChange} options={OPSI.rt} disabled={userProfile?.role === 'operator'} />[span_278](end_span)
                        <SelectField label="RW" name="rw" value={formData.rw} onChange={handleChange} options={OPSI.rw} />
                        <SelectField label="Status Tempat Tinggal" name="statusTinggal" value={formData.statusTinggal} onChange={handleChange} options={OPSI.statusTinggal} />
                        <InputField label="Kewarganegaraan" name="kewarganegaraan" value={formData.kewarganegaraan} onChange={handleChange} />
                        
                        {/* New Photo Upload Field */}
                        <div className="md:col-span-2">
                            <InputField 
                                label="Unggah Foto (Opsional)" 
                                name="photo" 
                                type="file" 
                                onChange={handlePhotoChange} 
                                accept="image/*" 
                            />
                            {photoPreview && (
                                <div className="mt-2">
                                    <img src={photoPreview} alt="Pratinjau Foto" className="max-w-[150px] max-h-[150px] object-cover rounded-md shadow" />
                                </div>
                            )}
                            {formData.photoUrl && !selectedPhoto && (
                                <p className="text-sm text-gray-500 mt-1">Foto saat ini: <a href={formData.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat</a></p>
                            )}
                        </div>

                    </div>
                    [span_279](start_span)<div className="flex justify-end pt-4 border-t mt-4">[span_279](end_span)
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
                        <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
                            {submitting ? [span_280](start_span)'Menyimpan...' : 'Simpan'}[span_280](end_span)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    [span_281](start_span));[span_281](end_span)
}

function ImportModal({ isOpen, onClose, userProfile }) {
    const [file, setFile] = useState(null);
    [span_282](start_span)const [data, setData] = useState([]);[span_282](end_span)
    [span_283](start_span)const [error, setError] = useState('');[span_283](end_span)
    [span_284](start_span)const [importing, setImporting] = useState(false);[span_284](end_span)
    [span_285](start_span)const handleFileChange = (e) => {[span_285](end_span)
        [span_286](start_span)const selectedFile = e.target.files[0];[span_286](end_span)
        if (selectedFile) {
            setFile(selectedFile);
            [span_287](start_span)setError('');[span_287](end_span)
            [span_288](start_span)const reader = new FileReader();[span_288](end_span)
            reader.onload = (event) => {
                try {
                    [span_289](start_span)const workbook = XLSX.read(event.target.result, { type: 'binary' });[span_289](end_span)
                    [span_290](start_span)const sheetName = workbook.SheetNames[0];[span_290](end_span)
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    const headers = jsonData[0];
                    [span_291](start_span)const headerMap = {[span_291](end_span)
                        'Nama Lengkap': 'nama', 'NIK': 'nik', 'No KK': 'kk', 'Tempat Lahir': 'tempatLahir',
                        'Tanggal Lahir': 'tanggalLahir', 'Jenis Kelamin': 'jenisKelamin', 'Agama': 'agama',
                        'Pendidikan': 'pendidikan', 'Pekerjaan': 'pekerjaan', 'Status Pernikahan': 'statusPernikahan',
  
                        [span_292](start_span)'Alamat': 'alamat', 'RT': 'rt', 'RW': 'rw',[span_292](end_span)
                    };
                    [span_293](start_span)const parsedData = jsonData.slice(1).map(row => {[span_293](end_span)
                        let obj = {};
                        headers.forEach((header, index) => {
                            const fieldName = headerMap[header];
          
                            [span_294](start_span)if (fieldName) {[span_294](end_span)
                                obj[fieldName] = row[index];
                            }
                  
                        [span_295](start_span)});[span_295](end_span)
                        return obj;
                    });
                    [span_296](start_span)setData(parsedData);[span_296](end_span)
                } catch (err) {
                    [span_297](start_span)setError("Gagal memproses file. Pastikan format file Excel benar.");[span_297](end_span)
                    [span_298](start_span)console.error(err);[span_298](end_span)
                }
            };
            reader.readAsBinaryString(selectedFile);
        }
    };
    [span_299](start_span)const handleImport = async () => {[span_299](end_span)
        if (data.length === 0) {
            [span_300](start_span)setError("Tidak ada data untuk diimpor.");[span_300](end_span)
            return;
        }
        [span_301](start_span)setImporting(true);[span_301](end_span)
        [span_302](start_span)setError('');[span_302](end_span)
        try {
            [span_303](start_span)const batch = writeBatch(db);[span_303](end_span)
            [span_304](start_span)const wargaCollectionRef = collection(db, "warga");[span_304](end_span)
            
            data.forEach(warga => {
                const docRef = doc(wargaCollectionRef);
                if (userProfile.role === 'operator') {
                    warga.rt = userProfile.rt;
                }
                
                [span_305](start_span)batch.set(docRef, warga);[span_305](end_span)
            });

            [span_306](start_span)await batch.commit();[span_306](end_span)
            [span_307](start_span)await createLog(userProfile.email, `Mengimpor ${data.length} data warga dari file Excel.`);[span_307](end_span)
            onClose();
        [span_308](start_span)} catch (err) {[span_308](end_span)
            [span_309](start_span)setError("Terjadi kesalahan saat menyimpan data ke database.");[span_309](end_span)
            [span_310](start_span)console.error(err);[span_310](end_span)
        [span_311](start_span)} finally {[span_311](end_span)
            [span_312](start_span)setImporting(false);[span_312](end_span)
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Import Data Warga dari Excel</h3>
             
                    [span_313](start_span)<button onClick={onClose}><CloseIcon /></button>[span_313](end_span)
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                        <p className="font-bold">Petunjuk</p>
      
                        [span_314](start_span)<p className="text-sm">Pastikan file Excel Anda memiliki kolom header berikut di baris pertama: <br/> <code className="text-xs">Nama Lengkap, NIK, No KK, Tempat Lahir, Tanggal Lahir, Tanggal Perkawinan, Jenis Kelamin, Agama, Pendidikan, Pekerjaan, Status Pernikahan, Status Hubungan Keluarga, Golongan Darah, Nama Ayah, Nama Ibu, Alamat, RT, RW, Status Tinggal, Kewarganegaraan, URL Foto</code></p>[span_314](end_span)
                    </div>
                    [span_315](start_span)<InputField type="file" label="Pilih File Excel (.xlsx)" name="file" onChange={handleFileChange} accept=".xlsx, .xls" />[span_315](end_span)
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {data.length > 0 && (
                        <div className="text-center bg-gray-50 p-4 rounded-lg">
                        
                            [span_316](start_span)<p className="font-semibold">{data.length} data warga siap untuk diimpor.</p>[span_316](end_span)
                            <p className="text-sm text-gray-600">Contoh: {data[0]?.nama}, {data[0]?.nik}</p>
                        </div>
                    )}
              
                [span_317](start_span)</div>[span_317](end_span)
                <div className="flex justify-end p-4 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2">Batal</button>
                    [span_318](start_span)<button type="button" onClick={handleImport} disabled={importing || data.length === 0} className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300">[span_318](end_span)
                        {importing ? [span_319](start_span)'Mengimpor...' : 'Mulai Import'}[span_319](end_span)
                    </button>
                </div>
            </div>
        </div>
    [span_320](start_span));[span_320](end_span)
}

function ConfirmModal({ onConfirm, onCancel, message }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <h3 className="text-lg font-bold mb-4">Konfirmasi</h3>
                <p className="text-gray-600 mb-6">{message || "Apakah Anda yakin?"}</p>
               
                [span_321](start_span)<div className="flex justify-center space-x-4">[span_321](end_span)
                    <button onClick={onCancel} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Batal</button>
                    <button onClick={onConfirm} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">Hapus</button>
                </div>
            </div>
        </div>
    [span_322](start_span));[span_322](end_span)
}

function InfoModal({ message, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                <h3 className="text-lg font-bold mb-4">Informasi</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center">
 
                    <button onClick={onClose} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                        OK
                    </button>
                </div>
            </div>
  
        </div>
    [span_323](start_span));[span_323](end_span)
}

function InputField({ label, name, type = 'text', value, onChange, required = false, className = '', disabled = false, accept = '' }) {
    return (
        <div className={className}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} id={name} name={name} value={value || ''} onChange={onChange} required={required} disabled={disabled} accept={accept}
                [span_324](start_span)className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />[span_324](end_span)
        </div>
    [span_325](start_span));[span_325](end_span)
}

function SelectField({ label, name, value, onChange, options, required = false, className = '', disabled = false }) {
    // Pastikan options selalu array, jika null/undefined jadi array kosong
    const safeOptions = options || []; 
    return (
        <div className={className}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select id={name} name={name} value={value || ''} onChange={onChange} required={required} disabled={disabled}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                [span_326](start_span){safeOptions.map(option => <option key={option} value={option}>{option}</option>)}[span_326](end_span)
            </select>
        </div>
    [span_327](start_span));[span_327](end_span)
}

function LoadingScreen({ text = "Memuat aplikasi..." }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">{text}</p>
        </div>
    [span_328](start_span));[span_328](end_span)
}

function LoginScreen() {
    const [email, setEmail] = useState('');
    [span_329](start_span)const [password, setPassword] = useState('');[span_329](end_span)
    [span_330](start_span)const [isLogin, setIsLogin] = useState(true);[span_330](end_span)
    const [error, setError] = useState('');
    [span_331](start_span)const [loading, setLoading] = useState(false);[span_331](end_span)
    [span_332](start_span)const handleSubmit = async (e) => {[span_332](end_span)
        [span_333](start_span)e.preventDefault();[span_333](end_span)
        [span_334](start_span)setError('');[span_334](end_span)
        [span_335](start_span)setLoading(true);[span_335](end_span)
        try {
            if (isLogin) {
                [span_336](start_span)await signInWithEmailAndPassword(mainAuth, email, password);[span_336](end_span)
            } else {
                [span_337](start_span)await createUserWithEmailAndPassword(mainAuth, email, password);[span_337](end_span)
            }
        [span_338](start_span)} catch (err) {[span_338](end_span)
            [span_339](start_span)setError(err.message.replace('Firebase: ', ''));[span_339](end_span)
        [span_340](start_span)} finally {[span_340](end_span)
            [span_341](start_span)setLoading(false);[span_341](end_span)
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{isLogin ? 'Login Admin' : 'Buat Akun Admin'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    [span_342](start_span)<InputField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />[span_342](end_span)
                    <InputField label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-blue-300">
    
                        {loading ? [span_343](start_span)'Memproses...' : (isLogin ? 'Login' : 'Buat Akun')}[span_343](end_span)
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    {isLogin ? "Belum punya akun?" [span_344](start_span): "Sudah punya akun?"}[span_344](end_span)
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); [span_345](start_span)}} className="font-semibold text-blue-500 hover:underline ml-1">[span_345](end_span)
                        {isLogin ? [span_346](start_span)'Buat Akun' : 'Login'}[span_346](end_span)
                    </button>
                </p>
            </div>
        </div>
    [span_347](start_span));[span_347](end_span)
}
