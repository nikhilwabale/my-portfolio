'use client';

import { motion } from 'framer-motion';
import { Brain, Cloud, Code2, Database, Globe2, Server, Smartphone, Wrench } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

const groups = [
  {
    icon: Globe2,
    title: 'Frontend Engineering',
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
    items: [
      { name: 'Java / Spring Boot', level: 88 },
      { name: 'C# / ASP.NET Core', level: 86 },
      { name: 'REST APIs', level: 90 },
      { name: 'Spring Security / JWT', level: 82 }
    ],
    tags: [
      'Spring Data JPA',
      'Hibernate',
      'RBAC',
      'Swagger / OpenAPI',
      'Dependency Injection',
      'Rate Limiting'
    ]
  },
  {
    icon: Database,
    title: 'Database Layer',
    items: [
      { name: 'SQL Server', level: 86 },
      { name: 'PostgreSQL', level: 74 },
      { name: 'Oracle Database', level: 62 },
      { name: 'Vector Database', level: 82 }
    ],
    tags: ['Embeddings', 'Vector Search', 'Semantic Search', 'Query Optimization']
  },

  {
    icon: Cloud,
    title: 'Cloud & DevOps',
    items: [
      { name: 'Docker', level: 80 },
      { name: 'Azure', level: 74 },
      { name: 'Kubernetes', level: 68 },
      { name: 'CI/CD', level: 72 }
    ],
    tags: ['Docker Compose', 'GitHub Actions', 'Cloud Deployment', 'Containerization']
  },
  {
    icon: Brain,
    title: 'Generative AI',
    items: [
      { name: 'OpenAI / Azure OpenAI', level: 88 },
      { name: 'LangChain / RAG', level: 84 },
      { name: 'Prompt Engineering', level: 90 },
      { name: 'AI Agents', level: 80 }
    ],
    tags: ['Function Calling', 'Vector Search', 'Embeddings', 'LLM Integration']
  },

  {
    icon: Smartphone,
    title: 'Mobile Development',
    items: [
      { name: 'Flutter', level: 80 },
      { name: 'Android', level: 72 },
      { name: 'iOS', level: 58 },
      { name: 'REST API Integration', level: 82 }
    ],

    tags: ['FCM', 'Responsive UI', 'Offline Sync', 'State Management']
  },
  {
    icon: Wrench,
    title: 'Tools & Delivery',
    items: [
      { name: 'Git / GitHub', level: 86 },
      { name: 'Postman / Swagger', level: 86 },
      { name: 'Visual Studio', level: 88 },
      { name: 'IntelliJ IDEA', level: 90 }
    ],
    tags: ['VS Code', 'Maven', 'Agile Scrum', 'Git']
  },
  {
    icon: Code2,
    title: 'Product Delivery',
    items: [
      { name: 'Landing Pages', level: 88 },
      { name: 'Admin Dashboards', level: 84 },
      { name: 'Contact Forms', level: 80 },
      { name: 'API Integration', level: 86 }
    ],
    tags: ['Portfolio Sites', 'Business Websites', 'Validation', 'Deployment Ready']
  }
];

export function Skills() {
  return (
    <section id="skills" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader
          kicker="Tech Stack"
          title="Skills with"
          highlight="depth."
          subtitle="A focused stack for building responsive interfaces, secure APIs, relational databases and deployment-ready business applications."
        />
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
                  <div className="skill-icon">
                    <group.icon size={22} />
                  </div>
                  <h3 className="font-mono text-base font-black uppercase tracking-[.18em] text-slate-300">
                    {group.title}
                  </h3>
                </div>
              </div>
              <div className="skill-progress-list">
                {group.items.map((skill, idx) => (
                  <div key={skill.name}>
                    <div className="skill-row-top">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
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
              <div className="skill-tags">
                {group.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
