'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Github, Lightbulb, Rocket } from 'lucide-react';
import { projects } from '@/data/content';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { site } from '@/lib/site';

const caseIcons = {
  Problem: Lightbulb,
  Actions: Rocket,
  Result: CheckCircle2
};

export function Projects() {
  return (
    <section id="projects" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader kicker="Featured Projects" title="Things I've" highlight="built." subtitle="Three focused portfolio projects presented as problem, action and result — so the value is clear, not just the tech stack." />
        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.article key={p.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }} whileHover={{ y: -10, rotateX: 2, rotateY: -2 }} className="glass-card project-card-pro p-6 [transform-style:preserve-3d]">
              <div className="mb-5 flex flex-wrap gap-2"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-200">★ Featured</span><span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-200">{p.type}</span></div>
              <h3 className="text-2xl font-black">{p.title}</h3>
              <p className="mt-1 text-sm font-bold text-cyan-300">{p.role} · {p.period}</p>
              <p className="mt-5 text-slate-300">{p.summary}</p>
              <div className="project-case-grid mt-6">
                <Case label="Problem" text={p.problem} tone="problem" />
                <Case label="Actions" text={p.actions.join(' • ')} tone="actions" />
                <Case label="Result" text={p.result} tone="result" />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">{p.stack.map((s) => <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-200" key={s}>{s}</span>)}</div>
            </motion.article>
          ))}
        </div>
        <div className="mt-16 text-center"><Button href={site.socials.github}><Github /> View More on GitHub</Button></div>
      </div>
    </section>
  );
}

function Case({ label, text, tone }: { label: keyof typeof caseIcons; text: string; tone: 'problem' | 'actions' | 'result' }) {
  const Icon = caseIcons[label];
  return (
    <div className={`project-case ${tone}`}>
      <div className="case-head"><Icon size={16} /><span>{label}</span></div>
      <p>{text}</p>
    </div>
  );
}
