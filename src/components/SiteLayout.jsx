import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import OnboardingSurvey from '@/components/OnboardingSurvey';
import FloatingAiChat from '@/components/FloatingAiChat';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LogOut, User } from 'lucide-react';

const SiteLayout = ({ logoUrl, children, pageTitle, pageDescription, openSurvey: propOpenSurvey }) => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  
  const handleUnimplemented = (pageName) => {
    toast({
      title: `🚧 The ${pageName} page isn't implemented yet!`,
      description: "Don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const navLinks = [
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blog" },
    { name: "Reviews", path: "/reviews" },
    { name: "Contact", path: "/contact" },
    { name: "FAQ", path: "/faq" },
    { name: "About Us", path: "/about" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ];
  
  const openSurvey = propOpenSurvey || (() => setIsSurveyOpen(true));

  return (
    <>
      <div className="bg-background text-foreground min-h-screen">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        <div className="relative z-10">
          <header className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-24">
              <Link to="/home" className="flex items-center gap-2">
                <img src={logoUrl} alt="GreenoFig Logo" className="w-10 h-10" />
                <span className="text-2xl font-extrabold tracking-tight gradient-text">GreenoFig</span>
              </Link>
              <nav className="hidden lg:flex items-center space-x-8">
                {navLinks.map(link => (
                  <button key={link.name} onClick={() => link.unimplemented ? handleUnimplemented(link.pageName) : navigate(link.path)} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                    {link.name}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                {user && userProfile ? (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/app')} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline">{userProfile.full_name || 'Profile'}</span>
                    </Button>
                    <Button variant="ghost" onClick={async () => {
                      await signOut();
                      navigate('/home');
                    }} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span className="hidden md:inline">Logout</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                    <Button onClick={() => navigate('/signup')} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">Sign Up</Button>
                  </>
                )}
                <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => handleUnimplemented('mobile menu')}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {pageTitle && pageDescription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                  {pageTitle}
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary">
                  {pageDescription}
                </p>
              </motion.div>
            )}
            {React.isValidElement(children) ? React.cloneElement(children, { openSurvey }) : children}
          </main>
          
          <footer className="mt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <Link to="/home" className="flex items-center gap-2 mb-4">
                    <img src={logoUrl} alt="GreenoFig Logo" className="w-8 h-8" />
                    <span className="text-xl font-extrabold tracking-tight gradient-text">GreenoFig</span>
                  </Link>
                  <p className="text-sm text-text-secondary">&copy; {new Date().getFullYear()} GreenoFig. All rights reserved.</p>
                </div>
                <div>
                  <p className="font-semibold mb-4">Platform</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/features" className="text-text-secondary hover:text-primary">Features</Link></li>
                    <li><Link to="/pricing" className="text-text-secondary hover:text-primary">Pricing</Link></li>
                    <li><button onClick={() => handleUnimplemented('Updates')} className="text-text-secondary hover:text-primary">Updates</button></li>
                  </ul>
                </div>
                 <div>
                  <p className="font-semibold mb-4">Company</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/about" className="text-text-secondary hover:text-primary">About Us</Link></li>
                    <li><Link to="/blog" className="text-text-secondary hover:text-primary">Blog</Link></li>
                    <li><Link to="/contact" className="text-text-secondary hover:text-primary">Contact</Link></li>
                  </ul>
                </div>
                 <div>
                  <p className="font-semibold mb-4">Legal</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/privacy-policy" className="text-text-secondary hover:text-primary transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms-of-service" className="text-text-secondary hover:text-primary transition-colors">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <FloatingAiChat />
      <OnboardingSurvey logoUrl={logoUrl} isOpen={isSurveyOpen} setIsOpen={setIsSurveyOpen} />
    </>
  )
}

export default SiteLayout;