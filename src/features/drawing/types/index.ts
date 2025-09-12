export interface StoryboardFrame {
  id: string;
  frameId: string;
  title: string;
  description: string;
  thumbnail: string;
  // نوع الإطار: الرسم (اسكتش) أو رسم نهائي
  frameType: 'storyboard' | 'final' | 'drawing';
  // الصورة النهائية (الرسم النهائي) اختيارية
  finalThumbnail?: string;
  // مسار الصورة النهائية داخل مخزن Supabase (Storage)
  finalArtPath?: string | null;
  duration: number;
  notes: string;
  order: number;
  sceneId?: string;
}

export interface Scene {
  id: string;
  title: string;
  thumbnail: string;
  description?: string;
}

export interface Folder {
  id: string;
  name: string;
  scenes: Scene[];
}
