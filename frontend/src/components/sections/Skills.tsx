'use client';

import { motion } from 'framer-motion';
import { Code2, Database, Globe2, Server, Smartphone, Wrench } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

const groups = [
  {
    icon: Globe2,
    title: 'Frontend Engineering',
    accent: 'cyan',
    items: [
      { name: 'React.js', level: 90 },
      { name: 'Next.js', level: 86 },
      { name: 'Angular', level: 78 },
      { name: 'TypeScript', level: 84 }
    ],
    tags: ['Tailwind CSS', 'Redux Toolkit', 'Responsive UI', 'Framer Motion']
  },
  {
    icon: Server,
    title: 'Backend & APIs',
    accent: 'purple',
    items: [
      { name: 'ASP.NET Core', level: 88 },
      { name: 'C#', level: 86 },
      { name: 'REST APIs', level: 90 },
      { name: 'JWT / RBAC', level: 82 }
    ],
    tags: ['Web API', 'Middleware', 'DI', 'Rate Limiting']
  },
  {
    icon: Database,
    title: 'Database Layer',
    accent: 'cyan',
    items: [
      { name: 'SQL Server', level: 86 },
      { name: 'Entity Framework Core', level: 82 },
      { name: 'LINQ', level: 84 },
      { name: 'Stored Procedures', level: 74 }
    ],
    tags: ['Migrations', 'Query Optimization', 'Relational Design']
  },
  {
    icon: Smartphone,
    title: 'Mobile & Integrations',
    accent: 'green',
    items: [
      { name: 'Flutter', level: 72 },
      { name: 'Firebase', level: 70 },
      { name: 'Google Maps', level: 68 },
      { name: 'FCM', level: 65 }
    ],
    tags: ['Android', 'Push Notifications', 'Maps SDK']
  },
  {
    icon: Wrench,
    title: 'Tools & Delivery',
    accent: 'purple',
    items: [
      { name: 'Git / GitHub', level: 86 },
      { name: 'Postman / Swagger', level: 86 },
      { name: 'Visual Studio', level: 88 },
      { name: 'Azure Basics', level: 62 }
    ],
    tags: ['VS Code', 'Agile Scrum', 'CI/CD Basics']
  },
  {
    icon: Code2,
    title: 'Freelance Stack',
    accent: 'cyan',
    items: [
      { name: 'Landing Pages', level: 88 },
      { name: 'SEO Setup', level: 82 },
      { name: 'Contact Forms', level: 80 },
      { name: 'Business Websites', level: 84 }
    ],
    tags: ['Portfolio Sites', 'Admin Dashboards', 'API Integration']
  }
];

export function Skills() {
  return (
    <section id="skills" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader kicker="Tech Stack" title="Skills with" highlight="depth." subtitle="Not just a list of tools — this shows where I am strongest and how I use each stack in real projects." />
        <div className="skill-progress-grid">
          {groups.map((group, i) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.22 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="glass-card skill-progress-card"
            >
              <div className="skill-head">
                <div className="skill-head-left">
                  <div className="skill-icon"><group.icon size={22} /></div>
                  <h3 className="font-mono text-base font-black uppercase tracking-[.18em] text-slate-300">{group.title}</h3>
                </div>
              </div>
              <div className="skill-progress-list">
                {group.items.map((skill, idx) => (
                  <div key={skill.name}>
                    <div className="skill-row-top"><span>{skill.name}</span><span>{skill.level}%</span></div>
                    <div className="skill-track">
                      <motion.div
                        className="skill-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: idx * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="skill-tags">{group.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
