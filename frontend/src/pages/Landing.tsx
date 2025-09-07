import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Zap, Circle } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-900 dark:to-black">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl px-4 py-3 bg-zinc-900/80 text-zinc-100 backdrop-blur border border-white/10 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-zinc-800 flex items-center justify-center shadow-inner">
              <Circle className="h-4 w-4 text-red-500" />
            </div>
            <div className="font-semibold tracking-tight">Renewly</div>
          </div>
          <Link to="/auth/sign-in">
            <Button variant="default" className="rounded-full bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_24px_-8px_rgba(239,68,68,0.7)]">Get Started</Button>
          </Link>
        </div>

        {/* Hero */}
  <div className="mt-10 rounded-[28px] bg-zinc-900/95 text-zinc-100 p-6 md:p-10 border border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
          <div className="max-w-3xl">
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Your subscriptions in one place
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight"
            >
              See it.
              <br />
              Plan it.
              <br />
              Renew it.
            </motion.h1>

      <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#about">
        <Button size="lg" variant="default" className="rounded-full px-6 bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_24px_-8px_rgba(239,68,68,0.7)]">
                  About Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 p-4 bg-zinc-900/70">
                <div className="text-sm text-zinc-400">Quick Management</div>
                <div className="mt-2 font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-red-500" />Track Subscriptions Fast</div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 bg-zinc-900/70">
                <div className="text-sm text-zinc-400">Secure by default</div>
                <div className="mt-2 font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-red-500" /> Secured and Reliable</div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 bg-zinc-900/70">
                <div className="text-sm text-zinc-400">Modern </div>
                <div className="mt-2 font-semibold">Comfortable and Accessible </div>
              </div>
            </div>
          </div>

          {/* Accent card */}
          <div id="about" className="mt-10 rounded-[28px] border border-white/10 overflow-hidden bg-zinc-900/70">
            <div className="bg-red-600 h-40 md:h-56" />
            <div className="p-6">
              <div className="text-zinc-400 text-sm">Preview</div>
              <div className="mt-2 font-medium">Manage subscriptions, track spend, and stay on top of renewals.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
