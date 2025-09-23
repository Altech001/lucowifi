
'use client';

import { useState, useMemo } from 'react';
import type { Voucher } from '@/lib/definitions';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';

type ActiveVoucher = Voucher & {
    packageName: string;
    packageDurationHours: number;
    expiry: string | null;
}

type ActiveVouchersTableProps = {
  vouchers: ActiveVoucher[];
};

export function ActiveVouchersTable({ vouchers }: ActiveVouchersTableProps) {
  const [filter, setFilter] = useState('');

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) =>
      v.code.toLowerCase().includes(filter.toLowerCase()) ||
      v.purchasedBy?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [vouchers, filter]);

  const handleExport = () => {
    const headers = ['phoneNumber'];
    const rows = filteredVouchers.map(v => [v.purchasedBy || '']);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(',') + "\n" 
        + rows.map(e => e.join(',')).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "active_vouchers_export.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by code or phone number..."
            className="pl-9"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Button onClick={handleExport} disabled={filteredVouchers.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
      </div>

      <div className="border rounded-lg w-full max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead>Voucher Code</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono">{voucher.code}</TableCell>
                    <TableCell>{voucher.purchasedBy}</TableCell>
                    <TableCell>{voucher.packageName}</TableCell>
                    <TableCell>{voucher.expiry}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No active vouchers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
