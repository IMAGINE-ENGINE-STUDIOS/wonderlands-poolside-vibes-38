import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  location: string;
  status: string;
  created_at: string;
  business_id: string;
  view_count: number;
  proposal_count: number;
  last_activity: string;
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export const useProcurementData = (filters?: any) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCacheKey = (filters: any) => {
    return `jobs-${JSON.stringify(filters || {})}`;
  };

  const getFromCache = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  };

  const setToCache = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  };

  const fetchJobs = useCallback(async (useCache = true) => {
    const cacheKey = getCacheKey(filters);
    
    // Check cache first
    if (useCache) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        setJobs(cachedData);
        setLoading(false);
        return;
      }
    }

    try {
      let query = supabase
        .from('job_postings')
        .select(`
          *,
          profiles!job_postings_business_id_fkey (
            first_name,
            last_name,
            company_name
          )
        `)
        .eq('status', 'open')
        .order('last_activity', { ascending: false });

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.budgetMin) {
        query = query.gte('budget_min', filters.budgetMin);
      }
      if (filters?.budgetMax) {
        query = query.lte('budget_max', filters.budgetMax);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setJobs(data || []);
      setToCache(cacheKey, data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Track job view
  const trackJobView = useCallback(async (jobId: string) => {
    if (!jobId) return;

    const sessionId = localStorage.getItem('session_id') || 
                     (() => {
                       const id = `session-${Date.now()}-${Math.random()}`;
                       localStorage.setItem('session_id', id);
                       return id;
                     })();

    try {
      await supabase.from('job_views').upsert({
        job_id: jobId,
        viewer_id: user?.id || null,
        session_id: sessionId,
        viewed_at: new Date().toISOString()
      }, {
        onConflict: 'job_id,viewer_id,session_id',
        ignoreDuplicates: true
      });

      // Update local cache optimistically
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, view_count: (job.view_count || 0) + 1 }
          : job
      ));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchJobs();

    // Subscribe to job_postings changes
    const jobsChannel = supabase
      .channel('job_postings_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_postings',
          filter: 'status=eq.open'
        }, 
        (payload) => {
          console.log('Job posting changed:', payload);
          // Invalidate cache and refetch
          cache.clear();
          fetchJobs(false);
        }
      )
      .subscribe();

    // Subscribe to proposal changes
    const proposalsChannel = supabase
      .channel('proposals_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_proposals'
        },
        (payload) => {
          console.log('Proposal changed:', payload);
          
          // Update proposal count optimistically
          if (payload.eventType === 'INSERT') {
            const newProposal = payload.new as any;
            setJobs(prev => prev.map(job =>
              job.id === newProposal.job_id
                ? { ...job, proposal_count: (job.proposal_count || 0) + 1 }
                : job
            ));
          } else if (payload.eventType === 'DELETE') {
            const oldProposal = payload.old as any;
            setJobs(prev => prev.map(job =>
              job.id === oldProposal.job_id
                ? { ...job, proposal_count: Math.max(0, (job.proposal_count || 0) - 1) }
                : job
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(proposalsChannel);
    };
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    refetch: () => fetchJobs(false),
    trackJobView
  };
};
