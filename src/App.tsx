import React, { useState, useEffect, useMemo } from 'react';
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
    getDoc,
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

// --- IKON (SVG) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAQ9jtfpBlGesndnBWpsZ79PqB2gKF3evM",
  authDomain: "data-kependudukan-fc3b2.firebaseapp.com",
  projectId: "data-kependudukan-fc3b2",
  storageBucket: "data-kependudukan-fc3b2.appspot.com",
  messagingSenderId: "707474702116",
  appId: "1:707474702116:web:a428bd252f9072e0477db1"
};

const mainApp = initializeApp(firebaseConfig);
const mainAuth = getAuth(mainApp);
const db = getFirestore(mainApp);
setLogLevel('debug');

const secondaryApp = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);


// --- DATA KONSTAN ---
const OPSI = {
    agama: ["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Khonghucu", "Lainnya"],
    jenisKelamin: ["Laki-laki", "Perempuan"],
    statusPernikahan: ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"],
    pendidikan: ["Tidak/Belum Sekolah", "SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "Diploma I/II", "Akademi/Diploma III/S. Muda", "Diploma IV/Strata I", "Strata II", "Strata III"],
    statusTinggal: ["Milik Sendiri", "Kontrak/Sewa", "Bebas Sewa", "Dinas", "Lainnya"],
    rt: Array.from({ length: 15 }, (_, i) => `00${i + 1}`.slice(-3)),
    rw: Array.from({ length: 5 }, (_, i) => `00${i + 1}`.slice(-3)),
    roles: ['superadmin', 'operator'],
    statusHubungan: ["Kepala Keluarga", "Istri", "Anak", "Famili Lain"],
    golonganDarah: ["A", "B", "AB", "O", "Tidak Tahu"],
};

// --- FUNGSI BANTU ---
const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};

const createLog = async (userEmail, action) => {
    try {
        await addDoc(collection(db, "logs"), {
            userEmail,
            action,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Error creating log:", error);
    }
};

// --- KOMPONEN UTAMA: App ---
export default function App() {
    const [authState, setAuthState] = useState({
        loading: true,
        user: null,
        userProfile: null,
    });
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(mainAuth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                let profileData = null;
                if (userDocSnap.exists()) {
                    profileData = userDocSnap.data();
                } else {
                    console.log("User profile not found in Firestore, creating default superadmin profile.");
                    profileData = { email: user.email, role: 'superadmin' };
                    await setDoc(userDocRef, profileData);
                }
                setAuthState({ loading: false, user, userProfile: profileData });
            } else {
                setAuthState({ loading: false, user: null, userProfile: null });
            }
        });
        return () => unsubscribe();
    }, []);

    if (authState.loading) {
        return <LoadingScreen text="Mengautentikasi..." />;
    }

    if (!authState.user) {
        return <LoginScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col md:flex-row">
            <Sidebar user={authState.user} userProfile={authState.userProfile} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex-1 flex flex-col">
                <Header user={authState.user} userProfile={authState.userProfile} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-100">
                    {currentPage === 'dashboard' && <Dashboard userProfile={authState.userProfile} />}
                    {currentPage === 'data-warga' && <DataWarga userProfile={authState.userProfile} />}
                    {currentPage === 'manajemen-user' && authState.userProfile?.role === 'superadmin' && <ManajemenUser userProfile={authState.userProfile} />}
                    {currentPage === 'log-aktivitas' && authState.userProfile?.role === 'superadmin' && <AktivitasLog />}
                    {currentPage === 'pengaturan' && <Pengaturan />}
                </main>
                <Footer />
            </div>
        </div>
    );
}

// --- KOMPONEN LAYOUT ---
function Header({ user, userProfile }) {
    const handleLogout = () => {
        signOut(mainAuth).catch(error => console.error("Logout error:", error));
    };

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-700">Sistem Administrasi Kependudukan</h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm hidden md:block">
                    {user.email} (<span className="font-semibold capitalize text-blue-600">{userProfile?.role} {userProfile?.role === 'operator' && `RT ${userProfile.rt}`}</span>)
                </span>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors">
                    <LogoutIcon />
                    <span className="hidden md:block">Logout</span>
                </button>
            </div>
        </header>
    );
}

