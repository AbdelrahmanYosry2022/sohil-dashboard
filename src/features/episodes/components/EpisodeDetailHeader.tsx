import * as React from 'react'
import { Button } from '../../../components/ui/button'
import { Separator } from '../../../components/ui/separator'
import { Home, List } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'

interface EpisodeDetailHeaderProps {
  title: string
  description?: string
  onHome: () => void
  onEpisodes: () => void
  showHomeButton?: boolean
  showEpisodesButton?: boolean
  showStats?: boolean
  showDescription?: boolean
  onLogout?: () => void
}

export function EpisodeDetailHeader({ title, description, onHome, onEpisodes, showHomeButton = true, showEpisodesButton = true, showStats = true, showDescription = true, onLogout }: EpisodeDetailHeaderProps) {
  return (
    <header className="border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Right: logo + separator + title + small stats */}
          <div className="flex items-center gap-4">
            {/* Light mode: dark logo, Dark mode: light logo */}
            <img src="/assets/logo-dark.png" alt="Logo" className="block dark:hidden h-10 w-auto" />
            <img src="/assets/logo-light.png" alt="Logo" className="hidden dark:block h-10 w-auto" />

            <Separator orientation="vertical" className="h-10" />

            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-semibold leading-tight">{title}</h1>
                {showDescription && (
                  description ? (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">وصف مختصر جدًا عن الحلقة الحالية</p>
                  )
                )}
              </div>
              {showStats && (
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">مشاهد:</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">التقدم:</span>
                    <span className="font-medium">72%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Left: Home, Episodes, Profile (profile last) */}
          <div className="flex items-center gap-2">
            {showHomeButton && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-11 w-11 md:h-12 md:w-12"
                aria-label="الصفحة الرئيسية"
                onClick={onHome}
              >
                <Home className="h-5 w-5" />
              </Button>
            )}
            {showEpisodesButton && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-11 w-11 md:h-12 md:w-12"
                aria-label="الرجوع للحلقات"
                onClick={onEpisodes}
              >
                <List className="h-5 w-5" />
              </Button>
            )}

            {/* Profile with dropdown - last on the left */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-11 w-11 md:h-12 md:w-12">
                  <Avatar className="h-full w-full border">
                    <AvatarImage src="/assets/Screenshot_46.png" alt="Profile" />
                    <AvatarFallback>PR</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>الحساب</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
                <DropdownMenuItem>الإعدادات</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => onLogout?.()}>تسجيل الخروج</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
