'use client';
import type { TimelineEvent } from '@/lib/types';

export function ImagePlaceholder({ event, height = '180px', radius = 10, style: extraStyle }: {
  event: TimelineEvent;
  height?: string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const hasImage = !!event.imageUrl;
  return (
    <div className={"img-placeholder" + (hasImage ? " has-image" : "")} style={{ height, borderRadius: radius, ...extraStyle }}>
      {hasImage ? (
        <img src={event.imageUrl!} alt={event.imageCaption || event.title} />
      ) : (
        event.imageCaption || 'Drop an image'
      )}
    </div>
  );
}
