import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  MapPin, DollarSign, Calendar, Briefcase, Send, Clock,
  ChevronDown, ChevronRight, ImagePlus, CheckCircle, Eye
} from 'lucide-react';
import ProcurementProposalForm from './ProcurementProposalForm';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  start_date: string | null;
  status: string;
  created_at: string;
  project_id: string;
  phase_item_id: string | null;
}

interface ProjectGroup {
  project_id: string;
  project_name: string;
  cover_image_url: string | null;
  status: string;
  project_listing: Listing | null; // whole-project listing
  task_listings: Listing[]; // individual task listings
  phases: PhaseGroup[];
}

interface PhaseGroup {
  phase_id: string;
  phase_name: string;
  phase_order: number;
  items: PhaseItemWithListing[];
}

interface PhaseItemWithListing {
  id: string;
  item_name: string;
  is_completed: boolean;
  item_order: number;
  listing: Listing | null;
}

interface MyProposal {
  id: string;
  proposed_price: number | null;
  proposal_text: string | null;
  estimated_timeline: string | null;
  status: string;
  proposal_type: string;
  created_at: string;
  listing_id: string;
  procurement_listings: {
    id: string;
    title: string;
    project_id: string;
    construction_projects?: {
      project_name: string;
      cover_image_url: string | null;
    };
  } | null;
}

interface ContractorProcurementTabProps {
  contractorId: string;
  contractorStatus: string;
}

