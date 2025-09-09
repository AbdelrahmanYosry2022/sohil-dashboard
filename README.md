# Sohil Dashboard

لوحة تحكم متطورة مبنية بتقنيات حديثة.

## التوثيق

- [نظام التصميم](/docs/DESIGN_SYSTEM.md) - الدليل الشامل لمبادئ التصميم والمكونات

## المتطلبات

- Node.js 18+
- npm 9+ أو pnpm 8+

## التثبيت

```bash
# تثبيت التبعيات
npm install

# تشغيل بيئة التطوير
npm run dev
```

```
new-sohil
├─ .eslintrc.json
├─ .templates
│  └─ component
│     └─ ComponentName.tsx
├─ ai_ui_contract.md
├─ apply-storage-policies.sql
├─ components.json
├─ docs
│  ├─ database-schema.md
│  └─ DESIGN_SYSTEM.md
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.cjs
├─ public
│  ├─ assets
│  │  ├─ logo-dark.png
│  │  ├─ logo-light.png
│  │  └─ Screenshot_46.png
│  ├─ fonts
│  │  ├─ GRAPHIK ARABIC BLACK.woff
│  │  ├─ GRAPHIK ARABIC BOLD.woff
│  │  ├─ GRAPHIK ARABIC EXTRALIGHT.woff
│  │  ├─ GRAPHIK ARABIC LIGHT.woff
│  │  ├─ GRAPHIK ARABIC MEDIUM.woff
│  │  ├─ GRAPHIK ARABIC SEMIBOLD.woff
│  │  ├─ GRAPHIK ARABIC THIN.woff
│  │  └─ GRAPHIK ARABIC.woff
│  └─ test-audio.mp3
├─ README-Supabase.md
├─ README.md
├─ schema.sql
├─ src
│  ├─ App.tsx
│  ├─ components
│  │  ├─ EpisodeDetailHeader.tsx
│  │  ├─ EpisodeSidebar.tsx
│  │  ├─ LoginPage.tsx
│  │  ├─ TabHeader.tsx
│  │  ├─ theme-toggle.tsx
│  │  └─ ui
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ header.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ progress.tsx
│  │     ├─ separator.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     └─ unified-modal.tsx
│  ├─ contexts
│  │  └─ AuthContext.tsx
│  ├─ env.d.ts
│  ├─ hooks
│  │  ├─ useAnimationTab.ts
│  │  ├─ useAudioTab.ts
│  │  ├─ useDrawingTab.ts
│  │  ├─ useEditingTab.ts
│  │  ├─ useEpisodeDetail.ts
│  │  ├─ useStoryboardTab.ts
│  │  └─ useTextTab.ts
│  ├─ lib
│  │  ├─ supabase.ts
│  │  ├─ types.ts
│  │  └─ utils.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ EpisodeDetail.tsx
│  │  ├─ Episodes.tsx
│  │  └─ tabs
│  │     ├─ AnimationTab.tsx
│  │     ├─ AudioTab.tsx
│  │     ├─ components
│  │     ├─ DrawingTab.tsx
│  │     ├─ EditingTab.tsx
│  │     ├─ StoryboardFrameTab.tsx
│  │     ├─ StoryboardTab.tsx
│  │     └─ TextTab.tsx
│  ├─ styles
│  │  └─ globals.css
│  └─ types
│     ├─ database.ts
│     ├─ storyboard.ts
│     └─ supabase.ts
├─ storage-policies.sql
├─ STORAGE_POLICIES_GUIDE.md
├─ STORAGE_SETUP_GUIDE.md
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  ├─ gotrue-version
│  │  ├─ pooler-url
│  │  ├─ postgres-version
│  │  ├─ project-ref
│  │  ├─ rest-version
│  │  └─ storage-version
│  ├─ config.toml
│  └─ migrations
│     └─ 20250906142533_remote_schema.sql
├─ supabase-schema.sql
├─ tailwind.config.cjs
├─ tsconfig.json
└─ vite.config.ts

```