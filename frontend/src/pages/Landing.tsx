import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Zap, Circle } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl px-4 py-3 bg-background/80 backdrop-blur border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center shadow">
              <Circle className="h-4 w-4 text-white" />
            </div>
            <div className="font-semibold tracking-tight">Renewly</div>
          </div>
          <Link to="/auth/sign-in">
            <Button variant="default" className="rounded-full bg-red-500 hover:bg-red-600 text-white">Get Started</Button>
          </Link>
        </div>

        {/* Hero */}
        <div className="mt-10 rounded-[28px] bg-background p-6 md:p-10 border">
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
                <Button size="lg" variant="default" className="rounded-full px-6 bg-red-500 hover:bg-red-600 text-white">
                  About Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Quick Management</div>
                <div className="mt-2 font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" />Track Subscriptions Fast</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Secure by default</div>
                <div className="mt-2 font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Secured and Reliable</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Modern </div>
                <div className="mt-2 font-semibold">Comfortable and Accessible </div>
              </div>
            </div>
          </div>

          {/* Accent card */}
          <div id="about" className="mt-10 rounded-[28px] border overflow-hidden">
            <div className="bg-red-600 h-40 md:h-56" />
            <div className="p-6">
              <div className="text-muted-foreground text-sm">Preview</div>
              <div className="mt-2 font-medium">Manage subscriptions, track spend, and stay on top of renewals.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
