# 🚀 Guía de Deploy en Railway

## Prerequisitos
- Cuenta en [Railway](https://railway.app)
- Git instalado
- Node.js 18+ (para desarrollo local)

---

## Paso 1 — Subir el código a GitHub

```bash
cd "E:\Morton Desarrollos\Trjeta de Fidelizacion"
git init
git add .
git commit -m "feat: sistema de fidelización Madedeco"
# Crear repo en GitHub y conectarlo:
git remote add origin https://github.com/TU_USUARIO/madedeco-fidelizacion.git
git push -u origin main
```

---

## Paso 2 — Crear proyecto en Railway

1. Entrá a [railway.app](https://railway.app) y hacé clic en **New Project**
2. Elegí **Deploy from GitHub repo** y seleccioná el repositorio
3. Railway detecta Next.js automáticamente ✅

---

## Paso 3 — Agregar base de datos PostgreSQL

1. En tu proyecto de Railway, clic en **+ New** → **Database** → **PostgreSQL**
2. Railway conecta automáticamente `DATABASE_URL` a tu app ✅

---

## Paso 4 — Configurar variables de entorno

En Railway → tu servicio → **Variables**, agregá:

| Variable | Valor |
|----------|-------|
| `ADMIN_PASSWORD` | tu contraseña segura (ej: `Madedeco#2024!`) |
| `JWT_SECRET` | una cadena aleatoria larga (ej: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | la URL de Railway (ej: `https://madedeco.up.railway.app`) |

> `DATABASE_URL` se completa automáticamente con el PostgreSQL de Railway.

---

## Paso 5 — Deploy

Railway hace el deploy automáticamente al pushear a `main`.

El `railway.toml` configura:
- Build: instala dependencias, genera Prisma, corre migraciones y hace build
- Start: `npm start`

---

## Desarrollo local

```bash
# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu DATABASE_URL local

# Instalar dependencias
npm install

# Crear tablas
npx prisma db push

# Iniciar
npm run dev
```

---

## URLs del sistema

| URL | Descripción |
|-----|-------------|
| `/` | Landing + registro de clientes |
| `/card/[token]` | Tarjeta personal del cliente con QR |
| `/admin` | Login del panel administrativo |
| `/admin/dashboard` | Dashboard con estadísticas |
| `/admin/customers` | Lista de todos los clientes |
| `/admin/scan` | Escáner QR para sumar sellos |
| `/admin/stamp/[token]` | Confirmar sello para un cliente |

---

## Flujo de uso

### Cliente:
1. Entra a la app y se registra con nombre + email
2. Recibe su tarjeta con 2 sellos de bienvenida y un QR personal
3. En cada compra, muestra el QR al local
4. Al completar los 10 sellos → 20% de descuento en la próxima compra

### Administrador:
1. Entra a `/admin` con la contraseña
2. Abre "Escanear QR" en su teléfono
3. Escanea el QR del cliente → confirma el sello
4. Si la tarjeta está completa → aplica el descuento y la reinicia
