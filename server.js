// server.js - CBT Lengkap dengan Semua Fitur Asli + Fitur Baru (OPTIMIZED)
const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const http = require('http');
const { Server } = require('socket.io');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Inisialisasi database dengan default termasuk fitur baru
try {
    db.defaults({
        siswa: [],
        bankSoal: [],
        ujian: {
            paket: [],
            tampilkanNilai: true,
            maxPelanggaran: 3,
            pesanPelanggaran: 'Anda terdeteksi berpindah tab atau aplikasi. Ujian Anda dihentikan. Serahkan perangkat Anda kepada pengawas ujian.',
            deteksiPelanggaran: true,
            alarmType: 'beep',
            alarmDurasi: 3000,
            acakSoal: false,
            durasiPerPaket: true
        },
        pengaturan: {
            namaSekolah: "SMK PEMBANGUNAN SURABAYA",
            namaAplikasi: "CBT Online",
            ukuranSekolah: 18,
            ukuranAplikasi: 13,
            tema: "green",
            temaLogin: "green",
            layoutLogin: "modern"
        }
    }).write();
} catch (e) {
    console.error('DB init error:', e);
    fs.writeFileSync('db.json', JSON.stringify({
        siswa: [], bankSoal: [],
        ujian: {
            paket: [], tampilkanNilai: true,
            maxPelanggaran: 3,
            pesanPelanggaran: 'Anda terdeteksi berpindah tab atau aplikasi. Ujian Anda dihentikan.',
            deteksiPelanggaran: true,
            alarmType: 'beep',
            alarmDurasi: 3000,
            acakSoal: false,
            durasiPerPaket: true
        },
        pengaturan: { namaSekolah: "SMK PEMBANGUNAN SURABAYA", namaAplikasi: "CBT Online", ukuranSekolah: 18, ukuranAplikasi: 13, tema: "green", temaLogin: "green", layoutLogin: "modern" }
    }, null, 2));
}

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login-admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/ujian', (req, res) => res.sendFile(path.join(__dirname, 'public', 'ujian.html')));
app.get('/cetak-kartu', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cetak-kartu.html')));

app.post('/logout', (req, res) => {
    db.get('siswa').find({ id: req.body.userId }).assign({ login: false }).write();
    flushCache(); res.json({ success: true });
});

// Cache sederhana dengan improvement
let cache = { siswa: null, bank: null, ujian: null, pengaturan: null, time: 0 };
const CACHE_TTL = 1000;
function flushCache() { cache.time = 0; cache.siswa = cache.bank = cache.ujian = cache.pengaturan = null; }
function gc(key) {
    if (Date.now() - cache.time > CACHE_TTL) {
        cache.siswa = cache.bank = cache.ujian = cache.pengaturan = null;
    }
    return cache[key];
}
function sc(key, val) { cache.time = Date.now(); cache[key] = val; }

function hitungNA(siswa, ujian) {
    const pg = Number(siswa.nilaiOtomatis) || 0;
    const esai = Number(siswa.nilaiEsai) || 0;
    const cfg = (ujian.paket || []).find(p => p.paketId == siswa.paketId && p.kelas === siswa.kelas);
    const bPG = cfg ? Number(cfg.bobotPG || 60) : 60;
    const bEsai = cfg ? Number(cfg.bobotEsai || 40) : 40;
    return (pg * bPG / 100) + (esai * bEsai / 100);
}

function normalizeKunci(raw) {
    if (!raw) return '';
    let cleaned = raw.toString().replace(/^KUNCI\s*[:\s]+/i, '').trim();
    var upper = cleaned.toUpperCase().replace(/\s+/g, '');
    if (upper === 'ESAI' || upper === 'ESAY') return 'ESAI';
    cleaned = cleaned.replace(/\s*,\s*/g, ',');
    cleaned = cleaned.replace(/[^A-E0-9,\-]/g, '');
    return cleaned.toUpperCase();
}

// GET endpoints
app.get('/get-ujian', (req, res) => {
    let d = gc('ujian'); if (!d) { d = db.get('ujian').value(); sc('ujian', d); }
    res.json(d);
});
app.get('/get-siswa', (req, res) => {
    let d = gc('siswa'); if (!d) { d = db.get('siswa').value(); sc('siswa', d); }
    res.json(d);
});
app.get('/get-bank-soal', (req, res) => {
    let d = gc('bank'); if (!d) { d = db.get('bankSoal').value(); sc('bank', d); }
    res.json(d);
});
app.get('/get-pengaturan', (req, res) => {
    let d = gc('pengaturan'); if (!d) { d = db.get('pengaturan').value(); sc('pengaturan', d); }
    res.json(d);
});

// FITUR 6: Hapus Semua Siswa
app.post('/hapus-semua-siswa', (req, res) => {
    try {
        const count = db.get('siswa').value().length;
        db.set('siswa', []).write();
        flushCache();
        log(`SEMUA SISWA DIHAPUS (${count} data) oleh admin`);
        res.json({ success: true, message: `${count} data siswa berhasil dihapus` });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.get('/admin/stats', (req, res) => {
    try {
        const siswa = db.get('siswa').value();
        const bankSoal = db.get('bankSoal').value();
        const ujian = db.get('ujian').value();
        const aktifpaket = db.get('paket').value();
        const selesai = siswa.filter(s => s.status === 'Selesai').length;
        const belum = siswa.filter(s => s.status !== 'Selesai' && s.status !== 'Diblokir').length;
        const diblokir = siswa.filter(s => s.status === 'Diblokir').length;
        const aktif = aktifpaket.filter(s => s.aktif === true).length;
        let totalNa = 0, countNa = 0;
        let dist = { A: 0, B: 0, C: 0, D: 0 };
        let kelasMap = {};
        siswa.forEach(s => {
            const k = s.kelas || 'Tanpa Kelas';
            if (!kelasMap[k]) kelasMap[k] = { total: 0, selesai: 0, na: 0, countNa: 0 };
            kelasMap[k].total++;
            if (s.status === 'Selesai') {
                kelasMap[k].selesai++;
                const na = s.na !== undefined ? Number(s.na) : hitungNA(s, ujian);
                totalNa += na; countNa++;
                kelasMap[k].na += na; kelasMap[k].countNa++;
                if (na >= 85) dist.A++;
                else if (na >= 70) dist.B++;
                else if (na >= 55) dist.C++;
                else dist.D++;
            }
        });
        let rekapKelas = Object.entries(kelasMap).map(([k, v]) => ({
            kelas: k, total: v.total, selesai: v.selesai,
            rata: v.countNa > 0 ? (v.na / v.countNa).toFixed(2) : 0
        })).sort((a, b) => a.kelas.localeCompare(b.kelas));
        res.json({
            success: true, totalSiswa: siswa.length, totalBankSoal: bankSoal.length,
            totalUjianAktif: aktifpaket.length, siswaSelesai: selesai,
            siswaBelum: belum, siswaDiblokir: diblokir,
            rataRataNilai: countNa > 0 ? (totalNa / countNa).toFixed(2) : 0,
            distribusiNilai: dist, rekapKelas: rekapKelas
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/review-jawaban/:id', (req, res) => {
    try {
        const siswa = db.get('siswa').find({ id: req.params.id }).value();
        if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
        const bank = db.get('bankSoal').find({ id: Number(siswa.paketId) }).value();
        if (!bank) return res.status(404).json({ success: false, message: 'Paket soal tidak ditemukan' });
        const review = bank.daftarSoal.map((soal, idx) => {
            const raw = siswa.jawabanSiswa ? siswa.jawabanSiswa[String(idx)] : null;
            const kunci = normalizeKunci(soal.kunci);
            const isEsai = kunci === 'ESAI';
            const isMJ = (soal.tipe || '').toUpperCase() === 'MENJODOHKAN'
                || soal.konten.indexOf('|') !== -1
                || /^\d+-[A-E](,\d+-[A-E])+$/i.test(kunci);
            const isKompleks = kunci.includes(',') && !isMJ && !isEsai;
            let jawabanText = '(tidak dijawab)', kunciText = kunci, benar = false;
            if (isEsai) { jawabanText = raw || '(tidak dijawab)'; kunciText = 'Esai — koreksi manual'; }
            else if (isMJ && typeof raw === 'object') {
                const kunciMap = {};
                kunci.split(',').forEach(part => {
                    const m = part.trim().match(/^(\d+)-([A-E])$/i);
                    if (m) kunciMap[Number(m[1])] = m[2].toUpperCase();
                });
                let allCorrect = true, anyAnswered = false;
                Object.keys(kunciMap).forEach(itemNum => {
                    const userAns = (raw[Number(itemNum)] || '').toUpperCase().trim();
                    if (userAns) anyAnswered = true;
                    if (userAns !== kunciMap[Number(itemNum)]) allCorrect = false;
                });
                jawabanText = Object.entries(raw).sort((a, b) => +a[0] - +b[0]).map(e => e[0] + '-' + e[1]).join(', ');
                benar = allCorrect && anyAnswered;
            } else {
                jawabanText = raw ? String(raw) : '(tidak dijawab)';
                const jawabanNorm = String(jawabanText).replace(/\s*,\s*/g, '').toUpperCase();
                const kunciNorm = kunci.replace(/\s*,\s*/g, '').toUpperCase();
                benar = jawabanNorm === kunciNorm && jawabanNorm !== '';
            }
            let pilihanHtml = '';
            if (soal.pilihan && soal.pilihan.length) {
                pilihanHtml = soal.pilihan.map((p, i) => {
                    const huruf = String.fromCharCode(65 + i);
                    const jawabanNorm = String(jawabanText).replace(/\s*,\s*/g, '').toUpperCase();
                    const kunciNorm = kunci.replace(/\s*,\s*/g, '').toUpperCase();
                    const isJawaban = jawabanNorm.includes(huruf) && !isMJ;
                    const isKunci = kunciNorm.includes(huruf) && !isMJ && !isEsai;
                    let cls = '';
                    if (isKunci && isJawaban) cls = 'bg-success text-white';
                    else if (isKunci) cls = 'bg-success bg-opacity-25 border border-success';
                    else if (isJawaban) cls = 'bg-danger bg-opacity-25 border border-danger';
                    return '<span class="badge ' + cls + ' me-1 mb-1" style="font-size:12px">' + huruf + '. ' + p + '</span>';
                }).join('');
            }
            return { nomor: idx + 1, konten: soal.konten, pilihanHtml, jawaban: jawabanText, kunci: kunciText, benar, tipe: isEsai ? 'ESAI' : isMJ ? 'MENJODOHKAN' : isKompleks ? 'KOMPLEKS' : 'PG' };
        });
        res.json({ success: true, siswa, review, mapel: bank.mapel, kelas: bank.kelas });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST endpoints untuk pengaturan ujian
app.post('/simpan-semua-ujian', (req, res) => {
    try {
        const { durasi, tampilkanNilai, paket, acakSoal, durasiPerPaket } = req.body;
        if (!Array.isArray(paket)) return res.status(400).json({ success: false, message: 'Data tidak valid' });
        const banks = db.get('bankSoal').value();
        for (let item of paket) {
            if (!banks.find(b => b.id === Number(item.paketId))) return res.status(400).json({ success: false, message: 'Paket ID ' + item.paketId + ' tidak ditemukan' });
            const bPG = Number(item.bobotPG) || 0, bEsai = Number(item.bobotEsai) || 0;
            if (bPG + bEsai !== 100) return res.status(400).json({ success: false, message: 'Bobot harus 100%' });
        }
        if (durasi !== undefined) db.set('ujian.durasi', Math.max(1, Number(durasi))).write();
        if (tampilkanNilai !== undefined) db.set('ujian.tampilkanNilai', !!tampilkanNilai).write();
        if (acakSoal !== undefined) db.set('ujian.acakSoal', !!acakSoal).write();
        if (durasiPerPaket !== undefined) db.set('ujian.durasiPerPaket', !!durasiPerPaket).write();
        db.set('ujian.paket', paket).write();
        flushCache();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/set-tampilkan-nilai', (req, res) => {
    db.set('ujian.tampilkanNilai', !!req.body.tampilkanNilai).write();
    flushCache(); res.json({ success: true });
});

app.post('/set-diblokir', (req, res) => {
    db.get('siswa').find({ id: req.body.userId }).assign({ status: 'Diblokir' }).write();
    flushCache(); res.json({ success: true });
});

app.post('/update-keamanan', (req, res) => {
    try {
        const { maxPelanggaran, pesanPelanggaran, deteksiPelanggaran, alarmType, alarmDurasi } = req.body;
        if (maxPelanggaran !== undefined) db.set('ujian.maxPelanggaran', Math.max(1, Math.min(20, Number(maxPelanggaran) || 3))).write();
        if (pesanPelanggaran !== undefined) db.set('ujian.pesanPelanggaran', (pesanPelanggaran || '').toString()).write();
        if (deteksiPelanggaran !== undefined) db.set('ujian.deteksiPelanggaran', !!deteksiPelanggaran).write();
        if (alarmType !== undefined) db.set('ujian.alarmType', (alarmType || 'beep').toString()).write();
        if (alarmDurasi !== undefined) db.set('ujian.alarmDurasi', Math.min(10000, Math.max(1000, Number(alarmDurasi) || 3000))).write();
        flushCache();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/update-tema', (req, res) => {
    try {
        const { tema, temaLogin, layoutLogin } = req.body;
        if (tema) db.set('pengaturan.tema', tema).write();
        if (temaLogin) db.set('pengaturan.temaLogin', temaLogin).write();
        if (layoutLogin) db.set('pengaturan.layoutLogin', layoutLogin).write();
        flushCache();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/update-pengaturan', (req, res) => {
    db.set('pengaturan', {
        namaSekolah: (req.body.namaSekolah || '').toString(),
        namaAplikasi: (req.body.namaAplikasi || '').toString(),
        ukuranSekolah: Math.max(10, Math.min(40, Number(req.body.ukuranSekolah) || 18)),
        ukuranAplikasi: Math.max(8, Math.min(30, Number(req.body.ukuranAplikasi) || 13)),
        tema: req.body.tema || 'green',
        temaLogin: req.body.temaLogin || 'green',
        layoutLogin: req.body.layoutLogin || 'modern'
    }).write();
    flushCache();
    res.json({ success: true });
});

app.post('/login-siswa', (req, res) => {
    try {
        const username = (req.body.username || req.body.nis || '').toString().trim();
        if (!username) return res.status(400).json({ success: false, message: 'NIS tidak boleh kosong!' });

        const user = db.get('siswa').find({ username: username }).value();
        const ujianConfig = db.get('ujian').value();

        if (!user) return res.status(404).json({ success: false, message: 'NIS tidak ditemukan!' });
        if (user.status === 'Selesai') return res.status(403).json({ success: false, message: 'Anda sudah mengerjakan ujian ini!' });
        if (user.status === 'Diblokir') return res.status(403).json({ success: false, message: 'Ujian Anda diblokir karena pelanggaran. Hubungi admin.' });

        const paketForKelas = (ujianConfig.paket || []).find(p => p.kelas === user.kelas);
        if (!paketForKelas) return res.status(400).json({ success: false, message: 'Belum ada ujian aktif untuk kelas ' + user.kelas });

        const paketSoal = db.get('bankSoal').find({ id: Number(paketForKelas.paketId) }).value();
        if (!paketSoal) return res.status(400).json({ success: false, message: 'Paket soal tidak ditemukan' });
        if (!paketSoal.daftarSoal || !paketSoal.daftarSoal.length) return res.status(400).json({ success: false, message: 'Paket soal kosong!' });

        let daftarSoal = [...paketSoal.daftarSoal];
        if (ujianConfig.acakSoal) {
            for (let i = daftarSoal.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [daftarSoal[i], daftarSoal[j]] = [daftarSoal[j], daftarSoal[i]];
            }
        }

        let durasiUjian = ujianConfig.durasi || 60;
        if (ujianConfig.durasiPerPaket && paketForKelas.durasi) durasiUjian = paketForKelas.durasi;

        res.json({
            success: true,
            user,
            config: {
                aktifId: paketForKelas.paketId,
                durasi: durasiUjian,
                tampilkanNilai: ujianConfig.tampilkanNilai !== false,
                bobotPG: paketForKelas.bobotPG || 60,
                bobotEsai: paketForKelas.bobotEsai || 40
            },
            soal: daftarSoal,
            mapelAsli: paketSoal.mapel,
            security: {
                maxPelanggaran: Number(ujianConfig.maxPelanggaran) || 3,
                pesanPelanggaran: ujianConfig.pesanPelanggaran || 'Anda terdeteksi berpindah tab atau aplikasi. Ujian Anda dihentikan. Serahkan perangkat Anda kepada pengawas ujian.',
                pelanggaranSaatIni: user.pelanggaran || 0,
                deteksiPelanggaran: ujianConfig.deteksiPelanggaran !== false,
                alarmType: ujianConfig.alarmType || 'beep',
                alarmDurasi: ujianConfig.alarmDurasi || 3000
            }
        });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/simpan-hasil', (req, res) => {
    try {
        const { userId, nilaiOtomatis, detailJawaban, paketId } = req.body;
        const siswa = db.get('siswa').find({ id: userId }).value();
        if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
        if (siswa.status === 'Diblokir') return res.status(403).json({ success: false, message: 'Siswa diblokir' });
        const ujian = db.get('ujian').value();
        const pg = Number(nilaiOtomatis) || 0;
        const cfg = (ujian.paket || []).find(p => p.paketId == paketId && p.kelas === siswa.kelas);
        const bPG = cfg ? Number(cfg.bobotPG || 60) : 60;
        const na = (pg * bPG / 100);
        db.get('siswa').find({ id: userId }).assign({
            status: 'Selesai', nilaiOtomatis: pg, totalNilai: pg,
            nilaiEsai: 0, na: na, jawabanSiswa: detailJawaban,
            paketId: paketId || null, pelanggaran: siswa.pelanggaran || 0,
            logPelanggaran: siswa.logPelanggaran || [], selesaiOtomatis: false
        }).write();
        flushCache();
        if (global.io) {
            global.io.emit('siswa-selesai', { nama: siswa.nama, kelas: siswa.kelas, nilai: pg });
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/autosave', (req, res) => {
    try {
        const { userId, jawaban } = req.body;
        db.get('siswa').find({ id: userId }).assign({ jawabanAutoSave: jawaban }).write();
        res.json({ success: true });
    } catch(e) { res.status(500).json({ success: false }); }
});

app.post('/update-nilai-esai', (req, res) => {
    try {
        const { id, nilaiEsai } = req.body;
        const siswa = db.get('siswa').find({ id: id }).value();
        if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
        const ujian = db.get('ujian').value();
        const pg = Number(siswa.nilaiOtomatis) || 0;
        const esai = Math.min(100, Math.max(0, Number(nilaiEsai) || 0));
        const cfg = (ujian.paket || []).find(p => p.paketId == siswa.paketId && p.kelas === siswa.kelas);
        const bPG = cfg ? Number(cfg.bobotPG || 60) : 60;
        const bEsai = cfg ? Number(cfg.bobotEsai || 40) : 40;
        const na = (pg * bPG / 100) + (esai * bEsai / 100);
        db.get('siswa').find({ id: id }).assign({ nilaiEsai: esai, totalNilai: pg + esai, na: na }).write();
        flushCache(); res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/log-pelanggaran', (req, res) => {
    try {
        const { userId } = req.body;
        const siswa = db.get('siswa').find({ id: userId }).value();
        if (!siswa) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
        const ujian = db.get('ujian').value();
        if (ujian.deteksiPelanggaran === false) return res.json({ success: true, blocked: false, count: 0, max: 0, disabled: true });
        if (siswa.status === 'Diblokir') return res.json({ success: true, blocked: true, count: siswa.pelanggaran || 0 });
        if (siswa.status === 'Selesai') return res.json({ success: true, blocked: false, count: siswa.pelanggaran || 0 });
        const maxP = Number(ujian.maxPelanggaran) || 3;
        const newCount = (siswa.pelanggaran || 0) + 1;
        let log = Array.isArray(siswa.logPelanggaran) ? siswa.logPelanggaran : [];
        log.push(new Date().toISOString());
        if (newCount >= maxP) {
            db.get('siswa').find({ id: userId }).assign({
                status: 'Diblokir', pelanggaran: newCount, logPelanggaran: log, selesaiOtomatis: true
            }).write();
            flushCache();
            return res.json({ success: true, blocked: true, count: newCount, pesan: ujian.pesanPelanggaran || 'Anda terdeteksi berpindah tab. Ujian dihentikan.' });
        }
        db.get('siswa').find({ id: userId }).assign({ pelanggaran: newCount, logPelanggaran: log }).write();
        flushCache();
        return res.json({ success: true, blocked: false, count: newCount, max: maxP });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/add-siswa', (req, res) => {
    try {
        const u = req.body.username.toString().trim();
        if (!u) return res.status(400).json({ success: false, message: 'NIS wajib diisi!' });
        if (db.get('siswa').find({ username: u }).value()) return res.status(400).json({ success: false, message: 'NIS sudah ada!' });
        db.get('siswa').push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            username: u, nama: req.body.nama || '', kelas: req.body.kelas || '',
            status: 'Belum', nilaiOtomatis: 0, nilaiEsai: 0, totalNilai: 0, na: 0,
            jawabanSiswa: {}, paketId: null, pelanggaran: 0, logPelanggaran: [], selesaiOtomatis: false
        }).write();
        flushCache(); res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/import-siswa', (req, res) => {
    try {
        const { siswaList } = req.body;
        if (!Array.isArray(siswaList)) return res.status(400).json({ success: false, message: 'Format tidak valid' });
        let added = 0, skipped = 0;
        siswaList.forEach(s => {
            const u = (s.username || '').toString().trim();
            const n = (s.nama || '').toString().trim();
            if (!u || !n) { skipped++; return; }
            if (db.get('siswa').find({ username: u }).value()) { skipped++; return; }
            db.get('siswa').push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
                username: u, nama: n, kelas: (s.kelas || '').toString().trim(),
                status: 'Belum', nilaiOtomatis: 0, nilaiEsai: 0, totalNilai: 0, na: 0,
                jawabanSiswa: {}, paketId: null, pelanggaran: 0, logPelanggaran: [], selesaiOtomatis: false
            }).write();
            added++;
        });
        flushCache(); res.json({ success: true, added, skipped });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/reset-siswa', (req, res) => {
    db.get('siswa').find({ id: req.body.id }).assign({
        status: 'Belum', nilaiOtomatis: 0, nilaiEsai: 0, totalNilai: 0, na: 0,
        jawabanSiswa: {}, paketId: null, pelanggaran: 0, logPelanggaran: [], selesaiOtomatis: false
    }).write();
    flushCache(); res.json({ success: true });
});

app.post('/reset-semua-siswa', (req, res) => {
    db.get('siswa').forEach(s => {
        db.get('siswa').find({ id: s.id }).assign({
            status: 'Belum', nilaiOtomatis: 0, nilaiEsai: 0, totalNilai: 0, na: 0,
            jawabanSiswa: {}, paketId: null, pelanggaran: 0, logPelanggaran: [], selesaiOtomatis: false
        }).write();
    }).value();
    flushCache(); res.json({ success: true });
});

app.delete('/delete-siswa/:id', (req, res) => { db.get('siswa').remove({ id: req.params.id }).write(); flushCache(); res.json({ success: true }); });
app.delete('/delete-bank/:id', (req, res) => { db.get('bankSoal').remove({ id: Number(req.params.id) }).write(); flushCache(); res.json({ success: true }); });

// Import soal Word
app.post('/import-soal', upload.single('file_soal'), (req, res) => {
    const { kelas, mapel } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    if (!mapel || !kelas) { fs.unlinkSync(req.file.path); return res.status(400).json({ success: false, message: 'Mapel dan Kelas wajib diisi!' }); }
    mammoth.convertToHtml({ path: req.file.path }, {
        convertImage: mammoth.images.imgElement((image) => {
            return image.read().then((buf) => {
                const fn = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.png';
                fs.writeFileSync(path.join(imagesDir, fn), buf);
                return { src: '/images/' + fn };
            });
        })
    }).then(result => {
        const paragraphs = result.value.split(/<p[^>]*>/g);
        let daftarSoal = [], currentSoal = null, currentKonten = '';
        paragraphs.forEach(p => {
            let htmlPar = p.replace(/<\/p>/g, '').trim();
            let txt = htmlPar.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const mS = txt.match(/^(\d+)[\.\)\-]/);
            const mO = txt.match(/^([A-Ea-e])[\.\)]/);
            if (mS) {
                if (currentSoal) { currentSoal.konten = currentKonten; currentSoal.kunci = normalizeKunci(currentSoal.kunci); daftarSoal.push(currentSoal); }
                currentSoal = { id: Date.now() + Math.random(), konten: '', pilihan: [], kunci: '' };
                currentKonten = htmlPar.replace(/^([\s<]*<[^>]*>[\s]*)*\d+\s*[\.\)\-]\s*/i, '').trim();
            } else if (currentSoal) {
                if (/^KUNCI\s*:/i.test(txt)) { currentSoal.kunci = txt.replace(/^KUNCI\s*[:\s]+/i, '').trim(); }
                else if (mO) { currentSoal.pilihan.push(txt.replace(/^([A-Ea-e])[\.\)]/, '').trim()); }
                else if (htmlPar !== '') { currentKonten += '<br>' + htmlPar; }
            }
        });
        if (currentSoal) { currentSoal.konten = currentKonten; currentSoal.kunci = normalizeKunci(currentSoal.kunci); daftarSoal.push(currentSoal); }
        let processed = [];
        for (let i = 0; i < daftarSoal.length; i++) {
            const soal = daftarSoal[i];
            const kunci = (soal.kunci || '').toUpperCase().trim();
            const isMatchKey = /^\d+-[A-E](,\d+-[A-E])+$/i.test(kunci);
            if (isMatchKey && processed.length > 0) {
                let subItems = [];
                while (processed.length > 0) { const last = processed[processed.length - 1]; if (last.kunci) break; if (last.pilihan && last.pilihan.length > 0) break; subItems.unshift(processed.pop()); }
                if (subItems.length > 0) {
                    const pilihanIdx = soal.konten.toLowerCase().indexOf('pilihan');
                    if (pilihanIdx !== -1) {
                        let optText = soal.konten.substring(pilihanIdx).replace(/^.*?pilihan\s*[:\s]*/i, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                        const optParts = optText.split(/\s+(?=[A-E]\.)/);
                        soal.pilihan = [];
                        for (const part of optParts) { const cleaned = part.replace(/^[A-E]\.\s*/, '').trim(); if (cleaned) soal.pilihan.push(cleaned); }
                        soal.konten = soal.konten.substring(0, pilihanIdx).replace(/<br>\s*$/, '').replace(/<br>\s*$/, '').trim();
                    }
                    soal.konten = subItems.map(s => s.konten).join(' | ') + ' | ' + soal.konten;
                    soal.tipe = 'MENJODOHKAN';
                }
            }
            processed.push(soal);
        }
        daftarSoal = processed;
        if (!daftarSoal.length) { fs.unlinkSync(req.file.path); return res.status(400).json({ success: false, message: 'Tidak ada soal terdeteksi.' }); }
        db.get('bankSoal').push({ id: Date.now(), mapel, kelas, daftarSoal }).write();
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        flushCache(); res.json({ success: true, total: daftarSoal.length });
    }).catch(err => { try { fs.unlinkSync(req.file.path); } catch (e) {} res.status(500).json({ success: false, message: 'Gagal parsing Word: ' + err.message }); });
});

// Import Excel
app.post('/import-soal-excel', upload.single('file_excel'), (req, res) => {
    const { kelas, mapel } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    if (!mapel || !kelas) { fs.unlinkSync(req.file.path); return res.status(400).json({ success: false, message: 'Mapel dan Kelas wajib diisi!' }); }
    try {
        const wb = XLSX.readFile(req.file.path);
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) throw new Error('File kosong');
        let daftarSoal = [];
        rows.forEach(row => {
            const tipe = (row.tipe || row.Tipe || '').toString().toUpperCase();
            const kunci = normalizeKunci(row.kunci || row.Kunci || '');
            const soalText = (row.soal || row.Soal || '').toString().trim();
            if (!soalText) return;
            let pilihan = [];
            if (tipe !== 'ESAI' && tipe !== 'ESAY' && kunci !== 'ESAI') {
                for (let i = 0; i <= 4; i++) { const t = row['pilihan_' + String.fromCharCode(65 + i)] || row['Pilihan_' + String.fromCharCode(65 + i)] || ''; if (t.toString().trim()) pilihan.push(t.toString().trim()); }
            }
            daftarSoal.push({ id: Date.now() + Math.random(), konten: soalText, pilihan, kunci, tipe });
        });
        if (!daftarSoal.length) throw new Error('Tidak ada soal valid');
        db.get('bankSoal').push({ id: Date.now(), mapel, kelas, daftarSoal }).write();
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        flushCache(); res.json({ success: true, total: daftarSoal.length });
    } catch (err) { try { fs.unlinkSync(req.file.path); } catch (e) {} res.status(500).json({ success: false, message: err.message }); }
});

app.get('/backup', (req, res) => {
    try { const data = JSON.stringify(db.getState(), null, 2); res.setHeader('Content-Type', 'application/json'); res.setHeader('Content-Disposition', 'attachment; filename=cbt_backup_' + new Date().toISOString().slice(0, 10) + '.json'); res.send(data); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/restore', upload.single('file_backup'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    try {
        const raw = fs.readFileSync(req.file.path, 'utf-8');
        const data = JSON.parse(raw);
        if (!data.siswa || !data.bankSoal || !data.ujian) throw new Error('Format backup tidak valid');
        const oldPengaturan = db.get('pengaturan').value();
        db.setState(data).write();
        if (oldPengaturan) db.set('pengaturan', oldPengaturan).write();
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        flushCache(); res.json({ success: true, message: 'Data berhasil direstore!' });
    } catch (e) { try { fs.unlinkSync(req.file.path); } catch (err) {} res.status(500).json({ success: false, message: 'Gagal restore: ' + e.message }); }
});

app.get('/template/soal.xlsx', (req, res) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['tipe', 'soal', 'pilihan_A', 'pilihan_B', 'pilihan_C', 'pilihan_D', 'pilihan_E', 'kunci'],
        ['PG', 'Ibu kota Indonesia adalah?', 'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'A'],
        ['KOMPLEKS', 'Pilih jawaban yang benar:', 'Pilihan A', 'Pilihan B', 'Pilihan C', '', '', 'A,B'],
        ['BENAR/SALAH', 'Indonesia merdeka tahun 1945', 'Benar', 'Salah', '', '', '', 'A'],
        ['MENJODOHKAN', 'Pasangkan: | Item1 | Item2', 'Jawaban1', 'Jawaban2', '', '', '', '1-A,2-B'],
        ['ESAI', 'Jelaskan pengertian gotong royong!', '', '', '', '', '', 'ESAI']
    ]), 'Template');
    res.setHeader('Content-Disposition', 'attachment; filename=template_soal.xlsx');
    res.send(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
});

app.get('/template/siswa.xlsx', (req, res) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['NIS', 'Nama', 'Kelas'], ['1001', 'Ahmad Fauzi', '7A'], ['1002', 'Siti Aminah', '7B']]), 'Template');
    res.setHeader('Content-Disposition', 'attachment; filename=template_siswa.xlsx');
    res.send(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
});

app.get('/template/soal.doc', (req, res) => {
    const namaSekolah = (db.get('pengaturan').value().namaSekolah || 'SCHOOL NAME').toUpperCase();
    const docContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>body{font-family:'Times New Roman',serif;font-size:12pt;margin:2.5cm 3cm;line-height:1.6}h1{text-align:center;font-size:14pt;margin-bottom:2pt}h2{text-align:center;font-size:12pt;font-weight:normal;margin-top:0;margin-bottom:18pt}.hr{border:none;border-top:2px solid #000;margin:10px 0 20px}.soal{margin-bottom:16pt}.opsi{margin-left:30pt;margin-top:2pt}.kunci{font-weight:bold;margin-top:4pt}.petunjuk{margin-top:30pt;padding:12px 16px;border:1pt solid #999;background:#f9f9f9;font-size:11pt;line-height:1.5}</style></head><body><h1>${namaSekolah}</h1><h2>UJIAN AKHIR SEMESTER</h2><div style="text-align:center;margin-bottom:16pt"><b>Mata Pelajaran : ..........................</b><br><b>Kelas : ..........................</b></div><div class="hr"></div><div class="soal"><p><b>1.</b> Ibu kota negara Indonesia adalah ...</p><p class="opsi">A. Surabaya</p><p class="opsi">B. Jakarta</p><p class="opsi">C. Bandung</p><p class="opsi">D. Medan</p><p class="opsi">E. Semarang</p><p class="kunci">Kunci: B</p></div><div class="soal"><p><b>2.</b> Berikut sumber energi terbarukan ...<br>(Pilih lebih dari satu)</p><p class="opsi">A. Sinar matahari</p><p class="opsi">B. Batu bara</p><p class="opsi">C. Angin</p><p class="opsi">D. Bahan bakar minyak</p><p class="kunci">Kunci: A,C</p></div><div class="soal"><p><b>3.</b> Indonesia merdeka pada tanggal 17 Agustus 1945</p><p class="opsi">A. Benar</p><p class="opsi">B. Salah</p><p class="kunci">Kunci: A</p></div><div class="soal"><p><b>4.</b> Pasangkan pernyataan berikut!</p><p class="opsi">1. Lambang negara</p><p class="opsi">2. Lagu kebangsaan</p><p class="opsi">3. Hari kemerdekaan</p><p style="margin-left:30pt;margin-top:8pt"><b>Pilihan:</b>&nbsp;&nbsp;A. Indonesia Raya&nbsp;&nbsp;&nbsp;B. 17 Agustus&nbsp;&nbsp;&nbsp;C. Garuda Pancasila</p><p class="kunci">Kunci: 1-C,2-A,3-B</p></div><div class="soal"><p><b>5.</b> Jelaskan pengertian gotong royong!</p><p>...................................................................................................................................................</p><p class="kunci">Kunci: ESAI</p></div><div class="petunjuk"><b>PETUNJUK:</b><br>1. Soal diawali nomor urut diikuti titik<br>2. Pilihan diawali huruf kapital diikuti titik (A. B. C. D. E.)<br>3. Kunci: <b>Kunci: huruf jawaban</b><br>4. Kompleks: kunci dipisah koma (Kunci: A,C)<br>5. Benar/Salah: A=Benar, B=Salah<br>6. Menjodohkan: Kunci: 1-A,2-B,3-C<br>7. Esai: Kunci: ESAI</div></body></html>`;
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', 'attachment; filename=template_soal.doc');
    res.send(docContent);
});

app.get('/analisis-soal/:paketId', (req, res) => {
    try {
        const paketId = Number(req.params.paketId);
        const bank = db.get('bankSoal').find({ id: paketId }).value();
        if (!bank) return res.json({ success: false, message: 'Paket tidak ditemukan' });
        const siswa = db.get('siswa').filter(s => s.paketId === paketId && s.status === 'Selesai').value();
        const totalSiswa = siswa.length;
        const analisis = bank.daftarSoal.map((soal, idx) => {
            let benar = 0;
            siswa.forEach(s => {
                const jawaban = s.jawabanSiswa ? s.jawabanSiswa[String(idx)] : null;
                const kunci = normalizeKunci(soal.kunci);
                if (kunci === 'ESAI') return;
                let isBenar = false;
                if (typeof jawaban === 'string') isBenar = jawaban.toUpperCase().trim() === kunci;
                else if (typeof jawaban === 'object') isBenar = JSON.stringify(jawaban) === kunci;
                if (isBenar) benar++;
            });
            const persen = totalSiswa ? Math.round((benar / totalSiswa) * 100) : 0;
            return { nomor: idx+1, konten: soal.konten.substring(0, 60), benar, totalSiswa, persen };
        });
        res.json({ success: true, data: analisis });
    } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

app.use((err, req, res, next) => { console.error('Server Error:', err); res.status(500).json({ success: false, message: 'Terjadi kesalahan server' }); });

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const io = new Server(server);
global.io = io;
io.on('connection', (socket) => { console.log('🔌 Client terhubung ke WebSocket'); });
server.listen(PORT, () => console.log('✅ CBT Server berjalan di port ' + PORT));