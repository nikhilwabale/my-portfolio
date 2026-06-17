'use client';

import { motion } from 'framer-motion';
import { experience } from '@/data/content';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHeader kicker="Work Experience" title="Where I've" highlight="shipped." subtitle="Building software solutions across frontend interfaces, backend APIs, mobile workflows and business-ready application modules." />
        <div className="relative mx-auto max-w-5xl">
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="absolute left-4 top-0 hidden h-full w-px origin-top bg-cyan-400/50 md:left-1/2 md:block" />
          <div className="space-y-10">
            {experience.map((e, i) => (
              <motion.article key={e.role} initial={{ opacity: 0, x: i % 2 ? 60 : -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .55 }} className={`relative md:w-[48%] ${i % 2 ? 'md:ml-auto' : ''}`}>
                <span className="absolute -left-2 top-8 hidden h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_22px_var(--cyan)] md:block" />
                <div className="glass-card p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-2xl font-black">{e.role}</h3><span className="rounded-full border border-cyan-300/30 px-4 py-1 text-sm text-cyan-200">{e.period}</span></div>
                  <p className="mt-2 font-bold text-cyan-300">{e.company} <span className="text-slate-500">· {e.location}</span></p>
                  <ul className="mt-5 space-y-3 text-slate-300">{e.bullets.map((b) => <li key={b} className="flex gap-3"><span className="text-cyan-300">▸</span>{b}</li>)}</ul>
                  <div className="mt-6 flex flex-wrap gap-2">{e.stack.map((s) => <span className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-200" key={s}>{s}</span>)}</div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
