# Adding SLA Indicators to Enhanced Issues Manager

## Quick Guide

I've created the `SLAIndicator` component. Here's how to add it:

### Step 1: Import the Component

Add to `src/components/admin/EnhancedIssuesManager.jsx` at the top:

```javascript
import SLAIndicator from '@/components/SLAIndicator';
```

### Step 2: Add SLA Column to Table Header

Find the table `<thead>` section (around line 489) and add a new column:

```jsx
<thead>
  <tr className="border-b border-white/10">
    <th className="p-4">Priority</th>
    <th className="p-4">Subject</th>
    <th className="p-4">Category</th>
    <th className="p-4">Customer</th>
    <th className="p-4">Assigned To</th>
    <th className="p-4">Status</th>
    <th className="p-4">SLA</th>  {/* ADD THIS */}
    <th className="p-4">Last Updated</th>
    <th className="p-4 text-right">Actions</th>
  </tr>
</thead>
```

### Step 3: Add SLA Column to Table Body

Find the `<tbody>` section (around line 500) and add:

```jsx
<td className="p-4">
  <SLAIndicator issue={issue} />
</td>
```

Full row example:
```jsx
<motion.tr
  key={issue.id}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
  onClick={() => openIssueDetail(issue)}
>
  <td className="p-4">{getPriorityBadge(issue.priority)}</td>
  <td className="p-4 font-medium">{issue.subject}</td>
  <td className="p-4">{getCategoryBadge(issue.category)}</td>
  <td className="p-4">
    <div className="font-medium">{issue.user_profiles?.full_name || 'N/A'}</div>
    <div className="text-sm text-text-secondary">{issue.user_profiles?.email || 'N/A'}</div>
  </td>
  <td className="p-4">
    {issue.assigned_user ? (
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span className="text-sm">{issue.assigned_user.full_name}</span>
      </div>
    ) : (
      <span className="text-text-secondary text-sm">Unassigned</span>
    )}
  </td>
  <td className="p-4">{getStatusBadge(issue.status)}</td>
  <td className="p-4">
    <SLAIndicator issue={issue} />  {/* ADD THIS */}
  </td>
  <td className="p-4 text-text-secondary">{new Date(issue.updated_at).toLocaleDateString()}</td>
  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
    {/* ... actions dropdown ... */}
  </td>
</motion.tr>
```

### Step 4: Add SLA Stats to Dashboard

Add a new statistics card:

```jsx
{statistics && (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">  {/* Change to 5 columns */}
    {/* ... existing cards ... */}

    {/* NEW SLA Card */}
    <Card className="glass-effect">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">SLA Compliance</p>
            <p className="text-2xl font-bold text-green-400">
              {statistics.sla_compliance_rate || 0}%
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

## What You'll See

### In the Table:
- **Green badge** - SLA met (response/resolution on time)
- **Red badge (pulsing)** - SLA breached (overdue)
- **Yellow badge (pulsing)** - SLA at risk (< 25% time remaining)
- **Blue badge** - Normal, plenty of time remaining

### Examples:
- "Response: 2h remaining" (blue)
- "Response: 30m remaining" (yellow, pulsing)
- "Response Overdue" (red, pulsing)
- "Response SLA Met" (green)
- "Resolution: 1d remaining" (blue)

## How It Works

The component:
1. Checks `sla_first_response_deadline` field
2. Compares to current time or `first_response_at`
3. Shows status with appropriate color
4. Same for resolution deadline

All automatic! Just add the component and it works!
