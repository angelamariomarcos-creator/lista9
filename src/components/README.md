# 🦖 Lista de la Compra 9.0

> La lista de la compra familiar que tu familia necesitaba — con IA, humor y tecnología de nivel profesional.

**[🚀 Ver demo en vivo](https://lista9.vercel.app)**

---

## 📱 ¿Qué es esto?

Una PWA (Progressive Web App) de lista de la compra familiar construida desde cero con Next.js 14, Supabase y Firebase. Nació de un problema real: ir al supermercado y olvidar la mitad de las cosas.

Incluye **Senior Rex** — un dinosaurio gamberro que comenta cada producto que añades a la cesta con humor, predice lo que se te está acabando en casa, y te mete caña si gastas demasiado a fin de mes.

---

## ✨ Features principales

### 🛒 Lista de la compra inteligente
- 250 productos organizados en 11 categorías con iconos estilo cómic
- Búsqueda instantánea por nombre
- Frases de humor únicas por producto generadas con IA (696 frases sin repetir)
- Añadir productos a la cesta con un solo tap

### ⚡ Tiempo real multi-dispositivo
- La cesta se sincroniza al instante entre todos los móviles de la familia
- Si Vane añade leche desde casa, a Javi le aparece en el súper en tiempo real
- Notificaciones push cuando alguien añade un producto (Firebase Cloud Messaging)

### 🏪 Modo supermercado
- Vista "Por pasillos" — agrupa los productos de la cesta por categoría para no dar vueltas
- Marcar productos como comprados con tachado visual y animación
- Contador de gasto estimado en tiempo real mientras compras
- Buscar precio en Google con un tap desde cualquier producto

### 🏠 Inventario de despensa
- Marca los productos que ya tienes en casa con semáforo de stock (🟢 Suficiente / 🟡 Poco / 🔴 Casi sin)
- Cuando algo está en rojo, un botón lo añade directamente a la cesta
- Predicción automática: Senior Rex sugiere productos que llevas días sin comprar

### 📊 Control de gastos
- Sube tickets del supermercado con foto
- Desglose de gasto por categoría con gráfico de barras
- Resumen mensual con comentarios de Senior Rex ("este mes os habéis fundido en Bebidas, vaya sed")
- Exportación a CSV para llevar el control en Excel

### 👨‍👩‍👧‍👦 Multi-usuario familiar
- Login sin contraseña con magic link (Supabase Auth)
- Cada miembro de la familia tiene su cuenta
- Row Level Security (RLS) en Supabase — los datos de tu familia son solo tuyos

---

## 🛠️ Stack técnico

| Tecnología | Uso |
|---|---|
| **Next.js 14** (App Router) | Framework principal |
| **TypeScript** | Tipado estático |
| **Supabase** | Base de datos PostgreSQL + Auth + Realtime + Storage |
| **Firebase Cloud Messaging** | Notificaciones push |
| **Tailwind CSS** | Estilos |
| **Framer Motion** | Animaciones |
| **next-pwa** | Progressive Web App |
| **Vercel** | Despliegue |

---

## 🏗️ Arquitectura

```
lista9/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home — grid de categorías + inventario
│   │   ├── cesta/            # Lista de la compra en tiempo real
│   │   ├── gastos/           # Control de gastos mensuales
│   │   ├── tickets/          # Subida de tickets
│   │   ├── despensa/         # Inventario de despensa
│   │   ├── login/            # Auth con magic link
│   │   └── api/
│   │       ├── notificar/    # Endpoint de notificaciones push
│   │       └── procesar-ticket/ # Procesado de tickets con IA
│   ├── components/
│   │   ├── ProductCard       # Tarjeta de producto con semáforo de despensa
│   │   ├── CestaItem         # Item de la cesta con acciones
│   │   ├── SeniorRexReaction # Animaciones del dinosaurio
│   │   ├── PrediccionRex     # Sugerencias basadas en historial
│   │   ├── NotificacionesSetup # Setup de Firebase push
│   │   └── BottomNav         # Navegación superior
│   └── lib/
│       ├── supabase.ts       # Cliente de Supabase
│       ├── firebase.ts       # Cliente de Firebase
│       └── frases.ts         # Sistema de frases sin repetir
└── public/
    ├── categorias/           # Iconos estilo cómic de cada categoría
    ├── rex-yes.png           # Senior Rex aprobando
    └── rex-no.png            # Senior Rex desaprobando
```

---

## 🚀 Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/angelamariomarcos-creator/lista9.git
cd lista9

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Rellenar con tus claves de Supabase y Firebase

# Arrancar en desarrollo
npm run dev
```

---

## 🔧 Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
FIREBASE_SERVICE_ACCOUNT=
```

---

## 👨‍💻 Autor

**Javi** — builder y desarrollador autodidacta basado en Madrid.

> "No estoy aprendiendo. Estoy construyendo."

[GitHub](https://github.com/angelamariomarcos-creator) · [LinkedIn](#) · [lista9.vercel.app](https://lista9.vercel.app)

---

*Construido con ☕ y mucha paciencia en sesiones de madrugada.*