function Sidebar({ user, userProfile, currentPage, setCurrentPage }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, roles: ['superadmin', 'operator'] },
        { id: 'data-warga', label: 'Data Warga', icon: <DatabaseIcon />, roles: ['superadmin', 'operator'] },
        { id: 'manajemen-user', label: 'Manajemen User', icon: <UsersIcon />, roles: ['superadmin'] },
        { id: 'log-aktivitas', label: 'Log Aktivitas', icon: <ActivityIcon />, roles: ['superadmin'] },
        { id: 'pengaturan', label: 'Pengaturan', icon: <SettingsIcon />, roles: ['superadmin', 'operator'] },
    ];

    return (
        <nav className="bg-white border-r border-gray-200 w-full md:w-64 p-4 flex-shrink-0">
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <UserIcon />
                </div>
                <p className="font-semibold text-center text-sm">{user.email}</p>
                <p className="text-xs text-gray-500 text-center break-all">ID: {user.uid}</p>
            </div>
            <ul>
                {navItems.map(item => (
                    item.roles.includes(userProfile?.role) && (
                        <li key={item.id}>
                            <button
                                onClick={() => setCurrentPage(item.id)}
                                className={`w-full flex items-center space-x-3 p-3 my-1 rounded-lg text-left transition-colors ${
                                    currentPage === item.id 
                                    ? 'bg-blue-500 text-white shadow' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        </li>
                    )
                ))}
            </ul>
        </nav>
    );
}

function Footer() {
    return (
        <footer className="text-center p-4 text-xs text-gray-500 bg-white border-t border-gray-200 mt-auto">
            © {new Date().getFullYear()} Aplikasi Kependudukan Kelurahan. Dibuat dengan ❤️.
        </footer>
    );
}

// --- HALAMAN BARU: PENGATURAN ---
function Pengaturan() {
    const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
    const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');
    const [namaKelurahan, setNamaKelurahan] = useState('');
    const [alamatKelurahan, setAlamatKelurahan] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedCloudName = localStorage.getItem('cloudinaryCloudName');
        const savedUploadPreset = localStorage.getItem('cloudinaryUploadPreset');
        const savedNamaKelurahan = localStorage.getItem('namaKelurahan');
        const savedAlamatKelurahan = localStorage.getItem('alamatKelurahan');
        if (savedCloudName) setCloudinaryCloudName(savedCloudName);
        if (savedUploadPreset) setCloudinaryUploadPreset(savedUploadPreset);
        if (savedNamaKelurahan) setNamaKelurahan(savedNamaKelurahan);
        if (savedAlamatKelurahan) setAlamatKelurahan(savedAlamatKelurahan);
    }, []);

    const handleSave = () => {
        localStorage.setItem('cloudinaryCloudName', cloudinaryCloudName);
        localStorage.setItem('cloudinaryUploadPreset', cloudinaryUploadPreset);
        localStorage.setItem('namaKelurahan', namaKelurahan);
        localStorage.setItem('alamatKelurahan', alamatKelurahan);
        setMessage('Pengaturan berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Pengaturan Aplikasi</h2>
            <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl space-y-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Header Laporan</h3>
                    <p className="text-sm text-gray-600 mb-4">Informasi ini akan ditampilkan di Dashboard dan setiap laporan PDF.</p>
                    <div className="space-y-4">
                        <InputField label="Nama Kelurahan / Desa" name="namaKelurahan" value={namaKelurahan} onChange={(e) => setNamaKelurahan(e.target.value)} placeholder="Contoh: Kelurahan Bahagia" />
                        <InputField label="Alamat" name="alamatKelurahan" value={alamatKelurahan} onChange={(e) => setAlamatKelurahan(e.target.value)} placeholder="Contoh: Jl. Raya Sejahtera No. 1, Kecamatan Makmur" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Pengaturan Cloudinary</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Masukkan informasi dari akun Cloudinary Anda untuk mengaktifkan fitur upload foto.
                        Pastikan Upload Preset diatur ke mode **"Unsigned"**.
                    </p>
                    <div className="space-y-4">
                        <InputField label="Cloud Name" name="cloudName" value={cloudinaryCloudName} onChange={(e) => setCloudinaryCloudName(e.target.value)} placeholder="Contoh: daxxxxxxx" />
                        <InputField label="Upload Preset" name="uploadPreset" value={cloudinaryUploadPreset} onChange={(e) => setCloudinaryUploadPreset(e.target.value)} placeholder="Contoh: ml_default" />
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600">
                        Simpan Pengaturan
                    </button>
                    {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
                </div>
            </div>
        </div>
    );
}


// --- HALAMAN BARU: LOG AKTIVITAS ---
function AktivitasLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

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
                };
            });
            setLogs(logsList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <LoadingScreen text="Memuat log aktivitas..." />;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Log Aktivitas Sistem</h2>
            <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Waktu</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Aktivitas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {log.timestamp.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                </td>
                                <td className="px-6 py-4 font-medium">{log.userEmail}</td>
                                <td className="px-6 py-4">{log.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


// --- HALAMAN MANAJEMEN USER ---
function ManajemenUser({ userProfile }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Fitur hapus user memerlukan implementasi Cloud Function untuk keamanan. Ini hanya simulasi.")) {
            console.log(`Simulasi menghapus user dengan ID: ${userId}`);
        }
    }

    if (loading) return <LoadingScreen text="Memuat data user..." />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Manajemen User</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600">
                    <PlusIcon />
                    <span>Tambah User Baru</span>
                </button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Penugasan</th>
                            <th className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{user.email}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full capitalize">{user.role}</span></td>
                                <td className="px-6 py-4">{user.role === 'operator' ? `RT ${user.rt}` : 'Semua Akses'}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentUserProfile={userProfile} />}
        </div>
    );
}

function AddUserModal({ isOpen, onClose, currentUserProfile }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(OPSI.roles[1]);
    const [rt, setRt] = useState(OPSI.rt[0]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCredential.user;
            const userProfileData = { email: newUser.email, role: role };
            if (role === 'operator') {
                userProfileData.rt = rt;
            }
            await setDoc(doc(db, "users", newUser.uid), userProfileData);
            await createLog(currentUserProfile.email, `Menambah user baru: ${email} (${role})`);
            await signOut(secondaryAuth);
            onClose();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Tambah User Baru</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <InputField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <InputField label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <SelectField label="Role" name="role" value={role} onChange={(e) => setRole(e.target.value)} options={OPSI.roles} />
                    {role === 'operator' && (
                        <SelectField label="Penugasan RT" name="rt" value={rt} onChange={(e) => setRt(e.target.value)} options={OPSI.rt} />
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2">Batal</button>
                        <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300">
                            {submitting ? 'Menyimpan...' : 'Simpan User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- KOMPONEN HALAMAN LAINNYA ---
function Dashboard({ userProfile }) {
    const [wargaList, setWargaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [namaKelurahan, setNamaKelurahan] = useState('');
    const [alamatKelurahan, setAlamatKelurahan] = useState('');

    useEffect(() => {
        const savedNamaKelurahan = localStorage.getItem('namaKelurahan') || 'Kelurahan Anda';
        const savedAlamatKelurahan = localStorage.getItem('alamatKelurahan') || 'Alamat kelurahan belum diatur';
        setNamaKelurahan(savedNamaKelurahan);
        setAlamatKelurahan(savedAlamatKelurahan);

        if (!userProfile) return;
        const wargaCollectionRef = collection(db, 'warga');
        const q = userProfile.role === 'operator' ? query(wargaCollectionRef, where("rt", "==", userProfile.rt)) : query(wargaCollectionRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWargaList(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching data for dashboard:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userProfile]);

    const dashboardData = useMemo(() => {
        const totalWarga = wargaList.length;
        const totalKK = new Set(wargaList.map(w => w.kk)).size;
        const lakiLaki = wargaList.filter(w => w.jenisKelamin === 'Laki-laki').length;
        const perempuan = totalWarga - lakiLaki;
        const janda = wargaList.filter(w => w.jenisKelamin === 'Perempuan' && (w.statusPernikahan === 'Cerai Hidup' || w.statusPernikahan === 'Cerai Mati')).length;
        const duda = wargaList.filter(w => w.jenisKelamin === 'Laki-laki' && (w.statusPernikahan === 'Cerai Hidup' || w.statusPernikahan === 'Cerai Mati')).length;

        const genderData = [{ name: 'Laki-laki', value: lakiLaki }, { name: 'Perempuan', value: perempuan }];
        const ageGroups = { '0-17': 0, '18-35': 0, '36-60': 0, '60+': 0, 'N/A': 0 };
        wargaList.forEach(w => {
            const age = calculateAge(w.tanggalLahir);
            if (age === null) ageGroups['N/A']++;
            else if (age <= 17) ageGroups['0-17']++;
            else if (age <= 35) ageGroups['18-35']++;
            else if (age <= 60) ageGroups['36-60']++;
            else ageGroups['60+']++;
        });
        const ageData = Object.keys(ageGroups).map(key => ({ name: key, jumlah: ageGroups[key] }));
        const wargaPerRT = {};
        wargaList.forEach(warga => {
            const rt = warga.rt || "N/A";
            wargaPerRT[rt] = (wargaPerRT[rt] || 0) + 1;
        });
        const rtData = Object.keys(wargaPerRT).map(rt => ({ name: `RT ${rt}`, jumlah: wargaPerRT[rt] })).sort((a, b) => a.name.localeCompare(b.name));
        return { totalWarga, totalKK, lakiLaki, perempuan, janda, duda, genderData, ageData, rtData };
    }, [wargaList]);

    const GENDER_COLORS = ['#3b82f6', '#ec4899'];

    if (loading) return <LoadingScreen text="Memuat data dashboard..." />;

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800">{namaKelurahan}</h2>
                <p className="text-sm text-gray-500">{alamatKelurahan}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Warga" value={dashboardData.totalWarga} />
                <StatCard title="Total Kepala Keluarga" value={dashboardData.totalKK} />
                <StatCard title="Jumlah Laki-laki" value={dashboardData.lakiLaki} />
                <StatCard title="Jumlah Perempuan" value={dashboardData.perempuan} />
                <StatCard title="Jumlah Janda" value={dashboardData.janda} />
                <StatCard title="Jumlah Duda" value={dashboardData.duda} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Jumlah Warga per RT</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={dashboardData.rtData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="jumlah" fill="#8884d8" name="Jumlah Warga" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md flex flex-col">
                    <h3 className="text-xl font-semibold mb-4">Distribusi Jenis Kelamin</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie data={dashboardData.genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                {dashboardData.genderData.map((entry, index) => (<Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />))}
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4">Distribusi Kelompok Usia</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dashboardData.ageData}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="jumlah" fill="#82ca9d" name="Jumlah Warga" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow">
            <h4 className="text-gray-500 font-medium">{title}</h4>
            <p className="text-4xl font-bold text-blue-600">{value}</p>
        </div>
    );
}

function DataWarga({ userProfile }) {
    const [wargaList, setWargaList] = useState([]);
    const [filteredWarga, setFilteredWarga] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [infoModalMessage, setInfoModalMessage] = useState('');
    const [editingWarga, setEditingWarga] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [filters, setFilters] = useState({
        nama: '', nik: '', kk: '', jenisKelamin: 'semua', statusPernikahan: 'semua', rt: 'semua', rw: 'semua'
    });

    useEffect(() => {
        if (!userProfile) return;
        const wargaCollectionRef = collection(db, 'warga');
        const q = userProfile.role === 'operator' ? query(wargaCollectionRef, where("rt", "==", userProfile.rt)) : query(wargaCollectionRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWargaList(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching data warga:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userProfile]);

    useEffect(() => {
        let data = [...wargaList];
        if (filters.nama) data = data.filter(w => w.nama?.toLowerCase().includes(filters.nama.toLowerCase()));
        if (filters.nik) data = data.filter(w => w.nik?.includes(filters.nik));
        if (filters.kk) data = data.filter(w => w.kk?.includes(filters.kk));
        if (filters.jenisKelamin !== 'semua') data = data.filter(w => w.jenisKelamin === filters.jenisKelamin);
        if (filters.statusPernikahan !== 'semua') data = data.filter(w => w.statusPernikahan === filters.statusPernikahan);
        if (userProfile.role === 'superadmin') {
            if (filters.rt !== 'semua') data = data.filter(w => w.rt === filters.rt);
            if (filters.rw !== 'semua') data = data.filter(w => w.rw === filters.rw);
        }
        setFilteredWarga(data);
    }, [filters, wargaList, userProfile]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setEditingWarga(null);
        setIsModalOpen(true);
    };

    const openEditModal = (warga) => {
        setEditingWarga(warga);
        setIsModalOpen(true);
    };

    const confirmDelete = async (id) => {
        const docRef = doc(db, "warga", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setDeletingId({ id, nama: docSnap.data().nama });
            setShowDeleteConfirm(true);
        }
    };

    const handleDelete = async () => {
        if (deletingId) {
            try {
                await deleteDoc(doc(db, "warga", deletingId.id));
                await createLog(userProfile.email, `Menghapus data warga: ${deletingId.nama}`);
            } catch (error) {
                console.error("Error deleting document: ", error);
            } finally {
                setShowDeleteConfirm(false);
                setDeletingId(null);
            }
        }
    };
    
    const handleExport = () => {
        const dataToExport = filteredWarga.map(w => ({
            'Nama Lengkap': w.nama, 'NIK': w.nik, 'No KK': w.kk, 'Tempat Lahir': w.tempatLahir,
            'Tanggal Lahir': w.tanggalLahir, 'Jenis Kelamin': w.jenisKelamin, 'Agama': w.agama,
            'Pendidikan': w.pendidikan, 'Pekerjaan': w.pekerjaan, 'Status Pernikahan': w.statusPernikahan,
            'Alamat': w.alamat, 'RT': w.rt, 'RW': w.rw,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga");
        XLSX.writeFile(workbook, "DataWarga.xlsx");
        createLog(userProfile.email, `Mengekspor ${dataToExport.length} data warga ke Excel.`);
    };

    const handleShare = () => {
        if (filteredWarga.length === 0) {
            setInfoModalMessage("Tidak ada data untuk dibagikan. Silakan filter data terlebih dahulu.");
            return;
        }

        let reportText = `Laporan Data Warga (Total: ${filteredWarga.length} orang)\n\n`;
        filteredWarga.slice(0, 20).forEach((w, index) => { // Batasi 20 data pertama untuk WhatsApp
            reportText += `${index + 1}. ${w.nama} - NIK: ${w.nik} - RT/RW: ${w.rt}/${w.rw}\n`;
        });
        if (filteredWarga.length > 20) {
            reportText += "\n...dan data lainnya.";
        }

        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
        window.open(whatsappUrl, '_blank');
        createLog(userProfile.email, `Membagikan laporan ${filteredWarga.length} warga via WhatsApp.`);
    };
    
    const handleDownloadPdf = () => {
        if (filteredWarga.length === 0) {
            setInfoModalMessage("Tidak ada data untuk diunduh. Silakan filter data terlebih dahulu.");
            return;
        }

        const doc = new jsPDF();
        doc.text("Laporan Data Warga", 14, 16);
        doc.setFontSize(10);
        doc.text(`Total: ${filteredWarga.length} warga`, 14, 22);
        
        const tableColumn = ["No", "Nama", "NIK", "No KK", "Jenis Kelamin", "Pekerjaan", "Pendidikan", "Status Nikah", "RT/RW"];
        const tableRows = [];

        filteredWarga.forEach((warga, index) => {
            const wargaData = [
                index + 1,
                warga.nama || '',
                warga.nik || '',
                warga.kk || '',
                warga.jenisKelamin || '',
                warga.pekerjaan || '',
                warga.pendidikan || '',
                warga.statusPernikahan || '',
                `${warga.rt || ''}/${warga.rw || ''}`
            ];
            tableRows.push(wargaData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 28,
        });
        
        doc.save("laporan_warga.pdf");
        createLog(userProfile.email, `Mengunduh laporan PDF berisi ${filteredWarga.length} data warga.`);
    };

    if (loading) return <LoadingScreen text="Memuat data warga..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Manajemen Data Warga {userProfile.role === 'operator' && `RT ${userProfile.rt}`}</h2>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-gray-700 transition-colors">
                        <ImportIcon />
                        <span>Import</span>
                    </button>
                    <button onClick={handleExport} className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-green-700 transition-colors">
                        <ExportIcon />
                        <span>Export</span>
                    </button>
                    <button onClick={handleDownloadPdf} className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-red-700 transition-colors">
                        <PdfIcon />
                        <span>PDF</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center space-x-2 bg-teal-500 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-teal-600 transition-colors">
                        <WhatsAppIcon />
                        <span>Share</span>
                    </button>
                    <button onClick={openAddModal} className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 text-sm rounded-lg shadow hover:bg-blue-600 transition-colors">
                        <PlusIcon />
                        <span>Tambah Warga</span>
                    </button>
                </div>
            </div>

            <FilterSection filters={filters} onFilterChange={handleFilterChange} userProfile={userProfile} />

            <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nama</th><th className="px-6 py-3">NIK</th><th className="px-6 py-3">Pekerjaan</th>
                            <th className="px-6 py-3">Pendidikan</th><th className="px-6 py-3">Alamat</th><th className="px-6 py-3">RT/RW</th>
                            <th className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWarga.length > 0 ? filteredWarga.map(warga => (
                            <tr key={warga.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{warga.nama}</td>
                                <td className="px-6 py-4">{warga.nik}</td><td className="px-6 py-4">{warga.pekerjaan}</td>
                                <td className="px-6 py-4">{warga.pendidikan}</td><td className="px-6 py-4">{warga.alamat}</td>
                                <td className="px-6 py-4">{warga.rt}/{warga.rw}</td>
                                <td className="px-6 py-4 flex items-center space-x-2">
                                    <button onClick={() => openEditModal(warga)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon /></button>
                                    <button onClick={() => confirmDelete(warga.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" className="text-center py-8 text-gray-500">Tidak ada data yang cocok dengan filter.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <WargaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} wargaData={editingWarga} userProfile={userProfile} />}
            {isImportModalOpen && <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} userProfile={userProfile} />}
            {infoModalMessage && <InfoModal message={infoModalMessage} onClose={() => setInfoModalMessage('')} />}
            {showDeleteConfirm && <ConfirmModal onConfirm={handleDelete} onCancel={() => setShowDeleteConfirm(false)} message={`Apakah Anda yakin ingin menghapus data warga: ${deletingId?.nama}?`} />}
        </div>
    );
}

function FilterSection({ filters, onFilterChange, userProfile }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" name="nama" placeholder="Cari Nama..." value={filters.nama} onChange={onFilterChange} className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                <input type="text" name="nik" placeholder="Cari NIK..." value={filters.nik} onChange={onFilterChange} className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                <input type="text" name="kk" placeholder="Cari No. KK..." value={filters.kk} onChange={onFilterChange} className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                {userProfile.role === 'superadmin' && (
                    <>
                        <select name="rt" value={filters.rt} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                            <option value="semua">Semua RT</option>{OPSI.rt.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                        </select>
                        <select name="rw" value={filters.rw} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                            <option value="semua">Semua RW</option>{OPSI.rw.map(rw => <option key={rw} value={rw}>{rw}</option>)}
                        </select>
                    </>
                )}
                <select name="jenisKelamin" value={filters.jenisKelamin} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                    <option value="semua">Semua Jenis Kelamin</option>{OPSI.jenisKelamin.map(jk => <option key={jk} value={jk}>{jk}</option>)}
                </select>
                <select name="statusPernikahan" value={filters.statusPernikahan} onChange={onFilterChange} className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                    <option value="semua">Semua Status Pernikahan</option>{OPSI.statusPernikahan.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                </select>
            </div>
        </div>
    );
}

function WargaModal({ isOpen, onClose, wargaData, userProfile }) {
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const defaultRt = userProfile?.role === 'operator' ? userProfile.rt : OPSI.rt[0];
        const initialData = {
            nama: '', nik: '', kk: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: OPSI.jenisKelamin[0],
            statusPernikahan: OPSI.statusPernikahan[0], agama: OPSI.agama[0], pekerjaan: '', pendidikan: OPSI.pendidikan[0],
            alamat: '', rt: defaultRt, rw: OPSI.rw[0], statusTinggal: OPSI.statusTinggal[0], kewarganegaraan: 'WNI',
        };
        setFormData(wargaData || initialData);
    }, [wargaData, userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const wargaCollectionRef = collection(db, `warga`);
            if (wargaData?.id) {
                const docRef = doc(db, `warga`, wargaData.id);
                await updateDoc(docRef, formData);
                await createLog(userProfile.email, `Memperbarui data warga: ${formData.nama}`);
            } else {
                await addDoc(wargaCollectionRef, formData);
                await createLog(userProfile.email, `Menambah warga baru: ${formData.nama}`);
            }
            onClose();
        } catch (error) {
            console.error("Error saving document: ", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">{wargaData ? 'Edit Data Warga' : 'Tambah Data Warga'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nama Lengkap" name="nama" value={formData.nama} onChange={handleChange} required />
                        <InputField label="NIK" name="nik" value={formData.nik} onChange={handleChange} required />
                        <InputField label="No. KK" name="kk" value={formData.kk} onChange={handleChange} required />
                        <InputField label="Tempat Lahir" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} />
                        <InputField label="Tanggal Lahir" name="tanggalLahir" type="date" value={formData.tanggalLahir} onChange={handleChange} />
                        <SelectField label="Jenis Kelamin" name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} options={OPSI.jenisKelamin} />
                        <SelectField label="Agama" name="agama" value={formData.agama} onChange={handleChange} options={OPSI.agama} />
                        <SelectField label="Status Pernikahan" name="statusPernikahan" value={formData.statusPernikahan} onChange={handleChange} options={OPSI.statusPernikahan} />
                        <SelectField label="Pendidikan Terakhir" name="pendidikan" value={formData.pendidikan} onChange={handleChange} options={OPSI.pendidikan} />
                        <InputField label="Pekerjaan" name="pekerjaan" value={formData.pekerjaan} onChange={handleChange} />
                        <InputField label="Alamat Lengkap" name="alamat" value={formData.alamat} onChange={handleChange} className="md:col-span-2" />
                        <SelectField label="RT" name="rt" value={formData.rt} onChange={handleChange} options={OPSI.rt} disabled={userProfile?.role === 'operator'} />
                        <SelectField label="RW" name="rw" value={formData.rw} onChange={handleChange} options={OPSI.rw} />
                        <SelectField label="Status Tempat Tinggal" name="statusTinggal" value={formData.statusTinggal} onChange={handleChange} options={OPSI.statusTinggal} />
                        <InputField label="Kewarganegaraan" name="kewarganegaraan" value={formData.kewarganegaraan} onChange={handleChange} />
                    </div>
                    <div className="flex justify-end pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
                        <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ImportModal({ isOpen, onClose, userProfile }) {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [importing, setImporting] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const workbook = XLSX.read(event.target.result, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    const headers = jsonData[0];
                    const headerMap = {
                        'Nama Lengkap': 'nama', 'NIK': 'nik', 'No KK': 'kk', 'Tempat Lahir': 'tempatLahir',
                        'Tanggal Lahir': 'tanggalLahir', 'Jenis Kelamin': 'jenisKelamin', 'Agama': 'agama',
                        'Pendidikan': 'pendidikan', 'Pekerjaan': 'pekerjaan', 'Status Pernikahan': 'statusPernikahan',
                        'Alamat': 'alamat', 'RT': 'rt', 'RW': 'rw',
                    };

                    const parsedData = jsonData.slice(1).map(row => {
                        let obj = {};
                        headers.forEach((header, index) => {
                            const fieldName = headerMap[header];
                            if (fieldName) {
                                obj[fieldName] = row[index];
                            }
                        });
                        return obj;
                    });

                    setData(parsedData);
                } catch (err) {
                    setError("Gagal memproses file. Pastikan format file Excel benar.");
                    console.error(err);
                }
            };
            reader.readAsBinaryString(selectedFile);
        }
    };

    const handleImport = async () => {
        if (data.length === 0) {
            setError("Tidak ada data untuk diimpor.");
            return;
        }
        setImporting(true);
        setError('');
        try {
            const batch = writeBatch(db);
            const wargaCollectionRef = collection(db, "warga");
            
            data.forEach(warga => {
                const docRef = doc(wargaCollectionRef);
                if (userProfile.role === 'operator') {
                    warga.rt = userProfile.rt;
                }
                batch.set(docRef, warga);
            });

            await batch.commit();
            await createLog(userProfile.email, `Mengimpor ${data.length} data warga dari file Excel.`);
            onClose();
        } catch (err) {
            setError("Terjadi kesalahan saat menyimpan data ke database.");
            console.error(err);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Import Data Warga dari Excel</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                        <p className="font-bold">Petunjuk</p>
                        <p className="text-sm">Pastikan file Excel Anda memiliki kolom header berikut di baris pertama: <br/> <code className="text-xs">Nama Lengkap, NIK, No KK, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Agama, Pendidikan, Pekerjaan, Status Pernikahan, Alamat, RT, RW</code></p>
                    </div>
                    <InputField type="file" label="Pilih File Excel (.xlsx)" name="file" onChange={handleFileChange} accept=".xlsx, .xls" />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {data.length > 0 && (
                        <div className="text-center bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold">{data.length} data warga siap untuk diimpor.</p>
                            <p className="text-sm text-gray-600">Contoh: {data[0]?.nama}, {data[0]?.nik}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end p-4 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2">Batal</button>
                    <button type="button" onClick={handleImport} disabled={importing || data.length === 0} className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300">
                        {importing ? 'Mengimpor...' : 'Mulai Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ConfirmModal({ onConfirm, onCancel, message }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <h3 className="text-lg font-bold mb-4">Konfirmasi</h3>
                <p className="text-gray-600 mb-6">{message || "Apakah Anda yakin?"}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onCancel} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400">Batal</button>
                    <button onClick={onConfirm} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">Hapus</button>
                </div>
            </div>
        </div>
    );
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
    );
}

function InputField({ label, name, type = 'text', value, onChange, required = false, className = '', disabled = false, accept = '' }) {
    return (
        <div className={className}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} id={name} name={name} value={value || ''} onChange={onChange} required={required} disabled={disabled} accept={accept}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
        </div>
    );
}

function SelectField({ label, name, value, onChange, options, required = false, className = '', disabled = false }) {
    return (
        <div className={className}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select id={name} name={name} value={value || ''} onChange={onChange} required={required} disabled={disabled}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        </div>
    );
}

function LoadingScreen({ text = "Memuat aplikasi..." }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">{text}</p>
        </div>
    );
}

function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(mainAuth, email, password);
            } else {
                await createUserWithEmailAndPassword(mainAuth, email, password);
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{isLogin ? 'Login Admin' : 'Buat Akun Admin'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <InputField label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                        {loading ? 'Memproses...' : (isLogin ? 'Login' : 'Buat Akun')}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-blue-500 hover:underline ml-1">
                        {isLogin ? 'Buat Akun' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
}
