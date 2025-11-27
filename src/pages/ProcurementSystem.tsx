import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Building2, AlertTriangle, Globe, TrendingUp, Users, Briefcase, DollarSign, Clock, RefreshCw } from 'lucide-react';
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
import { useProcurementData } from '@/hooks/useProcurementData';
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
  last_activity?: string;
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}
const ProcurementSystem = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showQuickProposal, setShowQuickProposal] = useState(false);
  const [quickProposalJob, setQuickProposalJob] = useState<JobPosting | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<any>({});
  
  // Use the custom hook for data fetching with caching and real-time updates
  const { jobs, loading, error, refetch, trackJobView } = useProcurementData(searchFilters);
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
    const matchesBudget = 
      (!searchFilters.budgetMin || job.budget_min >= searchFilters.budgetMin) && 
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
        return new Date(a.deadline || '9999-12-31').getTime() - 
               new Date(b.deadline || '9999-12-31').getTime();
      case 'most_proposals':
        return (b.proposal_count || 0) - (a.proposal_count || 0);
      case 'most_viewed':
        return (b.view_count || 0) - (a.view_count || 0);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  const requireAuth = (action: () => void, actionName: string) => {
    if (!user) {
      toast.error(`Please sign in to ${actionName}`);
      navigate('/auth');
      return;
    }
    action();
  };
  const handleJobCreated = () => {
    setShowJobForm(false);
    refetch();
    toast.success('Job posted successfully!');
  };
  const isCompanyProfileComplete = () => {
    if (!profile) return false;
    return profile.company_name && (profile.first_name || profile.last_name);
  };
  const handlePostJobClick = () => {
    requireAuth(() => {
      if (!isCompanyProfileComplete()) {
        toast.error('Please complete your company profile before posting jobs');
        return;
      }
      setShowJobForm(true);
    }, 'post jobs');
  };
  const handleQuickProposal = (jobId: string) => {
    requireAuth(() => {
      const job = filteredJobs.find(j => j.id === jobId);
      if (job) {
        setQuickProposalJob(job);
        setShowQuickProposal(true);
        trackJobView(jobId); // Track view when opening proposal
      }
    }, 'submit proposals');
  };
  const handleProfileClick = (userId: string) => {
    requireAuth(() => {
      setSelectedProfileId(userId);
      setShowProfile(true);
    }, 'view profiles');
  };
  const handleMessaging = () => {
    requireAuth(() => {
      setShowMessaging(true);
    }, 'access messages');
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Corporate Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Procurement Network</h1>
                <p className="text-sm text-slate-600">Professional B2B Marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => refetch()} 
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {user ? <>
                  <Button onClick={handleMessaging} variant="ghost" size="sm">
                    Messages
                  </Button>
                  <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Dashboard
                  </Button>
                </> : <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Connect with Top Suppliers
              </h2>
              <p className="text-xl mb-6 text-blue-100">
                Access thousands of verified suppliers, post procurement needs, and manage your supply chain efficiently.
              </p>
              <div className="flex gap-4">
                <Button onClick={handlePostJobClick} size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Post Requirement
                </Button>
                <Button onClick={() => document.getElementById('jobs-section')?.scrollIntoView({
                behavior: 'smooth'
              })} size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Opportunities
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                  <Globe className="h-8 w-8 text-blue-200 mb-2" />
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-blue-100">Active Suppliers</div>
                </Card>
                <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                  <TrendingUp className="h-8 w-8 text-blue-200 mb-2" />
                  <div className="text-2xl font-bold">$300k+</div>
                  <div className="text-sm text-blue-100">Monthly Volume</div>
                </Card>
                <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                  <Users className="h-8 w-8 text-blue-200 mb-2" />
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-blue-100">Companies</div>
                </Card>
                <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                  <Building2 className="h-8 w-8 text-blue-200 mb-2" />
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-blue-100">Industries</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-slate-200 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-slate-500">Active</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{filteredJobs.length}</div>
            <div className="text-sm text-slate-600">Open Opportunities</div>
          </Card>

          <Card className="p-6 border-slate-200 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-green-600" />
              <span className="text-sm font-medium text-slate-500">Network</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">500+</div>
            <div className="text-sm text-slate-600">Verified Suppliers</div>
          </Card>

          <Card className="p-6 border-slate-200 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <span className="text-sm font-medium text-slate-500">Value</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">$300k+</div>
            <div className="text-sm text-slate-600">Monthly Volume</div>
          </Card>

          <Card className="p-6 border-slate-200 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <span className="text-sm font-medium text-slate-500">Response</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">&lt;24h</div>
            <div className="text-sm text-slate-600">Average Time</div>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <main id="jobs-section" className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Browse Opportunities</h3>
          <p className="text-slate-600">Discover procurement needs from verified businesses</p>
        </div>

        <div className="mb-8">
          <JobSearchEnhanced onFiltersChange={setSearchFilters} totalJobs={filteredJobs.length} />
        </div>

        <JobFeed 
          jobs={filteredJobs} 
          loading={loading} 
          onJobClick={(job) => {
            setSelectedJob(job);
            trackJobView(job.id); // Track view when clicking job
          }} 
          onQuickProposal={handleQuickProposal} 
          onProfileClick={handleProfileClick} 
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">Procurement Network</h4>
            <p className="text-slate-400 text-sm">
              Professional B2B marketplace connecting businesses with verified suppliers worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Browse Jobs</li>
              <li>Post Requirements</li>
              <li>Find Suppliers</li>
              <li>Success Stories</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>About Us</li>
              <li>Contact</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
          © 2024 Procurement Network. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      {user && isCompanyProfileComplete() && <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
            <EnhancedJobPostingForm onJobCreated={handleJobCreated} />
          </DialogContent>
        </Dialog>}

      {/* Job Detail Modal */}
      {selectedJob && <JobDetailModal job={selectedJob} isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} onProposalSubmitted={() => {
      setSelectedJob(null);
      refetch(); // Use refetch instead of fetchJobs
    }} />}

      {/* Quick Proposal Modal */}
      <QuickProposalModal job={quickProposalJob} isOpen={showQuickProposal} onClose={() => {
      setShowQuickProposal(false);
      setQuickProposalJob(null);
    }} onSubmit={proposalData => {
      console.log('Quick proposal submitted:', proposalData);
      refetch(); // Refresh jobs after proposal submission using cached refetch
    }} />

      {/* Messaging System */}
      <MessagingSystem isOpen={showMessaging} onClose={() => setShowMessaging(false)} />

      {/* User Profile Modal */}
      <UserProfileModal isOpen={showProfile} onClose={() => {
      setShowProfile(false);
      setSelectedProfileId(null);
    }} userId={selectedProfileId || undefined} isOwnProfile={!selectedProfileId} />
    </div>;
};
export default ProcurementSystem;