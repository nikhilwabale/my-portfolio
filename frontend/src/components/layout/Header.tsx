'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { navLinks } from '@/data/content';
import { site } from '@/lib/site';
import { useActiveSection } from '@/hooks/useActiveSection';

const searchable = [
  { label: 'About Nikhil', href: '#about', desc: 'Experience, highlights and stack summary' },
  { label: 'Work Experience', href: '#experience', desc: 'PathLogics internship, Technvil full stack role and freelance project journey' },
  { label: 'Projects', href: '#projects', desc: 'Asset Management System, AMS App and TechCart Product Showcase with problem action result case studies' },
  { label: 'Skills', href: '#skills', desc: 'Progress-based technical skill section' },
  { label: 'Education', href: '#education', desc: 'Engineering education and achievements' },
  { label: 'Freelance Services', href: '#freelance', desc: 'Full stack web application, mobile application, desktop application and business website services' },
  { label: 'Contact', href: '#contact', desc: 'Email, social links and contact form' }
];

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const results = searchable.filter((item) => `${item.label} ${item.desc}`.toLowerCase().includes(query.toLowerCase()));

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
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sections, projects, skills..." />
          <kbd>ESC</kbd>
          <button onClick={onClose} aria-label="Close search"><X /></button>
        </div>
        <div className="search-modal-body">
          <p className="mb-3 text-sm font-bold uppercase tracking-[.2em] text-slate-500">Quick navigation</p>
          {results.map((item) => (
            <a className="search-result" href={item.href} key={item.href} onClick={onClose}>
              {item.label}<span className="block text-sm font-normal text-slate-500">{item.desc}</span>
            </a>
          ))}
          {results.length === 0 && <p className="rounded-xl border border-white/10 p-4 text-slate-400">No matching section found.</p>}
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
        {open && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mobile-nav border-t border-white/10 bg-[#06101c] px-5 pb-5 lg:hidden">{navLinks.map((l) => <a onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-bold text-slate-200" key={l.href} href={l.href}>{l.label}</a>)}</motion.div>}
      </motion.header>
      <AnimatePresence>{searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}</AnimatePresence>
    </>
  );
}

export function Footer() {
  return <footer className="border-t border-cyan-400/15 py-9"><div className="container flex flex-col items-center justify-between gap-4 text-slate-400 md:flex-row"><p>© 2026 <span className="text-cyan-300">{site.name}</span>. Built with Next.js & Framer Motion.</p><div className="flex gap-3"><a href={site.socials.github}>GitHub</a><a href={site.socials.linkedin}>LinkedIn</a><a href={site.socials.x}>X</a></div></div></footer>;
}
