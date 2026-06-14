'use client';

import { motion } from 'framer-motion';
import { freelanceServices } from '@/data/content';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

export function Freelance() {
  return (
    <section id="freelance" className="section">
      <div className="container">
        <SectionHeader kicker="Freelance" title="Available for" highlight="projects." subtitle="Along with job opportunities, I am open to freelance work for web apps, mobile apps, desktop workflows and conversion-focused business websites." />
        <div className="freelance-grid grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {freelanceServices.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*.06 }} whileHover={{ y: -8 }} className="glass-card freelance-card-pro min-h-[260px] p-7">
                <div className="freelance-card-top"><span>0{i+1}</span><Icon size={24} /></div>
                <h3 className="mt-10 text-2xl font-black">{s.title}</h3>
                <p className="mt-4 text-slate-400 leading-relaxed">{s.text}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-12 text-center"><Button href="#contact">Start a Project</Button></div>
      </div>
    </section>
  );
}
