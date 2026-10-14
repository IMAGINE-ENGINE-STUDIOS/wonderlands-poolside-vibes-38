/**
 * Studio3DPage — /studio-3d. The 3D Studio on its own page, full screen,
 * seeded with a 16' × 36' rectangular pool. The showroom shows the same
 * tool contained in a widget and links here for the full-screen version.
 * No back-to-showroom link here (by request); a showcase pre-screen opens first.
 */
import * as React from 'react';

const ShowroomStudio3D = React.lazy(() => import('@/components/showroom/ShowroomStudio3D'));

const Studio3DPage = () => {
  React.useEffect(() => { document.title = '3D Studio · Wonderlands World'; }, []);
  return (
    <div className="min-h-screen bg-background select-none">
      <React.Suspense fallback={<div className="p-12 text-center text-sm text-muted-foreground">Opening the 3D Studio…</div>}>
        <ShowroomStudio3D embedded={false} fromBoard={new URLSearchParams(window.location.search).get('from') === 'board'} />
      </React.Suspense>
    </div>
  );
};

export default Studio3DPage;
