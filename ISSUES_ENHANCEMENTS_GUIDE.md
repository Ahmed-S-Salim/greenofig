# Issues System Enhancements - Complete Guide

## What's Been Added

I've created **ISSUES_ENHANCEMENTS.sql** with advanced features for your support ticket system.

## Step 1: Apply the SQL

1. Open `ISSUES_ENHANCEMENTS.sql`
2. Copy all content
3. Go to Supabase Dashboard → SQL Editor
4. Paste and click "Run"

## What This Adds to Your Database

### 1. Email Notification System

**Table:** `issue_email_queue`
- Stores emails to be sent
- Tracks sent status, errors, retry count
- Queue-based system for reliable delivery

**Automatic Triggers:**
- ✅ **New ticket created** → Notifies all admins
- ✅ **Admin replies** → Notifies customer (only for non-internal comments)
- ✅ **Status changes to resolved/closed** → Notifies customer
- ✅ **Resolved tickets** → Includes satisfaction survey link

**Email Types:**
- `new_ticket` - Admin notification
- `admin_reply` - Customer gets admin response
- `status_change` - Customer gets status update
- `satisfaction_request` - Customer satisfaction survey

### 2. SLA (Service Level Agreement) Tracking

**New Fields Added to `issues` Table:**
- `sla_first_response_deadline` - When first response is due
- `sla_resolution_deadline` - When resolution is due
- `sla_first_response_met` - Boolean: Did we respond in time?
- `sla_resolution_met` - Boolean: Did we resolve in time?

**SLA Targets by Priority:**

| Priority | First Response | Resolution |
|----------|---------------|------------|
| Urgent   | 1 hour        | 4 hours    |
| High     | 4 hours       | 1 day      |
| Medium   | 8 hours       | 3 days     |
| Low      | 24 hours      | 7 days     |

**Automatic Tracking:**
- Deadlines set when ticket created
- Compliance checked when first_response_at or resolved_at updates
- Color-coded visual indicators (green = met, red = breached, yellow = approaching)

### 3. Helper Functions Created

#### `queue_issue_email()`
Manually queue an email:
```sql
SELECT queue_issue_email(
  '123-456-789',  -- issue_id
  'customer@email.com',
  'Customer Name',
  'Subject Line',
  'Email Body',
  'admin_reply'
);
```

#### `get_sla_status(issue_id)`
Get current SLA status for an issue:
```sql
SELECT * FROM get_sla_status('issue-uuid');
-- Returns:
-- first_response_status: 'met', 'breached', or 'pending'
-- first_response_time_remaining: interval
-- resolution_status: 'met', 'breached', or 'pending'
-- resolution_time_remaining: interval
```

#### `get_sla_compliance_stats()`
Get overall SLA performance:
```sql
SELECT * FROM get_sla_compliance_stats();
-- Returns:
-- total_tickets
-- first_response_met_count
-- first_response_breached_count
-- first_response_compliance_rate (%)
-- resolution_met_count
-- resolution_breached_count
-- resolution_compliance_rate (%)
```

## How Emails Work

### The Queue System

Emails aren't sent immediately - they're queued:

1. **Trigger fires** (e.g., admin replies to ticket)
2. **Email added to queue** (`issue_email_queue` table)
3. **External service processes queue** (you need to set this up)
4. **Email sent and marked as sent**

### To Actually Send Emails

You have 3 options:

#### Option A: Supabase Edge Function (Recommended)
Create an Edge Function that:
- Runs every 1 minute (cron job)
- Queries unsent emails: `SELECT * FROM issue_email_queue WHERE sent = false`
- Sends via SendGrid/Mailgun/AWS SES
- Updates: `UPDATE issue_email_queue SET sent = true, sent_at = NOW() WHERE id = ?`

#### Option B: External Cron Job
- Node.js script on your server
- Runs every minute via cron
- Same logic as Option A

#### Option C: Real-time with Database Webhooks
- Supabase Database Webhooks
- Trigger on INSERT into `issue_email_queue`
- Call your email service API

### Email Service Options

**SendGrid** (Easy, generous free tier)
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email.recipient_email,
  from: 'support@greenofig.com',
  subject: email.subject,
  text: email.body
});
```

**Resend** (Modern, developer-friendly)
```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'support@greenofig.com',
  to: email.recipient_email,
  subject: email.subject,
  text: email.body
});
```

## Frontend Enhancements

### Add SLA Indicators to Issues Table

Add this column to show SLA status:

```jsx
<th className="p-4">SLA Status</th>

