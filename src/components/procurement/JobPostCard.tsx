import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users, 
  Building2, 
  Clock, 
  Star,
  MessageSquare,
  Eye
} from 'lucide-react';
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
  job_proposals?: { count: number }[];
  image_url?: string;
  urgency?: 'low' | 'medium' | 'high';
  rating?: number;
  total_proposals?: number;
}

interface JobPostCardProps {
  job: JobPosting;
  onJobClick: (job: JobPosting) => void;
  onQuickProposal?: (jobId: string) => void;
  variant?: 'default' | 'featured' | 'compact';
}

const JobPostCard = ({ job, onJobClick, onQuickProposal, variant = 'default' }: JobPostCardProps) => {
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

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
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

  const proposalCount = job.job_proposals?.[0]?.count || job.total_proposals || 0;

  if (variant === 'compact') {
    return (
      <Card className="w-full hover:shadow-md transition-all duration-200 cursor-pointer border-border/50"
            onClick={() => onJobClick(job)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 mb-1">{job.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(job.category)}>
                  {job.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{proposalCount} proposals</span>
              </div>
              <div className="text-xs text-primary font-medium">
                {formatBudget(job.budget_min, job.budget_max)}
              </div>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isFeatured = variant === 'featured';

  return (
    <Card className={`w-full transition-all duration-300 cursor-pointer group relative overflow-hidden
      ${isFeatured 
        ? 'border-2 border-primary/20 bg-gradient-to-br from-background via-background/95 to-primary/5 hover:shadow-xl' 
        : 'hover:shadow-lg bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20'
      }`}
      onClick={() => onJobClick(job)}>
      
      {isFeatured && <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold">FEATURED</div>}
      
      {job.image_url && (
        <div className="h-32 bg-gradient-to-r from-primary/10 to-teal/10 relative overflow-hidden">
          <img 
            src={job.image_url} 
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

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
              <CardTitle className={`font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors
                ${isFeatured ? 'text-lg' : 'text-base'}`}>
                {job.title}
              </CardTitle>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="font-medium">
                  {job.profiles?.company_name || 
                   `${job.profiles?.first_name} ${job.profiles?.last_name}`.trim() || 
                   'Anonymous'}
                </span>
                {job.rating && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{job.rating}</span>
                    </div>
                  </>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge className={getCategoryColor(job.category)}>
                  {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                </Badge>
                
                {job.urgency && (
                  <Badge className={getUrgencyColor(job.urgency)}>
                    {job.urgency.toUpperCase()}
                  </Badge>
                )}
                
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium">{proposalCount}</span> proposals
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{Math.floor(Math.random() * 50) + 10}</span> views
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{Math.floor(Math.random() * 5) + 1}</span> messages
            </div>
          </div>
          
          <div className="flex gap-2">
            {onQuickProposal && (
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-primary hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickProposal(job.id);
                }}
              >
                Quick Proposal
              </Button>
            )}
            
            <Button 
              variant={isFeatured ? "default" : "outline"}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default JobPostCard;