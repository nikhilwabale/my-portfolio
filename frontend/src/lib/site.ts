export const site = {
  name: 'Nikhil Wabale',
  role: 'Full Stack Developer',
  location: 'Pune, Maharashtra, India',
  email: 'wablenikhil2000@gmail.com',
  phone: '+91 84599•••••',
  resume: '/resume/Nikhil-Wabale-Full-Stack-Developer-Resume.pdf',
  socials: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/nikhilwabale',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/in/nikhil-wabale-401678229',
    x: process.env.NEXT_PUBLIC_X_URL || ''
  },
  seo: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nikhilwabale.dev',
    title: 'Nikhil Wabale | Full Stack Developer | React, Next.js, ASP.NET Core',
    description: 'Portfolio of Nikhil Wabale, a Pune-based Full Stack Developer and freelance web developer building scalable React, Next.js, Angular, ASP.NET Core and SQL Server applications.',
    image: '/og.png'
  }
};
