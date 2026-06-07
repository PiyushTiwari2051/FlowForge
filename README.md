<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=FlowForge&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Config-Driven%20Application%20Engine&descAlignY=60&descSize=22" width="100%"/>

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-v4-7C3AED?style=for-the-badge&logo=auth0&logoColor=white)](https://next-auth.js.org/)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![GitHub Stars](https://img.shields.io/github/stars/PiyushTiwari2051/FlowForge?style=flat-square&color=gold)](https://github.com/PiyushTiwari2051/FlowForge/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/PiyushTiwari2051/FlowForge?style=flat-square&color=red)](https://github.com/PiyushTiwari2051/FlowForge/issues)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

<br/>

> **🔥 Build complete, full-stack database applications — no backend code, just a JSON config.**
> *Define your schema, pages, components, and API in one file. FlowForge does the rest.*

<br/>

[**🚀 Live Demo**](https://github.com/PiyushTiwari2051/FlowForge) • [**📖 Documentation**](#-getting-started) • [**🎯 Examples**](#-real-world-examples) • [**🤝 Contributing**](#-contributing)

</div>

---

## 📌 Table of Contents

- [💡 What is FlowForge?](#-what-is-flowforge)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🛠️ Technology Stack](#️-technology-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ JSON Configuration Schema](#️-json-configuration-schema)
- [🌐 Auto-Generated REST API](#-auto-generated-rest-api)
- [🎨 Themes & Localization](#-themes--localization)
- [📦 Real-World Examples](#-real-world-examples)
- [🔒 Authentication & Security](#-authentication--security)
- [🤝 Contributing](#-contributing)

---

## 💡 What is FlowForge?

<div align="center">
<br/>

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   Traditional Approach:    1000+ lines of boilerplate code   ║
║   ─────────────────────    ───────────────────────────────   ║
║   FlowForge Approach:      One JSON config file              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

</div>

**FlowForge** is a production-grade, **Config-Driven Application Engine** that eliminates boilerplate. Instead of writing thousands of lines of backend and frontend code for standard CRUD applications (CRMs, Dashboards, Inventory Systems, Task Managers), you define your **entire application** — database schema, UI pages, components, navigation, and REST APIs — in a **single JSON configuration file**.

FlowForge's dynamic compilation engine reads that config, **auto-migrates** the database, **generates** fully typed REST endpoints, and **renders** a premium UI — all in real-time with hot-reloading.

### 🎯 Who is it for?

| Role | Use Case |
|------|----------|
| 🧑‍💻 **Developers** | Rapidly prototype and deploy full-stack apps |
| 📊 **Data Teams** | Create admin dashboards without frontend work |
| 🏢 **Businesses** | Build internal tools in minutes, not months |
| 🎓 **Students** | Learn full-stack architecture through live examples |

---

## ✨ Key Features

<br/>

<table>
<tr>
<td width="50%">

### ⚡ Config-Driven Compilation
Define database tables, UI pages, components, navigation, and REST APIs in **one JSON file**. FlowForge auto-migrates, compiles, and renders instantly.

### 🎨 10 Premium Themes
Toggle between hand-crafted premium themes: **Zinc, Midnight, Forest, Velvet, Crimson, Indigo, Amber, Emerald, Rose, Teal** — all with smooth transitions.

### 🌐 Multi-Language + RTL
Full localization support for **English, Hindi, Arabic (RTL), French, Spanish** with native right-to-left layout switching.

### 📤 Streaming CSV Import
Import thousands of records via CSV with auto column-mapping, skip/overwrite conflict resolution, and **real-time SSE progress** streaming.

</td>
<td width="50%">

### 🔌 Auto-Generated REST APIs
Every table you define automatically exposes **full CRUD endpoints** (`GET`, `POST`, `PUT`, `DELETE`) with filtering, pagination, and sorting.

### 🔔 Live Notification System
Event-driven notification center — get real-time alerts on data inserts, updates, CSV imports, and system events, directly in the UI.

### 🚀 One-Click Code Export
Export your running application as a **standalone, production-ready Next.js codebase** pushed directly to your GitHub with one click.

### 🔒 OTP Email Authentication
Enterprise-grade auth: **email OTP verification**, session management, protected routes via NextAuth.js middleware guard.

</td>
</tr>
</table>

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FlowForge Engine                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   JSON Config File                                                  │
│        │                                                            │
│        ▼                                                            │
│   ┌─────────────────┐     ┌─────────────────┐                      │
│   │  Dynamic DB      │     │  UI Renderer    │                      │
│   │  Compiler        │────▶│  Engine         │                      │
│   │  (Prisma ORM)    │     │  (Next.js 14)   │                      │
│   └────────┬─────────┘     └────────┬────────┘                     │
│            │                        │                              │
│            ▼                        ▼                              │
│   ┌─────────────────┐     ┌─────────────────┐                      │
│   │  Auto-Generated │     │  Component      │                      │
│   │  REST API       │     │  Registry       │                      │
│   │  (CRUD + SSE)   │     │  (Table/Form/   │                      │
│   └─────────────────┘     │   Chart/Card/   │                      │
│                            │   Dashboard)    │                      │
│                            └─────────────────┘                     │
│                                                                     │
│   ┌──────────────────────────────────────────────┐                 │
│   │  NextAuth.js  │  OTP Auth  │  Session Guard   │                 │
│   └──────────────────────────────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Flow:** User writes JSON → FlowForge compiles schema → Prisma migrates DB → REST APIs auto-generate → Premium UI renders live.

---

## 🛠️ Technology Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) | SSR, routing, API routes, middleware |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type safety across full-stack |
| **ORM** | [Prisma](https://prisma.io/) | Dynamic schema compilation & DB migrations |
| **Database** | SQLite / PostgreSQL | Development & production data store |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) | OTP sessions, middleware route guards |
| **Styling** | [TailwindCSS v3](https://tailwindcss.com/) | Utility-first responsive design system |
| **Animations** | [Framer Motion](https://framer.com/motion/) | Micro-animations & page transitions |
| **Charts** | [Recharts](https://recharts.org/) | Live data visualization |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query) | Global state & server state management |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) | In-app JSON config editor |
| **Icons** | [Lucide React](https://lucide.dev/) | Premium consistent icon system |
| **CSV Parsing** | [PapaParse](https://www.papaparse.com/) | High-performance CSV streaming |
| **Streaming** | Server-Sent Events (SSE) | Real-time CSV import progress |

</div>

---

## 📂 Project Structure

```
flowforge/
│
├── 📁 prisma/
│   ├── schema.prisma              # Core auth & app models
│   └── migrations/                # Auto-generated migration history
│
├── 📁 public/                     # Static assets
│
├── 📁 src/
│   │
│   ├── 📁 app/                    # Next.js 14 App Router
│   │   │
│   │   ├── 📁 (auth)/             # Auth pages (login, register, OTP)
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Registration + email OTP
│   │   │   └── verify/            # OTP verification flow
│   │   │
│   │   ├── 📁 api/                # REST API Routes
│   │   │   ├── auth/[...nextauth]/ # NextAuth session handlers
│   │   │   ├── apps/              # App CRUD (create/list/update/delete)
│   │   │   ├── dynamic/           # ⚡ Auto-generated table API endpoints
│   │   │   ├── csv-import/        # Streaming CSV import (SSE)
│   │   │   ├── export/            # GitHub one-click export
│   │   │   └── notifications/     # Notification CRUD & mark-read
│   │   │
│   │   ├── 📁 dashboard/          # Main workspace (protected)
│   │   │   ├── layout.tsx         # Dashboard shell + nav
│   │   │   └── [appId]/           # Dynamic app workspace
│   │   │       ├── page.tsx       # Config editor + live preview
│   │   │       └── [route]/       # Rendered app pages
│   │   │
│   │   ├── globals.css            # Global CSS + theme variables
│   │   ├── layout.tsx             # Root layout with providers
│   │   └── page.tsx               # Landing page
│   │
│   ├── 📁 components/
│   │   ├── ClientProviders.tsx    # QueryClient + SessionProvider
│   │   ├── ThemeProvider.tsx      # 10-theme CSS variable system
│   │   ├── ThemeSelector.tsx      # Theme switcher UI
│   │   ├── LocaleContext.tsx      # i18n + RTL context provider
│   │   ├── NotificationsDrawer.tsx # Live notification panel
│   │   ├── GitHubExportModal.tsx  # One-click GitHub export UI
│   │   │
│   │   └── 📁 registry/           # ⚡ Component Engine
│   │       ├── FormComponent.tsx  # Dynamic form generator
│   │       ├── TableComponent.tsx # Sortable, filterable data table
│   │       ├── ChartComponent.tsx # Bar/Line/Pie auto-charts
│   │       ├── DashboardComponent.tsx # Stats cards + KPI widgets
│   │       ├── CardComponent.tsx  # Record display cards
│   │       └── index.ts           # Component registry map
│   │
│   ├── 📁 lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config + OTP handlers
│   │   ├── compiler.ts            # JSON → SQL schema compiler
│   │   ├── email.ts               # OTP email sender
│   │   └── types.ts               # Shared TypeScript types
│   │
│   └── middleware.ts              # Route protection guard
│
├── .env                           # Environment variables (git-ignored)
├── .env.example                   # Environment template
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # Design tokens & color system
├── vercel.json                    # Vercel deployment config
└── package.json                   # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.0 or higher → [Download](https://nodejs.org/)
- **npm** v9+ or **yarn** v1.22+
- **Git** → [Download](https://git-scm.com/)

### ⚡ Quick Start (3 Steps)

```bash
# 1️⃣ Clone the repository
git clone https://github.com/PiyushTiwari2051/FlowForge.git
cd FlowForge

# 2️⃣ Install dependencies
npm install

# 3️⃣ Set up environment variables
cp .env.example .env
```

### 🔧 Environment Configuration

Edit `.env` with your values:

```env
# Database
DATABASE_URL="file:./dev.db"           # SQLite for local dev
                                        # Use PostgreSQL URL for production

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"     # Generate: openssl rand -hex 32

# Email OTP (use Gmail App Password or SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="FlowForge <your@gmail.com>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# GitHub Export (optional)
GITHUB_PAT="ghp_your_personal_access_token"
```

### 🗄️ Database Setup

```bash
# Push schema to database (creates tables)
npx prisma db push

# Optional: View database in browser UI
npx prisma studio
```

### 🟢 Run the Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** → Create account → Start building! 🎉

---

## ⚙️ JSON Configuration Schema

The heart of FlowForge. Every app is defined by a single JSON config:

```jsonc
{
  "app": {
    "name": "My App",                  // Application display name
    "description": "App description",  // Short description
    "language": "en",                  // "en" | "hi" | "ar" | "fr" | "es"
    "theme": "midnight",               // Any of 10 premium themes
    "primaryColor": "#6366F1"          // HEX accent color
  },

  "database": {
    "tables": [
      {
        "name": "table_name",          // SQL table name (snake_case)
        "displayName": "Display Name", // UI label
        "fields": [
          {
            "name": "field_name",      // Column name
            "type": "string",          // string | number | email | date | boolean | text
            "label": "Field Label",    // UI label
            "required": true,          // Validation
            "unique": false,           // Unique constraint
            "default": "value"         // Default value
          }
        ]
      }
    ]
  },

  "ui": {
    "pages": [
      {
        "route": "/",                  // URL path
        "title": "Page Title",         // Nav label
        "icon": "Home",                // Lucide icon name
        "showInNav": true,             // Show in sidebar
        "components": [
          {
            "id": "unique-id",         // Unique component ID
            "type": "table",           // table | form | chart | dashboard | card
            "table": "table_name",     // Which table to connect
            "config": {
              "title": "Section Title",
              "description": "Optional description"
            }
          }
        ]
      }
    ]
  }
}
```

### 🧩 Component Types

| Type | Description | Best For |
|------|-------------|----------|
| `table` | Sortable, filterable, paginated data grid with inline edit & delete | Viewing all records |
| `form` | Auto-generated form with validation based on field schema | Adding new records |
| `chart` | Bar, Line & Pie charts auto-fed from table data | Data visualization |
| `dashboard` | KPI cards with total count, recent activity, and stats | Overview pages |
| `card` | Individual record display in card grid layout | Profile/detail views |

---

## 🌐 Auto-Generated REST API

Every table defined in your config automatically gets a full REST API:

```
Base URL: /api/dynamic/{appId}/{tableName}
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dynamic/:appId/:table` | Fetch all records (supports `?search=`, `?page=`, `?limit=`) |
| `POST` | `/api/dynamic/:appId/:table` | Create a new record |
| `PUT` | `/api/dynamic/:appId/:table/:id` | Update a record by ID |
| `DELETE` | `/api/dynamic/:appId/:table/:id` | Delete a record by ID |

### 📋 CSV Import API (with SSE Streaming)

```
POST /api/csv-import/:appId/:table
Content-Type: multipart/form-data

# Response: Server-Sent Events stream
data: {"progress": 45, "processed": 450, "total": 1000}
data: {"progress": 100, "processed": 1000, "total": 1000, "done": true}
```

### 🔔 Notifications API

```
GET    /api/notifications          # Get all notifications
PATCH  /api/notifications/:id      # Mark as read
DELETE /api/notifications/:id      # Delete notification
```

---

## 🎨 Themes & Localization

### 🖌️ 10 Premium Themes

| Theme | Preview |
|-------|---------|
| `zinc` | Classic dark neutral |
| `midnight` | Deep blue-black |
| `forest` | Rich dark green |
| `velvet` | Deep purple |
| `crimson` | Dark red accent |
| `indigo` | Professional indigo |
| `amber` | Warm amber tones |
| `emerald` | Fresh emerald green |
| `rose` | Elegant rose pink |
| `teal` | Modern teal |

Switch themes instantly via the **Theme Selector** in the top navigation bar — no page reload required.

### 🌐 Supported Languages

| Code | Language | Direction |
|------|----------|-----------|
| `en` | English | LTR ← Default |
| `hi` | हिन्दी (Hindi) | LTR |
| `ar` | العربية (Arabic) | **RTL** |
| `fr` | Français (French) | LTR |
| `es` | Español (Spanish) | LTR |

---

## 📦 Real-World Examples

### 📋 Example 1 — CRM Application

```json
{
  "app": { "name": "Sales CRM", "theme": "midnight", "language": "en", "primaryColor": "#6366F1" },
  "database": {
    "tables": [{
      "name": "customers", "displayName": "Customers",
      "fields": [
        { "name": "name", "type": "string", "label": "Full Name", "required": true },
        { "name": "email", "type": "email", "label": "Email", "required": true, "unique": true },
        { "name": "phone", "type": "string", "label": "Phone" },
        { "name": "company", "type": "string", "label": "Company" },
        { "name": "status", "type": "string", "label": "Status", "default": "Lead" },
        { "name": "deal_value", "type": "number", "label": "Deal Value ($)" }
      ]
    }]
  },
  "ui": {
    "pages": [
      {
        "route": "/", "title": "Dashboard", "icon": "LayoutDashboard", "showInNav": true,
        "components": [{ "id": "crm-dash", "type": "dashboard", "table": "customers", "config": { "title": "CRM Overview" } }]
      },
      {
        "route": "/customers", "title": "Customers", "icon": "Users", "showInNav": true,
        "components": [
          { "id": "add-customer", "type": "form", "table": "customers", "config": { "title": "Add Customer" } },
          { "id": "customer-list", "type": "table", "table": "customers", "config": { "title": "All Customers" } }
        ]
      },
      {
        "route": "/analytics", "title": "Analytics", "icon": "BarChart2", "showInNav": true,
        "components": [{ "id": "deals-chart", "type": "chart", "table": "customers", "config": { "title": "Deal Pipeline" } }]
      }
    ]
  }
}
```

### 📦 Example 2 — Inventory Manager

```json
{
  "app": { "name": "Inventory Pro", "theme": "forest", "language": "en", "primaryColor": "#10B981" },
  "database": {
    "tables": [{
      "name": "products", "displayName": "Products",
      "fields": [
        { "name": "sku", "type": "string", "label": "SKU", "required": true, "unique": true },
        { "name": "name", "type": "string", "label": "Product Name", "required": true },
        { "name": "category", "type": "string", "label": "Category" },
        { "name": "quantity", "type": "number", "label": "Stock Qty", "default": "0" },
        { "name": "price", "type": "number", "label": "Unit Price" },
        { "name": "supplier", "type": "string", "label": "Supplier" }
      ]
    }]
  },
  "ui": {
    "pages": [
      {
        "route": "/", "title": "Inventory", "icon": "Package", "showInNav": true,
        "components": [
          { "id": "inv-dash", "type": "dashboard", "table": "products", "config": { "title": "Inventory Overview" } },
          { "id": "products-table", "type": "table", "table": "products", "config": { "title": "All Products" } }
        ]
      }
    ]
  }
}
```

### ✅ Example 3 — Task Manager

```json
{
  "app": { "name": "TaskFlow", "theme": "indigo", "language": "en", "primaryColor": "#8B5CF6" },
  "database": {
    "tables": [{
      "name": "tasks", "displayName": "Tasks",
      "fields": [
        { "name": "title", "type": "string", "label": "Task Title", "required": true },
        { "name": "description", "type": "text", "label": "Description" },
        { "name": "status", "type": "string", "label": "Status", "default": "Todo" },
        { "name": "priority", "type": "string", "label": "Priority", "default": "Medium" },
        { "name": "due_date", "type": "date", "label": "Due Date" },
        { "name": "assignee", "type": "string", "label": "Assigned To" }
      ]
    }]
  },
  "ui": {
    "pages": [
      {
        "route": "/", "title": "Tasks", "icon": "CheckSquare", "showInNav": true,
        "components": [
          { "id": "add-task", "type": "form", "table": "tasks", "config": { "title": "New Task" } },
          { "id": "task-list", "type": "table", "table": "tasks", "config": { "title": "All Tasks" } }
        ]
      }
    ]
  }
}
```

---

## 🔒 Authentication & Security

FlowForge implements **enterprise-grade authentication**:

```
Registration Flow:
  1. User enters name + email + password
  2. System sends 6-digit OTP to email (expires in 10 min)
  3. User verifies OTP → Account activated
  4. Secure session created via NextAuth.js JWT

Login Flow:
  1. Email + Password validation (bcrypt hashed)
  2. Session token issued
  3. All dashboard routes protected by middleware guard
```

### Security Measures

- ✅ **bcrypt password hashing** (cost factor 12)
- ✅ **OTP expiry** — tokens expire in 10 minutes
- ✅ **Middleware route guard** — unauthenticated users redirected to login
- ✅ **User data isolation** — each user only accesses their own apps
- ✅ **NEXTAUTH_SECRET** based JWT signing
- ✅ **Environment variables** for all secrets (never hardcoded)

---

## 🤝 Contributing

Contributions are warmly welcome! Here's how to get started:

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/FlowForge.git
cd FlowForge
npm install

# Create a feature branch
git checkout -b feature/your-awesome-feature

# Make your changes, then commit
git commit -m "feat: add awesome new feature"

# Push and open a Pull Request
git push origin feature/your-awesome-feature
```

### Development Guidelines

- Follow **TypeScript** strict typing
- Use **Prisma** for all database operations
- Keep components in `src/components/registry/` for new UI types
- Add new API routes under `src/app/api/`
- Test with at least one real-world JSON config

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repo if FlowForge helped you!

[![GitHub Stars](https://img.shields.io/github/stars/PiyushTiwari2051/FlowForge?style=social)](https://github.com/PiyushTiwari2051/FlowForge/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/PiyushTiwari2051/FlowForge?style=social)](https://github.com/PiyushTiwari2051/FlowForge/network/members)

<br/>

**Built with ❤️ by [Piyush Tiwari](https://github.com/PiyushTiwari2051)**

*FlowForge — Config-Driven. Production-Ready. Zero Boilerplate.*

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

</div>
