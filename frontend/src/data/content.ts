import { Award, Code2, Database, GitBranch, Globe2, GraduationCap, Layers3, Monitor, Rocket, Server, Smartphone, Trophy, Wrench } from 'lucide-react';

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Education', href: '#education' },
  { label: 'Freelance', href: '#freelance' },
  { label: 'Contact', href: '#contact' }
];

export const aboutCards = [
  {
    icon: Layers3,
    title: 'Full-stack mindset',
    text: 'I connect UI, APIs, database design and deployment readiness so the complete product flow works cleanly.'
  },
  {
    icon: Rocket,
    title: 'Business-focused delivery',
    text: 'I care about measurable outcomes such as faster workflows, reusable components, clean screens and maintainable code.'
  },
  {
    icon: Code2,
    title: 'Production-ready approach',
    text: 'I follow component structure, API contracts, validation, security basics, responsive design and performance-first development.'
  }
];

export const experience = [
  {
    role: 'Frontend Developer Intern',
    company: 'PathLogics Technologies',
    location: 'Pune District, Maharashtra, India · On-site',
    period: 'Nov 2023 – Apr 2024',
    badge: 'Internship',
    bullets: [
      'Worked on web interfaces using HTML, CSS, JavaScript, Tailwind CSS, React and Next.js.',
      'Gained hands-on experience building responsive websites, reusable components and end-to-end UI flows.',
      'Collaborated on frontend development tasks and improved practical understanding of modern web project structure.'
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'React', 'Next.js']
  },
  {
    role: 'Software Engineer / Full Stack Developer',
    company: 'Technvil',
    location: 'Pune, Maharashtra, India',
    period: 'May 2024 – May 2026',
    badge: 'Professional',
    bullets: [
      'Built scalable full-stack modules across Fleet Management, Automotive Diagnostics and PLMS-style enterprise workflows.',
      'Developed ASP.NET Core REST APIs for trips, vehicles, drivers, routes, documents and role-based access control.',
      'Created reusable React, Next.js and Angular UI components and optimized rendering for smoother user experiences.',
      'Worked with SQL Server, EF Core, LINQ, JWT Authentication, Flutter, Firebase, Google Maps, Azure and CI/CD practices.'
    ],
    stack: ['React.js', 'Next.js', 'Angular', 'ASP.NET Core', 'C#', 'SQL Server', 'EF Core', 'Flutter', 'Azure', 'CI/CD']
  },
  {
    role: 'Freelance / Portfolio Project Developer',
    company: 'Independent Projects',
    location: 'Remote / Pune',
    period: '2025 – Present',
    badge: 'Freelance',
    bullets: [
      'Built responsive Next.js and React applications with SEO, SSR/SSG concepts and reusable UI patterns.',
      'Created client-ready interfaces for product showcases, landing pages, business websites and portfolio systems.',
      'Focused on performance, clean design, accessibility, maintainable folder structure and smooth Framer Motion interactions.'
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'SEO', 'Responsive UI']
  }
];

export const projects = [
  {
    title: 'Asset Management System',
    type: 'Full Stack Project',
    role: 'Full Stack Developer',
    period: 'SaaS-style Platform',
    summary: 'Enterprise asset management platform for properties, buildings, rooms, assets, tenants, documents, maintenance tickets and role-based operations.',
    problem: 'Asset and property operations required a centralized platform to manage tenants, rooms, assets, tickets, documents and owner-level workflows.',
    actions: ['Designed role-based screens for Root Admin, Owner, Asset Manager and Tenant', 'Built ASP.NET Core APIs with SQL Server and EF Core data models', 'Planned cloud-ready services including Azure, Blob storage, SignalR, Redis and Firebase notifications'],
    result: 'Created a scalable SaaS-style architecture suitable for organized asset operations, maintenance tracking and future cloud deployment.',
    stack: ['React.js', 'ASP.NET Core', 'SQL Server', 'EF Core', 'Azure', 'Redis', 'SignalR', 'Firebase']
  },
  {
    title: 'AMS App',
    type: 'Mobile + Cloud Project',
    role: 'Mobile / Full Stack Developer',
    period: 'Tenant & Asset Workflow App',
    summary: 'Mobile application experience for tenant-side asset workflows, issue reporting, notifications, document access and service communication.',
    problem: 'Tenants and asset users needed a mobile-first way to report issues, track service requests and access important asset/property information.',
    actions: ['Built Flutter mobile screens for tenant workflows and issue ticket flows', 'Integrated API-driven data flow with the AMS backend architecture', 'Prepared cloud-enabled notifications and storage flow using Firebase and Azure-ready services'],
    result: 'Improved accessibility for users by extending AMS workflows from web dashboard to mobile application experience.',
    stack: ['Flutter', 'Dart', 'ASP.NET Core API', 'Firebase', 'Azure', 'SQL Server', 'REST API']
  },
  {
    title: 'TechCart Product Showcase',
    type: 'Assignment Project',
    role: 'Next.js Developer',
    period: 'Product Showcase',
    summary: 'Mini e-commerce product showcase with product listing, product details, cart experience, login flow, SEO metadata and responsive UI.',
    problem: 'The task required a clean, maintainable and SEO-friendly product experience using static product and user data.',
    actions: ['Built Next.js App Router pages and reusable components', 'Implemented product listing, details, cart, login and responsive layouts', 'Added SEO metadata, structured content and optimized frontend flow'],
    result: 'Delivered a polished task-ready frontend with reusable architecture and recruiter-friendly project presentation.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React', 'SEO', 'Responsive UI']
  }
];

