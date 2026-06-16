'use client';
import type { TimelineEvent } from '@/lib/types';

export function ImagePlaceholder({ event, height = '180px', radius = 10, style: extraStyle }: {
  event: TimelineEvent;
  height?: string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const hasImage = !!event.imageUrl;
  let imgSrc = event.imageUrl;
  if (hasImage && event.imageUrl!.includes('.blob.vercel-storage.com') && !event.imageUrl!.startsWith('/api/image')) {
    imgSrc = `/api/image?url=${encodeURIComponent(event.imageUrl!)}`;
  }
  return (
    <div className={"img-placeholder" + (hasImage ? " has-image" : "")} style={{ height, borderRadius: radius, ...extraStyle }}>
      {hasImage ? (
        <img src={imgSrc!} alt={event.imageCaption || event.title} />
      ) : (
        event.imageCaption || 'Drop an image'
      )}
    </div>
  );
}
