import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'

interface UnifiedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  type: 'folder' | 'scene' | 'storyboard'
  onSubmit: (data: { name: string; description?: string }) => void
  initialData?: {
    name: string
    description?: string
  }
}

export function UnifiedModal({
  isOpen,
  onClose,
  title,
  type,
  onSubmit,
  initialData = { name: '', description: '' }
}: UnifiedModalProps) {
  const [formData, setFormData] = React.useState({
    name: initialData.name,
    description: initialData.description || ''
  })

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.name,
        description: initialData.description || ''
      })
    }
  }, [isOpen, initialData.name, initialData.description])

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim()
      })
      setFormData({ name: '', description: '' })
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    onClose()
  }

  const getPlaceholder = () => {
    switch (type) {
      case 'folder':
        return 'أدخل اسم المجلد'
      case 'scene':
        return 'أدخل اسم المشهد'
      case 'storyboard':
        return 'أدخل اسم الرسم'
      default:
        return 'أدخل الاسم'
    }
  }

  const getDescriptionPlaceholder = () => {
    switch (type) {
      case 'scene':
        return 'وصف المشهد (اختياري)'
      case 'storyboard':
        return 'وصف الرسم (اختياري)'
      default:
        return 'وصف (اختياري)'
    }
  }

  const showDescription = type === 'scene' || type === 'storyboard'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {type === 'folder' ? 'اسم المجلد' : type === 'scene' ? 'اسم المشهد' : 'اسم الرسم'}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={getPlaceholder()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !showDescription) {
                  handleSubmit()
                }
              }}
            />
          </div>
          {showDescription && (
            <div>
              <label className="text-sm font-medium mb-2 block">الوصف</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={getDescriptionPlaceholder()}
                rows={4}
                className="resize-none"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            {type === 'folder' ? 'إنشاء المجلد' : type === 'scene' ? 'إضافة المشهد' : 'إنشاء الرسم'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}