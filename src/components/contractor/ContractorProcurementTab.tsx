import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  MapPin, DollarSign, Calendar, Briefcase, Send, Clock,
  ChevronDown, ChevronRight, ImagePlus, CheckCircle, FileText, Download, ExternalLink,
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
  project_listing: Listing | null;
  task_listings: Listing[];
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
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchData();
  }, [contractorId]);

  const fetchData = async () => {
    setLoading(true);

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

    const projectIds = [...new Set(listings.map((l: any) => l.project_id))];

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
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2 text-foreground">Account Not Approved</h3>
          <p className="text-sm text-muted-foreground">
            Your account must be approved before you can access procurement listings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Pagination
  const pagedGroups = projectGroups.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(projectGroups.length / PAGE_SIZE);

  return (
    <>
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="listings">
            Available Projects ({projectGroups.length})
          </TabsTrigger>
          <TabsTrigger value="proposals">
            My Proposals ({myProposals.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Projects */}
        <TabsContent value="listings" className="space-y-3">
          {projectGroups.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No open procurement listings at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pagedGroups.map(group => (
                <ProjectCard
                  key={group.project_id}
                  group={group}
                  expanded={expandedProjects.has(group.project_id)}
                  onToggle={() => toggleProject(group.project_id)}
                  appliedListingIds={appliedListingIds}
                  onApply={(listing) => setApplyingTo(listing)}
                />
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* My Proposals */}
        <TabsContent value="proposals" className="space-y-3">
          {myProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Send className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  You haven't submitted any proposals yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            myProposals.map(p => (
              <Card key={p.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-foreground">
                        {p.procurement_listings?.title || 'Listing'}
                      </h3>
                      {p.procurement_listings?.construction_projects && (
                        <p className="text-xs text-muted-foreground">
                          Project: {p.procurement_listings.construction_projects.project_name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {p.proposal_text}
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      p.status === 'accepted' ? 'default' :
                      p.status === 'rejected' ? 'destructive' : 'secondary'
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

// ─── Project Documents Viewer (read-only for contractors) ───────────────────

const ProjectDocumentsViewer: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('procurement_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }: any) => setDocs(data || []));
  }, [projectId]);

  if (docs.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-border">
      <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
        <FileText className="h-3 w-3" /> Project Documents
      </h4>
      <div className="space-y-1">
        {docs.map((doc: any) => (
          <a
            key={doc.id}
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-1.5 px-2 rounded bg-muted/50 hover:bg-muted transition-colors text-xs text-foreground"
          >
            <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 truncate">{doc.file_name}</span>
            {doc.file_size && (
              <span className="text-muted-foreground text-[10px]">
                {(doc.file_size / 1024).toFixed(0)}KB
              </span>
            )}
            <Download className="h-3 w-3 text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
};

// ─── Project Card (collapsed by default, expandable) ────────────────────────

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
  const allItems = group.phases.flatMap(p => p.items);
  const completedCount = allItems.filter(i => i.is_completed).length;
  const totalItems = allItems.length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const openTaskCount = group.task_listings.length + (group.project_listing ? 1 : 0);

  return (
    <Card className="overflow-hidden border-border">
      {/* Collapsed header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}

        {/* Small thumbnail */}
        {group.cover_image_url ? (
          <img
            src={group.cover_image_url}
            alt={group.project_name}
            className="h-10 w-16 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-10 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {group.project_name}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {openTaskCount} open task{openTaskCount !== 1 ? 's' : ''}
            </span>
            {group.project_listing?.location && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{group.project_listing.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-20 hidden sm:block">
            <Progress value={progress} className="h-2" />
          </div>
          <span className={`text-xs font-medium ${progress === 100 ? 'text-green-600' : 'text-foreground'}`}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Cover image */}
          {group.cover_image_url && (
            <div className="relative aspect-[3/1] w-full">
              <img
                src={group.cover_image_url}
                alt={group.project_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />
            </div>
          )}

          {/* Project info + Apply for entire project */}
          {group.project_listing && (
            <div className="px-4 py-3 border-b border-border">
              {group.project_listing.description && (
                <p className="text-sm text-muted-foreground mb-2">{group.project_listing.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {(group.project_listing.budget_min || group.project_listing.budget_max) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {group.project_listing.budget_min ? `$${group.project_listing.budget_min.toLocaleString()}` : '$0'}
                    {' – '}
                    {group.project_listing.budget_max ? `$${group.project_listing.budget_max.toLocaleString()}` : 'Open'}
                  </span>
                )}
                {group.project_listing.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />Deadline: {new Date(group.project_listing.deadline).toLocaleDateString()}
                  </span>
                )}
                <div className="ml-auto">
                  {appliedListingIds.has(group.project_listing.id) ? (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Applied
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onApply(group.project_listing!); }}
                      className="h-7 text-xs"
                    >
                      <Send className="h-3 w-3 mr-1" /> Apply for Entire Project
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Procurement Documents */}
          <ProjectDocumentsViewer projectId={group.project_id} />

          {/* Phases & Tasks */}
          <div className="px-4 py-3 space-y-3">
            {group.phases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
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
    <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {phase.phase_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16">
            <Progress value={progress} className="h-1.5" />
          </div>
          <span className={`text-xs font-semibold ${progress === 100 ? 'text-green-600' : 'text-foreground'}`}>
            {progress}%
          </span>
        </div>
      </div>

      {expanded && totalCount > 0 && (
        <div className="px-3 pb-2 space-y-0.5">
          {phase.items.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-2 py-1.5 px-2 rounded transition-colors group ${
                item.is_completed ? 'opacity-50' : 'hover:bg-muted/50'
              }`}
            >
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                item.is_completed ? 'bg-green-500' : 'bg-muted-foreground/30'
              }`} />
              <span className={`flex-1 text-xs ${
                item.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {item.item_name}
              </span>

              {/* Show apply for non-completed items */}
              {item.is_completed ? (
                <Badge variant="outline" className="text-[10px] h-5 text-green-600 border-green-500/30">
                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Done
                </Badge>
              ) : item.listing ? (
                appliedListingIds.has(item.listing.id) ? (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Applied
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onApply(item.listing!); }}
                    className="h-6 px-2 text-[10px]"
                  >
                    <Send className="h-2.5 w-2.5 mr-1" /> Apply
                  </Button>
                )
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onApplyForItem(item); }}
                  className="h-6 px-2 text-[10px]"
                >
                  <Send className="h-2.5 w-2.5 mr-1" /> Apply
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractorProcurementTab;
