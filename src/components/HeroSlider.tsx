'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import WallpaperImage from './WallpaperImage';
import type { GameWithSteamData } from '@/lib/supabase';


type Props = {
  games: GameWithSteamData[];
  loading: boolean;
  t: any;
  onGameClickAction: (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => void;
};

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg';

export default function HeroSlider({ games, loading, t, onGameClickAction }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenSize, setScreenSize] = useState<ScreenSize>('md');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 400) setScreenSize('xs' as ScreenSize); // iPhone SE y menores
      else if (width < 640) setScreenSize('sm' as ScreenSize); // Móviles grandes
      else if (width < 768) setScreenSize('md' as ScreenSize); // Tablets pequeñas
      else setScreenSize('lg' as ScreenSize); // Desktop
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % games.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + games.length) % games.length);
  };

  // Estilos dinámicos basados en el tamaño de pantalla
  const getResponsiveStyles = () => {
    const styles = {
      xs: { // iPhone SE (< 400px)
        container: { height: '65vh' },
        arrow: { left: '8px', right: '8px', padding: '6px' },
        iconSize: { width: '18px', height: '18px' },
        content: { paddingLeft: '12px', paddingRight: '12px', paddingBottom: '60px', maxWidth: '100%' },
        title: { fontSize: '18px', marginBottom: '8px', lineHeight: '1.2' },
        metadata: { fontSize: '11px', gap: '6px' },
        description: { fontSize: '12px', marginBottom: '12px', lineClamp: 2 },
        button: {
          padding: '6px 12px',
          fontSize: '11px',
          gap: '4px',
          minWidth: '80px',
          minHeight: '32px'
        },
        buttonIcon: { width: '14px', height: '14px' },
        indicators: { bottom: '8px', gap: '3px', maxWidth: '340px' },
        indicatorBar: { width: '24px', height: '2px' },
        gradientBottom: '120px',
        gradient: 'linear-gradient(to right, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 50%, transparent 100%)'
      },
      sm: { // Móviles grandes (400-640px)
        container: { height: '70vh' },
        arrow: { left: '12px', right: '12px', padding: '8px' },
        iconSize: { width: '20px', height: '20px' },
        content: { paddingLeft: '16px', paddingRight: '16px', paddingBottom: '70px', maxWidth: '100%' },
        title: { fontSize: '22px', marginBottom: '10px', lineHeight: '1.3' },
        metadata: { fontSize: '12px', gap: '8px' },
        description: { fontSize: '13px', marginBottom: '16px', lineClamp: 2 },
        button: {
          padding: '8px 16px',
          fontSize: '12px',
          gap: '6px',
          minWidth: '90px',
          minHeight: '36px'
        },
        buttonIcon: { width: '16px', height: '16px' },
        indicators: { bottom: '12px', gap: '4px', maxWidth: '380px' },
        indicatorBar: { width: '28px', height: '2px' },
        gradientBottom: '140px',
        gradient: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, transparent 100%)'
      },
      md: { // Tablets (640-768px)
        container: { height: '75vh' },
        arrow: { left: '16px', right: '16px', padding: '10px' },
        iconSize: { width: '28px', height: '28px' },
        content: { paddingLeft: '24px', paddingRight: '24px', paddingBottom: '80px', maxWidth: '100%' },
        title: { fontSize: '28px', marginBottom: '12px', lineHeight: '1.3' },
        metadata: { fontSize: '13px', gap: '10px' },
        description: { fontSize: '14px', marginBottom: '20px', lineClamp: 3 },
        button: {
          padding: '10px 24px',
          fontSize: '14px',
          gap: '8px',
          minWidth: '100px',
          minHeight: '40px'
        },
        buttonIcon: { width: '18px', height: '18px' },
        indicators: { bottom: '20px', gap: '5px', maxWidth: '100%' },
        indicatorBar: { width: '40px', height: '2.5px' },
        gradientBottom: '160px',
        gradient: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)'
      },
      lg: { // Desktop (>768px)
        container: { height: '90vh' },
        arrow: { left: '20px', right: '20px', padding: '12px' },
        iconSize: { width: '32px', height: '32px' },
        content: { paddingLeft: '80px', paddingRight: '32px', paddingBottom: '100px', maxWidth: '800px' },
        title: { fontSize: '48px', marginBottom: '16px', lineHeight: '1.2' },
        metadata: { fontSize: '16px', gap: '16px' },
        description: { fontSize: '18px', marginBottom: '24px', lineClamp: 3 },
        button: {
          padding: '12px 32px',
          fontSize: '16px',
          gap: '8px',
          minWidth: '120px',
          minHeight: '48px'
        },
        buttonIcon: { width: '20px', height: '20px' },
        indicators: { bottom: '32px', gap: '6px', maxWidth: '100%' },
        indicatorBar: { width: '60px', height: '3px' },
        gradientBottom: '160px',
        gradient: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.5) 60%, transparent 100%)'
      }
    };

    return styles[screenSize] || styles.md;
  };

  const styles = getResponsiveStyles();

  // Debug: verificar que los estilos se están aplicando
  useEffect(() => {
    console.log('Current screenSize:', screenSize);
    console.log('Indicator styles:', styles.indicatorBar);
  }, [screenSize, styles.indicatorBar]);

  if (loading) {
    return (
      <div style={{
        position: 'relative',
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#9ca3af' }}>{t.loading.games}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div style={{
        position: 'relative',
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {t.empty.noGames}
          </h2>
          <p style={{ color: '#9ca3af' }}>{t.empty.addGames}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        ...styles.container,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}
    >
      {/* Wallpaper */}
      <WallpaperImage
        src={games[currentSlide].wallpaper}
        alt={games[currentSlide].title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
      />

      {/* Gradientes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: styles.gradient,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: styles.gradientBottom,
          background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 50%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: styles.arrow.left,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: styles.arrow.padding,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
        aria-label="Previous slide"
      >
        <ChevronLeft style={{ ...styles.iconSize, color: 'white' }} />
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: styles.arrow.right,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: styles.arrow.padding,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
        aria-label="Next slide"
      >
        <ChevronRight style={{ ...styles.iconSize, color: 'white' }} />
      </button>

      {/* Slide Indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: styles.indicators.bottom,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: styles.indicators.gap,
          padding: '0 8px',
          maxWidth: styles.indicators.maxWidth
        }}
      >
        {games.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentSlide(index)}
            role="button"
            tabIndex={0}
            aria-label={`Go to slide ${index + 1}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setCurrentSlide(index);
              }
            }}
            style={{
              minWidth: styles.indicatorBar.width,
              maxWidth: styles.indicatorBar.width,
              minHeight: styles.indicatorBar.height,
              maxHeight: styles.indicatorBar.height,
              borderRadius: '1px',
              transition: 'all 0.3s ease',
              backgroundColor: index === currentSlide ? '#ef4444' : 'rgba(156, 163, 175, 0.4)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          paddingLeft: styles.content.paddingLeft,
          paddingRight: styles.content.paddingRight,
          paddingBottom: styles.content.paddingBottom,
          maxWidth: styles.content.maxWidth
        }}
      >
        <h2
          style={{
            fontSize: styles.title.fontSize,
            fontWeight: 'bold',
            marginBottom: styles.title.marginBottom,
            lineHeight: styles.title.lineHeight,
            color: 'white',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'

          }}

        >
          {games[currentSlide].title}
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: styles.metadata.gap,
            marginBottom: styles.metadata.gap,
            flexWrap: 'wrap',
            fontSize: styles.metadata.fontSize
          }}
        >
          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
            {Math.round(games[currentSlide].rating * 10)}% {t.hero.match}
          </span>
          <span style={{ color: '#9ca3af' }}>
            {games[currentSlide].release_year || 'N/A'}
          </span>
          <span style={{
            border: '1px solid #6b7280',
            padding: '2px 6px',
            color: '#d1d5db'
          }}>
            {games[currentSlide].required_age ? `${games[currentSlide].required_age}+` : '18+'}
          </span>
          <span style={{
            border: '1px solid #6b7280',
            padding: '2px 6px',
            color: '#d1d5db'
          }}>
            HD
          </span>
        </div>

        <p
          style={{
            fontSize: styles.description.fontSize,
            marginBottom: styles.description.marginBottom,
            color: '#d1d5db',
            lineHeight: '1.6',
            display: '-webkit-box',
            WebkitLineClamp: styles.description.lineClamp,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {games[currentSlide].description}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() =>
              onGameClickAction(games[currentSlide], {
                currentTarget: {
                  getBoundingClientRect: () => ({
                    left: window.innerWidth / 2 - 100,
                    top: window.innerHeight / 2 - 100,
                    width: 200,
                    height: 200,
                  }),
                },
              } as React.MouseEvent<HTMLDivElement>)
            }
            style={{
              backgroundColor: 'white',
              color: 'black',
              padding: styles.button.padding,
              borderRadius: '9999px',
              fontWeight: 'bold',
              fontSize: styles.button.fontSize,
              display: 'flex',
              alignItems: 'center',
              gap: styles.button.gap,
              minWidth: styles.button.minWidth,
              minHeight: styles.button.minHeight,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <Play style={{ ...styles.buttonIcon }} fill="currentColor" />
            {t.hero.play}
          </button>

          <button
            style={{
              backgroundColor: 'rgba(55, 65, 81, 0.8)',
              color: 'white',
              padding: styles.button.padding,
              borderRadius: '9999px',
              fontWeight: 'bold',
              fontSize: styles.button.fontSize,
              display: 'flex',
              alignItems: 'center',
              gap: styles.button.gap,
              minWidth: styles.button.minWidth,
              minHeight: styles.button.minHeight,
              border: 'none',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.8)'}
          >
            <Info style={{ ...styles.buttonIcon }} />
            {t.hero.report}
          </button>
        </div>
      </div>
    </div>
  );
}