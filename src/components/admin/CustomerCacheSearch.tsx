import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Lock, DollarSign, Mail, Phone, MapPin, Calendar, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

const ADMIN_PASSCODE = "WONDERMAGIC";

interface CachedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  total_quotes: number;
  total_quote_value: number;
  last_quote_date: string;
  first_quote_date: string;
  last_pool_model: string | null;
  created_at: string;
}

const CustomerCacheSearch = () => {
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<CachedCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const handleUnlock = () => {
    if (passcode === ADMIN_PASSCODE) {
      setIsUnlocked(true);
      loadCustomers();
    }
  };

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_cache' as any)
        .select('*')
        .order('last_quote_date', { ascending: false })
        .limit(200);

      if (!error && data) {
        setCustomers(data as any[]);
        setTotalCount((data as any[]).length);
      }
    } catch (err) {
      console.error('Error loading customer cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.last_pool_model?.toLowerCase().includes(q)
    );
  });

  if (!isUnlocked) {
    return (
      <Card className="holographic-panel border-cyan-500/30 max-w-md mx-auto">
        <CardHeader className="text-center">
          <Lock className="h-10 w-10 text-cyan-400 mx-auto mb-2" />
          <CardTitle className="text-cyan-300 font-mono">Customer Database</CardTitle>
          <CardDescription className="text-cyan-400/60 font-mono">
            Enter admin passcode to access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter passcode..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="bg-black/40 border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
            />
            <Button
              onClick={handleUnlock}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
            >
              <Lock className="h-4 w-4 mr-1" />
              Unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
          <Input
            placeholder="Search by name, email, phone, address, or pool model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
          />
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono">
          <Users className="h-3 w-3 mr-1" />
          {filteredCustomers.length} / {totalCount}
        </Badge>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-cyan-400/60 font-mono">
          {searchTerm ? `No customers match "${searchTerm}"` : "No customers in the database yet"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="holographic-panel border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-mono text-cyan-300 font-bold text-sm truncate">
                    {customer.name}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-500/30 shrink-0 ml-2">
                    {customer.total_quotes} quote{customer.total_quotes !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center gap-2 text-cyan-400/80">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-cyan-400/80">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-cyan-400/80">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10">
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <DollarSign className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">
                      ${(customer.total_quote_value || 0).toLocaleString()}
                    </span>
                  </div>
                  {customer.last_pool_model && (
                    <Badge className="text-[9px] bg-blue-500/20 text-blue-300 border-blue-500/30">
                      <FileText className="h-2.5 w-2.5 mr-0.5" />
                      {customer.last_pool_model}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-cyan-400/50 font-mono">
                  <Calendar className="h-2.5 w-2.5" />
                  Last: {customer.last_quote_date ? format(new Date(customer.last_quote_date), 'MMM d, yyyy') : 'N/A'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerCacheSearch;
