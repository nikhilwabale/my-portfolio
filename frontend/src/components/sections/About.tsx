'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { aboutCards } from '@/data/content';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MagneticCard } from '@/components/ui/MagneticCard';

export function About() {
  return (
    <section id="about" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader
          kicker="About Me"
          title="Built on"
          highlight="fundamentals."
          subtitle="A practical full-stack developer focused on clean UI, reliable APIs, database-driven workflows and real business outcomes."
        />
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-7">
            <div className="about-photo-card relative mx-auto h-[390px] max-w-[360px] overflow-hidden rounded-[28px] border border-cyan-300/35 bg-white/95 shadow-[0_0_55px_rgba(32,216,255,.18)]">
              <Image src="/images/profile-placeholder.svg" alt="Nikhil Wabale professional avatar" fill className="object-cover" priority />
              <div className="status-chip absolute bottom-5 right-5 rounded-2xl border border-emerald-400/30 bg-[#071221]/90 px-5 py-4 font-mono text-sm shadow-[0_0_24px_rgba(16,185,129,.18)]">
                <span className="text-slate-400">status</span><br/><span className="text-emerald-300">● Available</span>
              </div>
            </div>
            <blockquote className="about-quote border-l-2 border-cyan-400 pl-7 text-2xl font-black italic leading-snug">
              “I like building products where the UI feels clean, the API is reliable, and the database supports the workflow properly.”
            </blockquote>
          </motion.div>

          <div className="space-y-6">
            <div className="glass-card about-copy-card p-7">
              <p className="text-xl leading-9 text-slate-300">
                I am <strong className="text-white">Nikhil Wabale</strong>, a Pune-based Full Stack Developer with 2+ years of experience building production web and mobile applications using <strong className="text-cyan-300">React.js, Next.js, Angular, ASP.NET Core, C#, SQL Server, EF Core</strong> and Flutter.
              </p>
              <p className="mt-5 text-xl leading-9 text-slate-300">
                My work includes enterprise dashboards, API-driven modules, authentication flows, role-based screens, database-backed workflows and responsive interfaces. Along with full-time opportunities, I am also open to <strong className="text-purple-300">freelance websites, landing pages, mobile apps and full-stack web application projects</strong>.
              </p>
            </div>

            <div className="grid gap-4">
              {aboutCards.map((h) => (
                <MagneticCard key={h.title} className="about-feature-card p-6">
                  <div className="flex gap-5">
                    <h.icon className="shrink-0 text-cyan-300" />
                    <div>
                      <h3 className="text-xl font-black">{h.title}</h3>
                      <p className="mt-2 text-slate-400">{h.text}</p>
                    </div>
                  </div>
                </MagneticCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
