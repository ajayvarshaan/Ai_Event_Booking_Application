import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import './Register.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const loginLinkRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  // Particle system (mirrors Login page)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.min(80, Math.floor(window.innerWidth / 15));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? '#ff0099' : '#00c8ff',
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = 0.1 * (1 - distance / 120);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      animationFrame = requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    createParticles();
    drawParticles();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Main GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(cardRef.current, { opacity: 0, y: 60, scale: 0.9, rotationX: 10 });
      gsap.set(logoRef.current, { opacity: 0, scale: 0, rotation: -180 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
      gsap.set('.register-input-group', { opacity: 0, x: -40 });
      gsap.set(submitBtnRef.current, { opacity: 0, y: 20, scale: 0.95 });
      gsap.set(loginLinkRef.current, { opacity: 0, y: 20 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(cardRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.8)'
      })
      .to(logoRef.current, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: 'back.out(2)'
      }, '-=0.6')
      .to('.register-title-char', {
        opacity: 1,
        y: 0,
        rotationX: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, '-=0.4')
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.3')
      .to('.register-input-group', {
        opacity: 1,
        x: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out'
      }, '-=0.2')
      .to(submitBtnRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, '-=0.2')
      .to(loginLinkRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5
      }, '-=0.2');

      // Floating orbs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: 60, y: 40, scale: 1.2, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }
      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: -50, y: -30, scale: 1.1, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }
      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          x: 30, y: -50, scale: 1.3, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }

      // Logo continuous float
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          y: -8, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }

      // Submit button pulse
      if (submitBtnRef.current) {
        gsap.to(submitBtnRef.current, {
          boxShadow: '0 12px 40px rgba(255, 0, 150, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // 3D Tilt effect on card
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !cardWrapperRef.current) return;

    const rect = cardWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    gsap.to(cardRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      transformPerspective: 1200,
      duration: 0.5,
      ease: 'power2.out'
    });

    if (logoRef.current) {
      gsap.to(logoRef.current, {
        x: (x - centerX) * 0.1,
        y: (y - centerY) * 0.1,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    });
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)'
      });
    }
  }, []);

  // Magnetic button effect
  const handleMagneticMove = useCallback((e: React.MouseEvent) => {
    const btn = submitBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, []);

  const handleMagneticLeave = useCallback(() => {
    const btn = submitBtnRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  // Error shake animation
  useEffect(() => {
    if (error && cardRef.current) {
      gsap.fromTo(cardRef.current,
        { x: 0 },
        {
          x: 8,
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.to(cardRef.current, { x: 0, duration: 0.1 });
          }
        }
      );
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (submitBtnRef.current) {
      gsap.to(submitBtnRef.current, {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }

    try {
      const response = await authAPI.register({ name, email, password });
      login(response.data, response.data.token);

      if (cardRef.current) {
        gsap.to(cardRef.current, {
          scale: 1.05,
          opacity: 0,
          y: -30,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => navigate('/home')
        });
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const title = 'Create Account';
  const titleChars = title.split('');

  return (
    <div className="register-page" ref={pageRef}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="register-particles" />

      {/* Floating orbs */}
      <div className="register-orb register-orb-1" ref={orb1Ref} />
      <div className="register-orb register-orb-2" ref={orb2Ref} />
      <div className="register-orb register-orb-3" ref={orb3Ref} />

      {/* Main card */}
      <div className="register-card-wrapper" ref={cardWrapperRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className="register-card" ref={cardRef}>
          {/* Logo */}
          <div className="register-logo" ref={logoRef}>
            <div className="register-logo-icon">
              <FaCalendarAlt />
            </div>
          </div>

          {/* Title */}
          <div className="register-title">
            <h1 ref={titleRef}>
              {titleChars.map((char, i) => (
                <span
                  key={i}
                  className="register-title-char"
                  style={{
                    display: 'inline-block',
                    opacity: 0,
                    transform: 'translateY(40px) rotateX(90deg)',
                    marginRight: char === ' ' ? '0.3em' : '0'
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
          </div>

          <p className="register-subtitle" ref={subtitleRef}>
            Join EventHub and start discovering amazing events
          </p>

          {/* Error message */}
          {error && (
            <div className="register-error">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="register-form" ref={formRef} onSubmit={handleSubmit}>
            {/* Name input */}
            <div className={`register-input-group ${focusedField === 'name' ? 'focused' : ''}`}>
              <span className="register-input-icon"><FaUser /></span>
              <input
                type="text"
                className="register-input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            {/* Email input */}
            <div className={`register-input-group ${focusedField === 'email' ? 'focused' : ''}`}>
              <span className="register-input-icon"><FaEnvelope /></span>
              <input
                type="email"
                className="register-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            {/* Password input */}
            <div className={`register-input-group ${focusedField === 'password' ? 'focused' : ''}`}>
              <span className="register-input-icon"><FaLock /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="register-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                minLength={6}
                style={{ paddingRight: '50px' }}
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <p className="register-hint">Password must be at least 6 characters</p>

            {/* Submit button */}
            <button
              type="submit"
              className="register-submit"
              ref={submitBtnRef}
              disabled={loading}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              {loading ? (
                <>
                  <span className="register-spinner" />
                  Creating account...
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="register-login-link" ref={loginLinkRef}>
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
