// seed.ts — Prisma Seed Script
// jalankan: npx prisma db seed
// package.json: { "prisma": { "seed": "ts-node seed.ts" } }

import { PrismaClient, RoleAdmin, StatusSiswa } from "@prisma/client"
//const prisma = new PrismaClient()

import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {

  // ── ADMIN ──
  await prisma.admin.deleteMany()
  await prisma.admin.create({ data: {
    username: "admin",
    password: "admin123",
    nama:     "Administrator",
    role:     RoleAdmin.superadmin,
    email:    "admin@smkpembangunan.sch.id",
    aktif:    true,
  } })
  await prisma.admin.create({ data: {
    username: "guru1",
    password: "guru123",
    nama:     "Guru Pengawas",
    role:     RoleAdmin.admin,
    email:    "guru1@smkpembangunan.sch.id",
    aktif:    true,
  } })

  // ── PENGATURAN ──
  await prisma.pengaturan.deleteMany()
  await prisma.pengaturan.create({ data: {
    namaSekolah:    "SMK PEMBANGUNAN SURABAYA",
    namaAplikasi:   "SIMULASI SAS",
    ukuranSekolah:  23,
    ukuranAplikasi: 17,
    tema:           "blue",
    temaLogin:      "green",
    layoutLogin:    "modern",
  } })

  // ── UJIAN ──
  await prisma.ujian.deleteMany()
  const ujian = await prisma.ujian.create({ data: {
    durasi:             50,
    tampilkanNilai:     false,
    maxPelanggaran:     3,
    pesanPelanggaran:   "Anda terdeteksi curang, silakan lapor ke pengawas",
    deteksiPelanggaran: true,
    alarmType:          "warning",
    acakSoal:           true,
    durasiPerPaket:     true,
    alarmDurasi:        5500,
  } })

  // ── BANK SOAL ──
  await prisma.soal.deleteMany()
  await prisma.aktifPaket.deleteMany()
  await prisma.bankSoal.deleteMany()

  const bank_1777533851165 = await prisma.bankSoal.create({
    data: {
      mapel: "SIMULASI",
      kelas: "X",
      daftarSoal: {
        create: [
        {
                "konten": "</strong> Ibu kota negara Indonesia saat ini adalah...",
                "pilihan": [
                        "Surabaya",
                        "Jakarta",
                        "Bandung",
                        "Medan"
                ],
                "kunci": "B"
        },
        {
                "konten": "</strong> Manakah yang merupakan komponen perangkat keras komputer? (Jawaban lebih dari satu)",
                "pilihan": [
                        "CPU",
                        "Windows",
                        "RAM",
                        "Microsoft Office"
                ],
                "kunci": "A,C"
        },
        {
                "konten": "</strong>  <img alt=\"C:\\Users\\PC\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.MSO\\C9CA9449.tmp\" src=\"/images/1777533851155-853am1.png\" />Pernyataan: Matahari terbit dari sebelah barat.",
                "pilihan": [
                        "Benar",
                        "Salah"
                ],
                "kunci": "B"
        },
        {
                "konten": "Pasangkanlah ibukota provinsi berikut ini dengan benar: | Indonesia | Jepang | Prancis |",
                "pilihan": [
                        "Tokyo",
                        "Paris",
                        "Jakarta"
                ],
                "kunci": "1-C,2-A,3-B"
        },
        {
                "konten": "</strong> Jelaskan apa yang dimaksud dengan fotosintesis pada tumbuhan!",
                "pilihan": [],
                "kunci": "ESAI"
        }
],
      },
    },
  })

  const bank_1777878357684 = await prisma.bankSoal.create({
    data: {
      mapel: "MTK",
      kelas: "X",
      daftarSoal: {
        create: [
        {
                "konten": "Nilai <img src=\"/images/1777878357669-iv93tm.png\" /> adalah …",
                "pilihan": [
                        "2",
                        "3",
                        "4",
                        "5",
                        "6"
                ],
                "kunci": "A"
        },
        {
                "konten": "Soal berikut anfjdvuer .<br>D <img src=\"/images/1777878357679-l1y3x3.png\" />",
                "pilihan": [
                        "",
                        "",
                        "",
                        ""
                ],
                "kunci": "B"
        }
],
      },
    },
  })

  const bank_1777878992195 = await prisma.bankSoal.create({
    data: {
      mapel: "B JAWA",
      kelas: "X",
      daftarSoal: {
        create: [
        {
                "konten": "Ing ngisor iki kang kalebu tembung kriya yaiku <strong>ꦲ ꦫ ꦏ ꦢ ꦠ ꦱ ꦮ ꦗ ꦪ ꦚ ꦩ ꦒ ꦧ ꦛ ꦯ<br /> </strong>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ<strong> </strong>",
                "pilihan": [
                        "Mangan",
                        "Kucing",
                        "Sepur",
                        "Gunung"
                ],
                "kunci": "A"
        },
        {
                "konten": "Tembung lingga yaiku tembung sing...",
                "pilihan": [
                        "Wis owah saka wangun asline",
                        "Dhasar utawa durung owah",
                        "Digawe saka rong tembung",
                        "Digawe saka telung tembung utawa luwih"
                ],
                "kunci": "B"
        },
        {
                "konten": "Ukara \"Dheweke mlaku menyang pasar\" yaiku ukara...",
                "pilihan": [
                        "Pasif",
                        "Aktif",
                        "Imperatif",
                        "Interogatif"
                ],
                "kunci": "B"
        },
        {
                "konten": "Kanggone tembung \"dilakoni\" iku wujude...",
                "pilihan": [
                        "Aktif",
                        "Pasif",
                        "Imperatif",
                        "Interogatif"
                ],
                "kunci": "B"
        },
        {
                "konten": "Tembung rangkep yaiku tembung kang...",
                "pilihan": [
                        "Kaping pindho utawa luwih",
                        "Digawe saka tembung asing",
                        "Owah saka tembung kriya",
                        "Digawe saka ukara negative"
                ],
                "kunci": "A"
        },
        {
                "konten": "Tembung \"turu\" ing krama alus yaiku...",
                "pilihan": [
                        "Sare",
                        "Tangi",
                        "Kesah",
                        "Panggih"
                ],
                "kunci": "A"
        },
        {
                "konten": "Ing ngisor iki kang kalebu tembung krama lugu yaiku...",
                "pilihan": [
                        "Dhahar",
                        "Mangan",
                        "Madang",
                        "Neda"
                ],
                "kunci": "B"
        },
        {
                "konten": "Ing ngisor iki kang kalebu tembung krama inggil yaiku...",
                "pilihan": [
                        "Tangi",
                        "Mlebu",
                        "Tumbas",
                        "Lenggah"
                ],
                "kunci": ""
        },
        {
                "konten": "\"Kowe lunga menyang pasar\" ing basa krama alus yaiku...",
                "pilihan": [
                        "Sampeyan tindak menyang pasar",
                        "Kowe lunga pasar",
                        "Panjenengan mlaku menyang pasar",
                        "Sampeyan tindak mrana"
                ],
                "kunci": ""
        },
        {
                "konten": "Tembung \"bocah\" ing krama alus yaiku...",
                "pilihan": [
                        "Cah",
                        "Lare",
                        "Putra",
                        "Kanca"
                ],
                "kunci": ""
        },
        {
                "konten": "Aksara Jawa \"<img src=\"/images/1777878992187-tgaq2s.png\" /> \" macahe...<br />A. Ba<br />B. Pa<br />C. Ta<br />D. Sa",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Aksara Jawa \" <img alt=\"Ga (aksara Jawa) | Ensiklopedia | Civitasbook.com\" src=\"/images/1777878992191-pzn3iw.png\" /> \" macahe...<br />A. Ga<br />B. Ba<br />C. Pa<br />D. Na",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Tanda diakritik ing aksara Jawa kang nggambarake swara \"é\" yaiku...<br />A. Cecak<br />B. Wulu<br />C. Layar<br />D. Taling",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Aksara jawa iki “<img alt=\"gajah gedhe) tulisen nganggo aksara Jawa!​ - Brainly.co.id\" src=\"/images/1777878992193-zzel8x.png\" />” yaiku...<br />A. Gajah gedhe<br />B. Gajah Cilik<br />C. Gajah Madha<br />D. Gajah Mungkur",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Aksara Wilangan angka iki “<img alt=\"Berkas:Jawa Pa Murda.png - Wikipedia bahasa Indonesia ...\" src=\"/images/1777878992193-7re8ac.png\" /> “ yaiku...<br />A. 2<br />B. 5<br />C. 7<br />D. 8",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Geguritan iku puisi kang...<br />A. Temane bebas lan ora kaiket paugeran<br />B. Diiket aturan baku<br />C. Saka basa manca<br />D. Digawe kanggo pawarta",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Ing geguritan, cacahe larik ing saben bait bisa...<br />A. Papat<br />B. Siji<br />C. Ora mesti<br />D. Loro",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Pupuh sing nadane sedhih lan mengharukan yaiku...<br />A. Maskumambang<br />B. Dhandhanggula<br />C. Kinanthi<br />D. Gambuh",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Ukara \"Adhem ayem tentrem ing desaku\" kalebu wangun...<br />A. Geguritan<br />B. Parikan<br />C. Tembang<br />D. Cerita",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Tembang dolanan sing misuwur yaiku...<br />A. Suwe ora jamu<br />B. Pucung<br />C. Dhandhanggula<br />D. Sinom",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Tembang macapat sing nduweni guru lagu \"u\" yaiku...<br />A. Dhandhanggula<br />B. Mijil<br />C. Kinanthi<br />D. Pucung",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Tembang macapat sing nadane sumedhih yaiku...<br />A. Maskumambang<br />B. Gambuh<br />C. Megatruh<br />D. Sinom",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "\"Ana ing desa tentrem lan ayem\" iku tuladha tembang...<br />A. Pangkur<br />B. Kinanthi<br />C. Mijil<br />D. Durma",
                "pilihan": [],
                "kunci": ""
        },
        {
                "konten": "Tembang macapat kang tema petunjuk utawa nasihat yaiku...<br />A. Sinom<br />B. Asmaradana<br />C. Maskumambang<br />D. Pangkur",
                "pilihan": [],
                "kunci": ""
        }
],
      },
    },
  })

  // ── AKTIF PAKET ──
  await prisma.aktifPaket.create({ data: {
    kelas:      "X",
    bobotPG:    100,
    bobotEsai:  0,
    ujianId:    ujian.id,
    bankSoalId: bank_1777878357684.id,
  } })

  // ── SISWA ──
  await prisma.siswa.deleteMany()
  await prisma.siswa.create({ data: {
    username:        "1001",
    nama:            "Anam",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "B", "1": "Padi dan kapas", "2": "A,C", "3": {"1": "A", "2": "B", "3": "C"}, "4": "C"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1002",
    nama:            "Anis",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "Dari hasil cahaya matahari ", "1": "B", "2": "B", "3": "A,C", "4": {"1": "C", "2": "A", "3": "B"}},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1003",
    nama:            "Ambar",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": {"1": "C", "2": "A", "3": "B"}, "1": "A,C", "2": "B", "3": "B"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1004",
    nama:            "Anggie",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "B", "1": "B", "2": "fotosintesis membantumu berkembsngnys"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1005",
    nama:            "Budi",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": {"1": "C", "2": "A", "3": "B"}, "1": "B", "2": "A,C", "3": "proses pertum"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1006",
    nama:            "Bondan",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": {"1": "C", "2": "A", "3": "B"}, "1": "B", "2": "Proses pertumbuhan tanaman"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1007",
    nama:            "Bagus",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "Masa pertumbuhan tanaman ", "1": {"1": "C", "2": "A", "3": "B"}, "2": "A,C", "3": "B"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1008",
    nama:            "Bintang",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": {"1": "C", "2": "B", "3": "A"}, "1": "B,D", "2": "Pertumbuhan tanaman"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1009",
    nama:            "Cika",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "A", "1": {"1": "C", "2": "A", "3": "B"}, "2": "B", "3": "D", "4": "Hewan sapi monyet "},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1010",
    nama:            "Cici",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": {"1": "A", "2": "B", "3": "C"}, "1": "B,C", "2": "C", "3": "A", "4": "Jelas apa yang  di maksud  dengan  fotosintesis pada  tumbuhan yaitu"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1011",
    nama:            "Cantika",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "B", "1": "A,C", "2": {"1": "C", "2": "A", "3": "B"}, "3": "proses biologis dimana tumbuhan hijau,alga,dan beberapa bakteri menggunakan energi cahaya matahari untuk mengubah air(H2o) dan karbon dioksida (CO2) menjadi glukosa(karbohidrat)dan oksigen(O2)", "4": "A"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1012",
    nama:            "Cempaka",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "proses biologis dimana tumbuhan hijau,alga,dan beberapa bakteri menggunakan energi cahata matahari untuk mengubah air(H2o)dan karbon dioksida(CO2) menjadi glukosa(karbohidrat)dan oksigen(O2)", "1": "A", "2": "B", "3": "A", "4": {"1": "C"}},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1013",
    nama:            "Dara",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "Proses tunggi badan", "1": "B", "2": "A,C", "3": {"1": "C"}},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1014",
    nama:            "Desi",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1015",
    nama:            "Danang",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": {"1": "C", "2": "A", "3": "B"}, "1": "B", "2": "B", "3": "A", "4": ""},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1016",
    nama:            "Dimas",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "B", "1": "A,C", "2": "dari sinar matahari ", "3": {"1": "C", "2": "A", "3": "B"}, "4": "A"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1017",
    nama:            "Edi",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "B", "1": "A", "2": {"1": "C", "2": "A", "3": "B"}, "3": "dari sinar matahari", "4": "A,C"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1018",
    nama:            "Endang",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "A", "1": "B", "2": "Pertumbuhan", "3": "A,C", "4": {"1": "C", "2": "A"}},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1019",
    nama:            "Eman",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "A", "1": "B", "2": "proses biologis dimana tumbuhan hijau,alga,dan beberapa bakteri menggunakan energi cahaya matahari untuh mengubah air(H2o) dan karbon dioksida(CO2) menjadi glukosa (karbohidrat) dan oksigen (O2)", "3": {"1": "C", "2": "A", "3": "B"}},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })
  await prisma.siswa.create({ data: {
    username:        "1020",
    nama:            "Elang",
    kelas:           "X",
    status:          StatusSiswa.Belum,
    nilaiOtomatis:   0,
    nilaiEsai:       0,
    totalNilai:      0,
    na:              0,
    jawabanSiswa:    {},
    jawabanAutoSave: {"0": "B", "1": "A", "2": "dari matahari"},
    pelanggaran:     0,
    logPelanggaran:  [],
    selesaiOtomatis: false,
  } })

  console.log("✅ Seed selesai!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })