# AI‑UI Contract & Consistency Guide (React 19 + TypeScript 5.9 + Vite 6.3 + Tailwind 3.4 + Radix UI)

> هذا الملف هو المرجع الملزم لكل الـ Agents أثناء توليد الواجهة. الهدف: **تصميم فائق التناسق** عبر المشروع ككل.

---

## 1) النطاق & الـStack
- **UI Framework:** React 19 (TSX)
- **Styling:** Tailwind CSS 3.4 فقط (لا CSS خارجي إلا عبر `@layer`)
- **Primitives:** Radix UI (Dialog, DropdownMenu, Label, Progress, Separator, Slot, Avatar)
- **Icons:** lucide-react (أحجام موحّدة)
- **State/Router:** React Router DOM 6.26
- **BaaS:** Supabase
- **Build:** Vite 6.3
- **Helpers:** clsx + tailwind-merge، tailwindcss-animate

> **ممنوع**: inline styles، قيم Tailwind عشوائية مثل `p-[13px]`، أكثر من Reset واحد، إضافة أي مكتبات CSS جديدة بدون موافقة.

---

## 2) قواعد غير قابلة للتفاوض (Hard Rules)
1. **لا inline styles** في JSX. كل شيء عبر Tailwind utility أو عبر مكوّنات/طبقات `@layer`.
2. **لا arbitrary values** في Tailwind (مثل `mt-[7px]`). استخدم الscale المعتمد فقط.
3. **Spacing & Layout** تدار عبر "Primitives": `Container`, `Stack`, `Cluster`, `Grid`.
4. **مكتبة UI واحدة**: Radix + مكوّناتنا. لا مزج Baselines من مكتبات أخرى.
5. **RTL أولاً**: استخدم `px`, `ps/pe` (إن وجد) أو تجنّب خصائص `pl/pr` غير المتناظرة. لا تستخدم `left/right` في الـlayout.
6. **Focus-visible** إلزامي. ممنوع `outline: none` إلا مع بديل واضح.
7. **Dark/Light** تُدار بفئة `class` على `<html>`، وألوان مربوطة بمتغيرات CSS.
8. **Icon sizing** موحّد: `h-5 w-5` افتراضي داخل الأزرار والنصوص.
9. **لا margin عمودي داخل المكوّنات**: استخدم `Stack` للفراغات الرأسية. المارجن يُسمح به فقط على مستوى أقسام الصفحة (Section boundaries).
10. **ملفات**: كل مكوّن بـ TSX + ملف `index.ts` للتصدير المنظّم.

---

## 3) Design Tokens
### 3.1 CSS Variables
ضعها في `src/styles/theme.css` واستوردها في `main.tsx` أو ضمن `globals.css`:

```css
:root {
  /* Typography */
  --font-sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans Arabic", "Inter", Arial, sans-serif;

  /* Colors */
  --bg: 255 255 255;          /* #fff */
  --fg: 15 23 42;             /* slate-900 */
  --muted: 100 116 139;       /* slate-500 */
  --brand: 91 141 239;        /* #5B8DEF */
  --brand-contrast: 10 13 20; /* #0A0D14 */

  /* Surface */
  --surface: 248 250 252;     /* slate-50 */
  --card: 255 255 255;
  --border: 226 232 240;      /* slate-200 */

  /* Radius */
  --r-xs: 0.25rem;
  --r-sm: 0.375rem;
  --r-md: 0.5rem;
  --r-lg: 0.75rem;
  --r-xl: 1rem;
  --r-2xl: 1.25rem;

  /* Motion */
  --ease: cubic-bezier(.2,.8,.2,1);
  --dur-1: 120ms;
  --dur-2: 200ms;
  --dur-3: 320ms;
}

.dark {
  --bg: 2 6 23;              /* slate-950 */
  --fg: 241 245 249;         /* slate-100 */
  --muted: 148 163 184;      /* slate-400 */
  --surface: 3 7 18;         /* near black */
  --card: 15 23 42;          /* slate-900 */
  --border: 51 65 85;        /* slate-700 */
}
```

