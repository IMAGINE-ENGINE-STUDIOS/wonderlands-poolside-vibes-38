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
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
  job_proposals: { count: number }[];
}

interface JobFeedProps {
  jobs: JobPosting[];
  loading: boolean;
  onJobClick: (job: JobPosting) => void;
  onQuickProposal?: (jobId: string) => void;
}

const JobFeed = ({ jobs, loading, onJobClick, onQuickProposal }: JobFeedProps) => {
  // Add sample mock data to showcase functionality
  const mockJobs = [
    {
      id: 'mock-1',
      title: 'Luxury Pool Installation - Custom Design',
      description: 'Looking for experienced pool contractor to install a custom luxury pool with spa integration, waterfall features, and LED lighting system. Must have experience with high-end residential projects and proper licensing.',
      category: 'pools',
      budget_min: 45000,
      budget_max: 65000,
      deadline: '2025-04-15',
      location: 'Miami, FL',
      status: 'open',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      business_id: 'mock-business-1',
      profiles: {
        first_name: 'John',
        last_name: 'Smith',
        company_name: 'Luxury Homes Development'
      },
      job_proposals: [{ count: 8 }],
      urgency: 'high' as const,
      rating: 4.8,
      image_url: '/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png'
    },
    {
      id: 'mock-2',
      title: 'Commercial Patio Renovation',
      description: 'Restaurant patio needs complete renovation including new concrete work, tile installation, outdoor kitchen setup, and landscaping. Must work nights/weekends to minimize disruption.',
      category: 'patios',
      budget_min: 25000,
      budget_max: 40000,
      deadline: '2025-03-30',
      location: 'Orlando, FL',
      status: 'open',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      business_id: 'mock-business-2',
      profiles: {
        first_name: 'Maria',
        last_name: 'Rodriguez',
        company_name: 'Oceanview Restaurant Group'
      },
      job_proposals: [{ count: 12 }],
      urgency: 'medium' as const,
      rating: 4.5,
      image_url: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png'
    },
    {
      id: 'mock-3',
      title: 'Outdoor Kitchen & Entertainment Area',
      description: 'Complete outdoor living space construction including kitchen with built-in grill, bar seating, fire pit area, and pergola. High-end finishes required.',
      category: 'outdoors',
      budget_min: 35000,
      budget_max: 55000,
      deadline: '2025-06-15',
      location: 'Jacksonville, FL',
      status: 'open',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      business_id: 'mock-business-3',
      profiles: {
        first_name: 'Sarah',
        last_name: 'Williams',
        company_name: 'Elite Property Management'
      },
      job_proposals: [{ count: 5 }],
      urgency: 'low' as const,
      rating: 4.9,
      image_url: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
    }
  ];

  // Combine real jobs with mock data for demonstration
  const allJobs = [...jobs, ...mockJobs];

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
          variant={index === 0 ? 'featured' : 'default'}
        />
      ))}
    </div>
  );
};

export default JobFeed;