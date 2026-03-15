import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

const emptyForm = {
  title: '',
  category: 'construction_worker',
  description: '',
  location: 'Orlando, FL',
  job_type: 'full_time',
  requirements: '',
  salary_range: '',
};

const AdminJobBoardManager = () => {
  const { toast } = useToast();
  const [postings, setPostings] = useState<CareerPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchPostings(); }, []);

  const fetchPostings = async () => {
    setLoading(true);
    const { data } = await supabase.from('career_postings').select('*').order('created_at', { ascending: false });
    setPostings((data as CareerPosting[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }

    if (editingId) {
      await supabase.from('career_postings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingId);
      toast({ title: 'Posting updated' });
    } else {
      await supabase.from('career_postings').insert([form]);
      toast({ title: 'Posting created' });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchPostings();
  };

  const handleEdit = (p: CareerPosting) => {
    setForm({
      title: p.title,
      category: p.category,
      description: p.description || '',
      location: p.location || '',
      job_type: p.job_type || 'full_time',
      requirements: p.requirements || '',
      salary_range: p.salary_range || '',
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('career_postings').delete().eq('id', id);
    toast({ title: 'Posting deleted' });
    fetchPostings();
  };

  const toggleActive = async (p: CareerPosting) => {
    await supabase.from('career_postings').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchPostings();
  };

  const inputClass = "bg-black/40 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 focus:border-cyan-400";
  const labelClass = "text-cyan-300 text-sm font-mono mb-1 block";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cyan-300 font-mono">Career Postings</h2>
          <p className="text-cyan-400/60 text-sm font-mono">{postings.length} total postings</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="bg-cyan-600 hover:bg-cyan-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Posting
        </Button>
      </div>

      {showForm && (
        <Card className="holographic-panel border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-300 font-mono">{editingId ? 'Edit' : 'New'} Posting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Title *</label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="e.g. Pool Technician" />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={`w-full rounded-md px-3 py-2 ${inputClass}`}>
                  <option value="construction_worker">Construction Worker</option>
                  <option value="pool_cleaner">Pool Cleaner</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inputClass} placeholder="Orlando, FL" />
              </div>
              <div>
                <label className={labelClass}>Job Type</label>
                <select value={form.job_type} onChange={e => setForm({...form, job_type: e.target.value})} className={`w-full rounded-md px-3 py-2 ${inputClass}`}>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Salary Range</label>
                <Input value={form.salary_range} onChange={e => setForm({...form, salary_range: e.target.value})} className={inputClass} placeholder="$18-25/hr" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`w-full rounded-md px-3 py-2 min-h-[80px] ${inputClass}`} placeholder="Job description..." />
            </div>
            <div>
              <label className={labelClass}>Requirements</label>
              <textarea value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className={`w-full rounded-md px-3 py-2 min-h-[60px] ${inputClass}`} placeholder="Requirements..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-cyan-400">Cancel</Button>
              <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white">Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-cyan-400/60 font-mono text-center py-8">Loading...</p>
      ) : postings.length === 0 ? (
        <p className="text-cyan-400/60 font-mono text-center py-8">No postings yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {postings.map(p => (
            <Card key={p.id} className="holographic-panel border-cyan-500/20">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-cyan-200 font-mono">{p.title}</span>
                    <Badge variant={p.is_active ? 'default' : 'secondary'} className={p.is_active ? 'bg-green-600/30 text-green-300 border-green-500/30' : 'bg-red-600/30 text-red-300 border-red-500/30'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                      {p.category === 'construction_worker' ? 'Construction' : 'Pool Cleaner'}
                    </Badge>
                  </div>
                  <p className="text-cyan-400/50 text-xs font-mono truncate">{p.location} • {p.job_type === 'full_time' ? 'Full Time' : 'Part Time'}{p.salary_range ? ` • ${p.salary_range}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => toggleActive(p)} className="text-cyan-400 hover:text-cyan-200">
                    {p.is_active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-red-400" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(p)} className="text-cyan-400 hover:text-cyan-200">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobBoardManager;
