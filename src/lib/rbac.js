// Role-Based Access Control (RBAC) System

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CONTENT_EDITOR: 'content_editor',
  SUPPORT_AGENT: 'support_agent',
  ANALYST: 'analyst',
  NUTRITIONIST: 'nutritionist',
  USER: 'user'
};

export const PERMISSIONS = {
  // Customer Management
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',
  CUSTOMERS_EXPORT: 'customers:export',

  // Subscription Management
  SUBSCRIPTIONS_VIEW: 'subscriptions:view',
  SUBSCRIPTIONS_EDIT: 'subscriptions:edit',
  SUBSCRIPTIONS_CREATE: 'subscriptions:create',
  SUBSCRIPTIONS_DELETE: 'subscriptions:delete',

  // Payment Management
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_REFUND: 'payments:refund',
  PAYMENTS_EXPORT: 'payments:export',

  // Revenue & Analytics
  REVENUE_VIEW: 'revenue:view',
  REVENUE_EXPORT: 'revenue:export',
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // Content Management
  BLOG_VIEW: 'blog:view',
  BLOG_CREATE: 'blog:create',
  BLOG_EDIT: 'blog:edit',
  BLOG_DELETE: 'blog:delete',
  BLOG_PUBLISH: 'blog:publish',

  WEBSITE_VIEW: 'website:view',
  WEBSITE_EDIT: 'website:edit',

  // Coupons & Referrals
  COUPONS_VIEW: 'coupons:view',
  COUPONS_CREATE: 'coupons:create',
  COUPONS_EDIT: 'coupons:edit',
  COUPONS_DELETE: 'coupons:delete',

  REFERRALS_VIEW: 'referrals:view',
  REFERRALS_MANAGE: 'referrals:manage',

  // Support
  SUPPORT_VIEW: 'support:view',
  SUPPORT_RESPOND: 'support:respond',
  SUPPORT_ASSIGN: 'support:assign',
  SUPPORT_DELETE: 'support:delete',

  // Database
  DATABASE_VIEW: 'database:view',
  DATABASE_EDIT: 'database:edit',

  // System Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // User Management
  USERS_VIEW_ROLES: 'users:view_roles',
  USERS_CHANGE_ROLES: 'users:change_roles'
};

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // Super Admin has ALL permissions
    '*'
  ],

  [ROLES.ADMIN]: [
    // Customers
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.CUSTOMERS_EXPORT,

    // Subscriptions
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_EDIT,
    PERMISSIONS.SUBSCRIPTIONS_CREATE,

    // Payments
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.PAYMENTS_EXPORT,

    // Revenue & Analytics
    PERMISSIONS.REVENUE_VIEW,
    PERMISSIONS.REVENUE_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,

    // Content
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.BLOG_DELETE,
    PERMISSIONS.BLOG_PUBLISH,
    PERMISSIONS.WEBSITE_VIEW,
    PERMISSIONS.WEBSITE_EDIT,

    // Coupons & Referrals
    PERMISSIONS.COUPONS_VIEW,
    PERMISSIONS.COUPONS_CREATE,
    PERMISSIONS.COUPONS_EDIT,
    PERMISSIONS.COUPONS_DELETE,
    PERMISSIONS.REFERRALS_VIEW,
    PERMISSIONS.REFERRALS_MANAGE,

    // Support
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_ASSIGN,

    // Settings
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.USERS_VIEW_ROLES
  ],

  [ROLES.CONTENT_EDITOR]: [
    // Blog
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.BLOG_PUBLISH,

    // Website
    PERMISSIONS.WEBSITE_VIEW,
    PERMISSIONS.WEBSITE_EDIT,

    // Limited analytics
    PERMISSIONS.ANALYTICS_VIEW
  ],

  [ROLES.SUPPORT_AGENT]: [
    // Customers (view only)
    PERMISSIONS.CUSTOMERS_VIEW,

    // Support
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,

    // Subscriptions (view only)
    PERMISSIONS.SUBSCRIPTIONS_VIEW
  ],

  [ROLES.ANALYST]: [
    // Analytics (full access)
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,

    // Revenue (view & export)
    PERMISSIONS.REVENUE_VIEW,
    PERMISSIONS.REVENUE_EXPORT,

    // Customers (view only)
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_EXPORT,

    // Subscriptions (view only)
    PERMISSIONS.SUBSCRIPTIONS_VIEW,

    // Payments (view only)
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_EXPORT
  ],

  [ROLES.NUTRITIONIST]: [
    // Limited access - mostly for future nutritionist features
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND
  ],

  [ROLES.USER]: [
    // No admin permissions
  ]
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  const userRole = user.role;
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  // Super admin has all permissions
  if (permissions.includes('*')) return true;

  return permissions.includes(permission);
};

/**
 * Check if user can access a specific admin tab
 * @param {Object} user - User object with role property
 * @param {string} tabId - Tab identifier
 * @returns {boolean} - Whether user can access tab
 */
export const canAccessTab = (user, tabId) => {
  if (!user || !user.role) return false;

  const tabPermissions = {
    dashboard: [PERMISSIONS.ANALYTICS_VIEW],
    analytics: [PERMISSIONS.ANALYTICS_VIEW],
    revenue: [PERMISSIONS.REVENUE_VIEW],
    customers: [PERMISSIONS.CUSTOMERS_VIEW],
    subscriptions: [PERMISSIONS.SUBSCRIPTIONS_VIEW],
    payments: [PERMISSIONS.PAYMENTS_VIEW],
    coupons: [PERMISSIONS.COUPONS_VIEW],
    referrals: [PERMISSIONS.REFERRALS_VIEW],
    issues: [PERMISSIONS.SUPPORT_VIEW],
    blog: [PERMISSIONS.BLOG_VIEW],
    website: [PERMISSIONS.WEBSITE_VIEW],
    studio: [PERMISSIONS.DATABASE_VIEW]
  };

  const requiredPermissions = tabPermissions[tabId];
  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  return requiredPermissions.some(perm => hasPermission(user, perm));
};

/**
 * Get accessible tabs for a user
 * @param {Object} user - User object with role property
 * @param {Array} allTabs - Array of all tab objects
 * @returns {Array} - Filtered array of accessible tabs
 */
export const getAccessibleTabs = (user, allTabs) => {
  if (!user || !user.role) return [];

  return allTabs.filter(tab => canAccessTab(user, tab.id));
};

/**
 * Check if user is admin (has any admin permissions)
 * @param {Object} user - User object with role property
 * @returns {boolean} - Whether user is an admin
 */
export const isAdmin = (user) => {
  if (!user || !user.role) return false;

  const adminRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.CONTENT_EDITOR,
    ROLES.SUPPORT_AGENT,
    ROLES.ANALYST
  ];

  return adminRoles.includes(user.role);
};

/**
 * Get user role display name
 * @param {string} role - Role identifier
 * @returns {string} - Display name for role
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.CONTENT_EDITOR]: 'Content Editor',
    [ROLES.SUPPORT_AGENT]: 'Support Agent',
    [ROLES.ANALYST]: 'Analyst',
    [ROLES.NUTRITIONIST]: 'Nutritionist',
    [ROLES.USER]: 'User'
  };

  return displayNames[role] || role;
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessTab,
  getAccessibleTabs,
  isAdmin,
  getRoleDisplayName
};
