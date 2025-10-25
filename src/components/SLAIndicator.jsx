import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * SLA Indicator Component
 * Shows visual status of SLA compliance
 */
const SLAIndicator = ({ issue }) => {
  const now = new Date();

  // Calculate first response SLA status
  const getFirstResponseStatus = () => {
    if (!issue.sla_first_response_deadline) return null;

    const deadline = new Date(issue.sla_first_response_deadline);

    if (issue.first_response_at) {
      const responseTime = new Date(issue.first_response_at);
      const met = responseTime <= deadline;

      return {
        status: met ? 'met' : 'breached',
        label: met ? 'Response SLA Met' : 'Response SLA Breached',
        color: met ? 'green' : 'red'
      };
    }

    // No response yet
    const timeRemaining = deadline - now;

    if (timeRemaining < 0) {
      return {
        status: 'breached',
        label: 'Response Overdue',
        color: 'red',
        overdue: true
      };
    }

    // Warning if less than 25% time remaining
    const totalTime = deadline - new Date(issue.created_at);
    const percentRemaining = (timeRemaining / totalTime) * 100;

    if (percentRemaining < 25) {
      return {
        status: 'warning',
        label: formatTimeRemaining(timeRemaining),
        color: 'yellow',
        urgent: true
      };
    }

    return {
      status: 'pending',
      label: formatTimeRemaining(timeRemaining),
      color: 'blue'
    };
  };

  // Calculate resolution SLA status
  const getResolutionStatus = () => {
    if (!issue.sla_resolution_deadline) return null;

    const deadline = new Date(issue.sla_resolution_deadline);

    if (issue.status === 'resolved' || issue.status === 'closed') {
      const resolvedTime = new Date(issue.resolved_at);
      const met = resolvedTime <= deadline;

      return {
        status: met ? 'met' : 'breached',
        label: met ? 'Resolution SLA Met' : 'Resolution SLA Breached',
        color: met ? 'green' : 'red'
      };
    }

    // Not resolved yet
    const timeRemaining = deadline - now;

    if (timeRemaining < 0) {
      return {
        status: 'breached',
        label: 'Resolution Overdue',
        color: 'red',
        overdue: true
      };
    }

    // Warning if less than 25% time remaining
    const totalTime = deadline - new Date(issue.created_at);
    const percentRemaining = (timeRemaining / totalTime) * 100;

    if (percentRemaining < 25) {
      return {
        status: 'warning',
        label: formatTimeRemaining(timeRemaining),
        color: 'orange',
        urgent: true
      };
    }

    return {
      status: 'pending',
      label: formatTimeRemaining(timeRemaining),
      color: 'blue'
    };
  };

  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return `${minutes}m remaining`;
  };

  const getStatusBadge = (statusInfo, type) => {
    if (!statusInfo) return null;

    const colorClasses = {
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };

    const Icon = statusInfo.status === 'met' ? CheckCircle :
                 statusInfo.overdue || statusInfo.urgent ? AlertTriangle :
                 Clock;

    return (
      <Badge className={`${colorClasses[statusInfo.color]} ${statusInfo.urgent ? 'animate-pulse' : ''}`}>
        <Icon className="w-3 h-3 mr-1" />
        {type}: {statusInfo.label}
      </Badge>
    );
  };

  const responseStatus = getFirstResponseStatus();
  const resolutionStatus = getResolutionStatus();

  if (!responseStatus && !resolutionStatus) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {responseStatus && getStatusBadge(responseStatus, 'Response')}
      {resolutionStatus && getStatusBadge(resolutionStatus, 'Resolution')}
    </div>
  );
};

export default SLAIndicator;
