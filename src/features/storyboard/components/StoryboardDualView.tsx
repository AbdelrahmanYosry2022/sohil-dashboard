import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';

interface StoryboardDualViewProps {
  frames: any[];
  onEditFrame: (frame: any) => void;
  onDeleteFrame: (frameId: string) => Promise<void>;
  onAddFrame: (index: number) => void;
  onOpenFrame: (frameId: string) => void;
  activeSceneId: string | null;
  sceneFrames: any[];
  unassignedFrames: any[];
}

export const StoryboardDualView: React.FC<StoryboardDualViewProps> = ({
  frames,
  onEditFrame,
  onDeleteFrame,
  onAddFrame,
  onOpenFrame,
  activeSceneId,
  sceneFrames,
  unassignedFrames,
}) => {
  const displayFrames = activeSceneId ? sceneFrames : unassignedFrames;

  if (displayFrames.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        لا توجد إطارات لعرضها
      </div>
    );
  }

  // Add button component for reusability
  const AddButton = ({ onClick, className = '' }: { onClick: () => void; className?: string }) => (
    <Button
      variant="outline"
      size="sm"
      className={`w-8 h-8 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary hover:text-primary-foreground shadow ${className}`}
      onClick={onClick}
      aria-label="إضافة إطار"
    >
      <Plus size={14} />
    </Button>
  );

  // unified wrapper for row-separator buttons (right edge). Using negative margin to pull toward outer border if needed.
  const ButtonRow: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
      <div className="flex justify-end w-full py-2 -mr-4 pr-0">
        <AddButton onClick={onClick} />
      </div>
    );
  };

  return (
    <div className="space-y-0 px-4 flex flex-col items-start" dir="rtl">
  <ButtonRow onClick={() => onAddFrame(-1)} />
      {displayFrames.map((frame, index) => (
        <React.Fragment key={frame.id}>
          <div className="flex flex-row gap-6 items-start p-4 justify-start">
        {/* Storyboard Image (يمين) */}
        <div className="relative group flex-shrink-0 order-1">
                <Card className="w-64 hover:shadow-lg transition-all bg-background relative z-10">
                  <div className="relative">
                    <div 
                      className="aspect-video bg-muted rounded-t-lg overflow-hidden cursor-pointer" 
                      onClick={() => onOpenFrame(frame.id)}
                    >
                      <img 
                        src={frame.thumbnail} 
                        alt={frame.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <h3 className="font-semibold text-xs">{frame.title}</h3>
                      <span className="text-[10px] text-muted-foreground">#{frame.order}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {frame.description}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Final Art Image (يسار) */}
              <div className="relative group flex-shrink-0 order-2">
                <Card className="w-64 hover:shadow-lg transition-all bg-background relative z-10 border-dashed">
                  <div className="relative">
                    <div className="aspect-video bg-muted/50 rounded-t-lg overflow-hidden cursor-pointer flex items-center justify-center">
                      {frame.finalThumbnail ? (
                        <img 
                          src={frame.finalThumbnail} 
                          alt={`${frame.title} نهائي`} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          الرسم النهائي لاحقاً
                        </span>
                      )}
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
          </div>

          {/* Add button after this row (between or final). Always render; last one acts as after-last-row */}
          <ButtonRow onClick={() => onAddFrame(index + 1)} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default StoryboardDualView;
