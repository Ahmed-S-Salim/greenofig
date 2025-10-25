import React, { useState, useEffect } from 'react';
    import { Link, NavLink, useNavigate } from 'react-router-dom';
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
    } from 'lucide-react';
    import { Outlet } from 'react-router-dom';
    import FloatingAiChat from '@/components/FloatingAiChat';

    const AppLayout = ({ logoUrl }) => {
      const { userProfile, signOut } = useAuth();
      const navigate = useNavigate();
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [unreadCount, setUnreadCount] = useState(0);

      // Fetch unread message count
      useEffect(() => {
        if (userProfile?.id) {
          fetchUnreadCount();

          // Set up real-time subscription for conversation updates
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
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
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
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app/nutritionist' },
        { icon: Users, label: 'Clients', path: '/app/nutritionist?tab=clients' },
        { icon: Carrot, label: 'Meal Plans', path: '/app/nutritionist?tab=meals' },
        { icon: Calendar, label: 'Schedule', path: '/app/nutritionist?tab=schedule' },
        { icon: MessageSquare, label: 'Messages', path: '/app/nutritionist?tab=messages' },
        { icon: BarChart3, label: 'Analytics', path: '/app/nutritionist?tab=analytics' },
        { icon: FileText, label: 'Resources', path: '/app/nutritionist?tab=resources' },
        { icon: FileText, label: 'Blog', path: '/app/nutritionist?tab=blog' },
        { icon: Settings, label: 'Settings', path: '/app/nutritionist?tab=settings' },
      ];

      const adminNavLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app/admin' },
        { icon: TrendingUp, label: 'Analytics', path: '/app/admin?tab=analytics' },
        { icon: Database, label: 'DB Studio', path: '/app/admin?tab=studio' },
        { icon: Users, label: 'Customers', path: '/app/admin?tab=customers' },
        { icon: CreditCard, label: 'Subscriptions', path: '/app/admin?tab=subscriptions' },
        { icon: CreditCard, label: 'Payments', path: '/app/admin?tab=payments' },
        { icon: ShieldQuestion, label: 'Issues', path: '/app/admin?tab=issues' },
        { icon: FileText, label: 'Blog', path: '/app/admin?tab=blog' },
        { icon: Globe, label: 'Website', path: '/app/admin?tab=website' },
        { icon: Bot, label: 'AI Coach', path: '/app/admin?tab=ai-coach' },
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
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium border ${
              isActive || isHovered
                ? 'bg-gradient-to-r from-primary to-green-400 text-primary-foreground border-primary/30'
                : 'bg-transparent text-muted-foreground border-transparent hover:border-primary/30'
            } ${isHovered ? 'translate-x-1' : 'translate-x-0'}`}
            onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
          >
            <link.icon className="w-4 h-4" />
            <span className="flex-1">{link.label}</span>
            {showBadge && (
              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </NavLink>
        );
      };

      const SidebarContent = () => (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Link to="/home" className="flex items-center gap-2">
              <img src={logoUrl} alt="GreenoFig Logo" className="w-8 h-8" />
              <span className="text-lg font-bold gradient-text">GreenoFig</span>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navLinks.map(link => {
              let isActive = false;

              if (link.path.includes('?')) {
                // For links with query params (like Analytics, DB Studio, etc.)
                isActive = window.location.pathname + window.location.search === link.path;
              } else {
                // For Dashboard link - only active if no query params
                if (link.path === '/app/admin') {
                  isActive = window.location.pathname === '/app/admin' && !window.location.search;
                } else {
                  isActive = window.location.pathname === link.path;
                }
              }

              return <NavButton key={link.path} link={link} isActive={isActive} />;
            })}
          </nav>
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={userProfile?.profile_picture_url} />
                <AvatarFallback className="text-xs">{getInitials(userProfile?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate">{userProfile?.full_name}</p>
                <p className="text-xs text-text-secondary truncate">{userProfile?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <NavLink
                to="/app/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
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
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-text-secondary hover:bg-muted hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );

      return (
        <div className="flex h-screen bg-background text-foreground">
          <aside className="hidden lg:block w-64 bg-card border-r border-border">
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
                  className="fixed top-0 left-0 h-full w-64 bg-card z-50 lg:hidden"
                >
                  <SidebarContent />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between lg:justify-end h-16 px-4 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-4">
                {userProfile?.role === 'admin' || userProfile?.role === 'super_admin' ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Shield className="w-5 h-5" />
                    Admin Mode
                  </div>
                ) : null}
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>

          {/* Floating AI Chat Widget */}
          <FloatingAiChat />
        </div>
      );
    };

    export default AppLayout;