// In the tbody:
<td className="p-4">
  {issue.sla_first_response_deadline && !issue.first_response_at && (
    <div className="text-xs">
      {Date.now() > new Date(issue.sla_first_response_deadline) ? (
        <Badge className="bg-red-500/20 text-red-300">
          Response Overdue
        </Badge>
      ) : (
        <Badge className="bg-yellow-500/20 text-yellow-300">
          Due in {formatTimeRemaining(issue.sla_first_response_deadline)}
        </Badge>
      )}
    </div>
  )}
</td>
```

### Add SLA Stats to Dashboard

```jsx
const [slaStats, setSlaStats] = useState(null);

const fetchSLAStats = async () => {
  const { data } = await supabase.rpc('get_sla_compliance_stats');
  if (data && data.length > 0) {
    setSlaStats(data[0]);
  }
};

// In render:
{slaStats && (
  <Card className="glass-effect">
    <CardContent className="p-4">
      <div>
        <p className="text-sm text-text-secondary">SLA Compliance</p>
        <p className="text-2xl font-bold text-green-400">
          {slaStats.first_response_compliance_rate || 0}%
        </p>
      </div>
    </CardContent>
  </Card>
)}
```

### Customer Satisfaction Rating

Add to SupportPage.jsx after ticket is marked resolved:

```jsx
const [showRatingModal, setShowRatingModal] = useState(false);
const [ratingIssueId, setRatingIssueId] = useState(null);
const [rating, setRating] = useState(0);

const handleRateIssue = async () => {
  await supabase
    .from('issues')
    .update({ customer_satisfaction_rating: rating })
    .eq('id', ratingIssueId);

  toast({ title: 'Thank you for your feedback!' });
  setShowRatingModal(false);
};

// Show rating prompt for resolved issues:
{issue.status === 'resolved' && !issue.customer_satisfaction_rating && (
  <Button onClick={() => {
    setRatingIssueId(issue.id);
    setShowRatingModal(true);
  }}>
    Rate This Support
  </Button>
)}

// Rating modal:
<Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
  <DialogContent>
    <DialogTitle>Rate Your Support Experience</DialogTitle>
    <div className="flex gap-2 justify-center my-4">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => setRating(star)}
          className={`text-4xl ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
        >
          ★
        </button>
      ))}
    </div>
    <Button onClick={handleRateIssue}>Submit Rating</Button>
  </DialogContent>
</Dialog>
```

## Testing

### Test Email Notifications

1. Create a test ticket as a user
2. Check `issue_email_queue` table:
   ```sql
   SELECT * FROM issue_email_queue WHERE sent = false;
   ```
3. You should see notification emails for admins

4. As admin, reply to the ticket (uncheck "Internal note")
5. Check queue again - should see customer notification

### Test SLA Tracking

1. Create urgent ticket
2. Check SLA deadlines:
   ```sql
   SELECT
     id,
     priority,
     created_at,
     sla_first_response_deadline,
     sla_resolution_deadline
   FROM issues
   WHERE id = 'your-ticket-id';
   ```
3. Check time remaining:
   ```sql
   SELECT * FROM get_sla_status('your-ticket-id');
   ```

### View Overall Performance

```sql
SELECT * FROM get_sla_compliance_stats();
```

## Summary

After applying the SQL, you have:

✅ **Email Queue System** - All notifications queued automatically
✅ **SLA Tracking** - Automatic deadlines and compliance checking
✅ **Performance Metrics** - SLA compliance rate tracking
✅ **Customer Satisfaction** - Database field ready for ratings
✅ **Complete Audit Trail** - All activity logged

## Next Steps

1. **Apply the SQL** - Run `ISSUES_ENHANCEMENTS.sql` in Supabase
2. **Set up email sending** - Choose SendGrid, Resend, or another service
3. **Add SLA indicators** - Update frontend to show SLA status
4. **Add satisfaction ratings** - Let customers rate resolved tickets
5. **Monitor performance** - Use SLA stats to track team performance

## Optional: Auto-Escalation Cron Job

Run this daily to auto-escalate old tickets:

```sql
SELECT auto_escalate_old_issues();
```

This will:
- Escalate medium → high after 3 days
- Escalate high → urgent after 7 days
- Return count of escalated tickets

All done! Your support system is now production-ready with enterprise features! 🎉
