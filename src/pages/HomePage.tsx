import { Link, Navigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Backpack, Box, Gem, Pickaxe, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { playClick, playHover } from '@/lib/sound';

const FEATURES = [
  {
    icon: Gem,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
    title: 'Ask anything',
    description: 'Type any STEM concept and get a clear, beginner-friendly explanation in seconds.',
  },
  {
    icon: Pickaxe,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-50',
    title: 'Built for beginners',
    description:
      'No jargon dumps — explanations use simple language and relatable, Minecraft-flavored analogies.',
  },
  {
    icon: Backpack,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    title: 'Track your progress',
    description: 'Every concept you explore is saved to your dashboard so you can revisit it anytime.',
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    title: 'Your data, private',
    description: 'Your account and history are yours alone — secured per-user, never shared.',
  },
];

const FLOATING_ICONS = [
  { icon: Gem, className: 'left-[8%] top-[12%] h-7 w-7 text-sky-300', duration: 5.5, delay: 0 },
  { icon: Pickaxe, className: 'right-[10%] top-[18%] h-8 w-8 text-amber-300', duration: 6.5, delay: 0.5 },
  { icon: Box, className: 'left-[14%] bottom-[8%] h-6 w-6 text-emerald-300', duration: 6, delay: 1 },
  { icon: Backpack, className: 'right-[12%] bottom-[14%] h-7 w-7 text-violet-300', duration: 7, delay: 1.5 },
];

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function HomePage() {
  const { currentUser, emailVerified } = useAuth();

  if (currentUser && emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {FLOATING_ICONS.map(({ icon: Icon, className, duration, delay }, i) => (
            <motion.div
              key={i}
              className={`absolute opacity-40 ${className}`}
              animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon className="h-full w-full" strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center"
        >
          <motion.span
            variants={heroItem}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md"
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-full w-full items-center justify-center"
            >
              <Box className="h-7 w-7" strokeWidth={2.25} />
            </motion.span>
          </motion.span>
          <motion.h1
            variants={heroItem}
            className="mt-6 font-display text-3xl font-bold text-slate-900 sm:text-5xl"
          >
            Learn STEM, one concept at a time.
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mx-auto mt-4 max-w-xl text-base text-slate-500 sm:text-lg"
          >
            StemCraft helps you learn science and math concepts using simple, Minecraft-flavored
            analogies and explanations.
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                to="/signup"
                onMouseEnter={playHover}
                onClick={playClick}
                className="relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
              >
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  initial={{ x: '-200%' }}
                  animate={{ x: '600%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                />
                <span className="relative z-10 flex items-center gap-1.5">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                to="/login"
                onMouseEnter={playHover}
                onClick={playClick}
                className="block w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
              >
                Log in
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-20 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.iconBg}`}
            >
              <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
            </span>
            <h3 className="mt-3 font-display text-base font-semibold text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
