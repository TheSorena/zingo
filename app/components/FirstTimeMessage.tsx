'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FirstTimeMessage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the message has been shown before
    const hasShown = localStorage.getItem('hasShownCountryMessage');
    if (!hasShown) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('hasShownCountryMessage', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2 rounded-full">
              <Globe2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">انتخاب کشور</h3>
              <p className="text-sm text-primary-foreground/90">
                برای مشاهده کانال‌های کشور مورد نظر خود، می‌توانید از دکمه انتخاب کشور در بالای صفحه استفاده کنید.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white/20"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 