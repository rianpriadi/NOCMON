# NOCMON Backend API & Frontend Dashboard

Struktur project backend menggunakan **FastAPI**, **SQLAlchemy 2.0 (Async)**, **GeoAlchemy2 (PostGIS)**, **Alembic**, dan frontend **Next.js App Router** untuk manajemen perangkat jaringan ISP (Network Operations Center & Fiber Monitoring).

---

## ⚡ Port Service NOCMON

- **FastAPI Backend API**: `http://localhost:8001` (Docs: `http://localhost:8001/docs`)
- **Next.js Frontend**: `http://localhost:3000`
- **PostgreSQL / PostGIS Database**: `localhost:5433` (User: `nocmon_user`, Pass: `nocmon_password`, DB: `nocmon_db`)

---

## 🚀 Fitur Utama

- **FastAPI**: Framework web Python modern & async (Port `8001`).
- **PostgreSQL + PostGIS**: Data spasial koordinat ODP & jalur kabel fiber optik (`LINESTRING`).
- **Next.js (App Router)**: Dashboard visualisasi GIS Map (Leaflet) dan monitoring real-time.
- **Background Poller**: ICMP Ping Service (30s) dan Mikrotik RouterOS Collector (60s).
- **Telegram Alerting Bot**: Notifikasi otomatis saat router DOWN / ONLINE kembali.

---

## 🛠️ Cara Menjalankan Proyek

### 1. Menggunakan Docker Compose (Direkomendasikan)

```bash
docker compose up -d --build
```

Menjalankan migrasi database di container:
```bash
docker compose exec web alembic upgrade head
docker compose exec web python -m app.db.seed
```

---

### 2. Menjalankan secara Lokal

#### A. PostgreSQL / PostGIS
```bash
docker compose up -d db
```

#### B. Backend FastAPI (Port 8001)
```bash
./venv/bin/alembic upgrade head
./venv/bin/python3 -m app.db.seed
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

#### C. Frontend Next.js (Port 3000)
```bash
cd frontend
export PATH=$PATH:/usr/share/nodejs/corepack/shims
npm run dev
```
