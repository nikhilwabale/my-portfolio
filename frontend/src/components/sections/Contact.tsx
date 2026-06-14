'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Github, Linkedin, Loader2, Mail, MapPin, Phone, Send, Twitter } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { site } from '@/lib/site';
import { submitContact } from '@/lib/api';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Turnstile } from '@/components/ui/Turnstile';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(255),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters.').max(200),
  inquiryType: z.enum(['job', 'freelance', 'project', 'other']),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(2000),
  companyFaxNumber: z.string().max(0).optional()
});

type FormData = z.infer<typeof schema>;

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const onVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const onExpire = useCallback(() => setTurnstileToken(''), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { inquiryType: 'job', companyFaxNumber: '' }
  });

  async function onSubmit(data: FormData) {
    setStatus('idle');
    setStatusMessage('');

    if (turnstileSiteKey && !turnstileToken) {
      setStatus('error');
      setStatusMessage('Please complete the security check before sending.');
      return;
    }

    try {
      const response = await submitContact({ ...data, turnstileToken });
      setStatus('success');
      setStatusMessage(response.emailNotificationSent === false ? 'Message saved successfully. Email notification is temporarily unavailable, but your inquiry is safely recorded.' : response.message);
      reset();
      setTurnstileToken('');
      setTimeout(() => setStatus('idle'), 6000);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unable to send message. Please try again.');
    }
  }

  return (
    <section id="contact" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader kicker="Get In Touch" title="Let's" highlight="talk." subtitle="Have a job opportunity, freelance project, or portfolio feedback? Send me a message." />
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <motion.div initial={{ opacity: 0, x: -36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <Info icon={<Mail />} label="Email" value={site.email} />
            <Info icon={<Phone />} label="Phone" value={site.phone} />
            <Info icon={<MapPin />} label="Location" value={site.location} />
            <div className="flex gap-3 pt-4">
              <a className="glass-card p-4" href={site.socials.github} aria-label="GitHub profile" target="_blank" rel="noreferrer"><Github /></a>
              <a className="glass-card p-4" href={site.socials.linkedin} aria-label="LinkedIn profile" target="_blank" rel="noreferrer"><Linkedin /></a>
              <a className="glass-card p-4" href={site.socials.x} aria-label="X profile" target="_blank" rel="noreferrer"><Twitter /></a>
            </div>
            <div className="glass-card border-emerald-400/25 p-5 text-emerald-300">● Currently available for Full Stack roles and freelance projects.</div>
          </motion.div>

          <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0, x: 36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-7" noValidate>
            <input {...register('companyFaxNumber')} tabIndex={-1} autoComplete="off" className="pointer-events-none absolute -left-[10000px] h-0 w-0 opacity-0" aria-hidden="true" />

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Your Name" error={errors.name?.message}><input {...register('name')} placeholder="Nikhil Wabale" autoComplete="name" /></Field>
              <Field label="Your Email" error={errors.email?.message}><input {...register('email')} placeholder="you@example.com" autoComplete="email" /></Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Inquiry Type" error={errors.inquiryType?.message}>
                <select {...register('inquiryType')}>
                  <option value="job">Job Opportunity</option>
                  <option value="freelance">Freelance Project</option>
                  <option value="project">Project Discussion</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Subject" error={errors.subject?.message}><input {...register('subject')} placeholder="Project / Job Opportunity" /></Field>
            </div>

            <Field label="Message" error={errors.message?.message}><textarea {...register('message')} rows={7} placeholder="Tell me about your requirement..." /></Field>

            <Turnstile siteKey={turnstileSiteKey} onVerify={onVerify} onExpire={onExpire} theme="auto" />

            <button disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-4 font-black text-white transition hover:-translate-y-1 disabled:opacity-70">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />} {isSubmitting ? 'Sending securely...' : 'Send Message'}
            </button>

            {status !== 'idle' && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-xl border p-4 ${status === 'success' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-red-400/25 bg-red-400/10 text-red-200'}`}>
                {statusMessage}
              </motion.p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-4"><div className="rounded-xl border border-cyan-300/30 p-3 text-cyan-300">{icon}</div><div><p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p><p className="font-bold text-slate-200">{value}</p></div></div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement }) {
  return <label className="mt-5 block"><span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">{label}</span><div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/15 [&_input]:bg-white/5 [&_input]:px-4 [&_input]:py-3 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/15 [&_select]:bg-white/5 [&_select]:px-4 [&_select]:py-3 [&_select]:text-slate-100 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/15 [&_textarea]:bg-white/5 [&_textarea]:px-4 [&_textarea]:py-3">{children}</div>{error && <span className="mt-1 block text-sm text-red-300">{error}
  </span>}</label>;
}
