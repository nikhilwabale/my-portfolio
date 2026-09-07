import {
  Award,
  BriefcaseBusiness,
  Code2,
  Database,
  GitBranch,
  Globe2,
  GraduationCap,
  Layers3,
  Rocket,
  Server,
  Smartphone,
  Trophy,
  Wrench
} from 'lucide-react';

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Education', href: '#education' },
  { label: 'Services', href: '#freelance' },
  { label: 'Contact', href: '#contact' }
];

export const aboutCards = [];

export const experience = [
  {
    role: 'Frontend Developer Intern',
    company: 'PathLogics Technologies',
    location: 'Pune District, Maharashtra, India · On-site',
    period: 'Nov 2023 – Apr 2024',
    badge: 'Internship',
    bullets: [
      'Built responsive web interfaces using HTML, CSS, JavaScript, Tailwind CSS, React and Next.js.',
      'Worked on reusable UI components, page layouts and end-to-end frontend flows for real project requirements.',
      'Improved practical understanding of modern frontend structure, responsive design and clean implementation.'
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'React', 'Next.js']
  },
  {
    role: 'Full Stack Developer',
    company: 'Technvil',
    location: 'Pune, Maharashtra, India',
    period: 'May 2024 – May 2026',
    badge: 'Professional',
    bullets: [
      'Developed production-ready full-stack applications for enterprise, automotive, and fleet management solutions.',
      'Built scalable REST APIs and backend services using Java, Spring Boot, Spring Data JPA, and role-based authentication.',
      'Developed responsive user interfaces using React.js and Next.js with reusable component architecture and seamless API integration.',
      'Worked with SQL Server, Hibernate, JWT Authentication, Flutter, Firebase, Google Maps, and deployment-ready practices.'
    ],
    stack: [
      'React.js',
      'Next.js',
      'Java',
      'Spring Boot',
      'Hibernate',
      'SQL Server',
      'Flutter',
      'AWS',
      'Azure',
      'CI/CD',
      'Generative AI'
    ]
  }
];

export const projects = [
  {
    title: 'Asset Management System',
    type: 'Full Stack Project',
    role: 'Full Stack Developer',
    period: 'Web Application',
    image: '/projects/asset-management-system.png',
    summary:
      'Role-based enterprise asset management platform for properties, tenants, maintenance workflows, documents and reports.',
    problem:
      'Property and asset operations needed a structured system to manage records, responsibilities, maintenance requests and business workflows in one place.',
    actions: [

      'Built responsive React.js interfaces for operational modules',
      'Developed secure Spring Boot REST APIs for business workflows',
      'Designed relational entities and database operations using Spring Data JPA and Hibernate',
    ],
    result:
      'Created a scalable full-stack foundation for enterprise asset tracking, workflow visibility and future cloud deployment.',
    stack: ['React.js', 'Java','Spring Boot', 'Spring Data JPA', 'Hibernate', 'SQL Server','REST API', 'JWT', 'RBAC','AWS']
  },
  {
    title: 'AMS App',
    type: 'Mobile App',
    role: 'Flutter Developer',
    period: 'Mobile Application',
    image: '/projects/ams-app.png',
    summary:
      'Flutter mobile application concept for tenant and maintenance operations with login, issue reporting and connected API flow.',
    problem:
      'Users needed a mobile-first way to raise issues, view assigned information and interact with asset management workflows quickly.',
    actions: [
      'Created Flutter screens for mobile-first workflows',
      'Connected mobile UI with backend API concepts',
      'Structured authentication, ticket submission and notification-ready flows'
    ],
    result:
      'Delivered a mobile companion foundation that supports faster reporting and smoother user interaction.',
    stack: ['Flutter', 'Android', 'REST API', 'JWT', 'Firebase', 'FCM']
  },
  {
    title: 'TechCart Website',
    type: 'Frontend Project',
    role: 'Next.js Developer',
    period: 'E-Commerce UI',
    image: '/projects/techcart-showcase.png',
    summary:
      'Modern product showcase website with listing, product details, cart flow, login screen, SEO metadata and responsive UI.',
    problem:
      'The application needed a clean, fast and maintainable product browsing experience that looked professional across devices.',
    actions: [
      'Built Next.js App Router pages and reusable components',
      'Implemented listing, detail, cart and login experiences',
      'Added SEO metadata, responsive layouts and polished UI interactions'
    ],
    result:
      'Delivered a recruiter-friendly frontend project with clean structure, fast UX and production-style presentation.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'SEO', 'Responsive UI']
  }
];

export const skillGroups = [
  { icon: Code2, title: 'Languages', skills: ['Java', 'TypeScript', 'JavaScript', 'SQL', 'Dart'] },
  {
    icon: Globe2,
    title: 'Frontend',
    skills: ['React.js', 'Next.js', 'Angular', 'Tailwind CSS', 'Redux Toolkit', 'HTML5', 'CSS3']
  },
  {
    icon: Server,
    title: 'Backend',
    skills: [
      'Spring Boot',
      'REST APIs',
      'Web API',
      'JWT Auth',
      'Middleware',
      'DI',
      'Rate Limiting'
    ]
  },
  {
    icon: Database,
    title: 'Database',
    skills: ['SQL Server', 'PostgreSQL', 'Oracle Database', 'EF Core', 'LINQ', 'Migrations']
  },
  { icon: Smartphone, title: 'Mobile', skills: ['Flutter', 'Android', 'iOS'] },
  {
    icon: Wrench,
    title: 'Tools & Platforms',
    skills: ['AWS', 'Azure', 'CI/CD', 'Git', 'GitHub', 'Postman', 'Swagger', 'Visual Studio', 'VS Code']
  }
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
  {
    icon: Trophy,
    title: 'Engineering Foundation',
    text: 'Strong academic base in Information Technology with project-based software development exposure.'
  },
  {
    icon: Award,
    title: 'Production Growth',
    text: 'Gained hands-on experience building production-ready applications by contributing to real-world business solutions, collaborating with teams, and delivering scalable software.'
  },
  {
    icon: GitBranch,
    title: 'Continuous Improvement',
    text: 'Committed to continuous learning by exploring modern technologies and building solutions that deliver long-term business value.'
  }
];

export const freelanceServices = [
  {
    icon: Globe2,
    title: 'Full Stack Web Application',
    text: 'End-to-end web applications with React or Next.js frontend, Spring Boot APIs, relational database and deployment-ready structure.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Application',
    text: 'Flutter mobile applications for business workflows, forms, dashboards and API-connected user experiences.'
  },
  {
    icon: Rocket,
    title: 'Business Website / Landing Page',
    text: 'Fast, SEO-friendly business websites and landing pages designed to present services clearly and convert visitors into leads.'
  },
  {
    icon: BriefcaseBusiness,
    title: 'Enterprise Dashboard',
    text: 'Admin panels, role-based screens, reports and internal dashboards that simplify business operations and data visibility.'
  }
];
