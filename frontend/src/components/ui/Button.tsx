import { AnchorHTMLAttributes, ReactNode } from 'react';

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-linear-to-r from-cyan-400 to-blue-600 text-white shadow-[0_0_32px_rgba(32,216,255,.24)] hover:shadow-[0_0_46px_rgba(32,216,255,.38)]',
    secondary: 'bg-white/5 border border-white/16 text-white hover:border-cyan-300/60 hover:bg-white/10',
    ghost: 'border border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10'
  };
  return <a className={`focus-ring inline-flex items-center justify-center gap-3 rounded-2xl px-7 py-4 font-extrabold transition duration-300 hover:-translate-y-1 ${variants[variant]} ${className}`} {...props}>{children}</a>;
}
