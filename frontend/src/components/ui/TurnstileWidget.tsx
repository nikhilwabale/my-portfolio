'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (container: HTMLElement | string, options?: Record<string, unknown>) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  siteKey?: string;
  resetKey?: number;
  /** Bump this to trigger verification on demand (execution: 'execute' mode) - the widget
   *  renders but does nothing until this fires, so nothing verifies just from mounting. */
  executeKey?: number;
  onTokenChange: (token: string) => void;
  onError?: () => void;
};

const SCRIPT_ID = 'cloudflare-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.turnstile) return resolve();

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Turnstile script failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed to load.'));
    document.head.appendChild(script);
  });
}

export function TurnstileWidget({ siteKey, resetKey = 0, executeKey = 0, onTokenChange, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const verifiedRef = useRef(false);
  const tokenCallbackRef = useRef(onTokenChange);
  const errorCallbackRef = useRef(onError);
  // A submit click can arrive before the widget has finished rendering (script still
  // loading) - remember it and execute as soon as the widget becomes ready instead of
  // silently dropping it.
  const pendingExecuteRef = useRef(false);
  const lastExecutedKeyRef = useRef(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'verifying' | 'verified' | 'error'>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    tokenCallbackRef.current = onTokenChange;
    errorCallbackRef.current = onError;
  }, [onTokenChange, onError]);

  useEffect(() => {
    let cancelled = false;
    const cleanupWidget = () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may already be removed by Cloudflare.
        }
      }
      widgetIdRef.current = null;
    };

    async function renderWidget() {
      if (!siteKey) return;

      verifiedRef.current = false;
      pendingExecuteRef.current = false;
      setStatus('loading');
      tokenCallbackRef.current('');
      cleanupWidget();

      try {
        await loadTurnstileScript();

        if (cancelled || !containerRef.current || !window.turnstile) return;

        containerRef.current.innerHTML = '';
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'flexible',
          appearance: 'always',
          // Widget renders immediately but does not run the actual check until
          // window.turnstile.execute() is called explicitly - see the executeKey effect
          // below, triggered only by clicking Submit, not by mounting/becoming visible.
          execution: 'execute',
          retry: 'auto',
          'retry-interval': 1000,
          callback: (token: string) => {
            if (cancelled) return;
            verifiedRef.current = true;
            tokenCallbackRef.current(token);
            setStatus('verified');
          },
          'error-callback': () => {
            if (cancelled) return;
            tokenCallbackRef.current('');
            setStatus('error');
            errorCallbackRef.current?.();
          },
          'expired-callback': () => {
            if (cancelled) return;
            tokenCallbackRef.current('');
            setStatus('ready');
          },
          'timeout-callback': () => {
            if (cancelled) return;
            tokenCallbackRef.current('');
            setStatus('error');
            errorCallbackRef.current?.();
          }
        });

        setStatus('ready');

        // A submit click that arrived while the widget was still loading is honored now.
        if (pendingExecuteRef.current) {
          pendingExecuteRef.current = false;
          setStatus('verifying');
          window.turnstile.execute(widgetIdRef.current);
        }
      } catch {
        if (cancelled) return;
        setStatus('error');
        tokenCallbackRef.current('');
        errorCallbackRef.current?.();
      }
    }

    renderWidget();

    return () => {
      cancelled = true;
      cleanupWidget();
    };
    // reloadKey intentionally re-renders Turnstile when the user clicks retry.
  }, [siteKey, resetKey, reloadKey]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // Deferred so the effect body itself has no synchronous setState call
        // (react-hooks/set-state-in-effect) - same recovery, just scheduled
        // a tick later instead of cascading within this render pass.
        queueMicrotask(() => setReloadKey((value) => value + 1));
      }
      verifiedRef.current = false;
      pendingExecuteRef.current = false;
      tokenCallbackRef.current('');
      setStatus('ready');
    }
  }, [resetKey]);

  // Runs the actual check on demand - executeKey is bumped exactly once per submit click,
  // never on mount (it starts at 0 and this effect skips key 0), so nothing verifies just
  // from the widget rendering or the Contact section scrolling into view.
  useEffect(() => {
    if (executeKey <= 0 || executeKey === lastExecutedKeyRef.current) return;
    lastExecutedKeyRef.current = executeKey;

    if (!window.turnstile) return;

    if (widgetIdRef.current && (status === 'ready' || status === 'error')) {
      setStatus('verifying');
      window.turnstile.execute(widgetIdRef.current);
    } else if (!widgetIdRef.current) {
      // Widget is still loading - honored by renderWidget() above once it's ready.
      pendingExecuteRef.current = true;
    }
  }, [executeKey, status]);

  if (!siteKey) {
    return (
      <div className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
        Security verification is not configured. Please set NEXT_PUBLIC_TURNSTILE_SITE_KEY.
      </div>
    );
  }

  return (
    <div className="turnstile-shell mt-5 space-y-3" aria-label="Security verification">
      <div className="turnstile-inner">
        <div ref={containerRef} key={`${resetKey}-${reloadKey}`} className="turnstile-container min-h-17.5" />
      </div>
      {status === 'loading' && (
        <p className="text-xs font-semibold text-slate-400">Loading security verification...</p>
      )}
      {status === 'ready' && (
        <p className="text-xs font-semibold text-slate-400">Verification runs automatically when you submit.</p>
      )}
      {status === 'verifying' && (
        <p className="text-xs font-semibold text-slate-400">Verifying...</p>
      )}
      {status === 'error' && (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100">
          <p>Security verification could not load. Please retry or refresh the page.</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-2 rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-300/10"
          >
            Retry verification
          </button>
        </div>
      )}
    </div>
  );
}
