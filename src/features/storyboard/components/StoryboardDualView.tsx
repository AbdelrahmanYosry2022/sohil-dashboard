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

  return (
    <div className="space-y-4">
      {displayFrames.map((frame, index) => (
        <React.Fragment key={frame.id}>
          <div className="flex flex-row-reverse gap-6 items-start p-4">
              {/* Storyboard Image */}
              <div className="relative group">
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

              {/* Final Art Image */}
              <div className="relative group">
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

          {/* Add button between frames */}
          {index < displayFrames.length - 1 && (
            <div className="flex justify-center py-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary hover:text-primary-foreground shadow"
                onClick={() => onAddFrame(index + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StoryboardDualView;
