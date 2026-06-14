'use client';

import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Download, Github, Linkedin, Mail, Sparkles, Twitter, BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { site } from '@/lib/site';
import { useEffect, useMemo, useState } from 'react';

function AnimatedRole() {
  const roles = useMemo(
    () => [
      'Full Stack Developer',
      'React • Next.js • Angular Engineer',
      'ASP.NET Core API Developer',
      'Freelance Web App Builder'
    ],
    []
  );
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const current = roles[index];

    if (pause) {
      const timer = window.setTimeout(() => {
        setPause(false);
        setDeleting(true);
      }, 1450);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      if (!deleting && text === current) {
        setPause(true);
        return;
      }
      if (deleting && text === '') {
        setDeleting(false);
        setIndex((index + 1) % roles.length);
        return;
      }
      setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1));
    }, deleting ? 26 : 45);

    return () => window.clearTimeout(timer);
  }, [deleting, index, pause, roles, text]);

  return (
    <span className="role-type" aria-live="polite">
      {text}
      <span className="typing-cursor">|</span>
    </span>
  );
}

const ticker = ['React.js', 'Next.js', 'Angular', 'ASP.NET Core', 'C#', 'SQL Server', 'EF Core', 'REST APIs', 'JWT', 'Flutter', 'Azure'];

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bgX = useTransform(mx, [-500, 500], [-18, 18]);
  const bgY = useTransform(my, [-500, 500], [-18, 18]);
  const avatarX = useTransform(mx, [-500, 500], [10, -10]);
  const avatarY = useTransform(my, [-500, 500], [8, -8]);

  return (
    <section
      id="home"
      onMouseMove={(event) => {
        mx.set(event.clientX - window.innerWidth / 2);
        my.set(event.clientY - window.innerHeight / 2);
      }}
      className="hero-section relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 -z-10 opacity-85 grid-bg" />
      <div className="hero-social-rail" aria-label="Social links">
        <a href={site.socials.github} aria-label="GitHub"><Github size={18} /></a>
        <a href={site.socials.linkedin} aria-label="LinkedIn"><Linkedin size={18} /></a>
        <a href={site.socials.x} aria-label="X"><Twitter size={18} /></a>
        <a href={`mailto:${site.email}`} aria-label="Email"><Mail size={18} /></a>
      </div>

      <div className="container hero-grid-v10 hero-grid-v11">
        <div className="hero-copy">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="availability-pill"
          >
            <span className="pulse-dot" /> Open to full-stack roles & freelance projects
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="hero-kicker"
          >
            // Portfolio of
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.28 }}
            className="hero-title hero-title-pro hero-title-v11"
          >
            <span>Nikhil</span>
            <span className="gradient-text">Wabale</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.55 }}
            className="hero-role hero-role-fixed"
          >
            <span className="comment-mark">//</span>
            <AnimatedRole />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.55 }}
            className="hero-description"
          >
            I design and build scalable web applications, enterprise dashboards, secure APIs, and business-ready freelance websites using React, Next.js, Angular and ASP.NET Core.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.64, duration: 0.55 }}
            className="hero-actions"
          >
            <Button href="#projects">Explore Work <ArrowRight size={20} /></Button>
            <Button variant="secondary" href={site.resume}><Download size={20} /> Download Resume</Button>
            <Button variant="ghost" href="#contact">Start a Project</Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.34, duration: 0.72, ease: 'easeOut' }}
          className="hero-visual hero-visual-pro"
        >
          <motion.div
            style={{ x: avatarX, y: avatarY }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="hero-avatar-stage"
          >
            <Image src="/images/dev-emoji-avatar.svg" alt="Animated developer avatar" width={280} height={280} priority />
          </motion.div>

          <motion.div className="pro-badge pro-badge-top" animate={{ y: [0, -7, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Sparkles size={16} /> Full-stack product builder
          </motion.div>
          <div className="delivery-panel glass-card">
            <div className="terminal-top"><span /><span /><span /></div>
            <p className="panel-label">Developer profile</p>
            <div className="hero-impact-list">
              <p><BriefcaseBusiness size={16} /> Full-stack web applications for business workflows.</p>
              <p><BriefcaseBusiness size={16} /> Mobile applications connected with secure APIs.</p>
              <p><BriefcaseBusiness size={16} /> Desktop-friendly dashboards and admin systems.</p>
              <p><BriefcaseBusiness size={16} /> Freelance websites, landing pages and SaaS-style products.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="tech-ticker" aria-hidden>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}>
          {[...ticker, ...ticker].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
        </motion.div>
      </div>

      <motion.a href="#about" className="scroll-cue" initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 8, 0] }} transition={{ delay: 1, duration: 1.6, repeat: Infinity }}>
        <span>SCROLL</span><i />
      </motion.a>
    </section>
  );
}
