'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { education, experience, freelanceServices, navLinks, projects, skillGroups } from '@/data/content';
import { site } from '@/lib/site';
import { useActiveSection } from '@/hooks/useActiveSection';

type SearchItem = {
  label: string;
  href: string;
  desc: string;
  type: string;
  keywords: string;
};

const normalizeSearch = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ').replace(/\s+/g, ' ').trim();

const baseSearchable: SearchItem[] = [
  { label: 'Home', href: '#home', type: 'Section', desc: 'Portfolio introduction, availability, resume and hero overview', keywords: 'home portfolio nikhil wabale full stack developer java spring boot developer freelance web app builder resume' },
  { label: 'About Nikhil', href: '#about', type: 'Section', desc: 'Profile summary, experience highlights and professional background', keywords: 'about nikhil profile pune software engineer full stack developer react java spring boot' },
  { label: 'Work Experience', href: '#experience', type: 'Section', desc: 'Professional journey across internships, production systems and business delivery', keywords: 'experience work technvil pathlogics frontend developer intern software engineer full stack developer' },
  { label: 'Projects', href: '#projects', type: 'Section', desc: 'Asset Management System, AMS App and TechCart case studies', keywords: 'projects asset management system ams app techcart portfolio case study' },
  { label: 'Skills', href: '#skills', type: 'Section', desc: 'React, Next.js, Angular, Java, Spring Boot, SQL Server and deployment-ready stack', keywords: 'skills tech stack react next angular java spring boot sql server postgresql oracle flutter aws azure' },
  { label: 'Education', href: '#education', type: 'Section', desc: 'BE Information Technology, academic background and achievements', keywords: 'education engineering sinhgad hsc ssc information technology cgpa' },
  { label: 'Services', href: '#freelance', type: 'Section', desc: 'Full-stack web applications, dashboards, mobile apps and business websites', keywords: 'services freelance web application dashboard mobile application landing page business website' },
  { label: 'Contact', href: '#contact', type: 'Section', desc: 'Send an inquiry for jobs, freelance work or project discussions', keywords: 'contact email phone pune inquiry form captcha turnstile resend' }
];

function buildSearchItems(): SearchItem[] {
  const projectItems = projects.map((project) => ({
    label: project.title,
    href: '#projects',
    type: 'Project',
    desc: `${project.role} · ${project.summary}`,
    keywords: [project.title, project.type, project.role, project.period, project.summary, project.problem, project.result, ...project.actions, ...project.stack].join(' ')
  }));

  const skillItems = skillGroups.map((group) => ({
    label: group.title,
    href: '#skills',
    type: 'Skill',
    desc: group.skills.join(' · '),
    keywords: [group.title, ...group.skills].join(' ')
  }));

  const experienceItems = experience.map((item) => ({
    label: item.role,
    href: '#experience',
    type: 'Experience',
    desc: `${item.company} · ${item.period}`,
    keywords: [item.role, item.company, item.location, item.period, item.badge, ...item.bullets, ...item.stack].join(' ')
  }));

  const educationItems = education.map((item) => ({
    label: item.title,
    href: '#education',
    type: 'Education',
    desc: `${item.place} · ${item.score}`,
    keywords: [item.title, item.place, item.period, item.score, item.note].join(' ')
  }));

  const serviceItems = freelanceServices.map((item) => ({
    label: item.title,
    href: '#freelance',
    type: 'Service',
    desc: item.text,
    keywords: `${item.title} ${item.text}`
  }));

  return [...baseSearchable, ...projectItems, ...skillItems, ...experienceItems, ...educationItems, ...serviceItems];
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const searchable = useMemo(() => buildSearchItems(), []);
  const normalizedQuery = normalizeSearch(query);
  const terms = normalizedQuery.split(' ').filter(Boolean);

  const results = useMemo(() => {
    if (!terms.length) return searchable.slice(0, 8);

    return searchable
      .map((item) => {
        const haystack = normalizeSearch(`${item.label} ${item.desc} ${item.type} ${item.keywords}`);
        const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
      .slice(0, 10)
      .map((entry) => entry.item);
  }, [searchable, terms]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div className="search-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="search-modal" initial={{ y: -28, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -18, opacity: 0, scale: 0.98 }} onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-head">
          <Search size={24} className="text-cyan-300" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search React, Java, projects, skills..." />
          <kbd>ESC</kbd>
          <button onClick={onClose} aria-label="Close search"><X /></button>
        </div>
        <div className="search-modal-body">
          <p className="mb-3 text-sm font-bold uppercase tracking-[.2em] text-slate-500">{terms.length ? 'Search results' : 'Quick navigation'}</p>
          {results.map((item) => (
            <a className="search-result" href={item.href} key={`${item.type}-${item.label}`} onClick={onClose}>
              <span className="search-result-top"><span>{item.label}</span><em>{item.type}</em></span>
              <span className="block text-sm font-normal text-slate-500">{item.desc}</span>
            </a>
          ))}
          {results.length === 0 && <p className="rounded-xl border border-white/10 p-4 text-slate-400">No matching result found. Try React, Java, AMS, SQL, Flutter, contact or resume.</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const ids = useMemo(() => navLinks.map((x) => x.href.replace('#', '')), []);
  const active = useActiveSection(ids);

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', lightMode);
  }, [lightMode]);

  useEffect(() => {
    if (!open) return;
    // body { overflow: hidden } alone doesn't reliably block touch-drag scrolling on iOS
    // Safari (a long-standing WebKit quirk) - taking the body out of flow with
    // position: fixed does, since there's then nothing left for a touch-scroll to move.
    const scrollY = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      document.body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <>
      <motion.header initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55 }} className="site-header fixed inset-x-0 top-0 z-50 border-b border-cyan-400/10 bg-[#06101c]/78 backdrop-blur-2xl">
        <nav className="container flex h-20 items-center justify-between">
          <a href="#home" className="focus-ring text-2xl font-black tracking-tight sm:text-3xl"><span className="gradient-text">Nikhil Wabale</span><span className="text-cyan-300">.</span></a>
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1);
              return <a key={link.href} href={link.href} className={`nav-link ${isActive ? 'nav-link-active' : ''}`}>{link.label}</a>;
            })}
          </div>
          <div className="flex items-center gap-2">
            <button className="search-button" aria-label="Open search" onClick={() => setSearchOpen(true)}><Search size={19} /></button>
            <button className="search-button" aria-label="Toggle theme" onClick={() => setLightMode((value) => !value)}>{lightMode ? <Moon size={19} /> : <Sun size={19} />}</button>
            <button className="focus-ring lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Open navigation">{open ? <X /> : <Menu />}</button>
          </div>
        </nav>
      </motion.header>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-nav mobile-nav-fullscreen border-t border-white/10 bg-[#06101c] px-5 pb-8 lg:hidden"
          >
            {navLinks.map((l) => (
              <a onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-bold text-slate-200" key={l.href} href={l.href}>{l.label}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}</AnimatePresence>
    </>
  );
}

export function Footer() {
  return <footer className="border-t border-cyan-400/15 py-9"><div className="container flex flex-col items-center justify-between gap-4 text-slate-400 md:flex-row"><p>© {new Date().getFullYear()} <span className="text-cyan-300">{site.name}</span>. All rights reserved.</p><div className="text-sm text-slate-500">Built for professional opportunities and selected project work.</div></div></footer>;
}
