import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { episodeOperations, statisticsOperations } from '../lib/supabase';
import { Episode } from '../lib/types';

type TabKey =
  | 'overview'
  | 'script'
  | 'audio'
  | 'storyboard'
  | 'draw'
  | 'animation'
  | 'edit'
  | 'final'
  | 'assets'
  | 'budget';

import { LayoutDashboard, FileText, AudioLines, Layers, PencilRuler, Clapperboard, Scissors, Film, Folder, Wallet } from 'lucide-react';

export const TABS = [
  { key: 'overview' as const, label: 'نظرة عامة', icon: LayoutDashboard },
  { key: 'script' as const, label: 'النص', icon: FileText },
  { key: 'audio' as const, label: 'الصوت', icon: AudioLines },
  { key: 'storyboard' as const, label: 'الستوري بورد', icon: Layers },
  { key: 'draw' as const, label: 'الرسم', icon: PencilRuler },
  { key: 'animation' as const, label: 'التحريك', icon: Clapperboard },
  { key: 'edit' as const, label: 'المونتاج', icon: Scissors },
  { key: 'final' as const, label: 'المشاهد النهائية', icon: Film },
  { key: 'assets' as const, label: 'أصول الحلقة', icon: Folder },
  { key: 'budget' as const, label: 'الميزانية', icon: Wallet },
];

export const useEpisodeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const title = useMemo(() => {
    return episode?.title || `حلقة ${id}`;
  }, [episode, id]);

  const loadEpisode = useCallback(async (episodeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await episodeOperations.getById(episodeId);
      // Ensure status is one of the allowed values
      const episodeWithValidStatus = {
        ...data,
        status: (['draft', 'in_progress', 'completed'] as const).includes(
          data.status as 'draft' | 'in_progress' | 'completed'
        ) ? data.status as 'draft' | 'in_progress' | 'completed' : 'draft'
      };
      setEpisode(episodeWithValidStatus);
    } catch (err) {
      console.error('Error loading episode:', err);
      setError('فشل في تحميل بيانات الحلقة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEpisodeStats = useCallback(async (episodeId: string) => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const stats = await statisticsOperations.getEpisodeStats(episodeId);
      setStatsData(stats);
    } catch (err) {
      console.error('Error loading episode stats:', err);
      setStatsError('فشل في تحميل إحصائيات الحلقة');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadEpisode(id);
      loadEpisodeStats(id);
    }
  }, [id, loadEpisode, loadEpisodeStats]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleEpisodes = () => {
    navigate('/episodes');
  };

  const handleRetry = () => {
    if (id) {
      loadEpisode(id);
      loadEpisodeStats(id);
    }
  };

  return {
    // State
    activeTab,
    episode,
    loading,
    error,
    statsData,
    statsLoading,
    statsError,
    title,
    
    // Handlers
    handleTabChange,
    handleHome,
    handleEpisodes,
    handleRetry,
  };
};
