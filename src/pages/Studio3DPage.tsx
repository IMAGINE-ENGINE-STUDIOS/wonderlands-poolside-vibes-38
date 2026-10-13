/**
 * Studio3DPage — /studio-3d. The 3D Studio on its own page, full screen,
 * seeded with a 16' × 36' rectangular pool. The showroom shows the same
 * tool contained in a widget and links here for the full-screen version.
 */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ShowroomStudio3D = React.lazy(() => import('@/components/showroom/ShowroomStudio3D'));

const Studio3DPage = () => {
  React.useEffect(() => { document.title = '3D Studio · Wonderlands World'; }, []);
  return (
    <div className="min-h-screen bg-background">
      <React.Suspense fallback={<div className="p-12 text-center text-sm text-muted-foreground">Opening the 3D Studio…</div>}>
        <ShowroomStudio3D embedded={false} />
      </React.Suspense>
      <Link
        to="/studio-showroom#studio-3d"
        className="fixed bottom-6 left-6 z-[10050] inline-flex items-center gap-2 border border-border bg-background/90 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-foreground backdrop-blur"
      >
        <ArrowLeft className="h-3 w-3" /> Back to the showroom
      </Link>
    </div>
  );
};

export default Studio3DPage;
