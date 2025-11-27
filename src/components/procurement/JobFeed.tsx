import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import JobPostCard from './JobPostCard';

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
  view_count?: number;
  proposal_count?: number;
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

interface JobFeedProps {
  jobs: JobPosting[];
  loading: boolean;
  onJobClick: (job: JobPosting) => void;
  onQuickProposal?: (jobId: string) => void;
  onProfileClick?: (userId: string) => void;
}

const JobFeed = ({ jobs, loading, onJobClick, onQuickProposal, onProfileClick }: JobFeedProps) => {
  // Use only real jobs from database
  const allJobs = jobs;

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (allJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Building2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
        <p className="text-muted-foreground">Be the first to post a job opportunity!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {allJobs.map((job, index) => (
            <JobPostCard
              key={job.id}
              job={job}
              onJobClick={onJobClick}
              onQuickProposal={onQuickProposal}
              onProfileClick={onProfileClick}
              variant={index === 0 ? 'featured' : 'default'}
            />
      ))}
    </div>
  );
};

export default JobFeed;