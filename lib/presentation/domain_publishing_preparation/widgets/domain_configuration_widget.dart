import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class DomainConfigurationWidget extends StatefulWidget {
  final String domain;
  final String hostingProvider;
  final bool isConfigured;
  final VoidCallback onRefresh;

  const DomainConfigurationWidget({
    Key? key,
    required this.domain,
    required this.hostingProvider,
    required this.isConfigured,
    required this.onRefresh,
  }) : super(key: key);

  @override
  State<DomainConfigurationWidget> createState() =>
      _DomainConfigurationWidgetState();
}

class _DomainConfigurationWidgetState extends State<DomainConfigurationWidget> {
  bool _isLoading = false;

  final List<Map<String, dynamic>> _dnsRecords = [
    {
      'type': 'A',
      'name': '@',
      'value': '185.199.108.153',
      'status': 'active',
      'description': 'Main domain pointing to server'
    },
    {
      'type': 'CNAME',
      'name': 'www',
      'value': 'greenofig.com',
      'status': 'active',
      'description': 'WWW subdomain redirect'
    },
    {
      'type': 'MX',
      'name': '@',
      'value': 'mail.greenofig.com',
      'status': 'active',
      'description': 'Email routing configuration'
    },
    {
      'type': 'TXT',
      'name': '@',
      'value': 'v=spf1 include:_spf.hostinger.com ~all',
      'status': 'active',
      'description': 'SPF email validation'
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Domain Status Header
        _buildDomainStatusHeader(theme),

        SizedBox(height: 3.h),

        // DNS Configuration
        _buildDNSConfiguration(theme),

        SizedBox(height: 3.h),

        // SSL Certificate Status
        _buildSSLStatus(theme),

        SizedBox(height: 3.h),

        // CDN Configuration
        _buildCDNConfiguration(theme),

        SizedBox(height: 3.h),

        // Hosting Details
        _buildHostingDetails(theme),
      ],
    );
  }

  Widget _buildDomainStatusHeader(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.green.withAlpha(26),
            Colors.green.withAlpha(13),
          ],
        ),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: Colors.green.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: Colors.green.withAlpha(26),
                  shape: BoxShape.circle,
                ),
                child: CustomIconWidget(
                  iconName: 'public',
                  color: Colors.green,
                  size: 8.w,
                ),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.domain,
                      style: GoogleFonts.inter(
                        fontSize: 24.sp,
                        fontWeight: FontWeight.w800,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 2.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '🟢 LIVE & ACTIVE',
                        style: GoogleFonts.inter(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: _refreshDomainStatus,
                icon: _isLoading
                    ? SizedBox(
                        width: 5.w,
                        height: 5.w,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.green),
                        ),
                      )
                    : Icon(
                        Icons.refresh,
                        color: Colors.green,
                        size: 6.w,
                      ),
              ),
            ],
          ),

          SizedBox(height: 3.h),

          // Quick Stats
          Row(
            children: [
              _buildStatItem(
                  'Uptime', '99.9%', Icons.trending_up, Colors.green, theme),
              SizedBox(width: 6.w),
              _buildStatItem(
                  'Response', '145ms', Icons.speed, Colors.blue, theme),
              SizedBox(width: 6.w),
              _buildStatItem(
                  'SSL', 'Active', Icons.security, Colors.orange, theme),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
      String label, String value, IconData icon, Color color, ThemeData theme) {
    return Column(
      children: [
        Container(
          padding: EdgeInsets.all(2.w),
          decoration: BoxDecoration(
            color: color.withAlpha(26),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: color,
            size: 5.w,
          ),
        ),
        SizedBox(height: 1.h),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 14.sp,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11.sp,
            fontWeight: FontWeight.w500,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildDNSConfiguration(ThemeData theme) {
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
                iconName: 'dns',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'DNS Configuration',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const Spacer(),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: Colors.green.withAlpha(26),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'Configured',
                  style: GoogleFonts.inter(
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.green,
                  ),
                ),
              ),
            ],
          ),

          SizedBox(height: 3.h),

          // DNS Records Table
          Container(
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                // Table Header
                Container(
                  padding: EdgeInsets.all(3.w),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withAlpha(26),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(12),
                      topRight: Radius.circular(12),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                          flex: 2,
                          child: Text('Type',
                              style: GoogleFonts.inter(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w700))),
                      Expanded(
                          flex: 3,
                          child: Text('Name',
                              style: GoogleFonts.inter(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w700))),
                      Expanded(
                          flex: 4,
                          child: Text('Value',
                              style: GoogleFonts.inter(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w700))),
                      Expanded(
                          flex: 2,
                          child: Text('Status',
                              style: GoogleFonts.inter(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w700))),
                    ],
                  ),
                ),

                // DNS Records
                ..._dnsRecords
                    .map((record) => Container(
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
                              Expanded(
                                flex: 2,
                                child: Container(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 2.w, vertical: 0.5.h),
                                  decoration: BoxDecoration(
                                    color: _getDNSTypeColor(record['type'])
                                        .withAlpha(26),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    record['type'],
                                    style: GoogleFonts.inter(
                                      fontSize: 10.sp,
                                      fontWeight: FontWeight.w700,
                                      color: _getDNSTypeColor(record['type']),
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                              Expanded(
                                  flex: 3,
                                  child: Text(record['name'],
                                      style: GoogleFonts.inter(
                                          fontSize: 11.sp,
                                          fontWeight: FontWeight.w500))),
                              Expanded(
                                flex: 4,
                                child: Text(
                                  record['value'],
                                  style: GoogleFonts.inter(
                                      fontSize: 10.sp,
                                      color:
                                          theme.colorScheme.onSurfaceVariant),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Row(
                                  children: [
                                    Container(
                                      width: 2.w,
                                      height: 2.w,
                                      decoration: BoxDecoration(
                                        color: Colors.green,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    SizedBox(width: 2.w),
                                    Text(
                                      'Active',
                                      style: GoogleFonts.inter(
                                        fontSize: 10.sp,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSSLStatus(ThemeData theme) {
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
                iconName: 'security',
                color: Colors.green,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'SSL Certificate',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const Spacer(),
              Container(
                padding: EdgeInsets.all(2.w),
                decoration: BoxDecoration(
                  color: Colors.green.withAlpha(26),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.verified,
                  color: Colors.green,
                  size: 5.w,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Row(
            children: [
              Expanded(
                child: _buildSSLDetail('Issuer', 'Let\'s Encrypt', theme),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: _buildSSLDetail('Valid Until', '2025-04-13', theme),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          Row(
            children: [
              Expanded(
                child: _buildSSLDetail('Encryption', 'TLS 1.3', theme),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: _buildSSLDetail('Auto Renewal', 'Enabled', theme),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSSLDetail(String label, String value, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12.sp,
            fontWeight: FontWeight.w500,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        SizedBox(height: 0.5.h),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ],
    );
  }

  Widget _buildCDNConfiguration(ThemeData theme) {
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
                iconName: 'cloud',
                color: Colors.blue,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'CDN & Caching',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const Spacer(),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: Colors.blue.withAlpha(26),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'Active',
                  style: GoogleFonts.inter(
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.blue,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Row(
            children: [
              Expanded(
                child:
                    _buildCDNStat('Cache Hit Rate', '94%', Colors.green, theme),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child:
                    _buildCDNStat('Edge Locations', '180+', Colors.blue, theme),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child:
                    _buildCDNStat('Avg Response', '42ms', Colors.orange, theme),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCDNStat(
      String label, String value, Color color, ThemeData theme) {
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
            value,
            style: GoogleFonts.inter(
              fontSize: 18.sp,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          SizedBox(height: 0.5.h),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11.sp,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildHostingDetails(ThemeData theme) {
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
                iconName: 'cloud_queue',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Hosting Configuration',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          ...[
            {'label': 'Hosting Provider', 'value': widget.hostingProvider},
            {'label': 'Server Location', 'value': 'Amsterdam, Netherlands'},
            {'label': 'PHP Version', 'value': '8.2'},
            {'label': 'MySQL Version', 'value': '8.0'},
            {'label': 'Storage Used', 'value': '2.4 GB / 100 GB'},
            {'label': 'Bandwidth Used', 'value': '45.2 GB / Unlimited'},
            {'label': 'Daily Backups', 'value': 'Enabled'},
            {'label': 'Malware Scanning', 'value': 'Active'},
          ]
              .map((detail) => Padding(
                    padding: EdgeInsets.only(bottom: 2.h),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          detail['label']!,
                          style: GoogleFonts.inter(
                            fontSize: 13.sp,
                            fontWeight: FontWeight.w500,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        Text(
                          detail['value']!,
                          style: GoogleFonts.inter(
                            fontSize: 13.sp,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onSurface,
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

  Color _getDNSTypeColor(String type) {
    switch (type) {
      case 'A':
        return Colors.blue;
      case 'CNAME':
        return Colors.green;
      case 'MX':
        return Colors.orange;
      case 'TXT':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  void _refreshDomainStatus() async {
    setState(() => _isLoading = true);

    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isLoading = false);
      widget.onRefresh();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Domain status refreshed for ${widget.domain}'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}
