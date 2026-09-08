'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Mail, MapPin, Phone, Send, ShieldCheck, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { site } from '@/lib/site';
import { sendContactMessage } from '@/lib/api';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TurnstileWidget } from '@/components/ui/TurnstileWidget';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter at least 2 characters.').max(100, 'Name is too long.'),
  email: z.string().trim().email('Please enter a valid email address.').max(255, 'Email is too long.'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters.').max(180, 'Subject is too long.'),
  inquiryType: z.string().min(1, 'Please select inquiry type.'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(2000, 'Message is too long.'),
  website: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const turnstileEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true';
const siteKey = turnstileEnabled ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY : undefined;
const defaultValues: FormData = {
  name: '',
  email: '',
  subject: '',
  inquiryType: '',
  message: '',
  website: ''
};

export function Contact() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  // Single source of truth for "is a submit attempt in flight" - covers the API call, so the
  // button/toast never disagree about whether something is happening.
  const [busy, setBusy] = useState(false);
  // Keeps the submit button disabled for a short window right after a successful send, so an
  // eager double-click can't immediately kick off a second submit. Separate from `busy` since
  // it only follows success, not errors - a failed attempt should stay retryable right away.
  const [justSucceeded, setJustSucceeded] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // The 3s "Message Sent" cooldown also gates when Turnstile resets back to a fresh unchecked
  // state, so the widget keeps showing "Success!" alongside the sent message instead of
  // instantly flipping back to unverified the moment the request completes.
  useEffect(() => {
    if (!justSucceeded) return;
    const timer = window.setTimeout(() => {
      setJustSucceeded(false);
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [justSucceeded]);

  const performSubmit = useCallback(async (data: FormData, token: string) => {
    try {
      await sendContactMessage({
        ...data,
        turnstileToken: token,
        website: ''
      });
      reset(defaultValues);
      setToast({ type: 'success', message: 'Message submitted successfully. I will get back to you soon.' });
      setJustSucceeded(true);
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to submit your message right now. Please try again later.' });
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }, [reset]);

  // Turnstile is the widget's own checkbox (standard Managed mode) - a token can arrive at any
  // time in response to the visitor's own click, independent of submitting. It only marks the
  // form as verified; it never submits on its own.
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  function onSubmit(data: FormData) {
    setToast(null);

    if (siteKey && !turnstileToken) {
      setToast({ type: 'error', message: 'Please complete the security verification before submitting.' });
      return;
    }

    setBusy(true);
    void performSubmit(data, turnstileToken);
  }

  function handleTurnstileError() {
    setToast({ type: 'error', message: 'Security verification failed. Please try again.' });
  }

  return (
    <section id="contact" className="section border-t border-cyan-400/20">
      <div className="container">
        <SectionHeader kicker="Get In Touch" title="Let's" highlight="talk." subtitle="Have a job opportunity, project requirement or collaboration idea? Send a message and I will respond personally." />
        <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <motion.div initial={{ opacity: 0, x: -36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <Info icon={<Mail/>} label="Email" value={site.email}/>
            <Info icon={<Phone/>} label="Phone" value={site.phone}/>
            <Info icon={<MapPin/>} label="Location" value={site.location}/>
            <div className="glass-card border-cyan-400/25 p-5">
              <div className="mb-3 flex items-center gap-3 text-cyan-200"><ShieldCheck size={20}/><span className="text-sm font-black uppercase tracking-widest">Secure contact flow</span></div>
              <p className="text-sm leading-7 text-slate-300">Use this form for job opportunities, project discussions or collaboration requests. Your message is reviewed personally and handled with care.</p>
            </div>
          </motion.div>

          <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0, x: 36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card contact-form-card p-7">
            <input tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register('website')} />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Your Name" error={errors.name?.message}><input {...register('name')} placeholder="Your name" /></Field>
              <Field label="Your Email" error={errors.email?.message}><input type="email" autoComplete="email" {...register('email')} placeholder="you@example.com" /></Field>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Inquiry Type" error={errors.inquiryType?.message}>
                <select {...register('inquiryType')}>
                  <option value="" disabled>Select inquiry type</option>
                  <option value="Job Opportunity">Job Opportunity</option>
                  <option value="Full Stack Web Application">Full Stack Web Application</option>
                  <option value="Business Website / Landing Page">Business Website / Landing Page</option>
                  <option value="Admin Dashboard">Admin Dashboard</option>
                  <option value="Mobile Application">Mobile Application</option>
                  <option value="API Integration">API Integration</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Subject" error={errors.subject?.message}><input {...register('subject')} placeholder="How can I help?" /></Field>
            </div>
            <Field label="Message" error={errors.message?.message}><textarea {...register('message')} rows={7} placeholder="Briefly describe the role, project requirement, timeline or collaboration idea..." /></Field>
            {turnstileEnabled && (
              <TurnstileWidget siteKey={siteKey} resetKey={turnstileResetKey} onTokenChange={handleToken} onError={handleTurnstileError} />
            )}
            <button type="submit" disabled={busy || justSucceeded || Boolean(siteKey && !turnstileToken)} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-linear-to-r from-cyan-400 to-blue-600 px-6 py-4 font-black text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70">
              {busy ? <Loader2 className="animate-spin"/> : justSucceeded ? <Check size={18}/> : <Send size={18}/>}
              {busy ? 'Sending message...' : justSucceeded ? 'Message Sent' : siteKey && !turnstileToken ? 'Complete Verification' : 'Submit Inquiry'}
            </button>
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  role="status"
                  className={`mt-4 flex items-start justify-between gap-4 rounded-xl border p-4 text-sm ${toast.type === 'success' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-red-400/25 bg-red-400/10 text-red-200'}`}
                >
                  <span>{toast.message}</span>
                  <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)} className="rounded-md p-1 opacity-80 transition hover:bg-white/10 hover:opacity-100">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
  return <label className="mt-5 block"><span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">{label}</span><div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/15 [&_input]:bg-white/5 [&_input]:px-4 [&_input]:py-3 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/15 [&_select]:bg-white/5 [&_select]:px-4 [&_select]:py-3 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/15 [&_textarea]:bg-white/5 [&_textarea]:px-4 [&_textarea]:py-3">{children}</div>{error && <span className="mt-1 block text-sm text-red-300">{error}</span>}</label>;
}
