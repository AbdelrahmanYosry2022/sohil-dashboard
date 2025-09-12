import React, { useRef, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Edit, Trash2, Plus, ImagePlus } from 'lucide-react';

interface DrawingSingleViewProps {
  frames: any[];
  onEditFrame: (frame: any) => void;
  onDeleteFrame: (frameId: string) => Promise<void>;
  onOpenFrame: (frameId: string) => void;
  onAddFrame: (index: number) => void;
  onUploadFinalArt: (frameId: string, file: File) => Promise<void>;
  cardsPerRow?: number; // 2 | 3
}

export const DrawingSingleView: React.FC<DrawingSingleViewProps> = ({
  frames,
  onEditFrame,
  onDeleteFrame,
  onOpenFrame,
  onAddFrame,
  onUploadFinalArt,
  cardsPerRow = 3,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFrameId, setUploadingFrameId] = useState<string | null>(null);

  const handleAddFinalArtClick = (frameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadingFrameId(frameId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFrameId) return;
    
    try {
      await onUploadFinalArt(uploadingFrameId, file);
    } catch (error) {
      console.error('Error uploading final art:', error);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadingFrameId(null);
    }
  };

  const colClass = cardsPerRow === 2 ? 'basis-1/2' : 'basis-1/3'
  
  // التحقق من وجود frames وأنه مصفوفة
  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        لا توجد إطارات
      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="space-y-8 px-4">
      {Array.from({ length: Math.ceil((frames.length + 1) / cardsPerRow) }, (_, rowIndex) => {
        const startIndex = rowIndex * cardsPerRow;
        const rowFrames = frames.slice(startIndex, startIndex + cardsPerRow);
        
        return (
          <div key={rowIndex} className="flex items-center gap-4">
            <div className="relative group/separator flex items-center justify-center" style={{ width: '32px', height: '256px' }}>
              <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-border -translate-x-1/2 -translate-y-1/2 z-5" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/separator:opacity-100 transition-all duration-200 z-30">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 h-8 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                  onClick={() => onAddFrame(startIndex - 1)}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
            
            {rowFrames.map((frame, cardIndex) => {
              const globalIndex = startIndex + cardIndex;
              return (
                <React.Fragment key={frame.id}>
                  <div className={`relative ${colClass}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all bg-background h-full flex flex-col">
                      <div className="relative">
                        {/* Storyboard Image */}
                        <div 
                          className="aspect-video bg-muted overflow-hidden cursor-pointer border-b border-border"
                          onClick={() => onOpenFrame(frame.id)}
                        >
                          <img 
                            src={frame.thumbnail} 
                            alt={frame.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Final Art Section */}
                        <div className="aspect-video bg-muted/30 border-b border-border relative group/finalart">
                          {frame.finalArtPath ? (
                            <div className="w-full h-full flex items-center justify-center bg-white">
                              <img 
                                src={frame.finalThumbnail || frame.finalArtPath} 
                                alt={`Final Art - ${frame.title}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/finalart:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover/finalart:opacity-100">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-white hover:bg-white/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(frame.finalArtPath, '_blank');
                                  }}
                                >
                                  عرض بالحجم الكامل
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="w-full h-full flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={(e) => handleAddFinalArtClick(frame.id, e)}
                            >
                              <ImagePlus className="w-8 h-8 text-muted-foreground group-hover/finalart:text-foreground transition-colors" />
                              <span className="text-xs text-muted-foreground group-hover/finalart:text-foreground transition-colors mt-2">
                                {uploadingFrameId === frame.id ? 'جاري الرفع...' : 'إضافة رسم نهائي'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 bg-background/80 hover:bg-background"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditFrame(frame);
                            }}
                          >
                            <Edit size={12} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await onDeleteFrame(frame.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3 flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <h3 className="font-semibold text-xs">{frame.title}</h3>
                          <span className="text-[10px] text-muted-foreground">#{frame.order}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {frame.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {cardIndex < rowFrames.length - 1 && (
                    <div key={`separator-${globalIndex}`} className="relative group/separator flex items-center justify-center" style={{ width: '32px', height: '256px' }}>
                      <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-border -translate-x-1/2 -translate-y-1/2 z-5" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/separator:opacity-100 transition-all duration-200 z-30">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-8 h-8 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                          onClick={() => onAddFrame(globalIndex)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            {/* عناصر وهمية للحفاظ على نفس العرض في الصف الأخير */}
            {rowFrames.length < cardsPerRow && Array.from({length: cardsPerRow - rowFrames.length}).map((_,i) => (
              <div key={`ph-${i}`} className={`relative ${colClass} opacity-0 pointer-events-none`}>placeholder</div>
            ))}
          </div>
        );
      })}
    </div>
    </>
  );
};

export default DrawingSingleView;
