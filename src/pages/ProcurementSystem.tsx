import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building2, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import EnhancedJobPostingForm from '@/components/procurement/EnhancedJobPostingForm';
import JobFeed from '@/components/procurement/JobFeed';
import JobDetailModal from '@/components/procurement/JobDetailModal';
import QuickProposalModal from '@/components/procurement/QuickProposalModal';
import MessagingSystem from '@/components/procurement/MessagingSystem';
import UserProfileModal from '@/components/UserProfileModal';
import JobSearchEnhanced from '@/components/procurement/JobSearchEnhanced';

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

const ProcurementSystem = () => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showQuickProposal, setShowQuickProposal] = useState(false);
  const [quickProposalJob, setQuickProposalJob] = useState<JobPosting | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<any>({});

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'pools', label: 'Pools' },
    { value: 'outdoors', label: 'Outdoors' },
    { value: 'patios', label: 'Patios' },
    { value: 'improvements', label: 'Improvements' },
    { value: 'construction', label: 'Construction' }
  ];

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('job_postings')
        .select(`
          *,
          profiles!job_postings_business_id_fkey (
            first_name,
            last_name,
            company_name
          ),
          job_proposals (count)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const filteredJobs = jobs.filter(job => {
    // Search term filtering
    const matchesSearch = !searchFilters.searchTerm || 
      job.title.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.profiles?.company_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.profiles?.first_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.profiles?.last_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());
    
    // Category filtering
    const matchesCategory = !searchFilters.category || 
      searchFilters.category === 'all' || 
      job.category === searchFilters.category;
    
    // Location filtering
    const matchesLocation = !searchFilters.location || 
      job.location?.toLowerCase().includes(searchFilters.location.toLowerCase());
    
    // Budget filtering
    const matchesBudget = (!searchFilters.budgetMin || job.budget_min >= searchFilters.budgetMin) &&
      (!searchFilters.budgetMax || job.budget_max <= searchFilters.budgetMax);
    
    // Deadline filtering
    const matchesDeadline = !searchFilters.deadline || 
      new Date(job.deadline) <= new Date(searchFilters.deadline);
    
    return matchesSearch && matchesCategory && matchesLocation && matchesBudget && matchesDeadline;
  }).sort((a, b) => {
    // Sorting logic
    switch (searchFilters.sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'budget_high':
        return (b.budget_max || 0) - (a.budget_max || 0);
      case 'budget_low':
        return (a.budget_min || 0) - (b.budget_min || 0);
      case 'deadline':
        return new Date(a.deadline || '9999-12-31').getTime() - new Date(b.deadline || '9999-12-31').getTime();
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleJobCreated = () => {
    setShowJobForm(false);
    fetchJobs();
    toast.success('Job posted successfully!');
  };

  const isCompanyProfileComplete = () => {
    if (!profile) return false;
    // Check if user has completed essential company information
    return profile.company_name && (profile.first_name || profile.last_name);
  };

  const handlePostJobClick = () => {
    if (!user) {
      toast.error('Please sign in to post jobs');
      return;
    }
    
    if (!isCompanyProfileComplete()) {
      toast.error('Please complete your company profile before posting jobs');
      return;
    }
    
    setShowJobForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full procurement-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-teal/5 rounded-full procurement-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-coral/5 rounded-full procurement-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border/30 sticky top-0 z-40 pt-20 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-teal to-coral bg-clip-text text-transparent procurement-pulse">
                Procurement Network
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
                Connect with top-rated professionals for your construction and improvement projects. 
                Post jobs, receive proposals, and build your dream project.
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {filteredJobs.length} Active Jobs
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Trusted Network</span>
                <span className="hidden sm:inline">•</span>
                <span>Quality Assured</span>
                <span className="hidden sm:inline">•</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessaging(true)}
                  className="text-primary hover:text-teal"
                >
                  Messages
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProfileId(null);
                    setShowProfile(true);
                  }}
                  className="text-primary hover:text-teal"
                >
                  My Profile
                </Button>
              </div>
            </div>

            <div className="w-full md:w-auto">
              {user ? (
                isCompanyProfileComplete() ? (
                  <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
                    <DialogTrigger asChild>
                      <Button className="w-full md:w-auto bg-gradient-to-r from-primary via-teal to-coral text-white hover:scale-105 transition-all duration-300 procurement-pulse shadow-lg px-6 md:px-8 py-3 text-base md:text-lg">
                        <PlusCircle className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                        Post New Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-full md:max-w-7xl max-h-[95vh] overflow-hidden p-0 m-2">
                      <div className="p-4 md:p-6">
                        <EnhancedJobPostingForm onJobCreated={handleJobCreated} />
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="space-y-3">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Complete your company profile to start posting jobs
                      </AlertDescription>
                    </Alert>
                    <Button 
                      variant="outline" 
                      className="w-full md:w-auto glass-button"
                      onClick={() => window.location.href = '/auth'}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Complete Profile
                    </Button>
                  </div>
                )
              ) : (
                <Button 
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-teal text-white hover:scale-105 transition-all duration-300 shadow-lg px-6 md:px-8 py-3"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Sign In to Post Jobs
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="mt-6 md:mt-8">
            <JobSearchEnhanced
              onFiltersChange={setSearchFilters}
              totalJobs={filteredJobs.length}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {[
            { label: 'Active Jobs', value: filteredJobs.length, color: 'text-blue-500' },
            { label: 'Categories', value: categories.length - 1, color: 'text-green-500' },
            { label: 'This Month', value: '12+', color: 'text-purple-500' },
            { label: 'Success Rate', value: '98%', color: 'text-orange-500' }
          ].map((stat, index) => (
            <Card key={index} className="glass-card procurement-slide-up border-border/30 hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-4 md:p-6 text-center">
                <div className={`text-xl md:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <JobFeed
          jobs={filteredJobs}
          loading={loading}
          onJobClick={setSelectedJob}
          onQuickProposal={(jobId) => {
            const job = [...filteredJobs].find(j => j.id === jobId);
            if (job) {
              setQuickProposalJob(job);
              setShowQuickProposal(true);
            }
          }}
          onProfileClick={(userId) => {
            setSelectedProfileId(userId);
            setShowProfile(true);
          }}
        />
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onProposalSubmitted={() => {
            setSelectedJob(null);
            fetchJobs();
          }}
        />
      )}

      {/* Quick Proposal Modal */}
      <QuickProposalModal
        job={quickProposalJob}
        isOpen={showQuickProposal}
        onClose={() => {
          setShowQuickProposal(false);
          setQuickProposalJob(null);
        }}
        onSubmit={(proposalData) => {
          console.log('Quick proposal submitted:', proposalData);
          fetchJobs(); // Refresh jobs after proposal submission
        }}
      />

      {/* Messaging System */}
      <MessagingSystem
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false);
          setSelectedProfileId(null);
        }}
        userId={selectedProfileId || undefined}
        isOwnProfile={!selectedProfileId}
      />
    </div>
  );
};

export default ProcurementSystem;