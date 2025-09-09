import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'

export type SidebarItem<Key extends string = string> = {
  key: Key
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface EpisodeSidebarProps<Key extends string = string> {
  title?: string
  description?: string
  items: SidebarItem<Key>[]
  active: Key
  onChange: (key: Key) => void
  className?: string
}

export function EpisodeSidebar<Key extends string = string>({
  title = 'التبويبات',
  description = 'تنقّل سريع بين مراحل الإنتاج',
  items,
  active,
  onChange,
  className,
}: EpisodeSidebarProps<Key>) {
  return (
    <nav aria-label="Episode sections" className={className}>
      <Card className="w-full max-w-xs shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <ul className="space-y-1.5">
            {items.map(({ key, label, icon: Icon }) => (
              <li key={key}>
                <button
                  onClick={() => onChange(key)}
                  className={
                    'w-full rounded-md px-3 py-2 text-right inline-flex items-center gap-3 transition-colors ' +
                    (active === key
                      ? 'bg-accent text-foreground'
                      : 'hover:bg-muted/60 text-muted-foreground')
                  }
                  aria-current={active === key ? 'page' : undefined}
                >
                  {Icon ? <Icon className="h-5 w-5" /> : null}
                  <span className="text-sm">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </nav>
  )
}