export const skillGroups = [
  { icon: Code2, title: 'Languages', skills: ['C#', 'TypeScript', 'JavaScript', 'SQL', 'Dart'] },
  { icon: Globe2, title: 'Frontend', skills: ['React.js', 'Next.js', 'Angular', 'Tailwind CSS', 'Redux Toolkit', 'HTML5', 'CSS3'] },
  { icon: Server, title: 'Backend', skills: ['ASP.NET Core', 'REST APIs', 'Web API', 'JWT Auth', 'Middleware', 'DI', 'Rate Limiting'] },
  { icon: Database, title: 'Database', skills: ['SQL Server', 'EF Core', 'LINQ', 'Stored Procedures', 'Migrations'] },
  { icon: Smartphone, title: 'Mobile', skills: ['Flutter', 'Firebase', 'Google Maps', 'FCM', 'Android'] },
  { icon: Wrench, title: 'Cloud & Tools', skills: ['Azure', 'CI/CD', 'Git', 'GitHub', 'Postman', 'Swagger', 'Visual Studio', 'VS Code'] }
];

export const education = [
  {
    icon: GraduationCap,
    title: 'Bachelor of Engineering in Information Technology',
    place: 'Sinhgad College of Engineering, Pune',
    period: 'Engineering',
    score: 'CGPA: 8.48',
    note: 'Built a strong foundation in programming, database concepts, software engineering, web development and project-based problem solving.'
  },
  {
    icon: GraduationCap,
    title: 'Higher Secondary Certificate (HSC)',
    place: 'Hutatma Rajguru Mahavidyalaya',
    period: 'HSC',
    score: 'Percentage: 72.15%',
    note: 'Developed analytical thinking, mathematics fundamentals and disciplined academic habits before entering engineering.'
  },
  {
    icon: GraduationCap,
    title: 'Secondary School Certificate (SSC)',
    place: 'Shridharrao Wabale Patil Vidhyalay, Retwadi',
    period: 'SSC',
    score: 'Percentage: 80%',
    note: 'Established a strong academic base with consistent performance, curiosity and interest in technology-driven learning.'
  }
];

export const achievements = [
  { icon: Trophy, title: 'Engineering Foundation', text: 'Completed Information Technology engineering with strong academics and project-based software development exposure.' },
  { icon: Award, title: 'Production Growth', text: 'Moved from internship fundamentals to production full-stack modules using React, Next.js, Angular, ASP.NET Core and SQL Server.' },
  { icon: GitBranch, title: 'Continuous Improvement', text: 'Actively improves cloud, CI/CD, clean architecture, frontend performance and secure API development practices.' }
];

export const freelanceServices = [
  { icon: Globe2, title: 'Full Stack Web Application', text: 'End-to-end web applications with React or Next.js frontend, ASP.NET Core APIs, SQL Server database and deployment-ready structure.' },
  { icon: Smartphone, title: 'Mobile Application', text: 'Flutter mobile applications for business workflows, dashboards, forms, notifications and API-connected experiences.' },
  { icon: Monitor, title: 'Desktop Application', text: 'Clean desktop application interfaces and workflow tools for business operations, data entry and internal process management.' },
  { icon: Rocket, title: 'Business Website / Landing Page', text: 'Fast, SEO-friendly business websites and landing pages designed to present services clearly and convert visitors into leads.' }
];
