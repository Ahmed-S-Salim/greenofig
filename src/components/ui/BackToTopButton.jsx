import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackToTopButton = ({ targetId = 'main-content' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId) || window;
    const element = targetId ? document.getElementById(targetId) : null;

    const toggleVisibility = () => {
      if (element) {
        // For scrollable containers
        if (element.scrollTop > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        // For window scroll
        if (window.pageYOffset > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    if (element) {
      element.addEventListener('scroll', toggleVisibility);
    } else {
      window.addEventListener('scroll', toggleVisibility);
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', toggleVisibility);
      } else {
        window.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, [targetId]);

  const scrollToTop = () => {
    const element = targetId ? document.getElementById(targetId) : null;

    if (element) {
      element.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-40"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-primary/60 hover:bg-primary/80 backdrop-blur-sm text-primary-foreground border border-primary/20"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTopButton;
