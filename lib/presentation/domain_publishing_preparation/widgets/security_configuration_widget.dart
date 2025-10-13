import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class SecurityConfigurationWidget extends StatefulWidget {
  final String domain;
  final VoidCallback onRefresh;

  const SecurityConfigurationWidget({
    Key? key,
    required this.domain,
    required this.onRefresh,
  }) : super(key: key);

  @override
  State<SecurityConfigurationWidget> createState() =>
      _SecurityConfigurationWidgetState();
}

class _SecurityConfigurationWidgetState
    extends State<SecurityConfigurationWidget> {
  bool _isLoading = false;

  final List<Map<String, dynamic>> _securityChecks = [
    {
      'title': 'SSL Certificate',
      'status': 'passed',
      'description': 'Valid TLS 1.3 certificate installed',
      'icon': 'security',
      'details': 'Let\'s Encrypt certificate valid until April 2025',
    },
    {
      'title': 'HTTPS Redirect',
      'status': 'passed',
      'description': 'All HTTP traffic redirected to HTTPS',
      'icon': 'lock',
      'details': '301 permanent redirects configured',
    },
    {
      'title': 'Security Headers',
      'status': 'warning',
      'description': 'Most security headers configured',
      'icon': 'shield',
      'details': 'Missing Content Security Policy (CSP) header',
    },
    {
      'title': 'DDoS Protection',
      'status': 'passed',
      'description': 'Advanced DDoS protection enabled',
      'icon': 'security_update_good',
      'details': 'Cloudflare protection active',
    },
    {
      'title': 'Malware Scanning',
      'status': 'passed',
      'description': 'Daily malware scans active',
      'icon': 'virus_scan',
      'details': 'Last scan: 2 hours ago - Clean',
    },
    {
      'title': 'Firewall Configuration',
      'status': 'passed',
      'description': 'Web Application Firewall active',
      'icon': 'firewall',
      'details': 'Rules updated and blocking threats',
    },
  ];

  final List<Map<String, dynamic>> _complianceChecks = [
    {
      'standard': 'GDPR',
      'status': 'compliant',
      'description': 'EU General Data Protection Regulation',
      'requirements': [
        'Privacy Policy implemented',
        'Cookie consent banner active',
        'Data export functionality',
        'Right to deletion implemented',
      ],
    },
    {
      'standard': 'CCPA',
      'status': 'compliant',
      'description': 'California Consumer Privacy Act',
      'requirements': [
        'Do Not Sell disclosure',
        'Consumer request portal',
        'Privacy rights information',
      ],
    },
    {
      'standard': 'SOC 2',
      'status': 'in_progress',
      'description': 'Service Organization Control 2',
      'requirements': [
        'Security controls documented',
        'Access logging implemented',
        'Audit trail maintenance',
        'Third-party assessment pending',
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Security Score Overview
        _buildSecurityOverview(theme),

        SizedBox(height: 3.h),

        // Security Checks
        _buildSecurityChecks(theme),

        SizedBox(height: 3.h),

        // Security Headers Analysis
        _buildSecurityHeaders(theme),

        SizedBox(height: 3.h),

        // Compliance Status
        _buildComplianceStatus(theme),

        SizedBox(height: 3.h),

        // Vulnerability Assessment
        _buildVulnerabilityAssessment(theme),
      ],
    );
  }

  Widget _buildSecurityOverview(ThemeData theme) {
    final securityScore = 88;
    final scoreColor = _getScoreColor(securityScore);

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            scoreColor.withAlpha(26),
            scoreColor.withAlpha(13),
          ],
        ),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: scoreColor.withAlpha(77),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 18.w,
            height: 18.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: scoreColor,
                width: 4,
              ),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CustomIconWidget(
                    iconName: 'security',
                    color: scoreColor,
                    size: 8.w,
                  ),
                  Text(
                    '$securityScore%',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w700,
                      color: scoreColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(width: 6.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Security Rating',
                  style: GoogleFonts.inter(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                SizedBox(height: 1.h),
                Text(
                  '${widget.domain} has strong security configurations with minor improvements needed.',
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w400,
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 2.h),
                Row(
                  children: [
                    _buildSecurityBadge('SSL', Colors.green, theme),
                    SizedBox(width: 2.w),
                    _buildSecurityBadge('HTTPS', Colors.green, theme),
                    SizedBox(width: 2.w),
                    _buildSecurityBadge('WAF', Colors.green, theme),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: _refreshSecurityStatus,
            icon: _isLoading
                ? SizedBox(
                    width: 5.w,
                    height: 5.w,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                    ),
                  )
                : Icon(
                    Icons.refresh,
                    color: scoreColor,
                    size: 6.w,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecurityBadge(String label, Color color, ThemeData theme) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
      decoration: BoxDecoration(
        color: color.withAlpha(26),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: color.withAlpha(77),
        ),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 10.sp,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  Widget _buildSecurityChecks(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'verified_user',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Security Checks',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const Spacer(),
              Text(
                '5/6 Passed',
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.green,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          ..._securityChecks
              .map((check) => _buildSecurityCheckItem(check, theme))
              .toList(),
        ],
      ),
    );
  }

  Widget _buildSecurityCheckItem(Map<String, dynamic> check, ThemeData theme) {
    Color statusColor;
    IconData statusIcon;

    switch (check['status']) {
      case 'passed':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'warning':
        statusColor = Colors.orange;
        statusIcon = Icons.warning;
        break;
      default:
        statusColor = Colors.red;
        statusIcon = Icons.error;
    }

    return Container(
      margin: EdgeInsets.only(bottom: 2.h),
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: statusColor.withAlpha(77),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(2.w),
            decoration: BoxDecoration(
              color: statusColor.withAlpha(26),
              shape: BoxShape.circle,
            ),
            child: CustomIconWidget(
              iconName: check['icon'],
              color: statusColor,
              size: 6.w,
            ),
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        check['title'],
                        style: GoogleFonts.inter(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                    Icon(
                      statusIcon,
                      color: statusColor,
                      size: 5.w,
                    ),
                  ],
                ),
                SizedBox(height: 0.5.h),
                Text(
                  check['description'],
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w400,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                if (check['details'] != null) ...[
                  SizedBox(height: 1.h),
                  Text(
                    check['details'],
                    style: GoogleFonts.inter(
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w500,
                      color: statusColor,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecurityHeaders(ThemeData theme) {
    final List<Map<String, dynamic>> headers = [
      {
        'header': 'Strict-Transport-Security',
        'status': 'present',
        'value': 'max-age=31536000; includeSubDomains',
      },
      {
        'header': 'X-Frame-Options',
        'status': 'present',
        'value': 'DENY',
      },
      {
        'header': 'X-Content-Type-Options',
        'status': 'present',
        'value': 'nosniff',
      },
      {
        'header': 'Referrer-Policy',
        'status': 'present',
        'value': 'strict-origin-when-cross-origin',
      },
      {
        'header': 'Content-Security-Policy',
        'status': 'missing',
        'value': 'Not configured',
      },
    ];

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'http',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Security Headers',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Container(
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: headers
                  .map((header) => _buildHeaderItem(header, theme))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderItem(Map<String, dynamic> header, ThemeData theme) {
    final isPresent = header['status'] == 'present';
    final statusColor = isPresent ? Colors.green : Colors.red;

    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: theme.colorScheme.outline.withAlpha(51),
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 3.w,
            height: 3.w,
            decoration: BoxDecoration(
              color: statusColor,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: 3.w),
          Expanded(
            flex: 2,
            child: Text(
              header['header'],
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              header['value'],
              style: GoogleFonts.inter(
                fontSize: 10.sp,
                fontWeight: FontWeight.w400,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComplianceStatus(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'gavel',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Compliance Status',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          ..._complianceChecks
              .map((compliance) => _buildComplianceItem(compliance, theme))
              .toList(),
        ],
      ),
    );
  }

  Widget _buildComplianceItem(
      Map<String, dynamic> compliance, ThemeData theme) {
    Color statusColor;
    String statusText;

    switch (compliance['status']) {
      case 'compliant':
        statusColor = Colors.green;
        statusText = 'Compliant';
        break;
      case 'in_progress':
        statusColor = Colors.orange;
        statusText = 'In Progress';
        break;
      default:
        statusColor = Colors.red;
        statusText = 'Non-compliant';
    }

    return Container(
      margin: EdgeInsets.only(bottom: 3.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: statusColor.withAlpha(26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: statusColor.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      compliance['standard'],
                      style: GoogleFonts.inter(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    Text(
                      compliance['description'],
                      style: GoogleFonts.inter(
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
                decoration: BoxDecoration(
                  color: statusColor,
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Text(
                  statusText,
                  style: GoogleFonts.inter(
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          ...compliance['requirements']
              .map<Widget>((req) => Padding(
                    padding: EdgeInsets.only(bottom: 1.h),
                    child: Row(
                      children: [
                        Container(
                          padding: EdgeInsets.all(1.w),
                          decoration: BoxDecoration(
                            color: statusColor.withAlpha(26),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.check,
                            color: statusColor,
                            size: 3.w,
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Text(
                            req,
                            style: GoogleFonts.inter(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.w500,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ))
              .toList(),
        ],
      ),
    );
  }

  Widget _buildVulnerabilityAssessment(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'bug_report',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Vulnerability Assessment',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Row(
            children: [
              Expanded(
                child:
                    _buildVulnerabilityCard('Critical', 0, Colors.red, theme),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildVulnerabilityCard('High', 1, Colors.orange, theme),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child:
                    _buildVulnerabilityCard('Medium', 3, Colors.yellow, theme),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildVulnerabilityCard('Low', 2, Colors.blue, theme),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: Colors.green.withAlpha(26),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.green.withAlpha(77),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.security, color: Colors.green, size: 5.w),
                SizedBox(width: 3.w),
                Expanded(
                  child: Text(
                    'Last security scan: 6 hours ago\nNext automated scan: In 18 hours',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
                      color: Colors.green,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVulnerabilityCard(
      String severity, int count, Color color, ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: color.withAlpha(26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(77),
        ),
      ),
      child: Column(
        children: [
          Text(
            count.toString(),
            style: GoogleFonts.inter(
              fontSize: 20.sp,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          Text(
            severity,
            style: GoogleFonts.inter(
              fontSize: 11.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 90) return Colors.green;
    if (score >= 70) return Colors.orange;
    return Colors.red;
  }

  void _refreshSecurityStatus() async {
    setState(() => _isLoading = true);

    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isLoading = false);
      widget.onRefresh();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Security status refreshed for ${widget.domain}'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}
