# Testing Guide - GreenoFig Website

## Overview
This document outlines the testing strategy and provides test cases for the GreenoFig nutritionist website.

## Test Coverage Areas

### 1. Authentication & Authorization
- ✅ User login/logout
- ✅ Role-based access control (User, Nutritionist, Admin)
- ✅ Protected routes
- ✅ Password reset flow

### 2. Critical User Flows
- ✅ User registration and onboarding survey
- ✅ Subscription purchase flow
- ✅ AI Coach interaction
- ✅ Profile updates
- ✅ Support ticket submission

### 3. Admin Functions
- ✅ User management
- ✅ Content management (Blog, Features, Pricing)
- ✅ Payment management
- ✅ Analytics viewing

### 4. Nutritionist Dashboard
- ✅ Client management
- ✅ Meal plan creation
- ✅ Recipe database
- ✅ Appointment scheduling
- ✅ Messaging system

## Manual Testing Checklist

### Pre-Deployment Tests

#### Authentication (10 tests)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Password reset email sent
- [ ] Password reset link works
- [ ] Session persistence across page refresh
- [ ] Auto-redirect to login when unauthorized
- [ ] Role-based dashboard redirect (user/nutritionist/admin)
- [ ] Protected routes block unauthenticated users
- [ ] Admin routes block non-admin users

#### User Dashboard (8 tests)
- [ ] Dashboard loads with user data
- [ ] BMI calculation is accurate
- [ ] Goals display correctly
- [ ] Quick actions are clickable
- [ ] Navigation to Nutrition/Fitness/Progress pages
- [ ] Profile update saves correctly
- [ ] Responsive design on mobile
- [ ] AI Coach chat opens and responds

#### Subscription Flow (12 tests)
- [ ] Pricing page displays all plans
- [ ] Monthly/Yearly toggle works
- [ ] "Get Started" button opens checkout
- [ ] Stripe checkout loads correctly
- [ ] Card payment processes successfully
- [ ] Subscription status updates in database
- [ ] User receives confirmation email
- [ ] Billing page shows subscription details
- [ ] Cancel subscription works
- [ ] Refund request submits successfully
- [ ] Coupon codes apply discounts
- [ ] Referral codes apply discounts

#### Content Management (6 tests)
- [ ] Blog post creation with rich text editor
- [ ] Blog post publish/draft toggle
- [ ] Image upload works
- [ ] SEO meta tags save
- [ ] Feature management CRUD operations
- [ ] Homepage content updates reflect immediately

#### Forms & Validation (8 tests)
- [ ] Contact form validation
- [ ] Contact form submission
- [ ] Survey form progression
- [ ] Survey form completion saves to database
- [ ] Support ticket form validation
- [ ] File upload size limits enforced
- [ ] Required fields prevent submission
- [ ] Email format validation

#### Performance (5 tests)
- [ ] Homepage loads in < 3 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] Images lazy load correctly
- [ ] No console errors on any page
- [ ] Mobile performance acceptable (3G simulation)

## Edge Cases to Test

### Authentication Edge Cases
1. **Expired session** - User session expires, should redirect to login
2. **Concurrent logins** - Same user logs in from two devices
3. **Password reset with invalid token** - Should show error
4. **Login during maintenance** - Graceful error handling

### Payment Edge Cases
1. **Card declined** - Show appropriate error message
2. **Network error during payment** - Don't charge twice
3. **Coupon code expired** - Should not apply
4. **Subscription already exists** - Prevent duplicate subscriptions
5. **Refund for canceled subscription** - Proper pro-rata calculation

### Form Edge Cases
1. **Submit empty form** - All required fields should show errors
2. **Submit with special characters** - Proper sanitization
3. **Submit with very long text** - Character limits enforced
4. **Double-click submit** - Prevent duplicate submissions
5. **Browser back button** - Form state preserved or cleared appropriately

### Data Edge Cases
1. **User profile with null values** - UI should handle gracefully
2. **Empty results** - Show appropriate empty states
3. **Very large datasets** - Pagination works correctly
4. **Invalid date ranges** - Validation prevents
5. **Deleted data references** - No broken links or 404s

## Test Data

### Test User Accounts
```
Regular User:
- Email: testuser@greenofig.com
- Password: Test123!@#
- Role: user

Nutritionist:
- Email: nutritionist@greenofig.com
- Password: Test123!@#
- Role: nutritionist

Admin:
- Email: admin@greenofig.com
- Password: Test123!@#
- Role: admin
```

### Test Payment Cards (Stripe)
```
Success:
- Card: 4242 4242 4242 4242
- CVC: Any 3 digits
- Date: Any future date

Decline:
- Card: 4000 0000 0000 0002

Requires 3D Secure:
- Card: 4000 0025 0000 3155
```

## Automated Testing Setup (Future)

### Recommended Tools
- **Unit Tests**: Vitest (fast, Vite-compatible)
- **Integration Tests**: React Testing Library
- **E2E Tests**: Playwright or Cypress
- **API Tests**: Supertest

### Installation (when ready)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

### Example Test Structure
```
tests/
├── unit/
│   ├── utils.test.js
│   ├── lib/
│   │   ├── rbac.test.js
│   │   ├── stripe.test.js
│   │   └── webVitals.test.js
├── integration/
│   ├── auth.test.jsx
│   ├── subscription.test.jsx
│   └── dashboard.test.jsx
└── e2e/
    ├── user-journey.spec.js
    ├── admin-journey.spec.js
    └── nutritionist-journey.spec.js
```

## Test Coverage Goals

Current (Manual): ~40% coverage estimate
Target (Automated): 80%+ coverage

### Priority Coverage Areas
1. **Critical**: Authentication, Payments (100% coverage needed)
2. **High**: User flows, Admin functions (80% coverage)
3. **Medium**: UI components, Forms (60% coverage)
4. **Low**: Visual styling, Animations (40% coverage)

## Regression Testing

### After Each Deployment
1. Smoke test: Homepage, Login, Dashboard
2. Critical path: Signup → Subscribe → Dashboard
3. Admin functions: Content updates, User management
4. Performance: Lighthouse audit

### Before Major Releases
- Complete manual testing checklist
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness (iOS, Android)
- Accessibility audit (WAVE, axe DevTools)

## Bug Reporting Template

```markdown
**Title**: [Brief description]

**Priority**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected**: [What should happen]
**Actual**: [What actually happens]

**Environment**:
- Browser: [Chrome 120, Firefox 121, etc.]
- OS: [Windows 11, macOS 14, etc.]
- Device: [Desktop, Mobile, Tablet]

**Screenshots**: [If applicable]
**Console Errors**: [If any]
```

## Test Execution Log

| Date | Tester | Tests Run | Passed | Failed | Notes |
|------|--------|-----------|--------|--------|-------|
| [Date] | [Name] | [#] | [#] | [#] | [Comments] |

## Notes
- All tests should be run on staging environment before production
- Security tests should include SQL injection, XSS, CSRF attempts
- Performance tests should simulate 3G network conditions
- Accessibility tests should use screen readers (NVDA, JAWS)