### 3.2 Tailwind Config (tokens مربوطة بالمتغيرات)
`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: { sans: ["var(--font-sans)", "sans-serif"] },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
      },
      borderRadius: {
        xs: "var(--r-xs)", sm: "var(--r-sm)", DEFAULT: "var(--r-md)",
        md: "var(--r-md)", lg: "var(--r-lg)", xl: "var(--r-xl)", "2xl": "var(--r-2xl)"
      },
      transitionTimingFunction: { brand: "var(--ease)" },
      transitionDuration: { 120: "120ms", 200: "200ms", 320: "320ms" },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        md: "0 2px 8px 0 rgb(0 0 0 / 0.06)",
        lg: "0 8px 24px -8px rgb(0 0 0 / 0.12)",
      },
      spacing: {
        0: "0rem", 0.5: "0.125rem", 1: "0.25rem", 1.5: "0.375rem",
        2: "0.5rem", 2.5: "0.625rem", 3: "0.75rem", 3.5: "0.875rem",
        4: "1rem", 5: "1.25rem", 6: "1.5rem", 8: "2rem", 10: "2.5rem", 12: "3rem"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), plugin(function() {})],
} satisfies Config;
```

---

## 4) Base/Reset & Layers
`src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "./theme.css";

*,*::before,*::after{ box-sizing:border-box }
html{ font-size:16px }
body{ margin:0; background:theme("colors.bg"); color:theme("colors.fg"); font-family: theme("fontFamily.sans") }

h1,h2,h3,h4,h5,h6,p,ul,ol{ margin:0; padding:0 }

/* Focus visible */
:where(button,[role="button"],a,input,textarea,select):focus-visible{
  outline: 2px solid rgb(var(--brand));
  outline-offset: 2px;
}

/* Radix portals inherit theme */
[data-radix-portal] { color: inherit }

/* Utilities Layer (اختياري لتجميع أدوات صغيرة) */
@layer utilities {
  .tap { @apply select-none touch-manipulation; }
  .card-border { @apply border border-border; }
}
```

---

