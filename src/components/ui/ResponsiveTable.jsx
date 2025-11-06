import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * ResponsiveTable - Shows table on desktop, cards on mobile
 * Solves the problem of horizontal scrolling on mobile devices
 */
const ResponsiveTable = ({
  data = [],
  columns = [],
  actions = null,
  emptyMessage = "No data available"
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View (≥768px) */}
      <div className="hidden md:block w-full">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="text-left p-3 lg:p-4 text-sm lg:text-base font-semibold text-text-secondary"
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && (
                  <th className="text-right p-3 lg:p-4 text-sm lg:text-base font-semibold text-text-secondary min-w-[180px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-3 lg:p-4 text-sm lg:text-base">
                      {column.render ? column.render(row) : row[column.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-3 lg:p-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (<768px) */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <Card key={index} className="glass-effect">
            <CardContent className="p-4">
              <div className="space-y-3">
                {columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start gap-4">
                    <span className="text-sm font-medium text-text-secondary min-w-[100px]">
                      {column.header}:
                    </span>
                    <span className="text-sm text-foreground flex-1 text-right">
                      {column.render ? column.render(row) : row[column.accessor]}
                    </span>
                  </div>
                ))}

                {/* Actions always visible on mobile */}
                {actions && (
                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                    {actions(row)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ResponsiveTable;
