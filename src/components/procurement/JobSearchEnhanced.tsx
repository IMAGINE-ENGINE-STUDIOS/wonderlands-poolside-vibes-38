import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar as CalendarIcon,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

interface SearchFilters {
  searchTerm: string;
  category: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  deadline?: Date;
  sortBy: string;
  urgent: boolean;
}

interface JobSearchEnhancedProps {
  onFiltersChange: (filters: SearchFilters) => void;
  totalJobs: number;
}

const JobSearchEnhanced = ({ onFiltersChange, totalJobs }: JobSearchEnhancedProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    location: '',
    budgetMin: 0,
    budgetMax: 100000,
    deadline: undefined,
    sortBy: 'newest',
    urgent: false
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'pools', label: 'Pools & Spas' },
    { value: 'outdoors', label: 'Outdoor Living' },
    { value: 'patios', label: 'Patios & Decking' },
    { value: 'improvements', label: 'Home Improvements' },
    { value: 'construction', label: 'Construction' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' },
    { value: 'deadline', label: 'Deadline Soon' },
    { value: 'most_proposals', label: 'Most Proposals' },
    { value: 'least_proposals', label: 'Least Proposals' }
  ];

  const locations = [
    'Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL', 
    'Fort Lauderdale, FL', 'West Palm Beach, FL', 'Naples, FL',
    'Sarasota, FL', 'Gainesville, FL', 'Tallahassee, FL'
  ];

  useEffect(() => {
    const count = [
      filters.category !== 'all',
      filters.location !== '',
      filters.budgetMin > 0 || filters.budgetMax < 100000,
      filters.deadline !== undefined,
      filters.urgent
    ].filter(Boolean).length;
    
    setActiveFiltersCount(count);
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all',
      location: '',
      budgetMin: 0,
      budgetMax: 100000,
      deadline: undefined,
      sortBy: 'newest',
      urgent: false
    });
    setShowAdvancedFilters(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search jobs by title, description, skills, company name..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="pl-12 pr-4 py-3 text-lg bg-background/80 backdrop-blur-sm border-border/30 focus:border-primary/50"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="relative"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Advanced
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" />
            Clear ({activeFiltersCount})
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {totalJobs} jobs found
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-accent/30 backdrop-blur-sm rounded-lg border border-border/30">
          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any location</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </label>
            <div className="space-y-3">
              <Slider
                value={[filters.budgetMin, filters.budgetMax]}
                onValueChange={([min, max]) => {
                  updateFilter('budgetMin', min);
                  updateFilter('budgetMax', max);
                }}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${filters.budgetMin.toLocaleString()}</span>
                <span>${filters.budgetMax.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deadline Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Deadline Before
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.deadline ? format(filters.deadline, 'MMM dd, yyyy') : 'Any date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.deadline}
                  onSelect={(date) => updateFilter('deadline', date)}
                  initialFocus
                />
                {filters.deadline && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => updateFilter('deadline', undefined)}
                      className="w-full"
                    >
                      Clear Date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="space-y-2">
              <Button
                variant={filters.urgent ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('urgent', !filters.urgent)}
                className="w-full"
              >
                Urgent Jobs Only
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Category: {categories.find(c => c.value === filters.category)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('category', 'all')}
              />
            </Badge>
          )}
          
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Location: {filters.location}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('location', '')}
              />
            </Badge>
          )}
          
          {(filters.budgetMin > 0 || filters.budgetMax < 100000) && (
            <Badge variant="secondary" className="gap-1">
              Budget: ${filters.budgetMin.toLocaleString()} - ${filters.budgetMax.toLocaleString()}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  updateFilter('budgetMin', 0);
                  updateFilter('budgetMax', 100000);
                }}
              />
            </Badge>
          )}
          
          {filters.deadline && (
            <Badge variant="secondary" className="gap-1">
              Deadline: {format(filters.deadline, 'MMM dd')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('deadline', undefined)}
              />
            </Badge>
          )}
          
          {filters.urgent && (
            <Badge variant="secondary" className="gap-1">
              Urgent Only
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('urgent', false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default JobSearchEnhanced;