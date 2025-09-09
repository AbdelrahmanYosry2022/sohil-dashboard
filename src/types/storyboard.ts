export interface StoryboardFrame {
  id: string;
  frameId: string;
  title: string;
  description: string;
  thumbnail: string;
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
