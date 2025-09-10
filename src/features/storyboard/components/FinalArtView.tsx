import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';

interface FinalArtViewProps {
  frames: any[];
  onEditFrame: (frame: any) => void;
  onDeleteFrame: (frameId: string) => Promise<void>;
  onOpenFrame: (frameId: string) => void;
  onAddFrame: (index: number) => void;
  cardsPerRow?: number; // 2 | 3 | 4
}

export const FinalArtView: React.FC<FinalArtViewProps> = ({
  frames,
  onEditFrame,
  onDeleteFrame,
  onOpenFrame,
  onAddFrame,
  cardsPerRow = 3,
}) => {
  const colClass = cardsPerRow === 2 ? 'basis-1/2' : cardsPerRow === 3 ? 'basis-1/3' : 'basis-1/4'
  if (frames.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        لا توجد رسومات نهائية
      </div>
    );
  }

  return (
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
                  <div className={`relative group ${colClass}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all bg-background">
                      <div className="relative">
                        <div 
                          className="aspect-video bg-muted/50 overflow-hidden cursor-pointer flex items-center justify-center"
                          onClick={() => onOpenFrame(frame.id)}
                        >
                          {frame.finalThumbnail ? (
                            <img 
                              src={frame.finalThumbnail} 
                              alt={`${frame.title} نهائي`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              الرسم النهائي لاحقاً
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <h3 className="font-semibold text-xs">{frame.title} - نهائي</h3>
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
            {rowFrames.length < cardsPerRow && Array.from({length: cardsPerRow - rowFrames.length}).map((_,i) => (
              <div key={`ph-${i}`} className={`relative ${colClass} opacity-0 pointer-events-none`}>placeholder</div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default FinalArtView;
