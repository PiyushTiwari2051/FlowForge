import { NormalizedConfig } from "../config/types";

export interface CompiledFile {
  path: string;
  content: string;
}

export function compileCodebase(appId: string, config: NormalizedConfig): CompiledFile[] {
  const files: CompiledFile[] = [];

  // 1. package.json
  files.push({
    path: "package.json",
    content: JSON.stringify(
      {
        name: config.app.name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint",
          "prisma:generate": "prisma generate",
          "prisma:push": "prisma db push",
        },
        dependencies: {
          "@auth/prisma-adapter": "^2.11.2",
          "@prisma/client": "^6.19.3",
          "@tanstack/react-query": "^5.100.11",
          "bcryptjs": "^3.0.3",
          "clsx": "^2.1.1",
          "framer-motion": "^12.40.0",
          "lucide-react": "^1.16.0",
          "next": "14.2.3",
          "next-auth": "^4.24.14",
          "papaparse": "^5.5.3",
          "react": "^18",
          "react-dom": "^18",
          "react-dropzone": "^15.0.0",
          "react-hot-toast": "^2.6.0",
          "recharts": "^3.8.1",
          "tailwind-merge": "^3.6.0",
          "zod": "^4.4.3",
          "zustand": "^5.0.13",
        },
        devDependencies: {
          "@types/bcryptjs": "^2.4.6",
          "@types/node": "^20",
          "@types/papaparse": "^5.5.2",
          "@types/react": "^18",
          "@types/react-dom": "^18",
          "eslint": "^8",
          "eslint-config-next": "14.2.3",
          "postcss": "^8",
          "prisma": "^6.19.3",
          "tailwindcss": "^3.4.1",
          "typescript": "^5",
        },
      },
      null,
      2
    ),
  });

  // 2. tsconfig.json
  files.push({
    path: "tsconfig.json",
    content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
  });

  // 3. tailwind.config.ts
  files.push({
    path: "tailwind.config.ts",
    content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#080C14",
          surface: "#0F172A",
          elevated: "#1E293B",
        },
        border: {
          DEFAULT: "#1E293B",
          subtle: "#334155",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#475569",
        },
        accent: {
          cyan: {
            DEFAULT: "#00C8E0",
            light: "#67E8F9",
            dark: "#0891B2",
          },
          amber: {
            DEFAULT: "#FF7A00",
            light: "#FED7AA",
          },
          purple: {
            DEFAULT: "#7C3AED",
          },
          green: {
            DEFAULT: "#10B981",
          },
          red: {
            DEFAULT: "#EF4444",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;`,
  });

  // 4. postcss.config.mjs
  files.push({
    path: "postcss.config.mjs",
    content: `const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;`,
  });

  // 5. next.config.mjs
  files.push({
    path: "next.config.mjs",
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;`,
  });

  // 6. .gitignore
  files.push({
    path: ".gitignore",
    content: `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# prisma
/prisma/dev.db
/prisma/dev.db-journal`,
  });

  // 7. prisma/schema.prisma
  files.push({
    path: "prisma/schema.prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  createdAt     DateTime  @default(now())
}
`,
  });

  // 8. README.md
  files.push({
    path: "README.md",
    content: `# ${config.app.name}

Generated dynamically by FlowForge.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Setup the Prisma database client:
   \`\`\`bash
   npx prisma db push
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
`,
  });

  // 9. src/app/globals.css
  files.push({
    path: "src/app/globals.css",
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  color: #F1F5F9;
  background-color: #080C14;
  font-family: system-ui, -apple-system, sans-serif;
}
`,
  });

  // 10. Config data itself exported (enables full portability)
  files.push({
    path: "flowforge.config.json",
    content: JSON.stringify(config, null, 2),
  });

  // 11. Custom generated navigation layouts in target app
  // Renders the standalone page components matching config routes
  config.ui.pages.forEach((page) => {
    // Generate route folder
    let pagePath = page.route;
    if (pagePath === "/") {
      pagePath = "src/app/page.tsx";
    } else {
      // Remove leading slash for folder creation
      const cleanPath = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
      pagePath = `src/app/${cleanPath}/page.tsx`;
    }

    files.push({
      path: pagePath,
      content: `"use client";

import React from "react";
import { ComponentRegistry, getComponent } from "@/components/registry";

export default function DynamicPage() {
  const pageDef = ${JSON.stringify(page)};

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="font-bold text-2xl text-white">{pageDef.title}</h1>
          <p className="text-sm text-slate-400">Powered by FlowForge Dynamic UI Registry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pageDef.components.map((comp: any) => {
          const Comp = getComponent(comp.type);
          return (
            <div key={comp.id} className="border border-white/5 bg-slate-900/50 p-6 rounded-xl">
              <Comp
                appId="${appId}"
                config={null as any}
                componentConfig={comp.config}
                table={comp.table}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    });
  });

  return files;
}
