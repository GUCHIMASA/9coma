'use client';

import React from 'react';
import { YouTubeSlot } from '@/types/youtube';
import YtGridSlot from './YtGridSlot';

interface YtGridProps {
  slots: (YouTubeSlot | null)[];
  onSlotClick?: (index: number) => void;
  onSlotRemove?: (index: number, e: React.MouseEvent) => void;
  draggedIndex?: number | null;
  dragOverIndex?: number | null;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  isReadOnly?: boolean;
}

export default function YtGrid({
  slots,
  onSlotClick,
  onSlotRemove,
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  isReadOnly = false,
}: YtGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', // 均等な幅を強制
      gap: '12px', // マンガ版に合わせる
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      alignItems: 'start', // 垂直方向のズレを防止
    }}>
      {slots.map((slot, idx) => (
        <div
          key={idx}
          draggable={!isReadOnly && slot !== null}
          onDragStart={(e) => !isReadOnly && onDragStart && onDragStart(e, idx)}
          onDragOver={(e) => !isReadOnly && onDragOver && onDragOver(e, idx)}
          onDragLeave={!isReadOnly ? onDragLeave : undefined}
          onDragEnd={!isReadOnly ? onDragEnd : undefined}
          onDrop={(e) => !isReadOnly && onDrop && onDrop(e, idx)}
        >
          <YtGridSlot
            slot={slot}
            index={idx}
            onClick={() => !isReadOnly && onSlotClick && onSlotClick(idx)}
            onRemove={(e) => !isReadOnly && onSlotRemove && onSlotRemove(idx, e)}
            isDragging={!isReadOnly && draggedIndex === idx}
            isDragOver={!isReadOnly && dragOverIndex === idx}
            isReadOnly={isReadOnly}
          />
        </div>
      ))}
    </div>
  );
}
