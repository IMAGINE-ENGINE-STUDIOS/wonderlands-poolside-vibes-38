# Product Media Gallery - Usage Guide

## Overview
The `ProductMediaGallery` component allows products in Wonderlands Studio to display multiple images and videos with navigation arrows.

## Features
- ✅ Multiple images support
- ✅ Video support with controls
- ✅ Navigation arrows (left/right)
- ✅ Indicator dots
- ✅ Counter display
- ✅ Backwards compatible with single image
- ✅ Responsive design
- ✅ Hover-activated controls

## Usage

### Single Image (Backwards Compatible)
```typescript
// Old format still works
{
  model: "Pool Model",
  image: "/path/to/image.jpg",
  // ... other properties
}
```

### Multiple Images
```typescript
{
  model: "Pool Model",
  image: "/path/to/primary-image.jpg", // Fallback for old components
  media: [
    { type: 'image', url: '/path/to/image1.jpg', alt: 'Front view' },
    { type: 'image', url: '/path/to/image2.jpg', alt: 'Side view' },
    { type: 'image', url: '/path/to/image3.jpg', alt: 'Installed' }
  ],
  // ... other properties
}
```

### With Videos
```typescript
{
  model: "Pool Model",
  image: "/path/to/primary-image.jpg",
  media: [
    { type: 'image', url: '/path/to/image1.jpg', alt: 'Main view' },
    { 
      type: 'video', 
      url: '/path/to/video.mp4', 
      thumbnail: '/path/to/thumbnail.jpg',
      alt: 'Installation video' 
    },
    { type: 'image', url: '/path/to/image2.jpg', alt: 'Detail view' }
  ],
  // ... other properties
}
```

## MediaItem Interface
```typescript
interface MediaItem {
  type: 'image' | 'video';
  url: string;           // Path to media file
  thumbnail?: string;    // Optional: Video thumbnail
  alt?: string;          // Optional: Alt text for accessibility
}
```

## Component Props
```typescript
interface ProductMediaGalleryProps {
  media: MediaItem[] | string;  // Array of media items or single image URL
  productName: string;           // Product name for alt text fallback
  className?: string;            // Optional: Additional CSS classes
}
```

## Examples

### Example 1: Pool with Multiple Views
```typescript
export const pools = [
  {
    model: "Astoria 12",
    price: 85000,
    category: "premium",
    image: "/lovable-uploads/astoria-12.jpg",
    media: [
      { type: 'image', url: '/lovable-uploads/astoria-12.jpg', alt: 'Astoria pool main' },
      { type: 'image', url: '/lovable-uploads/astoria-12-angle.jpg', alt: 'Astoria angled view' },
      { type: 'image', url: '/lovable-uploads/astoria-12-night.jpg', alt: 'Astoria at night' },
      { type: 'image', url: '/lovable-uploads/astoria-12-detail.jpg', alt: 'Astoria details' }
    ]
  }
];
```

### Example 2: Sauna with Video Tour
```typescript
export const saunas = [
  {
    model: "Barrel Sauna 4P",
    price: 15000,
    category: "premium",
    image: '/lovable-uploads/barrel-sauna.webp',
    media: [
      { type: 'image', url: '/lovable-uploads/barrel-sauna.webp', alt: 'Exterior view' },
      { 
        type: 'video', 
        url: '/videos/sauna-tour.mp4',
        thumbnail: '/lovable-uploads/sauna-video-thumb.jpg',
        alt: '360° sauna tour'
      },
      { type: 'image', url: '/lovable-uploads/sauna-interior.jpg', alt: 'Interior view' }
    ]
  }
];
```

## Navigation Controls
- **Left/Right Arrows**: Appear on hover, cycle through media
- **Indicator Dots**: Click to jump to specific media item
- **Counter**: Shows current position (e.g., "2 / 5")
- **Video Badge**: Shows when media item is a video

## Styling
The component uses Tailwind CSS and shadcn/ui components with:
- Smooth transitions
- Opacity animations on controls
- Responsive sizing
- Accessible keyboard navigation

## Tips
1. **Image Order**: Place the most important/hero image first
2. **Alt Text**: Always provide descriptive alt text for accessibility
3. **Video Thumbnails**: Provide thumbnails for better UX before video loads
4. **File Sizes**: Optimize images/videos for web to ensure fast loading
5. **Consistency**: Use similar aspect ratios for all media in a gallery
