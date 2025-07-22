
import { ImaginalyConsumer } from './imaginaly/ImaginalyConsumer';

interface Consumer3DEditorProps {
  className?: string;
  selectedPool?: string;
  onPoolChange?: (pool: string) => void;
}

const Consumer3DEditor = ({ 
  className = "", 
  selectedPool = 'Apollo 14',
  onPoolChange 
}: Consumer3DEditorProps) => {
  return (
    <ImaginalyConsumer
      className={className}
      selectedPool={selectedPool}
      onPoolChange={onPoolChange}
    />
  );
};

export default Consumer3DEditor;
