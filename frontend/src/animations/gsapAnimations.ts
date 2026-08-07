import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============ BASIC ANIMATIONS ============
export const fadeInUp = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 80 },
    { 
      opacity: 1, 
      y: 0, 
      duration: 1.2, 
      delay, 
      ease: 'power4.out'
    }
  );
};

export const staggerFadeIn = (elements: HTMLElement[] | NodeListOf<Element>, stagger: number = 0.15): void => {
  if (!elements || elements.length === 0) return;
  gsap.fromTo(
    elements,
    { opacity: 0, y: 60, scale: 0.95 },
    { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      duration: 0.8, 
      stagger, 
      ease: 'power3.out'
    }
  );
};

export const scaleIn = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { scale: 0.85, opacity: 0, rotation: -5 },
    { 
      scale: 1, 
      opacity: 1, 
      rotation: 0,
      duration: 0.7, 
      delay, 
      ease: 'back.out(1.5)'
    }
  );
};

export const slideInLeft = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { x: -120, opacity: 0 },
    { 
      x: 0, 
      opacity: 1, 
      duration: 1, 
      delay, 
      ease: 'power4.out'
    }
  );
};

export const slideInRight = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { x: 120, opacity: 0 },
    { 
      x: 0, 
      opacity: 1, 
      duration: 1, 
      delay, 
      ease: 'power4.out'
    }
  );
};

export const scrollReveal = (elements: HTMLElement[] | NodeListOf<Element>): void => {
  if (!elements || elements.length === 0) return;
  gsap.fromTo(
    elements,
    { opacity: 0, y: 100, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: elements,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    }
  );
};

export const hoverScale = (element: HTMLElement | null): void => {
  if (!element) return;
  element.addEventListener('mouseenter', () => {
    gsap.to(element, { 
      scale: 1.03, 
      duration: 0.4, 
      ease: 'power2.out'
    });
  });
  element.addEventListener('mouseleave', () => {
    gsap.to(element, { 
      scale: 1, 
      duration: 0.4, 
      ease: 'power2.out'
    });
  });
};

export const pulseAnimation = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.to(element, {
    scale: 1.1,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

export const rotateIn = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { rotation: -180, opacity: 0 },
    { rotation: 0, opacity: 1, duration: 0.8, delay, ease: 'back.out(1.7)' }
  );
};

export const flipCard = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.to(element, {
    rotationY: 180,
    duration: 0.6,
    ease: 'back.out(1.7)',
    transformStyle: 'preserve-3d'
  });
};

export const pageTransition = (): gsap.core.Timeline => {
  const tl = gsap.timeline();
  tl.fromTo(
    '.page-transition',
    { scaleY: 0, transformOrigin: 'top' },
    { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }
  ).to('.page-transition', {
    scaleY: 0,
    transformOrigin: 'bottom',
    duration: 0.5,
    ease: 'power3.inOut'
  });
  return tl;
};

export const revealRouteShell = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: 'power3.out',
      clearProps: 'transform,opacity'
    }
  );
};

export const animateFloatingDock = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 40, scale: 0.92 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'back.out(1.4)'
    }
  );
};

export const animateDockItems = (elements: HTMLElement[] | NodeListOf<Element>): void => {
  if (!elements || elements.length === 0) return;
  gsap.fromTo(
    elements,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out'
    }
  );
};

export const dockHoverLift = (element: HTMLElement | null): void => {
  if (!element) return;

  const onEnter = () => {
    gsap.to(element, {
      y: -6,
      scale: 1.04,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  const onLeave = () => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  element.addEventListener('mouseenter', onEnter);
  element.addEventListener('mouseleave', onLeave);
};

export const textReveal = (element: HTMLElement | null, staggerDelay: number = 0.03): void => {
  if (!element) return;
  const text = element.textContent || '';
  element.innerHTML = '';
  
  text.split('').forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    element.appendChild(span);
  });
  
  const chars = element.querySelectorAll('span');
  gsap.to(chars, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: staggerDelay,
    ease: 'power3.out'
  });
};

