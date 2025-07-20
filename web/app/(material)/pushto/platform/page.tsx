'use client';
import React from 'react';
import PushToPlatform from '@/components/push-to-platform';

function Platform({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = React.use(searchParams);

  // TODO: 暂未开放
  return (
    <div className='p-10 text-center text-lg text-muted-foreground'>
      暂未开放
    </div>
  );
  return <PushToPlatform value={ids?.split(',')} />;
}

export default Platform;
