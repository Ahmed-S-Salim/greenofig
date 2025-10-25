# GreenoFig Website - Pages Inventory

## PROJECT STATUS TRACKER
Track completion status for each page as we build them.

---

## PUBLIC PAGES (Marketing/Information)

### 1. HomePage
- **Path**: `/`
- **File**: `src/pages/HomePage.jsx`
- **Status**: ✅ COMPLETE
- **Description**: Landing page with hero section, features overview, pricing preview, testimonials, and CTA
- **Dependencies**: SiteLayout, Button, motion animations

### 2. AboutPage
- **Path**: `/about`
- **File**: `src/pages/AboutPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Company information, mission, vision, team
- **Dependencies**: SiteLayout

### 3. FeaturesPage
- **Path**: `/features`
- **File**: `src/pages/FeaturesPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Detailed showcase of all platform features
- **Dependencies**: SiteLayout, feature cards

### 4. PricingPage
- **Path**: `/pricing`
- **File**: `src/pages/PricingPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Subscription plans, pricing comparison, FAQ
- **Dependencies**: SiteLayout, pricing cards

### 5. BlogPage (Unified Blog System)
- **Path**: `/blog` and `/blog/:postId`
- **File**: `src/pages/BlogPage.jsx`
- **Status**: ✅ COMPLETE
- **Description**: Complete unified blog system that handles both list view and individual post view in a single component. Combines BlogPage, ArticlesPage, and BlogPostPage functionality.
- **Dependencies**: SiteLayout, Tabs component, Supabase integration
- **Features**:
  - **List View** (`/blog`):
    - Tab 1: All Posts - Grid layout with cards
    - Tab 2: Featured Articles - Magazine layout with featured hero post
  - **Post View** (`/blog/:postId`):
    - Full blog post content
    - Author info and publish date
    - Back to blog navigation
  - Glassmorphic design maintained
  - Framer Motion animations
  - Single source of truth for blog functionality

### 6. ReviewsPage
- **Path**: `/reviews`
- **File**: `src/pages/ReviewsPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: User testimonials and reviews
- **Dependencies**: SiteLayout, rating components

### 7. FaqPage
- **Path**: `/faq`
- **File**: `src/pages/FaqPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Frequently asked questions with accordion
- **Dependencies**: SiteLayout, Accordion component

### 8. ContactPage
- **Path**: `/contact`
- **File**: `src/pages/ContactPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Contact form and company contact information
- **Dependencies**: SiteLayout, form validation

---

## USER PAGES (Authenticated Users)

### 9. SurveyPage
- **Path**: `/survey`
- **File**: `src/pages/SurveyPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Onboarding survey for new users (goals, preferences, health data)
- **Dependencies**: OnboardingSurvey component, Supabase auth

### 10. UserDashboard
- **Path**: `/app/user`
- **File**: `src/pages/UserDashboard.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Main user dashboard with health metrics, meal plans, workouts
- **Dependencies**: AppLayout, Dashboard, FitnessPage, NutritionPage, ProgressPage components

### 11. ProfilePage
- **Path**: `/app/profile`
- **File**: `src/pages/ProfilePage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: User profile settings and preferences
- **Dependencies**: AppLayout, form components, Supabase

### 12. AiCoachPage
- **Path**: `/app/ai-coach`
- **File**: `src/pages/AiCoachPage.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: AI coaching chat interface
- **Dependencies**: AppLayout, chat UI, AI integration

---

## NUTRITIONIST PAGES

### 13. NutritionistDashboard
- **Path**: `/app/nutritionist`
- **File**: `src/pages/NutritionistDashboard.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Dashboard for nutritionist users to manage clients
- **Dependencies**: AppLayout, client management components

---

## ADMIN PAGES

### 14. AdminDashboard
- **Path**: `/app/admin`
- **File**: `src/pages/AdminDashboard.jsx`
- **Status**: ⏳ NEEDS REVIEW
- **Description**: Main admin control panel with tabs for all management features
- **Dependencies**: AppLayout, all admin components
- **Sub-components**:
  - Analytics
  - BlogManager
  - BlogPostEditor
  - CustomersManager
  - DatabaseStudio
  - FeaturesManager
  - IssuesManager
  - PaymentsManager
  - PricingManager
  - SiteContentManager
  - SubscriptionsManager
  - WebsiteManager

---

## SHARED COMPONENTS

### Authentication
- **AuthPage** (`src/components/AuthPage.jsx`) - Login/Signup
- **OnboardingSurvey** (`src/components/OnboardingSurvey.jsx`) - User onboarding

### Layouts
- **SiteLayout** (`src/components/SiteLayout.jsx`) - Public pages wrapper
- **AppLayout** (`src/components/AppLayout.jsx`) - Authenticated pages wrapper

### Dashboard Components
- **Dashboard** (`src/components/Dashboard.jsx`)
- **FitnessPage** (`src/components/FitnessPage.jsx`)
- **NutritionPage** (`src/components/NutritionPage.jsx`)
- **ProgressPage** (`src/components/ProgressPage.jsx`)

### UI Components (shadcn/ui)
- accordion, avatar, badge, button, card, checkbox, dialog, dropdown-menu, input, label, tabs, textarea, toast, toaster

---

## WORK PLAN

### Phase 1: Review & Fix Existing Pages
1. Check each page for completeness
2. Verify routing in App.jsx
3. Test authentication flow
4. Ensure consistent styling

### Phase 2: Database Integration
1. Review Supabase schema
2. Connect pages to database
3. Implement CRUD operations
4. Add error handling

### Phase 3: Feature Implementation
1. AI Coach integration
2. Meal plan generation
3. Workout recommendations
4. Progress tracking

### Phase 4: Admin Features
1. Complete all admin managers
2. Analytics dashboard
3. Content management
4. User management

### Phase 5: Testing & Polish
1. Cross-browser testing
2. Responsive design verification
3. Performance optimization
4. SEO implementation

---

## NOTES
- Using React Router v6 for routing
- Supabase for backend and authentication
- Framer Motion for animations
- Tailwind CSS + shadcn/ui for styling
- Dark theme as default with light mode support
