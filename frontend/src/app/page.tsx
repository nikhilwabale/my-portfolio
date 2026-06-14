import { PageShell } from '@/components/layout/PageShell';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { Education } from '@/components/sections/Education';
import { Experience } from '@/components/sections/Experience';
import { Freelance } from '@/components/sections/Freelance';
import { Hero } from '@/components/sections/Hero';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';

export default function Home() {
  return <PageShell><main><Hero /><About /><Experience /><Projects /><Skills /><Education /><Freelance /><Contact /></main></PageShell>;
}
