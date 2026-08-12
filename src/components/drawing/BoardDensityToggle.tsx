import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface BoardDensityToggleProps {
  compact: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Compact / full chrome switch for the drawing boards. The choice is stored by
 * useBoardDensity, so the boards reopen in the same state next session.
 */
const BoardDensityToggle = ({ compact, onToggle, className = '' }: BoardDensityToggleProps) => (
  <Button
    type="button"
    size="sm"
    variant="ghost"
    onClick={onToggle}
    aria-pressed={compact}
    title={compact ? 'Show all panels' : 'Compact view — hide extra panels'}
    className={`h-8 ${className}`}
  >
    {compact ? <Maximize2 className="mr-1.5 h-3.5 w-3.5" /> : <Minimize2 className="mr-1.5 h-3.5 w-3.5" />}
    {compact ? 'Full view' : 'Compact'}
  </Button>
);

export default BoardDensityToggle;
