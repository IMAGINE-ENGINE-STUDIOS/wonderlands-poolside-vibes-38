/**
 * ProjectDetailModal — one Wonderlands project on the public Procurement
 * Exchange (/procurement): its cover image, its full description, its
 * documents (plans and renders) and its areas, each area open for its own
 * bids. The data comes from fetchPublicProjects in procurementService,
 * which reads the same construction_projects, procurement_listings and
 * procurement_documents records the admin Projects section, the client
 * dashboard and the contractor procurement tab use.
 * Credits: Imagine Engine Studios Corp.
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, FileText, MapPin, Send } from 'lucide-react';
import {
  areaListingsOf,
  projectListingOf,
  type PublicProject,
  type PublicProjectListing,
} from '@/lib/procurement/procurementService';

interface ProjectDetailModalProps {
  project: PublicProject | null;
  isOpen: boolean;
  onClose: () => void;
  onBid: (listing: PublicProjectListing) => void;
}

/** Format a date column (yyyy-mm-dd) as a local date, with no timezone shift. */
export const formatDateColumn = (value?: string | null): string | null => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString();
};

const money = (n?: number | null) => (n == null ? null : `$${Number(n).toLocaleString()}`);

const isImageDoc = (fileType?: string | null, fileUrl?: string | null, fileName?: string | null) =>
  (fileType || '').startsWith('image') || /\.(png|jpe?g|webp|gif|avif)$/i.test(fileUrl || fileName || '');

const ProjectDetailModal = ({ project, isOpen, onClose, onBid }: ProjectDetailModalProps) => {
  if (!project) return null;

  const projectListing = projectListingOf(project);
  const areas = areaListingsOf(project);
  const title = projectListing?.title || project.project_name;
  const location = projectListing?.location || areas[0]?.location || null;
  const startDate = formatDateColumn(projectListing?.start_date || areas[0]?.start_date);
  const budget =
    projectListing && (projectListing.budget_min != null || projectListing.budget_max != null)
      ? `${money(projectListing.budget_min) ?? 'Open'} to ${money(projectListing.budget_max) ?? 'Open'}`
      : null;
  const imageDocs = project.documents.filter((d) => isImageDoc(d.file_type, d.file_url, d.file_name));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">{title}</DialogTitle>
          {projectListing && project.project_name && project.project_name !== title && (
            <p className="text-sm text-muted-foreground">Project: {project.project_name}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {project.cover_image_url && (
            <div className="overflow-hidden rounded-xl ring-1 ring-neutral-200">
              <img
                src={project.cover_image_url}
                alt={title}
                className="h-64 w-full object-cover md:h-80"
                loading="lazy"
              />
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {location}
                  </span>
                )}
                {startDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Work starts {startDate}
                  </span>
                )}
                {budget && (
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Budget {budget}
                  </span>
                )}
                <span>{areas.length} areas open for bids</span>
              </div>
              {projectListing?.description && (
                <p className="mt-4 leading-relaxed text-neutral-700">{projectListing.description}</p>
              )}
              {projectListing && (
                <Button
                  className="mt-5 bg-neutral-900 text-white hover:bg-neutral-800"
                  onClick={() => onBid(projectListing)}
                >
                  <Send className="mr-2 h-4 w-4" /> Bid on the whole project
                </Button>
              )}
            </CardContent>
          </Card>

          {imageDocs.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {imageDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => window.open(doc.file_url, '_blank')}
                  className="group overflow-hidden rounded-xl ring-1 ring-neutral-200"
                  title={doc.file_name}
                >
                  <img
                    src={doc.file_url}
                    alt={doc.file_name}
                    className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {project.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-normal">Project documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 rounded border p-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm">{doc.file_name}</span>
                      {doc.file_size != null && (
                        <span className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024).toFixed(0)} KB
                        </span>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl font-normal">Areas open for bids</CardTitle>
              <p className="text-sm text-muted-foreground">
                This project is divided into areas and each area takes its own bids. Choose the
                area that matches your trade and place your bid on that area.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {areas.map((area, index) => {
                  const areaStart = formatDateColumn(area.start_date);
                  const areaBudget =
                    area.budget_min != null || area.budget_max != null
                      ? `${money(area.budget_min) ?? 'Open'} to ${money(area.budget_max) ?? 'Open'}`
                      : null;
                  return (
                    <div key={area.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif text-lg font-normal text-foreground">
                            {index + 1}. {area.title}
                          </h4>
                          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                            {area.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" /> {area.location}
                              </span>
                            )}
                            {areaStart && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" /> Work starts {areaStart}
                              </span>
                            )}
                            {areaBudget && (
                              <span className="flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5" /> Budget {areaBudget}
                              </span>
                            )}
                          </div>
                          {area.description && (
                            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                              {area.description}
                            </p>
                          )}
                        </div>
                        <Button
                          className="shrink-0 bg-neutral-900 text-white hover:bg-neutral-800"
                          onClick={() => onBid(area)}
                        >
                          <Send className="mr-2 h-4 w-4" /> Place your bid
                        </Button>
                      </div>
                      {(area.documents?.length ?? 0) > 0 && (
                        <div className="mt-3 space-y-2">
                          {area.documents.filter((d) => isImageDoc(d.file_type, d.file_url, d.file_name)).length > 0 && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {area.documents
                                .filter((d) => isImageDoc(d.file_type, d.file_url, d.file_name))
                                .map((doc) => (
                                  <button
                                    key={doc.id}
                                    onClick={() => window.open(doc.file_url, '_blank')}
                                    className="group overflow-hidden rounded-lg ring-1 ring-neutral-200"
                                    title={doc.file_name}
                                  >
                                    <img
                                      src={doc.file_url}
                                      alt={doc.file_name}
                                      className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                      loading="lazy"
                                    />
                                  </button>
                                ))}
                            </div>
                          )}
                          {area.documents
                            .filter((d) => !isImageDoc(d.file_type, d.file_url, d.file_name))
                            .map((doc) => (
                              <div key={doc.id} className="flex items-center gap-2 rounded border p-2">
                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="flex-1 truncate text-sm">{doc.file_name}</span>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    Open
                                  </a>
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {areas.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    This project has no open areas right now.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;
