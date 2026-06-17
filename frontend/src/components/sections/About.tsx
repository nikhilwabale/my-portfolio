'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function About() {
  return (
    <section id="about" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader
          kicker="About Me"
          title="Built on"
          highlight="fundamentals."
          subtitle="A short profile snapshot — who I am, how I work and what I am currently looking for."
        />
        <div className="about-profile-grid">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="about-photo-card-wrap">
            <div className="about-photo-card relative mx-auto h-[430px] max-w-[370px] overflow-hidden rounded-[30px] border border-cyan-300/35 bg-slate-950 shadow-[0_0_55px_rgba(32,216,255,.18)]">
              <Image src="/images/profile-nikhil.jpg" alt="Nikhil Wabale" fill sizes="(max-width: 768px) 82vw, 370px" className="object-cover object-top" priority />
              <div className="status-chip absolute right-5 top-5 rounded-2xl border border-emerald-400/35 bg-[#06121f]/90 px-4 py-3 font-mono text-xs shadow-[0_0_24px_rgba(16,185,129,.20)]">
                <span className="text-slate-400">status</span><br/><span className="text-emerald-300">● Available</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="glass-card about-copy-card p-7">
              <p className="text-xl leading-9 text-slate-300">
                I am <strong className="text-white">Nikhil Wabale</strong>, a Pune-based Software Engineer who enjoys converting practical business requirements into usable digital products.
              </p>
              <p className="mt-5 text-xl leading-9 text-slate-300">
                My work style is hands-on and outcome-focused: understand the requirement clearly, build clean interfaces, connect reliable APIs, validate data properly and keep the full flow easy to use.
              </p>
              <p className="mt-5 text-xl leading-9 text-slate-300">
                I am currently available for software engineering opportunities and selected project work where I can contribute to real products, internal dashboards, business websites or API-driven systems.
              </p>
            </div>

            <div className="about-highlights-grid">
              {[
                'Pune, Maharashtra, India',
                'Immediate joiner',
                'Open to full-stack and .NET roles',
                'Available for selected project work'
              ].map((item) => (
                <div key={item} className="glass-card about-mini-highlight">
                  <CheckCircle2 size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
