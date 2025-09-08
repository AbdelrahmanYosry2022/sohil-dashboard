import React from 'react'

interface TabHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

// A standardized tab header used across all tabs
// - Title: text-2xl font-bold
// - Description: muted foreground, small
// - Horizontal spacing and vertical padding unified
export function TabHeader({ title, description, actions, className = '' }: TabHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
  )
}

export default TabHeader
