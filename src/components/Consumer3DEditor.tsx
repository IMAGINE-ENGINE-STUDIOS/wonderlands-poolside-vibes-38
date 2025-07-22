
import { ImaginalyConsumer } from './imaginaly/ImaginalyConsumer';

interface Consumer3DEditorProps {
  className?: string;
  selectedPool?: string;
  onPoolChange?: (pool: string) => void;
  disableUpload?: boolean;
}

const Consumer3DEditor = ({ 
  className = "", 
  selectedPool = 'Apollo 14',
  onPoolChange,
  disableUpload = true 
}: Consumer3DEditorProps) => {
  return (
    <ImaginalyConsumer
      className={className}
      selectedPool={selectedPool}
      onPoolChange={onPoolChange}
      disableUpload={disableUpload}
    />
  );
};

export default Consumer3DEditor;