## 5) Helper: `cn`
`src/lib/cn.ts`:

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }
```

---

## 6) Layout Primitives (ممنوع إدارة الفراغات يدويًا خارجها)
`src/ui/primitives/Container.tsx`
```tsx
import { cn } from "@/lib/cn";
export function Container({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
```

`src/ui/primitives/Stack.tsx`
```tsx
import { cn } from "@/lib/cn";
export type Space = 0|0.5|1|1.5|2|2.5|3|3.5|4|5|6|8|10|12;
export function Stack({ gap = 4, className, children }: React.PropsWithChildren<{ gap?: Space; className?: string }>) {
  return <div className={cn(`flex flex-col gap-${gap}`, className)}>{children}</div>;
}
```

`src/ui/primitives/Cluster.tsx`
```tsx
import { cn } from "@/lib/cn";
import type { Space } from "./Stack";
export function Cluster({ gap=2, align="center", wrap=true, className, children }:
  React.PropsWithChildren<{ gap?: Space; align?: "start"|"center"|"end"; wrap?: boolean; className?: string }>) {
  return (
    <div className={cn("flex items-center", wrap && "flex-wrap", `gap-${gap}`, `items-${align}`, className)}>
      {children}
    </div>
  );
}
```

`src/ui/primitives/Grid.tsx`
```tsx
import { cn } from "@/lib/cn";
export function Grid({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>{children}</div>;
}
```

> **قاعدة:** أي صفحة = `Container` خارجي + أقسام داخلية مفصولة بـ `Stack` (gap ثابت). لا تضع `mt/mb` داخل العناصر.

---

## 7) أمثلة مكوّنات نمطية (Buttons/Card/Field)
`src/ui/components/Button.tsx`
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base = "inline-flex items-center justify-center gap-2 rounded-md tap transition duration-200 ease-brand disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  solid:   "bg-brand text-[rgb(var(--brand-contrast))] hover:opacity-90",
  outline: "border border-border bg-transparent text-fg hover:bg-card",
  ghost:   "bg-transparent text-fg hover:bg-card/60",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean; variant?: Variant; size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
  }
);
Button.displayName = "Button";
```

`src/ui/components/Card.tsx`
```tsx
import { cn } from "@/lib/cn";
export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-lg bg-card text-fg shadow-md card-border", className)}>{children}</div>;
}
export function CardBody({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("p-4 sm:p-6", className)}>{children}</div>;
}
export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-4 sm:p-6 border-b border-border">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </div>
  );
}
```

`src/ui/components/Field.tsx`
```tsx
import * as React from "react";
import { Label } from "@radix-ui/react-label";
import { cn } from "@/lib/cn";

export function Field({ id, label, hint, children, className }:{ id:string; label:string; hint?:string; className?:string; children:React.ReactNode }){
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-sm text-fg">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export const inputBase = "h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-fg placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70";
```

---

## 8) أنماط الحركة والتحميل
- استخدم `tailwindcss-animate` فقط. مدد المدد إلى 120/200/320ms.
- Skeleton موحّد:
```tsx
export function Skeleton({ className="h-4 w-full" }:{ className?: string }){
  return <div className={cn("animate-pulse rounded-md bg-fg/10", className)} />
}
```

---

## 9) RTL
- على `<html dir="rtl">`.
- استخدم `px-…` للتماثل. تجنب `pl/pr` إلا لضرورة.
- أي Icon يوضع **بعد** النص افتراضيًا في RTL (عدّل عند الحاجة).

---

## 10) Supabase في الواجهة
- لا طلبات مباشرة داخل المكوّنات المعروضة بصريًا. استخدم حاويات (Containers) + hooks.
- حالة (loading/empty/error) لها UI ثابت (Skeleton/EmptyState/ErrorState) ضمن `src/ui/patterns/`.

---

## 11) ESLint/Quality Gates
`.eslintrc.json` (المقتطفات المهمة):
```json
{
  "plugins": ["tailwindcss", "react"],
  "rules": {
    "react/forbid-dom-props": ["error", { "forbid": ["style"] }],
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/no-contradicting-classname": "error"
  }
}
```
> **CI يفشل** لو وُجد `style=` في JSX أو `-[…px]` في كلاس Tailwind.

---

## 12) بنية الملفات
```
src/
  lib/cn.ts
  styles/globals.css
  styles/theme.css
  ui/
    primitives/ { Container.tsx, Stack.tsx, Cluster.tsx, Grid.tsx }
    components/ { Button.tsx, Card.tsx, Field.tsx, … }
    patterns/   { Skeleton.tsx, EmptyState.tsx, ErrorState.tsx }
  pages/…
```

---

## 13) نظام الـPrompts للـAgents (انسخه كنص نظامي)
> **System/Developer Message:**
> - استخدم فقط: Container, Stack, Cluster, Grid لإدارة المسافات.
> - ممنوع inline styles، وممنوع arbitrary Tailwind values.
> - استخدم ألوان/أنماط من Design Tokens. لا تضف Reset أو مكتبات CSS.
> - RTL افتراضي. الأيقونات بعد النص.
> - الأزرار عبر `<Button>` فقط، الحقول عبر `<Field>`+`inputBase`.
> - لا تستخدم margin عمودي داخل المكوّنات، دع Stack يدير الفراغات.
> - أي مكوّن جديد يجب أن يكون: ملف TSX + تصدير افتراضي + Props واضحة.

---

## 14) Checklist قبل الدمج (PR)
- [ ] لا يوجد `style=` في JSX.
- [ ] لا توجد قيم Tailwind عشوائية.
- [ ] صفحة ملفوفة بـ `<Container>`.
- [ ] الفراغات عبر `Stack/Cluster` فقط.
- [ ] اتساق RTL والأيقونات.
- [ ] حالات loading/empty/error موجودة.

---

## 15) أسئلة شائعة
- **أحتاج padding إضافي؟** زود `gap` في `Stack` أو `px` على `Container` فقط.
- **Icon أكبر؟** استخدم `className="h-6 w-6"` مع الحفاظ على line-height.
- **عنصر Radix؟** لفّه داخل Card/Body لتطبيق tokens تلقائيًا.

---

# خطة إصلاح التناسق في المشروع (Migration Playbook)

1) **تجميد التوكنز**: أضف `theme.css` و`tailwind.config.ts` المرفقين. فعّل الـdarkMode = class.
2) **Baseline موحّد**: استورد `globals.css` في جذر التطبيق.
3) **إنشاء Primitives**: أضف `Container`, `Stack`, `Cluster`, `Grid`.
4) **حظر الفوضى**: فعّل ESLint rules. اجعل CI يفشل عند المخالفة.
5) **تلفيح الصفحات**: لف كل صفحاتك بـ `<Container>` واستبدل الـmargin الرأسية بـ `<Stack gap=…>`.
6) **توحيد الأزرار والحقول**: استبدل أي button/input عشوائي بـ `<Button>` و`inputBase` داخل `<Field>`.
7) **تنظيف RTL**: غيّر أي `pl/pr` غير متناظر إلى `px` أو استعمل بدائل متناسقة. تجنب `left/right`.
8) **Skeleton/States**: أضف Skeleton/Empty/Error موحّدين واستعملهم في كل fetch.
9) **فحص بصري**: أضف Storybook (اختياري) + لقطة بصرية (Chromatic/Percy) لأهم الشاشات.
10) **قفل الدمج**: لا دمج لأي PR لا يمر على Checklist أعلاه.

> بعد تطبيق الخطوات 1→6 سترى هبوطًا كبيرًا في التباين بصريًا. الخطوات 7→10 تصقل النتائج وتمنع الارتداد.

