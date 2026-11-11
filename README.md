# 💼 FinanzFlow - Plataforma de Gestión Financiera (Persona & Empresa)

Plataforma web integral diseñada para la gestión financiera tanto de **Personas Individuales** como de **Empresas**, desarrollada con **programación orientada a componentes** y una **estricta separación entre Frontend y Backend**.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está organizado en dos módulos independientes y desacoplados:

```
finanzas/
├── backend/                       # 🟢 Servidor REST API en Node.js
│   ├── src/
│   │   ├── controllers/          # Lógica de controladores HTTP
│   │   │   ├── budgetController.js
│   │   │   ├── goalController.js
│   │   │   ├── invoiceController.js
│   │   │   ├── profileController.js
│   │   │   └── transactionController.js
│   │   ├── db/
│   │   │   └── database.js       # SQLite nativo (node:sqlite) + Semillas de datos
│   │   ├── services/
│   │   │   └── financialService.js # Métricas, P&L, Runway, Ratios y Proyecciones
│   │   └── server.js             # Servidor HTTP nativo con CORS y enrutador modular
│   ├── finanzas.sqlite           # Base de datos relacional local
│   └── package.json
│
├── frontend/                      # 🔵 Aplicación SPA React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Componentes atómicos reutilizables
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Icon.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── Tabs.tsx
│   │   │   ├── layout/           # Componentes estructurales
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── ProfileSwitcher.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── dashboard/        # Métricas principales y gráficos interactivos
│   │   │   │   ├── CashFlowChart.tsx      (Gráfico SVG interactivo de barras)
│   │   │   │   ├── CategoryDonutChart.tsx (Gráfico SVG interactivo circular)
│   │   │   │   ├── KpiGrid.tsx            (Tarjetas de KPIs adaptadas al perfil)
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   └── RecentTransactions.tsx
│   │   │   ├── transactions/     # Módulo de transacciones
│   │   │   │   ├── TransactionModal.tsx
│   │   │   │   └── TransactionTable.tsx   (Búsqueda, filtros y exportación CSV)
│   │   │   ├── budgets/          # Módulo de presupuestos y techos de gasto
│   │   │   │   ├── BudgetCard.tsx         (Alertas por proximidad o exceso)
│   │   │   │   ├── BudgetGrid.tsx
│   │   │   │   └── BudgetModal.tsx
│   │   │   ├── company/          # Módulo exclusivo empresarial
│   │   │   │   ├── InvoiceModal.tsx
│   │   │   │   └── InvoiceTable.tsx       (Cuentas por Cobrar y por Pagar)
│   │   │   ├── personal/         # Módulo exclusivo personal
│   │   │   │   ├── GoalContributeModal.tsx
│   │   │   │   ├── GoalModal.tsx
│   │   │   │   └── SavingsGoals.tsx       (Metas de ahorro y fondos de reserva)
│   │   │   └── reports/          # Módulo de análisis y reportes
│   │   │       └── FinancialReports.tsx   (P&L empresarial y regla 50/30/20)
│   │   ├── context/
│   │   │   └── FinanceContext.tsx# Estado global reactivo con useFinance()
│   │   ├── services/
│   │   │   └── api.ts            # Cliente API con soporte offline/resiliente
│   │   ├── types/
│   │   │   └── finance.ts        # Interfaces y tipos TypeScript
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── run-all.js                     # Script para iniciar backend y frontend simultáneamente
└── package.json                   # Scripts unificados de raíz
```

---

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Iniciar Todo a la Vez (Recomendado)

Desde la raíz del proyecto ejecuta:

```bash
npm run dev
```

Esto levantará automáticamente el **servidor Backend en el puerto 5000** y el **servidor Frontend en el puerto 3000** con salida por consola formateada.

### Opción 2: Iniciar Módulos por Separado

Si deseas ejecutar cada parte en terminales independientes:

* **Para el Backend:**
  ```bash
  npm run dev:backend
  # O directamente: node --watch backend/src/server.js
  ```
  API disponible en: `http://localhost:5000`

* **Para el Frontend:**
  ```bash
  npm run dev:frontend
  # O entrar a la carpeta: cd frontend && npm run dev
  ```
  Web accesible en: `http://localhost:3000`

---

## 🌟 Características Principales

### 🔄 Selector de Perfiles (Profile Switcher)
En la barra superior puedes alternar con un solo clic entre:
1. **Finanzas Personales (Diego Brivio)**: Con paleta de color Índigo, enfocado en ingresos personales, gastos domésticos, presupuestos de vida, metas de ahorro y regla 50/30/20.
2. **Finanzas Empresariales (NovaTech Solutions S.A.)**: Con paleta de color Esmeralda, enfocado en tesorería corporativa, OPEX, facturación B2B (Cuentas por cobrar/pagar), margen EBITDA y Cash Runway.

