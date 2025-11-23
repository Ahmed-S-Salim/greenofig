import React, { useState, useEffect } from 'react';
    import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Badge } from '@/components/ui/badge';
    import {
      LayoutDashboard,
      User,
      Settings,
      LogOut,
      Menu,
      X,
      Bot,
      HeartPulse,
      Dumbbell,
      Carrot,
      BarChart3,
      Shield,
      Database,
      TrendingUp,
      Users,
      CreditCard,
      ShieldQuestion,
      FileText,
      Globe,
      MessageSquare,
      Calendar,
      Mail,
      DollarSign,
      Bug,
      Wallet,
      Ticket,
      Gift,
      Megaphone,
    } from 'lucide-react';
    import { Outlet } from 'react-router-dom';
    import FloatingAiChat from '@/components/FloatingAiChat';
    import BackToTopButton from '@/components/ui/BackToTopButton';
    import NotificationBell from '@/components/NotificationBell';

    const AppLayout = ({ logoUrl }) => {
      const { userProfile, signOut } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [unreadCount, setUnreadCount] = useState(0);

      // Fetch unread message count
      useEffect(() => {
        if (userProfile?.id) {
          fetchUnreadCount();

          // Set up real-time subscription for conversation updates
          // Wrapped in try-catch to prevent WebSocket errors on mobile from breaking the app
          try {
            const channel = supabase
              .channel('conversations-changes')
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'conversations',
                  filter: userProfile.role === 'user'
                    ? `user_id=eq.${userProfile.id}`
                    : `nutritionist_id=eq.${userProfile.id}`
                },
                () => {
                  fetchUnreadCount();
                }
              )
              .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                  console.warn('Realtime subscription error - will use polling instead');
                }
              });

            return () => {
              try {
                supabase.removeChannel(channel);
              } catch (e) {
                // Silently handle cleanup errors
              }
            };
          } catch (error) {
            console.warn('Realtime not available, using polling only:', error.message);
            // Fallback: poll for updates every 30 seconds if realtime fails
            const pollInterval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(pollInterval);
          }
        }
      }, [userProfile?.id]);

      const fetchUnreadCount = async () => {
        if (!userProfile?.id) return;

        try {
          if (userProfile.role === 'user') {
            const { data, error } = await supabase.rpc('get_unread_message_count', {
              p_user_id: userProfile.id
            });
            if (!error) setUnreadCount(data || 0);
          } else if (['nutritionist', 'admin', 'super_admin'].includes(userProfile.role)) {
            const { data, error } = await supabase.rpc('get_nutritionist_unread_count', {
              p_nutritionist_id: userProfile.id
            });
            if (!error) setUnreadCount(data || 0);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      const handleSignOut = async () => {
        await signOut();
        // Navigation is handled in signOut function with window.location.href
      };

      const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
      };

      const userNavLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app/user' },
        { icon: Bot, label: 'AI Coach', path: '/app/ai-coach' },
        { icon: Carrot, label: 'Nutrition', path: '/app/nutrition' },
        { icon: Dumbbell, label: 'Fitness', path: '/app/fitness' },
        { icon: BarChart3, label: 'Progress', path: '/app/progress' },
        { icon: Mail, label: 'Messages', path: '/app/messages' },
        { icon: MessageSquare, label: 'Support', path: '/app/support' },
      ];

      const nutritionistNavLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app/nutritionist/dashboard' },
        { icon: Users, label: 'Clients', path: '/app/nutritionist/clients' },
        { icon: Carrot, label: 'Meal Plans', path: '/app/nutritionist/meals' },
        { icon: Calendar, label: 'Schedule', path: '/app/nutritionist/schedule' },
        { icon: MessageSquare, label: 'Messages', path: '/app/nutritionist/messages' },
        { icon: BarChart3, label: 'Analytics', path: '/app/nutritionist/analytics' },
        { icon: FileText, label: 'Resources', path: '/app/nutritionist/resources' },
        { icon: FileText, label: 'Blog', path: '/app/nutritionist/blog' },
        { icon: Settings, label: 'Settings', path: '/app/nutritionist/settings' },
      ];

      const adminNavLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app/admin' },
        { icon: User, label: 'Tier Preview', path: '/app/admin/tier-preview' },
        { icon: BarChart3, label: 'Analytics', path: '/app/admin/analytics' },
        { icon: DollarSign, label: 'Revenue', path: '/app/admin/revenue' },
        { icon: Bug, label: 'AI Errors', path: '/app/admin/errors' },
        { icon: Users, label: 'User Management', path: '/app/admin/customers' },
        { icon: CreditCard, label: 'Subscriptions', path: '/app/admin/subscriptions' },
        { icon: Wallet, label: 'Payments', path: '/app/admin/payments' },
        { icon: Ticket, label: 'Coupons', path: '/app/admin/coupons' },
        { icon: Gift, label: 'Referrals', path: '/app/admin/referrals' },
        { icon: ShieldQuestion, label: 'Support', path: '/app/admin/issues' },
        { icon: MessageSquare, label: 'Messaging', path: '/app/admin/messaging' },
        { icon: FileText, label: 'Blog', path: '/app/admin/blog' },
        { icon: Globe, label: 'Website', path: '/app/admin/website' },
        { icon: Megaphone, label: 'Ad Management', path: '/app/admin/ads' },
        { icon: Bot, label: 'AI Coach', path: '/app/admin/ai-coach' },
        { icon: Database, label: 'Database', path: '/app/admin/studio' },
      ];

      const getNavLinks = () => {
        switch (userProfile?.role) {
          case 'admin':
          case 'super_admin':
            return adminNavLinks;
          case 'nutritionist':
            return nutritionistNavLinks;
          default:
            return userNavLinks;
        }
      };

      const navLinks = getNavLinks();

      const sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
      };

      const NavButton = ({ link, isActive }) => {
        const [isHovered, setIsHovered] = useState(false);
        const showBadge = link.path === '/app/messages' && unreadCount > 0;

        return (
          <NavLink
            to={link.path}
            end
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex items-center gap-2 px-2 py-2 sm:py-1.5 rounded-md transition-all duration-200 text-sm sm:text-xs font-medium border min-h-[44px] sm:min-h-0 ${
              isActive || isHovered
                ? 'bg-gradient-to-r from-primary to-green-400 text-primary-foreground border-primary/30'
                : 'bg-transparent text-muted-foreground border-transparent hover:border-primary/30'
            } ${isHovered ? 'translate-x-1' : 'translate-x-0'}`}
            onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
          >
            <link.icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">{link.label}</span>
            {showBadge && (
              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 sm:h-4 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </NavLink>
        );
      };

      const SidebarContent = () => (
        <div className="flex flex-col h-full">
          <div className="p-3 sm:p-2.5 border-b border-border flex items-center gap-2">
            <Link to="/home" className="flex items-center gap-1.5">
              <img src={logoUrl} alt="GreenoFig Logo" className="w-7 h-7 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-sm font-bold gradient-text">GreenoFig</span>
            </Link>
          </div>
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {navLinks.map(link => {
              let isActive = false;

              if (link.path.includes('?')) {
                // For links with query params
                isActive = location.pathname + location.search === link.path;
              } else {
                // For links without query params (like /app/admin)
                if (link.path === '/app/admin') {
                  isActive = location.pathname === link.path && !location.search;
                } else {
                  isActive = location.pathname === link.path;
                }
              }

              return <NavButton key={link.path} link={link} isActive={isActive} />;
            })}
          </nav>
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-9 h-9 sm:w-8 sm:h-8">
                <AvatarImage src={userProfile?.profile_picture_url} />
                <AvatarFallback className="text-xs sm:text-[10px]">{getInitials(userProfile?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm sm:text-xs font-semibold truncate">{userProfile?.full_name}</p>
                <p className="text-xs sm:text-[10px] text-text-secondary truncate">{userProfile?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <NavLink
                to="/app/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg transition-colors text-sm font-medium min-h-[44px] sm:min-h-0 ${
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-text-secondary hover:bg-muted hover:text-foreground'
                  }`
                }
                onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </NavLink>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg transition-colors text-sm font-medium text-text-secondary hover:bg-muted hover:text-foreground min-h-[44px] sm:min-h-0"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );

      return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
          <aside className="hidden lg:block w-64 bg-card border-r border-border flex-shrink-0">
            <SidebarContent />
          </aside>

          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <motion.aside
                  variants={sidebarVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="fixed top-0 left-0 h-full w-72 sm:w-64 bg-card z-50 lg:hidden shadow-2xl"
                >
                  <SidebarContent />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <header className="sticky top-0 z-30 flex items-center justify-between lg:justify-end h-14 sm:h-16 px-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden min-h-[44px] min-w-[44px]"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-4">
                <NotificationBell user={userProfile} />
                {userProfile?.role === 'admin' || userProfile?.role === 'super_admin' ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-primary">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Admin Mode</span>
                    <span className="sm:hidden">Admin</span>
                  </div>
                ) : null}
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content">
              <Outlet />
            </main>
          </div>

          {/* Floating AI Chat Widget - Show for all logged-in users */}
          <FloatingAiChat />

          {/* Back to Top Button */}
          <BackToTopButton targetId="main-content" />
        </div>
      );
    };

    export default AppLayout;