export const morphShape = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.to(element, {
    borderRadius: '50%',
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

// ============ ENHANCED COLORFUL ANIMATIONS ============

export const glowEffect = (element: HTMLElement | null, color: string = '#667eea'): void => {
  if (!element) return;
  gsap.to(element, {
    boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

export const floatingAnimation = (element: HTMLElement | null, distance: number = 20): void => {
  if (!element) return;
  gsap.to(element, {
    y: -distance,
    rotation: 5,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

export const bounceInColorful = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { 
      scale: 0, 
      opacity: 0,
      rotation: -180
    },
    { 
      scale: 1, 
      opacity: 1,
      rotation: 0,
      duration: 0.8, 
      delay,
      ease: 'elastic.out(1, 0.5)'
    }
  );
};

export const shimmerEffect = (element: HTMLElement | null): void => {
  if (!element) return;
  const shimmer = document.createElement('div');
  shimmer.style.position = 'absolute';
  shimmer.style.top = '0';
  shimmer.style.left = '-100%';
  shimmer.style.width = '100%';
  shimmer.style.height = '100%';
  shimmer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)';
  shimmer.style.pointerEvents = 'none';
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(shimmer);
  
  gsap.to(shimmer, {
    left: '100%',
    duration: 2,
    repeat: -1,
    repeatDelay: 1,
    ease: 'power2.inOut'
  });
};

export const staggerScale = (elements: HTMLElement[] | NodeListOf<Element>, stagger: number = 0.1): void => {
  if (!elements || elements.length === 0) return;
  gsap.fromTo(
    elements,
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      stagger,
      ease: 'back.out(1.7)'
    }
  );
};

export const flipAndFade = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { 
      rotationY: -90, 
      opacity: 0,
      x: -50
    },
    { 
      rotationY: 0, 
      opacity: 1,
      x: 0,
      duration: 0.8, 
      delay,
      ease: 'power3.out',
      perspective: 1000
    }
  );
};

export const slideAndRotate = (element: HTMLElement | null, direction: 'left' | 'right' = 'left', delay: number = 0): void => {
  if (!element) return;
  const xValue = direction === 'left' ? -100 : 100;
  gsap.fromTo(
    element,
    { 
      x: xValue, 
      opacity: 0,
      rotation: direction === 'left' ? -45 : 45
    },
    { 
      x: 0, 
      opacity: 1,
      rotation: 0,
      duration: 0.8, 
      delay,
      ease: 'power3.out'
    }
  );
};

export const pulseWithColor = (element: HTMLElement | null, color: string = '#667eea'): void => {
  if (!element) return;
  gsap.to(element, {
    scale: 1.15,
    boxShadow: `0 0 30px ${color}`,
    duration: 0.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

export const rotateAndScale = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { 
      rotation: -360, 
      scale: 0,
      opacity: 0
    },
    { 
      rotation: 0, 
      scale: 1,
      opacity: 1,
      duration: 1, 
      delay,
      ease: 'back.out(1.5)'
    }
  );
};

export const waveAnimation = (elements: HTMLElement[] | NodeListOf<Element>, stagger: number = 0.1): void => {
  if (!elements || elements.length === 0) return;
  gsap.to(elements, {
    y: -20,
    duration: 0.5,
    stagger: {
      amount: stagger,
      repeat: -1,
      yoyo: true
    },
    ease: 'sine.inOut'
  });
};

export const bounceAndGlow = (element: HTMLElement | null, color: string = '#667eea'): void => {
  if (!element) return;
  gsap.to(element, {
    y: -15,
    boxShadow: `0 10px 30px ${color}`,
    duration: 0.6,
    repeat: -1,
    yoyo: true,
    ease: 'power2.inOut'
  });
};

export const spiralAnimation = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { 
      opacity: 0,
      scale: 0,
      rotation: -360
    },
    { 
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.2, 
      delay,
      ease: 'power3.out'
    }
  );
};

export const flipStagger = (elements: HTMLElement[] | NodeListOf<Element>, stagger: number = 0.1): void => {
  if (!elements || elements.length === 0) return;
  gsap.fromTo(
    elements,
    { 
      rotationY: -90, 
      opacity: 0
    },
    {
      rotationY: 0,
      opacity: 1,
      duration: 0.6,
      stagger,
      ease: 'back.out(1.5)'
    }
  );
};

export const expandContract = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.to(element, {
    width: '110%',
    height: '110%',
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

export const neonGlow = (element: HTMLElement | null, color: string = '#00ff00'): void => {
  if (!element) return;
  gsap.to(element, {
    textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
    boxShadow: `0 0 10px ${color}, 0 0 20px ${color}, inset 0 0 10px ${color}`,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

export const perspectiveEntrance = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { 
      opacity: 0,
      rotationX: 90,
      z: -500
    },
    { 
      opacity: 1,
      rotationX: 0,
      z: 0,
      duration: 1, 
      delay,
      ease: 'power3.out',
      perspective: 1000
    }
  );
};

export const blurAndFocus = (element: HTMLElement | null, delay: number = 0): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { 
      opacity: 0,
      filter: 'blur(10px)'
    },
    { 
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1, 
      delay,
      ease: 'power3.out'
    }
  );
};

export const skewAnimation = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.to(element, {
    skewY: 10,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

// ============ ADVANCED UNIFIED ANIMATIONS ============

// 3D Tilt effect for cards
export const tilt3D = (element: HTMLElement | null, intensity: number = 6): void => {
  if (!element) return;
  
  const onMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    gsap.to(element, {
      rotationX: ((y - centerY) / centerY) * -intensity,
      rotationY: ((x - centerX) / centerX) * intensity,
      transformPerspective: 1000,
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out'
    });
  };
  
  const onLeave = () => {
    gsap.to(element, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });
  };
  
  element.addEventListener('mousemove', onMove);
  element.addEventListener('mouseleave', onLeave);
};

// Magnetic button effect
export const magneticButton = (element: HTMLElement | null, strength: number = 0.25): void => {
  if (!element) return;
  
  const onMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const onLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  };
  
  element.addEventListener('mousemove', onMove);
  element.addEventListener('mouseleave', onLeave);
};

// Animated counter for numbers
export const animateCounter = (element: HTMLElement | null, finalValue: number, prefix: string = '', duration: number = 1.5): void => {
  if (!element) return;
  const obj = { val: 0 };
  gsap.to(obj, {
    val: finalValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      const formatted = obj.val >= 1000
        ? Math.round(obj.val).toLocaleString()
        : (finalValue % 1 !== 0 ? obj.val.toFixed(2) : Math.round(obj.val).toString());
      element.textContent = prefix + formatted;
    }
  });
};

