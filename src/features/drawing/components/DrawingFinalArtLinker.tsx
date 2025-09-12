import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ImagePlus } from 'lucide-react';
import { drawingApi, drawingStorage } from '../api';
// Using window.alert as a fallback for toast notifications
const toast = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
  if (options.variant === 'destructive') {
    console.error(options.title, options.description);
  } else {
    console.log(options.title, options.description);
  }
  window.alert(`${options.title}: ${options.description}`);
};

interface DrawingFinalArtLinkerProps {
  episodeId: string;
  frameId: string;
  currentFinalArtPath?: string | null;
  currentThumbnail?: string;
  onLinked: (frameId: string, finalArtPath: string, thumbnail: string) => void;
  onUnlinked: (frameId: string) => void;
}

export function DrawingFinalArtLinker({
  episodeId,
  frameId,
  currentFinalArtPath,
  currentThumbnail,
  onLinked,
  onUnlinked,
}: DrawingFinalArtLinkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Using the imported toast function directly

  // Set initial preview URL
  useEffect(() => {
    if (currentFinalArtPath) {
      setPreviewUrl(currentThumbnail || '');
    }
  }, [currentFinalArtPath, currentThumbnail]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار ملف صورة صالح',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleLinkFinalArt = async () => {
    if (!selectedFile) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار ملف صورة أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsLinking(true);
    try {
      const { data: existingFinalArt, error: fetchError } = await drawingApi.getFrame(frameId);
      
      if (fetchError) {
        toast({
          title: 'خطأ',
          description: 'فشل في جلب بيانات الإطار',
          variant: 'destructive'
        });
        return;
      }
      
      if (existingFinalArt?.finalArtPath) {
        // Delete the old final art
        await drawingStorage.deleteFinalArtImage(existingFinalArt.finalArtPath);
      }
      
      const safeName = `${frameId}-${Date.now()}-${selectedFile.name}`;
      const uploaded = await drawingStorage.uploadFinalArt(
        episodeId,
        safeName,
        selectedFile
      );
      
      if (uploaded) {
        // Update the frame with the final art path
        await drawingApi.updateFrame(frameId, {
          finalArtPath: uploaded
        });
        
        // Generate a thumbnail URL (using the same image for simplicity)
        const finalArtUrl = drawingStorage.getFinalArtPublicUrl(uploaded);
        
        if (!finalArtUrl) {
          throw new Error('فشل في إنشاء رابط الصورة النهائية');
        }
        
        toast({
          title: 'تم الربط بنجاح',
          description: 'تم ربط الرسم النهائي بالإطار بنجاح',
        });
        onLinked(frameId, uploaded, finalArtUrl);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error linking final art:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في ربط الرسم النهائي. يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkFinalArt = async () => {
    if (!currentFinalArtPath) return;

    try {
      // Unlink the final art from the frame
      const result = await drawingApi.unlinkFinalArtFromFrame(episodeId, frameId);
      
      if (result) {
        toast({
          title: 'تم إلغاء الربط',
          description: 'تم إزالة الرسم النهائي من الإطار',
        });
        onUnlinked(frameId);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error unlinking final art:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة الرسم النهائي. يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {previewUrl ? (
        <div className="relative">
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
            <img
              src={previewUrl}
              alt="Final Art Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-md p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            لا يوجد رسم نهائي مرتبط بهذا الإطار
          </p>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ImagePlus className="w-4 h-4 mr-1" />
                ربط رسم نهائي
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ربط رسم نهائي بالإطار</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="final-art">اختر صورة الرسم النهائي</Label>
                  <Input
                    id="final-art"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLinking}
                  />
                </div>
                {previewUrl && (
                  <div className="border rounded-md p-2">
                    <p className="text-sm font-medium mb-2">معاينة الصورة:</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLinking}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleLinkFinalArt}
                  disabled={!selectedFile || isLinking}
                >
                  {isLinking ? 'جاري الربط...' : 'ربط الرسم النهائي'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