### 📊 Dashboard Interactivo
- **KPIs Dinámicos**: Balance total, ingresos, egresos y tasa de ahorro / margen operativo.
- **Gráfico Histórico de Flujo de Caja**: Gráfico SVG de barras de ingresos vs gastos con tooltip detallado.
- **Distribución de Gastos en Gráfico Donut**: Desglose porcentual y visual por categorías.
- **Últimos Movimientos**: Vista previa de transacciones recientes con categorización.

### 💳 Gestión de Transacciones
- Formulario modal validado para registrar ingresos o gastos.
- Categorías automáticas según perfil personal o empresa.
- Búsqueda en tiempo real por texto, filtrado por tipo y por categoría.
- Exportación del listado a archivo **CSV**.

### 🎯 Presupuestos y Techos de Gasto
- Establece un límite mensual para cada categoría.
- Barras de progreso inteligentes: verde (en meta), amarillo (cerca del límite >= 85%), rojo (excedido).
- Notificación visual del monto excedido o disponible.

### 🏢 Módulo Empresarial (Facturación B2B)
- Pestañas independientes para **Cuentas por Cobrar (Clientes)** y **Cuentas por Pagar (Proveedores)**.
- Estados de factura: `Pendiente`, `Cobrada / Pagada`, `Vencida (Mora)`.
- Al marcar una factura como cobrada/pagada, se puede registrar automáticamente el movimiento en tesorería.

### 🚀 Módulo Personal (Metas de Ahorro)
- Fondos con objetivos concretos (Fondo de Emergencia, Vacaciones, Tecnología, Inversión).
- Botón de abono rápido (`+$50`, `+$100`, etc.) que actualiza el progreso y añade el movimiento financiero.

### 📈 Informes Financieros y Ratios
- **Empresa**: Estado de Resultados (P&L), Margen EBITDA, estimación de IVA y cálculo de meses de supervivencia (Cash Runway).
- **Personal**: Evaluación cuantitativa del balance de vida y análisis según la regla financiera 50/30/20.
- Exportación del informe ejecutivo a formato **JSON**.

---

## ⚡ Conexión con Supabase & Despliegue en Vercel

La aplicación cuenta con integración directa a **Supabase** usando `@supabase/supabase-js`, permitiendo desplegar el frontend directamente en **Vercel** sin necesidad de mantener un servidor backend local en producción.

### Variables de Entorno (Vercel & Local)
En `frontend/.env` (o en las variables de entorno de tu proyecto en Vercel):

```env
VITE_SUPABASE_URL=https://ktsgljggdnmurjzrllob.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZPPqmxCLHG1ixn3n41SucA_tqwwENk6
```

### Pasos para montar en Vercel:
1. Conecta tu repositorio de GitHub / GitLab a Vercel.
2. En la configuración del proyecto:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (o raíz con script `cd frontend && npm run build`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. En **Settings > Environment Variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Haz clic en **Deploy**. ¡Listo para usarse desde cualquier teléfono o navegador!

---

## 📱 Adaptabilidad Móvil (Responsive Design)
La interfaz ha sido optimizada para teléfonos móviles y pantallas táctiles:
- **Barra de navegación adaptable**: Título truncado dinámicamente y botones compactos con target táctil de al menos 44px.
- **Menú Drawer deslizante**: Sidebar colapsable con fondo desenfocado (backdrop blur) y autocierre al seleccionar sección.
- **Selector de Perfiles Compacto**: En móvil muestra el avatar con gradiente táctil para no sobrecargar la barra superior.
- **Tablas con Scroll Horizontal Asistido**: Las transacciones y facturas mantienen sus datos tabulares legibles con `-webkit-overflow-scrolling: touch`.
- **Gráficos Responsivos**: El gráfico de Dona pasa automáticamente a diseño vertical para visualizar segmentos y porcentajes claramente en teléfonos.
- **Formularios y Modales Optimizados**: Se adaptan como modal tipo sheet inferior con botones grandes para pulgares.

---

## 🛠️ Endpoints de la API Backend

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor |
| `GET` | `/api/profiles` | Lista de perfiles (Personal y Empresa) |
| `GET` | `/api/summary?profileId={id}` | Resumen, métricas, P&L y gráficos |
| `GET` | `/api/transactions?profileId={id}` | Lista de transacciones con filtros |
| `POST` | `/api/transactions` | Crear nueva transacción |
| `DELETE` | `/api/transactions/{id}` | Eliminar transacción |
| `GET` | `/api/budgets?profileId={id}` | Obtener presupuestos y consumo real |
| `POST` | `/api/budgets` | Crear o actualizar límite mensual |
| `DELETE` | `/api/budgets/{id}` | Eliminar presupuesto |
| `GET` | `/api/invoices?profileId={id}` | Facturas emitidas y recibidas |
| `POST` | `/api/invoices` | Crear factura |
| `PATCH` | `/api/invoices/{id}/status` | Cambiar estado (pending, paid, overdue) |
| `GET` | `/api/goals?profileId={id}` | Metas de ahorro personales |
| `POST` | `/api/goals` | Crear meta de ahorro |
| `POST` | `/api/goals/{id}/contribute` | Abonar dinero a una meta |