// Word-by-word text reveal with 3D rotation
export const wordReveal3D = (element: HTMLElement | null, stagger: number = 0.1): void => {
  if (!element) return;
  const words = element.textContent?.split(' ') || [];
  element.textContent = '';
  
  words.forEach((word, wi) => {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.marginRight = '0.35em';
    span.style.opacity = '0';
    span.style.transform = 'translateY(60px) rotateX(60deg)';
    span.style.transformStyle = 'preserve-3d';
    span.textContent = word;
    element.appendChild(span);
    
    gsap.to(span, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.7,
      delay: wi * stagger,
      ease: 'back.out(1.8)'
    });
  });
};

// Character-by-character reveal
export const charReveal = (element: HTMLElement | null, stagger: number = 0.03): void => {
  if (!element) return;
  const chars = Array.from(element.textContent || '');
  element.textContent = '';
  
  chars.forEach((char, i) => {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.marginRight = char === ' ' ? '0.25em' : '0';
    span.style.opacity = '0';
    span.style.transform = 'translateY(40px) rotateX(60deg)';
    span.style.transformStyle = 'preserve-3d';
    span.textContent = char === ' ' ? '\u00A0' : char;
    element.appendChild(span);
    
    gsap.to(span, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.6,
      delay: i * stagger,
      ease: 'back.out(1.8)'
    });
  });
};

// Scroll-triggered section reveal
export const scrollSectionReveal = (element: HTMLElement | null, from: string = 'top 85%'): void => {
  if (!element) return;
  gsap.fromTo(element,
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: from
      }
    }
  );
};

// Staggered card entrance with 3D flip
export const staggerCards3D = (elements: HTMLElement[] | NodeListOf<Element>, stagger: number = 0.15): void => {
  if (!elements || elements.length === 0) return;
  gsap.fromTo(elements,
    { opacity: 0, y: 100, scale: 0.9, rotationY: -18 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationY: 0,
      duration: 0.9,
      stagger,
      ease: 'back.out(1.6)',
      transformPerspective: 900
    }
  );
};

// Animated progress bar
export const animateProgressBar = (element: HTMLElement | null, targetWidth: string): void => {
  if (!element) return;
  gsap.fromTo(element,
    { width: '0%' },
    {
      width: targetWidth,
      duration: 1.2,
      ease: 'power3.out'
    }
  );
};

// Floating orbs background animation
export const animateFloatingOrbs = (elements: HTMLElement[] | NodeListOf<Element>): void => {
  if (!elements || elements.length === 0) return;
  elements.forEach((orb, i) => {
    gsap.to(orb, {
      x: (i % 2 === 0 ? 1 : -1) * (60 + i * 20),
      y: (i % 2 === 0 ? -1 : 1) * (40 + i * 15),
      scale: 1.2 + i * 0.1,
      duration: 8 + i * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });
};

// Continuous glow pulse
export const glowPulse = (element: HTMLElement | null, color: string = '#667eea'): void => {
  if (!element) return;
  gsap.to(element, {
    boxShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

// Shimmer sweep effect
export const shimmerSweep = (element: HTMLElement | null): void => {
  if (!element) return;
  gsap.fromTo(element,
    { backgroundPosition: '200% 0' },
    {
      backgroundPosition: '-200% 0',
      duration: 3,
      repeat: -1,
      ease: 'linear'
    }
  );
};
