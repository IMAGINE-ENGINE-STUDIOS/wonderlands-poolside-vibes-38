import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Search, Filter, MapPin, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import JobPostingForm from '@/components/procurement/JobPostingForm';
import JobFeed from '@/components/procurement/JobFeed';
import JobDetailModal from '@/components/procurement/JobDetailModal';

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

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJobCreated = () => {
    setShowJobForm(false);
    fetchJobs();
    toast.success('Job posted successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40 pt-20 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
                Procurement Network
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect with professionals for your construction and improvement projects
              </p>
            </div>

            {user && (
              <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-teal text-white hover:scale-105 transition-all duration-300">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Post Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Job Posting</DialogTitle>
                  </DialogHeader>
                  <JobPostingForm onJobCreated={handleJobCreated} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, locations, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/60 backdrop-blur-sm border-border/50"
              />
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-6 bg-background/60 backdrop-blur-sm">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.value}
                    value={category.value}
                    className="text-xs md:text-sm"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <JobFeed
          jobs={filteredJobs}
          loading={loading}
          onJobClick={setSelectedJob}
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
    </div>
  );
};

export default ProcurementSystem;