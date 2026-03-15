import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, HardHat, Droplets, Wrench, MapPin, Clock, ChevronRight, ArrowLeft, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CareerPosting {
  id: string;
  title: string;
  category: string;
  description: string | null;
  location: string | null;
  job_type: string | null;
  requirements: string | null;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
}

const jobCategories = [
  {
    id: 'sales_team',
    title: 'Sales Team',
    description: 'Join our growing sales team and help families transform their backyards into dream oases.',
    icon: Users,
    gradient: 'from-primary to-teal',
    bgGlow: 'bg-primary/10',
    link: '/sales-rep-register',
    type: 'link' as const,
  },
  {
    id: 'independent_contractor',
    title: 'Independent Contractor',
    description: 'Partner with Wonderlands as a licensed contractor. Access projects, tools, and a growing client base.',
    icon: Wrench,
    gradient: 'from-coral to-orange',
    bgGlow: 'bg-coral/10',
    link: '/contractor-registration',
    type: 'link' as const,
  },
  {
    id: 'construction_worker',
    title: 'Construction Worker',
    description: 'Build amazing outdoor spaces. We're hiring skilled construction workers for pool and patio installations.',
    icon: HardHat,
    gradient: 'from-teal to-primary',
    bgGlow: 'bg-teal/10',
    type: 'db' as const,
    dbCategory: 'construction_worker',
  },
  {
    id: 'pool_cleaner',
    title: 'Pool Cleaner',
    description: 'Keep pools sparkling. Join our maintenance crew and help homeowners enjoy their pools year-round.',
    icon: Droplets,
    gradient: 'from-orange to-coral',
    bgGlow: 'bg-orange/10',
    type: 'db' as const,
    dbCategory: 'pool_cleaner',
  },
];

const JobsPage = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [postings, setPostings] = useState<CareerPosting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expandedCategory) {
      fetchPostings(expandedCategory);
    }
  }, [expandedCategory]);

  const fetchPostings = async (category: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('career_postings')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setPostings(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-coral/5" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-coral/10 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Briefcase className="w-3 h-3 mr-1" /> We're Hiring
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Join the Wonderlands Team
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Be part of a company transforming backyards into personal oases. Explore career opportunities below.
          </p>
        </div>
      </section>

      {/* Job Categories */}
      <section className="max-w-6xl mx-auto px-4 pb-20 -mt-4">
        {!expandedCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.id}
                  className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => {
                    if (cat.type === 'link' && cat.link) {
                      window.location.href = cat.link;
                    } else if (cat.type === 'db' && cat.dbCategory) {
                      setExpandedCategory(cat.dbCategory);
                    }
                  }}
                >
                  <div className={`absolute inset-0 ${cat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <CardContent className="p-8 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{cat.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{cat.description}</p>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      {cat.type === 'link' ? 'Apply Now' : 'View Openings'}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => { setExpandedCategory(null); setPostings([]); }} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Positions
            </Button>
            
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal">
              {expandedCategory === 'construction_worker' ? 'Construction Worker' : 'Pool Cleaner'} Openings
            </h2>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading positions...</div>
            ) : postings.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No Open Positions Right Now</h3>
                  <p className="text-muted-foreground">Check back soon — we're always growing! You can also send your resume to{' '}
                    <a href="mailto:careers@wonderlandsworld.com" className="text-primary hover:underline">careers@wonderlandsworld.com</a>
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {postings.map((post) => (
                  <Card key={post.id} className="border-border/50 hover:border-primary/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-xl font-bold text-foreground">{post.title}</h3>
                          {post.description && <p className="text-muted-foreground">{post.description}</p>}
                          <div className="flex flex-wrap gap-3 text-sm">
                            {post.location && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5 text-coral" /> {post.location}
                              </span>
                            )}
                            {post.job_type && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5 text-teal" /> {post.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
                              </span>
                            )}
                            {post.salary_range && (
                              <Badge variant="secondary">{post.salary_range}</Badge>
                            )}
                          </div>
                          {post.requirements && (
                            <p className="text-sm text-muted-foreground mt-2"><strong>Requirements:</strong> {post.requirements}</p>
                          )}
                        </div>
                        <Button variant="gradient" asChild>
                          <a href={`mailto:careers@wonderlandsworld.com?subject=Application: ${post.title}`}>
                            Apply Now
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default JobsPage;
