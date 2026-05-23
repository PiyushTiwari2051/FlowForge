# 🔥 FlowForge

FlowForge is a premium, state-of-the-art **Config-Driven Application Engine** built on Next.js 14, SQLite, Prisma, and TailwindCSS. 

Instead of writing thousands of lines of boilerplate code to build standard database applications (like CRMs, Task Planners, or Inventory Systems), FlowForge allows you to define your entire application—including database schemas, frontend components, pages, navigation structure, and REST APIs—in a **single JSON configuration file**. FlowForge's dynamic compilation engine instantly compiles, migrates, and renders the fully functional application with hot reloading.

---

## ✨ Key Features

- **⚡ Config-Driven Compilation**: Define your database, pages, and components in JSON, and watch the platform build and hot-reload your application in real-time.
- **🎨 10 Harmonious Premium Themes**: Toggle between high-quality modern themes (zinc, midnight, forest, velvet, crimson, indigo, amber, emerald, rose, and teal) designed to feel ultra-premium.
- **🌐 Native Multi-Language & RTL**: Fully localized support for English, Hindi, Arabic (with native right-to-left UI layouts), French, and Spanish.
- **📤 Streaming CSV Data Import**: Import thousands of records from CSV with automatic column mapping, conflict resolution (skip/overwrite), and real-time Server-Sent Events (SSE) progress indicators.
- **🔌 Auto-Generated REST APIs**: Dynamic CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`) are automatically exposed for every database table you define.
- **🚀 One-Click Code Export**: Export your generated application as a standalone, production-ready Next.js codebase.
- **🔔 Live Notifications**: Integrated event-based notification system notifying you on data additions, updates, imports, and system processes.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database ORM**: [Prisma](https://prisma.io/)
- **Database Engine**: [SQLite](https://sqlite.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling & Components**: [TailwindCSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Interactive Editor**: Custom code editor with validation

---

## 📂 Project Structure

```
flowforge/
├── prisma/                  # Database schema definitions and migrations
│   └── schema.prisma        # Prisma database schema
├── public/                  # Static assets and images
├── src/
│   ├── app/                 # Next.js pages, routing, and dynamic layouts
│   │   ├── api/             # REST endpoints (auth, compilation, dynamic records)
│   │   └── dashboard/       # Core workspace editor, preview engine, and CSV importer
│   ├── components/          # Reusable UI components (Forms, Tables, Charts, stats)
│   ├── lib/                 # Core utility functions & db client
│   └── middleware.ts        # NextAuth security guard
├── README.md                # Project documentation
├── tailwind.config.ts       # Design tokens & color system
└── package.json             # Core dependencies & launch scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js (v18.x or later)](https://nodejs.org/)
- npm or yarn

### Installation & Run

1. **Clone & install dependencies**:
   ```bash
   npm install
   ```

2. **Database Initialization**:
   ```bash
   npx prisma db push
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the platform**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📄 Real-World JSON Config Example (CRM Application)

Paste this configuration directly in your FlowForge Workspace to deploy a live Customer Relationship Management application in 5 seconds:

```json
{
  "app": {
    "name": "My CRM App",
    "description": "Customer management system",
    "language": "en",
    "theme": "dark",
    "primaryColor": "#00C8E0"
  },
  "database": {
    "tables": [
      {
        "name": "customers",
        "displayName": "Customer Database",
        "fields": [
          { "name": "name", "type": "string", "required": true, "label": "Customer Name" },
          { "name": "email", "type": "email", "required": true, "unique": true, "label": "Email Address" },
          { "name": "phone", "type": "string", "required": false, "label": "Phone Number" },
          { "name": "company", "type": "string", "required": false, "label": "Company Name" },
          { "name": "status", "type": "string", "required": false, "default": "Lead", "label": "Customer Status" }
        ]
      }
    ]
  },
  "ui": {
    "pages": [
      {
        "route": "/",
        "title": "Dashboard",
        "icon": "Home",
        "showInNav": true,
        "components": [
          {
            "id": "crm-stats",
            "type": "dashboard",
            "table": "customers",
            "config": {
              "title": "CRM Overview",
              "description": "Live stats of your customer database"
            }
          }
        ]
      },
      {
        "route": "/customers",
        "title": "Customers",
        "icon": "Users",
        "showInNav": true,
        "components": [
          {
            "id": "add-customer",
            "type": "form",
            "table": "customers",
            "config": {
              "title": "Add New Customer"
            }
          },
          {
            "id": "customers-list",
            "type": "table",
            "table": "customers",
            "config": {
              "title": "All Customers"
            }
          }
        ]
      }
    ]
  }
}
```

---

## 🔒 Security & Best Practices

- Always keep your `.env` secrets private. They are pre-excluded in `.gitignore`.
- Run migrations using `npx prisma db push` whenever you alter structure schemas via the dynamic compiler in production environments.

---

*FlowForge is open-source and ready for extensions. Happy crafting!* 🚀
