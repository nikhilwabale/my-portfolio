'use client';

import { motion } from 'framer-motion';
import { Award, GraduationCap, Trophy, Zap } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { achievements, education } from '@/data/content';

export function Education() {
  return (
    <section id="education" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader
          kicker="Education & Growth"
          title="Proof of"
          highlight="foundation."
          subtitle="My academic journey created the base for software engineering, full-stack development and production-ready project delivery."
        />

        <div className="education-timeline">
          {education.map((item, index) => (
            <motion.div
              key={item.title}
              className={`edu-item ${index % 2 === 0 ? 'edu-left' : 'edu-right'}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -44 : 44 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span className="edu-dot" />
              <div className="glass-card edu-card">
                <span className="period">{item.period}</span>
                <h3>{item.title}</h3>
                <p className="text-cyan-200 font-bold">{item.place}</p>
                <p className="edu-score">{item.score}</p>
                <p className="mt-3">{item.note}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {achievements.map((a, i) => {
            const Icon = i === 0 ? Trophy : i === 1 ? Zap : Award;
            return (
              <motion.div key={a.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card edu-summary-card p-6">
                <Icon className="mb-5 text-cyan-300" />
                <h3 className="text-2xl font-black">{a.title}</h3>
                <p className="mt-3 text-slate-400 leading-relaxed">{a.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
