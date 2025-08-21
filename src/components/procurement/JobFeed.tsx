import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, DollarSign, MapPin, Users, Building2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
}

const JobFeed = ({ jobs, loading, onJobClick }: JobFeedProps) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      pools: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      outdoors: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      patios: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      improvements: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      construction: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const formatBudget = (min: number, max: number) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `From $${min.toLocaleString()}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()}`;
    }
    return 'Budget TBD';
  };

  const getInitials = (firstName: string, lastName: string, companyName: string) => {
    if (companyName) {
      return companyName.substring(0, 2).toUpperCase();
    }
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

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

  if (jobs.length === 0) {
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
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          className="w-full hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20"
          onClick={() => onJobClick(job)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-teal text-white font-semibold">
                    {getInitials(
                      job.profiles?.first_name || '',
                      job.profiles?.last_name || '',
                      job.profiles?.company_name || ''
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                    {job.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="font-medium">
                      {job.profiles?.company_name || 
                       `${job.profiles?.first_name} ${job.profiles?.last_name}`.trim() || 
                       'Anonymous'}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getCategoryColor(job.category)}>
                      {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                    </Badge>
                    
                    {job.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="flex items-center gap-1 text-sm font-medium text-primary mb-1">
                  <DollarSign className="h-4 w-4" />
                  {formatBudget(job.budget_min, job.budget_max)}
                </div>
                
                {job.deadline && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(job.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {job.description && (
              <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                {job.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {job.job_proposals?.[0]?.count || 0} proposals
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-primary hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onJobClick(job);
                }}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JobFeed;