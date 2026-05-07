-- CreateEnum
CREATE TYPE "RoleAdmin" AS ENUM ('superadmin', 'admin');

-- CreateEnum
CREATE TYPE "StatusSiswa" AS ENUM ('Belum', 'Mengerjakan', 'Selesai');

-- CreateTable
CREATE TABLE "admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "RoleAdmin" NOT NULL DEFAULT 'admin',
    "email" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siswa" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "status" "StatusSiswa" NOT NULL DEFAULT 'Belum',
    "nilaiOtomatis" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiEsai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNilai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "na" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jawabanSiswa" JSONB NOT NULL DEFAULT '{}',
    "jawabanAutoSave" JSONB NOT NULL DEFAULT '{}',
    "paketId" TEXT,
    "pelanggaran" INTEGER NOT NULL DEFAULT 0,
    "logPelanggaran" JSONB NOT NULL DEFAULT '[]',
    "selesaiOtomatis" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_soal" (
    "id" TEXT NOT NULL,
    "mapel" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_soal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soal" (
    "id" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "pilihan" JSONB NOT NULL,
    "kunci" TEXT NOT NULL,
    "bankSoalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ujian" (
    "id" SERIAL NOT NULL,
    "durasi" INTEGER NOT NULL DEFAULT 50,
    "tampilkanNilai" BOOLEAN NOT NULL DEFAULT false,
    "maxPelanggaran" INTEGER NOT NULL DEFAULT 3,
    "pesanPelanggaran" TEXT NOT NULL DEFAULT 'Anda terdeteksi curang, silakan lapor ke pengawas',
    "deteksiPelanggaran" BOOLEAN NOT NULL DEFAULT true,
    "alarmType" TEXT NOT NULL DEFAULT 'warning',
    "acakSoal" BOOLEAN NOT NULL DEFAULT true,
    "durasiPerPaket" BOOLEAN NOT NULL DEFAULT true,
    "alarmDurasi" INTEGER NOT NULL DEFAULT 5500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aktif_paket" (
    "id" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "bobotPG" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "bobotEsai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ujianId" INTEGER NOT NULL,
    "bankSoalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aktif_paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaturan" (
    "id" SERIAL NOT NULL,
    "namaSekolah" TEXT NOT NULL DEFAULT 'SMK PEMBANGUNAN SURABAYA',
    "namaAplikasi" TEXT NOT NULL DEFAULT 'SIMULASI SAS',
    "ukuranSekolah" INTEGER NOT NULL DEFAULT 23,
    "ukuranAplikasi" INTEGER NOT NULL DEFAULT 17,
    "tema" TEXT NOT NULL DEFAULT 'blue',
    "temaLogin" TEXT NOT NULL DEFAULT 'green',
    "layoutLogin" TEXT NOT NULL DEFAULT 'modern',

    CONSTRAINT "pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_username_key" ON "siswa"("username");

-- CreateIndex
CREATE UNIQUE INDEX "aktif_paket_ujianId_kelas_key" ON "aktif_paket"("ujianId", "kelas");

-- AddForeignKey
ALTER TABLE "soal" ADD CONSTRAINT "soal_bankSoalId_fkey" FOREIGN KEY ("bankSoalId") REFERENCES "bank_soal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktif_paket" ADD CONSTRAINT "aktif_paket_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktif_paket" ADD CONSTRAINT "aktif_paket_bankSoalId_fkey" FOREIGN KEY ("bankSoalId") REFERENCES "bank_soal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