const ContractorProcurementTab: React.FC<ContractorProcurementTabProps> = ({
  contractorId, contractorStatus
}) => {
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [myProposals, setMyProposals] = useState<MyProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<Listing | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [contractorId]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch open listings with their project info
    const [listingsRes, proposalsRes] = await Promise.all([
      supabase
        .from('procurement_listings')
        .select('*, construction_projects(id, project_name, cover_image_url, status)')
        .eq('status', 'open')
        .order('created_at', { ascending: false }) as any,
      supabase
        .from('procurement_proposals')
        .select('*, procurement_listings(id, title, project_id, construction_projects(project_name, cover_image_url))')
        .eq('contractor_id', contractorId)
        .order('created_at', { ascending: false }) as any,
    ]);

    const listings: any[] = listingsRes.data || [];
    setMyProposals(proposalsRes.data || []);

    // Get unique project IDs from listings
    const projectIds = [...new Set(listings.map((l: any) => l.project_id))];

    // Fetch phases and items for those projects
    if (projectIds.length > 0) {
      const [phasesRes, itemsRes] = await Promise.all([
        supabase
          .from('project_phases')
          .select('*')
          .in('project_id', projectIds)
          .order('phase_order') as any,
        supabase
          .from('phase_items')
          .select('*, project_phases!inner(project_id)')
          .order('item_order') as any,
      ]);

      const phases: any[] = phasesRes.data || [];
      const items: any[] = itemsRes.data || [];

      // Build project groups
      const groups: ProjectGroup[] = projectIds.map((pid) => {
        const projectListings = listings.filter((l: any) => l.project_id === pid);
        const projectInfo = projectListings[0]?.construction_projects;
        const projectPhases = phases.filter((p: any) => p.project_id === pid);

        const phaseGroups: PhaseGroup[] = projectPhases.map((phase: any) => {
          const phaseItems = items
            .filter((i: any) => i.phase_id === phase.id)
            .map((item: any) => ({
              id: item.id,
              item_name: item.item_name,
              is_completed: item.is_completed,
              item_order: item.item_order,
              listing: projectListings.find((l: any) => l.phase_item_id === item.id) || null,
            }));

          return {
            phase_id: phase.id,
            phase_name: phase.phase_name,
            phase_order: phase.phase_order,
            items: phaseItems,
          };
        });

        return {
          project_id: pid,
          project_name: projectInfo?.project_name || 'Project',
          cover_image_url: projectInfo?.cover_image_url || null,
          status: projectInfo?.status || 'active',
          project_listing: projectListings.find((l: any) => !l.phase_item_id) || null,
          task_listings: projectListings.filter((l: any) => l.phase_item_id),
          phases: phaseGroups,
        };
      });

      setProjectGroups(groups);
      // Auto-expand all projects
      setExpandedProjects(new Set(projectIds));
    } else {
      setProjectGroups([]);
    }

    setLoading(false);
  };

  const appliedListingIds = new Set(
    myProposals.map(p => p.procurement_listings?.id).filter(Boolean)
  );

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(projectId) ? next.delete(projectId) : next.add(projectId);
      return next;
    });
  };

  if (contractorStatus !== 'approved') {
    return (
      <Card className="holographic-panel border-cyan-500/20">
        <CardContent className="pt-6 text-center">
          <Briefcase className="w-12 h-12 text-cyan-500/30 mx-auto mb-4" />
          <h3 className="font-mono font-semibold mb-2 text-cyan-300">Account Not Approved</h3>
          <p className="text-xs font-mono text-cyan-400/60">
            Your account must be approved before you can access procurement listings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-[#0d0d15] border border-cyan-500/20">
          <TabsTrigger
            value="listings"
            className="font-mono text-xs data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-300"
          >
            Available Projects ({projectGroups.length})
          </TabsTrigger>
          <TabsTrigger
            value="proposals"
            className="font-mono text-xs data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-300"
          >
            My Proposals ({myProposals.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Projects */}
        <TabsContent value="listings" className="space-y-4">
          {projectGroups.length === 0 ? (
            <Card className="holographic-panel border-cyan-500/20">
              <CardContent className="pt-6 text-center">
                <Briefcase className="w-10 h-10 text-cyan-500/20 mx-auto mb-3" />
                <p className="text-xs font-mono text-cyan-400/50">
                  No open procurement listings at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            projectGroups.map(group => (
              <ProjectCard
                key={group.project_id}
                group={group}
                expanded={expandedProjects.has(group.project_id)}
                onToggle={() => toggleProject(group.project_id)}
                appliedListingIds={appliedListingIds}
                onApply={(listing) => setApplyingTo(listing)}
              />
            ))
          )}
        </TabsContent>

        {/* My Proposals */}
        <TabsContent value="proposals" className="space-y-4">
          {myProposals.length === 0 ? (
            <Card className="holographic-panel border-cyan-500/20">
              <CardContent className="pt-6 text-center">
                <Send className="w-10 h-10 text-cyan-500/20 mx-auto mb-3" />
                <p className="text-xs font-mono text-cyan-400/50">
                  You haven't submitted any proposals yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            myProposals.map(p => (
              <Card key={p.id} className="holographic-panel border-cyan-500/20">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-mono font-semibold text-sm text-cyan-300">
                        {p.procurement_listings?.title || 'Listing'}
                      </h3>
                      {p.procurement_listings?.construction_projects && (
                        <p className="text-[10px] font-mono text-cyan-400/50">
                          Project: {p.procurement_listings.construction_projects.project_name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs font-mono text-cyan-400/60">
                        {p.proposed_price && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />${p.proposed_price.toLocaleString()}
                          </span>
                        )}
                        {p.estimated_timeline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{p.estimated_timeline}
                          </span>
                        )}
                        <span className="capitalize">{p.proposal_type.replace('_', ' ')}</span>
                      </div>
                      {p.proposal_text && (
                        <p className="text-[10px] font-mono text-cyan-400/40 mt-1 line-clamp-2">
                          {p.proposal_text}
                        </p>
                      )}
                    </div>
                    <Badge className={
                      p.status === 'accepted'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30 font-mono text-[10px]'
                        : p.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30 font-mono text-[10px]'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-mono text-[10px]'
                    }>
                      {p.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {applyingTo && (
        <ProcurementProposalForm
          open={!!applyingTo}
          onOpenChange={(open) => !open && setApplyingTo(null)}
          listing={applyingTo}
          contractorId={contractorId}
          onSubmitted={() => { setApplyingTo(null); fetchData(); }}
        />
      )}
    </>
  );
};

// ─── Project Card ───────────────────────────────────────────────────────────

interface ProjectCardProps {
  group: ProjectGroup;
  expanded: boolean;
  onToggle: () => void;
  appliedListingIds: Set<string>;
  onApply: (listing: Listing) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  group, expanded, onToggle, appliedListingIds, onApply,
}) => {
  const totalListings = (group.project_listing ? 1 : 0) + group.task_listings.length;
  const appliedCount = [group.project_listing, ...group.task_listings]
    .filter(l => l && appliedListingIds.has(l.id)).length;

  // Calculate phase progress from items
  const allItems = group.phases.flatMap(p => p.items);
  const completedCount = allItems.filter(i => i.is_completed).length;
  const totalItems = allItems.length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <Card className="holographic-panel border-cyan-500/20 overflow-hidden">
      {/* Cover Image */}
      {group.cover_image_url ? (
        <div className="relative aspect-[3/1] w-full">
          <img
            src={group.cover_image_url}
            alt={group.project_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d15] via-transparent to-black/30" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-mono font-bold text-lg text-cyan-100 drop-shadow-lg">
              {group.project_name}
            </h3>
          </div>
        </div>
      ) : (
        <div className="relative aspect-[4/1] w-full bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-b border-cyan-500/10 flex items-center justify-center">
          <div className="text-center">
            <ImagePlus className="h-6 w-6 text-cyan-500/20 mx-auto mb-1" />
            <h3 className="font-mono font-bold text-lg text-cyan-300">
              {group.project_name}
            </h3>
          </div>
        </div>
      )}

      {/* Project Header Info */}
      <div className="px-4 py-3 border-b border-cyan-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">
              {totalListings} open listing{totalListings !== 1 ? 's' : ''}
              {appliedCount > 0 && ` • ${appliedCount} applied`}
            </span>
          </div>
          {group.project_listing && (
            appliedListingIds.has(group.project_listing.id) ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono text-[10px]">
                <CheckCircle className="h-3 w-3 mr-1" /> Applied to Project
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => onApply(group.project_listing!)}
                className="bg-cyan-600 hover:bg-cyan-500 text-[10px] font-mono h-7"
              >
                <Send className="h-3 w-3 mr-1" /> Apply for Entire Project
              </Button>
            )
          )}
        </div>

        {/* Project-level info */}
        {group.project_listing && (
          <div className="flex flex-wrap gap-3 text-[10px] font-mono text-cyan-400/50 mb-2">
            {group.project_listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />{group.project_listing.location}
              </span>
            )}
            {(group.project_listing.budget_min || group.project_listing.budget_max) && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {group.project_listing.budget_min ? `$${group.project_listing.budget_min.toLocaleString()}` : '$0'}
                {' - '}
                {group.project_listing.budget_max ? `$${group.project_listing.budget_max.toLocaleString()}` : 'Open'}
              </span>
            )}
            {group.project_listing.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />{new Date(group.project_listing.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400/60">
              {completedCount}/{totalItems} tasks
            </span>
          </div>
        )}
      </div>

      {/* Expandable Phases */}
      <div
        className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-cyan-500/5 transition-colors"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-cyan-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-cyan-400" />
        )}
        <span className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider">
          Project Tasks & Phases
        </span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {group.phases.length === 0 ? (
            <p className="text-[10px] font-mono text-cyan-400/30 text-center py-2">
              No phases defined for this project.
            </p>
          ) : (
            group.phases.map(phase => (
              <PhaseSection
                key={phase.phase_id}
                phase={phase}
                appliedListingIds={appliedListingIds}
                onApply={onApply}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
};

// ─── Phase Section ──────────────────────────────────────────────────────────

interface PhaseSectionProps {
  phase: PhaseGroup;
  appliedListingIds: Set<string>;
  onApply: (listing: Listing) => void;
}

const PhaseSection: React.FC<PhaseSectionProps> = ({
  phase, appliedListingIds, onApply,
}) => {
  const [expanded, setExpanded] = useState(true);
  const completedCount = phase.items.filter(i => i.is_completed).length;
  const totalCount = phase.items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-cyan-500/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-3 w-3 text-cyan-400" />
          ) : (
            <ChevronRight className="h-3 w-3 text-cyan-400" />
          )}
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-wide">
            {phase.phase_name}
          </span>
          <span className="text-[10px] font-mono text-cyan-400/50">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16">
            <Progress value={progress} className="h-1.5" />
          </div>
          <span className={`text-[10px] font-mono font-bold ${progress === 100 ? 'text-green-400' : 'text-cyan-400'}`}>
            {progress}%
          </span>
        </div>
      </div>

      {expanded && totalCount > 0 && (
        <div className="px-3 pb-2 space-y-0.5">
          {phase.items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-cyan-500/5 transition-colors group"
            >
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                item.is_completed ? 'bg-green-500' : 'bg-cyan-500/30'
              }`} />
              <span className={`flex-1 text-xs font-mono ${
                item.is_completed ? 'line-through text-cyan-400/30' : 'text-cyan-300/80'
              }`}>
                {item.item_name}
              </span>

              {item.listing ? (
                appliedListingIds.has(item.listing.id) ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono text-[9px] h-5">
                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Applied
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onApply(item.listing!); }}
                    className="h-6 px-2 text-[10px] font-mono bg-cyan-600 hover:bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Send className="h-2.5 w-2.5 mr-1" /> Apply
                  </Button>
                )
              ) : (
                <span className="text-[9px] font-mono text-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  Not listed
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractorProcurementTab;
