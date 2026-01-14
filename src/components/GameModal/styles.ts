type ScreenSize = 'xs' | 'sm' | 'md' | 'lg';

export const getResponsiveStyles = (screenSize: ScreenSize) => {
  const styles = {
    xs: {
      modal: {
        container: { width: '100%', margin: '0 0.75rem', minHeight: '65vh' },
        closeButton: { width: '2rem', height: '2rem', marginRight: "8px", marginTop: "8px" },
        closeIcon: { width: '1rem', height: '1rem' },
      },
      hero: {
        height: { height: '200px' },
        title: { fontSize: '1.125rem', lineHeight: '1.75rem' },
        titleMargin: { marginBottom: '0.5rem' },
        buttonContainer: { bottom: '0.5rem', left: '0.75rem', right: '0.75rem' },
        button: {
          padding: '0.375rem 0.75rem',
          minHeight: '30px',
          minWidth: '70px',
          fontSize: '0.75rem',
          justifyContent: 'center'
        },
        buttonIcon: { width: '0.875rem', height: '0.875rem' },
        buttonGap: { gap: '0.375rem' },
        steamButton: {
          padding: '0.375rem 0.75rem',
          minHeight: '30px',
          minWidth: '90px',
          fontSize: '0.75rem',
          justifyContent: 'center'
        },
      },
      content: {
        padding: { padding: '0.75rem'},
        gap: { gap: '0.375rem' },
        spacing: { marginBottom: '0.625rem' },
        spacingLarge: { marginBottom: '0.75rem' },
      },
      slider: {
        dot: { minWidth: '5px', minHeight: '5px', justifyContent: "center" },
        dotGap: { gap: '6px' },
        dotMargin: { marginTop: '0.5rem', marginBottom: "1rem" },
        thumbnail: { 
          width: '200px', 
          height: '112px',
          flexShrink: 0,
          aspectRatio: '16/9'
        },
      },
      text: {
        xs: { fontSize: '0.625rem' },
        sm: { fontSize: '0.75rem' },
        base: { fontSize: '0.875rem' },
        heading: { fontSize: '0.75rem' },
      },
      grid: {
        features: {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '0.375rem'
        },
        requirements: {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '0.75rem'
        },
        main: {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem'
        },
      },
      sidebar: {
        spacing: {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0.75rem'
        } as React.CSSProperties,
        priceCard: { borderRadius: '0.75rem', padding: '0.75rem', minWidth: "100px" },
        priceTitle: { fontSize: '0.5625rem' },
        priceAmount: { fontSize: '1.25rem', lineHeight: '1.75rem' },
        priceDiscount: { fontSize: '0.625rem' },
        info: { fontSize: '0.625rem' },
        tag: { padding: '0.125rem 0.25rem', fontSize: '0.5625rem' },
        button: { 
          padding: '0.5rem 0.75rem', 
          fontSize: '0.75rem',
          minWidth: '90px',
          textAlign: 'center' as const
        },
        shareContainer: {
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap' as const,
          justifyContent: 'center' as const
        },
      },
      widget: {
        container: { 
          marginTop: '0.75rem', 
          paddingLeft: '0.25rem', 
          paddingRight: '0.25rem',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        },
        iframe: {
          width: '100%',
          maxWidth: '340px', // Ajustado para iPhone SE
          transform: 'scale(0.85)',
          transformOrigin: 'center center'
        },
        skeleton: { 
          height: '140px',
          maxWidth: '340px',
          margin: '0 auto'
        },
      },
      viewer: {
        padding: { padding: '0.25rem' },
        closeButton: { top: '0.5rem', right: '0.5rem', width: '1.75rem', height: '1.75rem' },
        closeIcon: { width: '1rem', height: '1rem' },
        counter: { top: '0.5rem', left: '0.5rem', fontSize: '0.625rem' },
        image: { maxWidth: '98vw', maxHeight: '75vh' },
        arrow: { width: '1.75rem', height: '1.75rem' },
        arrowIcon: { width: '1rem', height: '1rem' },
        arrowLeft: { left: '0.25rem' },
        arrowRight: { right: '0.25rem' },
        thumbnails: { bottom: '0.5rem', gap: '0.25rem' },
        thumbnail: { width: '2.5rem', height: '1.75rem' },
      },
    },
    sm: {
      modal: {
        container: { width: '100%', margin: '0 1rem', minHeight: '70vh' },
        closeButton: { width: '2.25rem', height: '2.25rem' },
        closeIcon: { width: '1.25rem', height: '1.25rem' },
      },
      hero: {
        height: { height: '250px' },
        title: { fontSize: '1.25rem', lineHeight: '1.75rem' },
        titleMargin: { marginBottom: '0.5rem' },
        buttonContainer: { bottom: '0.75rem', left: '1rem', right: '1rem' },
        button: {
          padding: '0.5rem 1rem',
          minHeight: '30px',
          minWidth: '90px',
          fontSize: '0.75rem',
          justifyContent: 'center'
        },
        buttonIcon: { width: '1rem', height: '1rem' },
        buttonGap: { gap: '0.5rem' },
        steamButton: {
          padding: '0.5rem 1rem',
          minHeight: '30px',
          minWidth: '100px',
          fontSize: '0.875rem',
          justifyContent: 'center'
        },
      },
      content: {
        padding: { padding: '1rem' },
        gap: { gap: '0.5rem' },
        spacing: { marginBottom: '0.75rem' },
        spacingLarge: { marginBottom: '1rem' },
      },
      slider: {
        dot: { width: '0.625rem', height: '0.625rem' },
        dotGap: { gap: '0.625rem' },
        dotMargin: { marginTop: '0.625rem' },
        thumbnail: { 
          width: '220px', 
          height: '124px',
          flexShrink: 0,
          aspectRatio: '16/9'
        },
      },
      text: {
        xs: { fontSize: '0.75rem' },
        sm: { fontSize: '0.875rem' },
        base: { fontSize: '1rem' },
        heading: { fontSize: '0.875rem' },
      },
      grid: {
        features: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem'
        },
        requirements: {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem'
        },
        main: {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.25rem'
        },
      },
      sidebar: {
        spacing: {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '1rem'
        } as React.CSSProperties,
        priceCard: { borderRadius: '1rem', padding: '1rem' },
        priceTitle: { fontSize: '0.625rem' },
        priceAmount: { fontSize: '1.5rem', lineHeight: '2rem' },
        priceDiscount: { fontSize: '0.75rem' },
        info: { fontSize: '0.75rem' },
        tag: { padding: '0.125rem 0.375rem', fontSize: '0.625rem' },
        button: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
        shareContainer: {
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap' as const,
          justifyContent: 'center' as const
        },
      },
      viewer: {
        padding: { padding: '0.5rem' },
        closeButton: { top: '0.75rem', right: '0.75rem', width: '2rem', height: '2rem' },
        closeIcon: { width: '1.25rem', height: '1.25rem' },
        counter: { top: '0.75rem', left: '0.75rem', fontSize: '0.75rem' },
        image: { maxWidth: '95vw', maxHeight: '80vh' },
        arrow: { width: '2.25rem', height: '2.25rem' },
        arrowIcon: { width: '1.25rem', height: '1.25rem' },
        arrowLeft: { left: '0.5rem' },
        arrowRight: { right: '0.5rem' },
        thumbnails: { bottom: '0.75rem', gap: '0.375rem' },
        thumbnail: { width: '3rem', height: '2rem' },
      },
      widget: {
        container: { 
          marginTop: '1rem', 
          paddingLeft: '0.75rem', 
          paddingRight: '0.75rem',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        },
        iframe: {
          width: '100%',
          maxWidth: '500px',
          transform: 'scale(0.9)',
          transformOrigin: 'center center'
        },
        skeleton: { 
          height: '160px',
          maxWidth: '500px',
          margin: '0 auto'
        },
      },
    },
    md: {
      modal: {
        container: { width: '90vw', margin: '0', minHeight: '80vh' },
        closeButton: { width: '2.5rem', height: '2.5rem' },
        closeIcon: { width: '1.5rem', height: '1.5rem' },
      },
      hero: {
        height: { height: '350px' },
        title: { fontSize: '1.875rem', lineHeight: '2.25rem' },
        titleMargin: { marginBottom: '0.75rem' },
        buttonContainer: { bottom: '1.25rem', left: '1.5rem', right: '1.5rem' },
        button: {
          padding: '0.625rem 1.75rem',
          fontSize: '0.9375rem'
        },
        buttonIcon: { width: '1.125rem', height: '1.125rem' },
        buttonGap: { gap: '1.75rem' },
        steamButton: {
          padding: '0.625rem 1.75rem',
          minHeight: '90px',
          minWidth: '120px',
          fontSize: '1.875rem',
          justifyContent: 'flex-end'
        },
      },
      content: {
        padding: { padding: '1.5rem' },
        gap: { gap: '0.75rem' },
        spacing: { marginBottom: '1rem' },
        spacingLarge: { marginBottom: '1.5rem' },
      },
      slider: {
        dot: { width: '0.5rem', height: '0.5rem' },
        dotGap: { gap: '0.5rem' },
        dotMargin: { marginTop: '0.75rem' },
        thumbnail: { 
          width: '240px', 
          height: '135px',
          flexShrink: 0,
          aspectRatio: '16/9'
        },
      },
      text: {
        xs: { fontSize: '0.875rem' },
        sm: { fontSize: '1rem' },
        base: { fontSize: '1.125rem' },
        heading: { fontSize: '1rem' },
      },
      grid: {
        features: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem'
        },
        requirements: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem'
        },
        main: {
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.75rem'
        },
      },
      sidebar: {
        spacing: {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '1.5rem'
        } as React.CSSProperties,
        priceCard: { borderRadius: '1.5rem', padding: '1.75rem' },
        priceTitle: { fontSize: '0.75rem' },
        priceAmount: { fontSize: '1.875rem', lineHeight: '2.25rem' },
        priceDiscount: { fontSize: '0.875rem' },
        info: { fontSize: '0.875rem' },
        tag: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
        button: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
        shareContainer: {
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap' as const,
          justifyContent: 'center' as const
        },
      },
      widget: {
        container: { 
          marginTop: '1.75rem', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        },
        iframe: {
          width: '100%',
          maxWidth: '646px',
          transform: 'scale(1)',
          transformOrigin: 'center center'
        },
        skeleton: { 
          height: '190px',
          maxWidth: '646px',
          margin: '0 auto'
        },
      },
      viewer: {
        padding: { padding: '1rem' },
        closeButton: { top: '1rem', right: '1rem', width: '2.5rem', height: '2.5rem' },
        closeIcon: { width: '1.5rem', height: '1.5rem' },
        counter: { top: '1rem', left: '1rem', fontSize: '0.875rem' },
        image: { maxWidth: '90vw', maxHeight: '85vh' },
        arrow: { width: '3rem', height: '3rem' },
        arrowIcon: { width: '2rem', height: '2rem' },
        arrowLeft: { left: '1rem' },
        arrowRight: { right: '1rem' },
        thumbnails: { bottom: '1rem', gap: '0.5rem' },
        thumbnail: { width: '4rem', height: '2.5rem' },
      },
    },
    lg: {
      modal: {
        container: { width: '1100px', maxWidth: '1100px', margin: '0', minHeight: '600px' },
        closeButton: { width: '2.5rem', height: '2.5rem' },
        closeIcon: { width: '1.5rem', height: '1.5rem' },
      },
      hero: {
        height: { height: '380px' },
        title: { fontSize: '2.25rem', lineHeight: '2.5rem' },
        titleMargin: { marginBottom: '0.75rem' },
        buttonContainer: { bottom: '1.25rem', left: '1.5rem', right: '1.5rem' },
        button: {
          padding: '0.625rem 1.75rem',
          fontSize: '0.9375rem'
        },
        buttonIcon: { width: '1.125rem', height: '1.125rem' },
        buttonGap: { gap: '0.5rem' },
        steamButton: {
          padding: '0.625rem 1.75rem',
          minHeight: '40px',
          minWidth: '120px',
          fontSize: '0.9375rem',
          justifyContent: 'center'
        },
      },
      content: {
        padding: { padding: '1.5rem' },
        gap: { gap: '0.75rem' },
        spacing: { marginBottom: '1rem' },
        spacingLarge: { marginBottom: '1.5rem' },
      },
      slider: {
        dot: { width: '0.5rem', height: '0.5rem' },
        dotGap: { gap: '0.5rem' },
        dotMargin: { marginTop: '0.75rem' },
        thumbnail: { 
          width: '260px', 
          height: '146px',
          flexShrink: 0,
          aspectRatio: '16/9'
        },
      },
      text: {
        xs: { fontSize: '0.875rem' },
        sm: { fontSize: '1rem' },
        base: { fontSize: '1.125rem' },
        heading: { fontSize: '1rem' },
      },
      grid: {
        features: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem'
        },
        requirements: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem'
        },
        main: {
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        },
      },
      sidebar: {
        spacing: {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '1.5rem'
        } as React.CSSProperties,
        priceCard: { borderRadius: '1.5rem', padding: '2rem' },
        priceTitle: { fontSize: '0.75rem' },
        priceAmount: { fontSize: '1.875rem', lineHeight: '2.25rem' },
        priceDiscount: { fontSize: '0.875rem' },
        info: { fontSize: '0.875rem' },
        tag: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
        button: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
        shareContainer: {
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap' as const,
          justifyContent: 'center' as const
        },
      },
      widget: {
        container: { 
          marginTop: '2rem', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        },
        iframe: {
          width: '100%',
          maxWidth: '646px',
          transform: 'scale(1)',
          transformOrigin: 'center center'
        },
        skeleton: { 
          height: '190px',
          maxWidth: '646px',
          margin: '0 auto'
        },
      },
      viewer: {
        padding: { padding: '1rem' },
        closeButton: { top: '1rem', right: '1rem', width: '2.5rem', height: '2.5rem' },
        closeIcon: { width: '1.5rem', height: '1.5rem' },
        counter: { top: '1rem', left: '1rem', fontSize: '0.875rem' },
        image: { maxWidth: '90vw', maxHeight: '85vh' },
        arrow: { width: '3rem', height: '3rem' },
        arrowIcon: { width: '2rem', height: '2rem' },
        arrowLeft: { left: '1rem' },
        arrowRight: { right: '1rem' },
        thumbnails: { bottom: '1rem', gap: '0.5rem' },
        thumbnail: { width: '4rem', height: '2.5rem' },
      },
    },
  };

  return styles[screenSize] || styles.md;
};
