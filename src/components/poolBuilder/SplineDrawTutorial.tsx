import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, X } from 'lucide-react';

interface SplineDrawTutorialProps {
  visible: boolean;
  onDismiss: () => void;
  onStartDrawing: () => void;
}

export function SplineDrawTutorial({ visible, onDismiss, onStartDrawing }: SplineDrawTutorialProps) {
  const [step, setStep] = useState(0);

  // Auto-advance steps
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      if (step < 2) setStep(s => s + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [step, visible]);

  const handleStart = () => {
    onStartDrawing();
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
          style={{ background: 'radial-gradient(ellipse at center, hsl(var(--background) / 0.6) 0%, hsl(var(--background) / 0.85) 100%)' }}
        >
          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-8 max-w-md px-6 text-center">
            {/* Animated cursor illustration */}
            <motion.div
              className="relative w-48 h-48"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Dotted pool shape outline */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Faint grid */}
                <defs>
                  <pattern id="tut-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="200" height="200" fill="url(#tut-grid)" />

                {/* Pool shape being drawn */}
                <motion.path
                  d="M 40,80 L 80,40 L 160,50 L 170,120 L 140,170 L 60,160 Z"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeDasharray="8 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
                />

                {/* Animated dots at vertices */}
                {[
                  [40, 80], [80, 40], [160, 50], [170, 120], [140, 170], [60, 160]
                ].map(([cx, cy], i) => (
                  <motion.circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill="hsl(var(--primary))"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.45, duration: 0.3 }}
                  />
                ))}
              </svg>

              {/* Animated cursor */}
              <motion.div
                className="absolute"
                initial={{ left: '15%', top: '35%' }}
                animate={{
                  left: ['15%', '35%', '75%', '80%', '65%', '25%', '15%'],
                  top: ['35%', '15%', '20%', '55%', '80%', '75%', '35%'],
                }}
                transition={{
                  duration: 3,
                  delay: 0.5,
                  ease: 'easeInOut',
                }}
              >
                <MousePointer2 className="w-6 h-6 text-foreground drop-shadow-lg" />
              </motion.div>
            </motion.div>

            {/* Text steps */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-xl font-bold text-foreground">
                Draw Your Pool Shape
              </h2>

              <div className="space-y-2 text-sm text-muted-foreground">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step >= 0 ? 1 : 0.3 }}
                  className={step === 0 ? 'text-foreground font-medium' : ''}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">1</span>
                  Click on the terrain to place spline points
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step >= 1 ? 1 : 0.3 }}
                  className={step === 1 ? 'text-foreground font-medium' : ''}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">2</span>
                  Trace around your desired pool outline
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step >= 2 ? 1 : 0.3 }}
                  className={step === 2 ? 'text-foreground font-medium' : ''}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">3</span>
                  Click the first point or press Enter to close the shape
                </motion.p>
              </div>
            </motion.div>

            {/* Start Drawing button */}
            <motion.button
              onClick={handleStart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg"
            >
              Start Drawing
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5 }}
              className="text-xs text-muted-foreground"
            >
              Press Esc to cancel at any time
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
