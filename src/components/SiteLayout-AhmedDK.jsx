import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import OnboardingSurvey from '@/components/OnboardingSurvey';
import FloatingAiChat from '@/components/FloatingAiChat';
import BackToTopButton from '@/components/ui/BackToTopButton';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LogOut, User } from 'lucide-react';

const SiteLayout = ({ logoUrl, children, pageTitle, pageDescription, openSurvey: propOpenSurvey }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, userProfile, signOut } = useAuth();
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUnimplemented = (pageName) => {
    toast({
      title: `🚧 The ${pageName} page isn't implemented yet!`,
      description: "Don't worry! You can request it in your next prompt! 🚀",
    });
  };

  // Get role-specific dashboard path
  const getDashboardPath = () => {
    const role = userProfile?.role;
    if (role === 'admin' || role === 'super_admin') {
      return '/app/admin';
    } else if (role === 'nutritionist') {
      return '/app/nutritionist';
    }
    return '/app/user';
  };

  const navLinks = [
    { name: t('nav.features'), path: "/features" },
    { name: t('nav.pricing'), path: "/pricing" },
    { name: t('nav.download'), path: "/download" },
    { name: t('nav.blog'), path: "/blog" },
    { name: t('nav.reviews'), path: "/reviews" },
    { name: t('nav.contact'), path: "/contact" },
    { name: t('nav.faq'), path: "/faq" },
    { name: t('nav.about'), path: "/about" },
  ];
  
  const openSurvey = propOpenSurvey || (() => setIsSurveyOpen(true));

  return (
    <>
      <div className="bg-background text-foreground min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{
                  type: "tween",
                  duration: 0.35,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="fixed right-0 top-0 h-[80vh] w-[60vw] min-w-[250px] rounded-bl-3xl overflow-hidden"
                style={{
                  background: 'rgba(22, 163, 74, 0.05)',
                  backdropFilter: 'blur(60px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(60px) saturate(180%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.15)',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <Link to="/home" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src={logoUrl} alt="GreenoFig Logo" className="w-8 h-8" />
                    <span className="text-lg font-bold gradient-text">GreenoFig</span>
                  </Link>
                  <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setIsMobileMenuOpen(false)}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                <nav className="space-y-2 flex-shrink-0">
                  {navLinks.map((link, index) => {
                    const isActive = location.pathname === link.path;
                    const currentLang = localStorage.getItem('language') || 'en';
                    const isArabic = currentLang === 'ar';

                    return (
                      <motion.button
                        key={link.name}
                        initial={{ x: 50 }}
                        animate={{ x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.35 + (index * 0.05),
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        onClick={() => {
                          if (isActive) return;
                          if (link.unimplemented) {
                            handleUnimplemented(link.pageName);
                          } else {
                            navigate(link.path);
                          }
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 font-medium rounded-md transition-all duration-300 ${
                          isArabic ? 'text-sm' : 'text-base'
                        } ${
                          isActive
                            ? 'text-primary bg-white/10 cursor-default'
                            : 'text-text-secondary hover:text-primary hover:bg-white/5 cursor-pointer'
                        }`}
                        disabled={isActive}
                      >
                        {link.name}
                      </motion.button>
                    );
                  })}
                </nav>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 flex-shrink-0">
                  <div className="mb-3">
                    <LanguageSwitcher />
                  </div>
                  {user && userProfile ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-10 text-sm backdrop-blur-sm border-white/10 hover:bg-white/5"
                        onClick={() => {
                          navigate(getDashboardPath());
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <User className="w-4 h-4" />
                        <span className="truncate">{userProfile.full_name || 'Dashboard'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-10 text-sm backdrop-blur-sm border-white/10 hover:bg-white/5"
                        onClick={async () => {
                          await signOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full h-10 text-sm backdrop-blur-sm border-white/10 hover:bg-white/5"
                        onClick={() => {
                          navigate('/login');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {t('nav.login')}
                      </Button>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm"
                        onClick={() => {
                          navigate('/signup');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {t('nav.signup')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20 lg:h-24">
              <Link to="/home" className="flex items-center gap-2">
                <img src={logoUrl} alt="GreenoFig Logo" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10" />
                <span className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight gradient-text">GreenoFig</span>
              </Link>
              {/* Navigation with dynamic spacing based on language */}
              {(() => {
                const currentLang = localStorage.getItem('language') || 'en';
                const isArabic = currentLang === 'ar';

                return (
                  <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                    {navLinks.map(link => {
                      const isActive = location.pathname === link.path;

                      return (
                        <button
                          key={link.name}
                          onClick={() => {
                            if (isActive) return;
                            link.unimplemented ? handleUnimplemented(link.pageName) : navigate(link.path);
                          }}
                          className={`font-medium transition-colors whitespace-nowrap ${
                            isArabic ? 'text-xs' : 'text-sm'
                          } ${
                            isActive
                              ? 'text-primary cursor-default'
                              : 'text-text-secondary hover:text-primary cursor-pointer'
                          }`}
                          disabled={isActive}
                        >
                          {link.name}
                        </button>
                      );
                    })}
                  </nav>
                );
              })()}
              <div className="flex items-center gap-1 sm:gap-2">
                <LanguageSwitcher />
                {user && userProfile ? (
                  <>
                    <Button variant="ghost" onClick={() => navigate(getDashboardPath())} className="flex items-center gap-2 h-10 min-h-[44px] sm:min-h-0 px-2 sm:px-3">
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline text-sm">{userProfile.full_name || 'Dashboard'}</span>
                    </Button>
                    <Button variant="ghost" onClick={async () => {
                      await signOut();
                      navigate('/home');
                    }} className="flex items-center gap-2 h-10 min-h-[44px] sm:min-h-0 px-2 sm:px-3">
                      <LogOut className="w-4 h-4" />
                      <span className="hidden md:inline text-sm">{t('nav.logout')}</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/login')} className="h-10 min-h-[44px] sm:min-h-0 text-sm">{t('nav.login')}</Button>
                    <Button onClick={() => navigate('/signup')} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-10 min-h-[44px] sm:min-h-0 text-sm">{t('nav.signup')}</Button>
                  </>
                )}
                <Button size="icon" variant="ghost" className="lg:hidden min-h-[44px] min-w-[44px]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex-grow">
            {pageTitle && pageDescription && (
              <div className="hero-content text-center mb-8 sm:mb-12 lg:mb-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-tight">
                  {pageTitle}
                </h1>
                <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-text-secondary px-4">
                  {pageDescription}
                </p>
              </div>
            )}
            {React.isValidElement(children) ? React.cloneElement(children, { openSurvey }) : children}
          </main>

          {/* Onboarding Survey - Inline above footer */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <OnboardingSurvey logoUrl={logoUrl} inline={true} />
          </div>

          <footer className="mt-auto border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                <div>
                  <Link to="/home" className="flex items-center gap-2 mb-4">
                    <img src={logoUrl} alt="GreenoFig Logo" className="w-8 h-8" />
                    <span className="text-xl font-extrabold tracking-tight gradient-text">GreenoFig</span>
                  </Link>
                  <p className="text-sm text-text-secondary">&copy; {new Date().getFullYear()} GreenoFig.com. All rights reserved.</p>
                </div>
                <div>
                  <p className="font-semibold mb-4">Contact Us</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="mailto:health@greenofig.com" className="text-text-secondary hover:text-primary transition-colors">health@greenofig.com</a>
                    </li>
                    <li>
                      <a href="mailto:support@greenofig.com" className="text-text-secondary hover:text-primary transition-colors">support@greenofig.com</a>
                    </li>
                    <li>
                      <a href="mailto:nutritionist@greenofig.com" className="text-text-secondary hover:text-primary transition-colors">nutritionist@greenofig.com</a>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-4">Platform</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      {location.pathname === '/features' ? (
                        <span className="text-primary cursor-default">Features</span>
                      ) : (
                        <Link to="/features" className="text-text-secondary hover:text-primary">Features</Link>
                      )}
                    </li>
                    <li>
                      {location.pathname === '/pricing' ? (
                        <span className="text-primary cursor-default">Pricing</span>
                      ) : (
                        <Link to="/pricing" className="text-text-secondary hover:text-primary">Pricing</Link>
                      )}
                    </li>
                    <li><button onClick={() => handleUnimplemented('Updates')} className="text-text-secondary hover:text-primary">Updates</button></li>
                  </ul>
                </div>
                 <div>
                  <p className="font-semibold mb-4">Company</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      {location.pathname === '/about' ? (
                        <span className="text-primary cursor-default">About Us</span>
                      ) : (
                        <Link to="/about" className="text-text-secondary hover:text-primary">About Us</Link>
                      )}
                    </li>
                    <li>
                      {location.pathname === '/blog' ? (
                        <span className="text-primary cursor-default">Blog</span>
                      ) : (
                        <Link to="/blog" className="text-text-secondary hover:text-primary">Blog</Link>
                      )}
                    </li>
                    <li>
                      {location.pathname === '/contact' ? (
                        <span className="text-primary cursor-default">Contact</span>
                      ) : (
                        <Link to="/contact" className="text-text-secondary hover:text-primary">Contact</Link>
                      )}
                    </li>
                  </ul>
                </div>
                 <div>
                  <p className="font-semibold mb-4">Legal</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      {location.pathname === '/privacy-policy' ? (
                        <span className="text-primary cursor-default">Privacy Policy</span>
                      ) : (
                        <Link to="/privacy-policy" className="text-text-secondary hover:text-primary transition-colors">Privacy Policy</Link>
                      )}
                    </li>
                    <li>
                      {location.pathname === '/terms-of-service' ? (
                        <span className="text-primary cursor-default">Terms of Service</span>
                      ) : (
                        <Link to="/terms-of-service" className="text-text-secondary hover:text-primary transition-colors">Terms of Service</Link>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <FloatingAiChat />
      <BackToTopButton />
    </>
  )
}

export default SiteLayout;