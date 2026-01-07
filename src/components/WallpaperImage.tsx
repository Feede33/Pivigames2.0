'use client';

import { useState, useEffect } from 'react';

type WallpaperImageProps = {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
};

export default function WallpaperImage({ src, alt, className = '', onLoad }: WallpaperImageProps) {
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({
    filter: 'saturate(1.1) contrast(1.05)',
    imageRendering: '-webkit-optimize-contrast' as any,
    mixBlendMode: 'normal' as any
  });

  // Use proxy for Steam images to avoid CORS issues
  const proxiedSrc = src.includes('steamstatic.com') || src.includes('akamai') 
    ? `/api/proxy-image?url=${encodeURIComponent(src)}`
    : src;

  useEffect(() => {
    // Detectar si la imagen tiene un tinte azul dominante
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = proxiedSrc;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Usar una muestra pequeña para mejor rendimiento
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;
        
        let totalR = 0, totalG = 0, totalB = 0;
        const pixelCount = data.length / 4;
        
        // Calcular el promedio de cada canal de color
        for (let i = 0; i < data.length; i += 4) {
          totalR += data[i];
          totalG += data[i + 1];
          totalB += data[i + 2];
        }
        
        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;
        
        console.log(`Color analysis for ${alt}:`, { avgR, avgG, avgB });
        
        // Si el azul es dominante (más de 10% mayor que los otros canales)
        const blueDominance = avgB - Math.max(avgR, avgG);
        
        if (blueDominance > 25) {
          console.log(`⚠ Blue tint detected in ${alt}, applying correction`);
          // Aplicar corrección de color para reducir el azul
          setImageStyle({
            filter: 'saturate(1.2) contrast(1.1) hue-rotate(-5deg)',
            imageRendering: '-webkit-optimize-contrast' as any,
            mixBlendMode: 'normal' as any
          });
        } else {
          console.log(`✓ No blue tint detected in ${alt}`);
        }
      } catch (error) {
        console.error('Error analyzing image color:', error);
        // Si hay error de CORS, usar el filtro por defecto
      }
      
      if (onLoad) onLoad();
    };
  }, [proxiedSrc, alt, onLoad]);

  return (
    <img
      src={proxiedSrc}
      alt={alt}
      className={className}
      style={imageStyle}
    />
  );
}
