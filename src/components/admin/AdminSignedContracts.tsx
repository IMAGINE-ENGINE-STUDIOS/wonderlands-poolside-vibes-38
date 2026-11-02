import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Eye, Pencil, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignedContract {
  id: string;
  created_at: string;
  client_name: string | null;
  client_email: string | null;
  project_address: string | null;
  proposal_no: string | null;
  proposal_date: string | null;
  contract_price: string | null;
  signer_name: string | null;
  signed_at: string | null;
  signature_data: string | null;
  document_html: string | null;
}

// Screen-only style injected into the viewer copy of a stored contract so the
// on-screen toolbar/panel of the contract page does not show in the preview.
// (Print output uses the page's own @media print rules, untouched.)
const VIEW_HIDE_STYLE =
  '<style>@media screen { .toolbar, .panel { display: none !important; } body { padding-top: 0 !important; } }</style>';

const withViewStyle = (html: string) =>
  html.includes('</head>') ? html.replace('</head>', `${VIEW_HIDE_STYLE}</head>`) : VIEW_HIDE_STYLE + html;

const formatSignedDate = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const AdminSignedContracts = () => {
  const [rows, setRows] = useState<SignedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<SignedContract | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    // signed_contracts was created after the repo's generated Database types,
    // so the table is accessed through an untyped handle here.
    const { data, error } = await (supabase as any)
      .from('signed_contracts')
      .select(
        'id, created_at, client_name, client_email, project_address, proposal_no, proposal_date, contract_price, signer_name, signed_at, signature_data, document_html',
      )
      .order('signed_at', { ascending: false, nullsFirst: false });
    if (error) {
      toast({ title: 'Could not load signed contracts', description: error.message, variant: 'destructive' });
    } else {
      setRows(((data as unknown) as SignedContract[]) ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  // JOB 8: exact-as-signed PDF — open the stored document in a print window;
  // the contract page's own print CSS hides its toolbar/panel, so the PDF
  // reproduces the signed document exactly.
  const handleDownload = (row: SignedContract) => {
    if (!row.document_html) {
      toast({ title: 'No stored document', description: 'This contract has no saved document to download.', variant: 'destructive' });
      return;
    }
    const win = window.open('', '_blank');
    if (!win) {
      toast({ title: 'Popup blocked', description: 'Allow popups for this site to download the contract PDF.', variant: 'destructive' });
      return;
    }
    win.document.open();
    win.document.write(row.document_html);
    win.document.close();
    win.focus();
    // Give the stored page a moment to lay out (and load the signature image)
    // before opening the print dialog for Save as PDF.
    setTimeout(() => {
      try {
        win.print();
      } catch {
        /* the window is open with the document; the user can print manually */
      }
    }, 600);
  };

  // Founder edit: open a FRESH, UNSIGNED, fully editable copy of the stored
  // contract. The stored signed original is never modified — signing the
  // edited copy stores a brand-new row.
  const handleEdit = (row: SignedContract) => {
    if (!row.document_html) {
      toast({ title: 'No stored document', description: 'This contract has no saved document to edit.', variant: 'destructive' });
      return;
    }
    try {
      localStorage.setItem('ww_contract_reedit', JSON.stringify({ html: row.document_html }));
    } catch {
      toast({ title: 'Could not open editor', description: 'Browser storage is unavailable.', variant: 'destructive' });
      return;
    }
    window.open('/contract.html?reedit=1', '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border border-neutral-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-black">
              <FileText className="h-5 w-5 text-black" />
              Sign Contracts
            </CardTitle>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-neutral-600">
            Contracts signed on the contract page are stored here exactly as signed. A signed copy never
            changes — use Edit to open a fresh, unsigned, fully editable copy; signing it saves a new contract.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Loading signed contracts…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              No signed contracts yet. When a client signs on the contract page, the signed copy appears here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="py-2 pr-4 font-medium">Client</th>
                    <th className="py-2 pr-4 font-medium">Date signed</th>
                    <th className="py-2 pr-4 font-medium">Contract price</th>
                    <th className="py-2 pr-4 font-medium">Proposal</th>
                    <th className="py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-black">{row.client_name || '—'}</div>
                        {row.client_email && <div className="text-xs text-neutral-500">{row.client_email}</div>}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">{formatSignedDate(row.signed_at ?? row.created_at)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.contract_price || '—'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.proposal_no || '—'}</td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => setViewing(row)} title="View the signed contract">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} title="Open a fresh, unsigned, editable copy">
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(row)} title="Download the contract exactly as signed (PDF)">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {viewing?.client_name || 'Signed contract'} — {formatSignedDate(viewing?.signed_at ?? viewing?.created_at ?? null)}
            </DialogTitle>
          </DialogHeader>
          {viewing?.document_html ? (
            <iframe
              title="Signed contract"
              className="w-full flex-1 border border-neutral-200 rounded bg-white"
              sandbox="allow-same-origin"
              srcDoc={withViewStyle(viewing.document_html)}
            />
          ) : (
            <p className="text-sm text-neutral-500">This contract has no stored document.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSignedContracts;
