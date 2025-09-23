
'use client';

import { useState, useMemo, useEffect, useRef, useActionState } from 'react';
import type { Voucher } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { addVoucherAction, updateVoucherAction, deleteVoucherAction } from '@/app/actions';
import { getVoucherStatus } from '@/lib/database-data';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type VoucherTableProps = {
  vouchers: Voucher[];
  packageSlug: string;
};

const initialState = {
    message: '',
    success: false,
};

function FormattedDate({ dateString }: { dateString: string | undefined }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if (dateString) {
            try {
                const date = parseISO(dateString);
                setFormattedDate(format(date, "dd MMM yyyy, HH:mm"));
            } catch (error) {
                setFormattedDate("Invalid Date");
            }
        } else {
            setFormattedDate(null);
        }
    }, [dateString]);
    
    if (!dateString) return <span className="text-muted-foreground/50">N/A</span>;

    return <>{formattedDate || '...'}</>;
}


export function VoucherTable({ vouchers, packageSlug }: VoucherTableProps) {
  const [filter, setFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  const { toast } = useToast();

  const [addState, addFormAction] = useActionState(addVoucherAction, initialState);
  const [updateState, updateFormAction] = useActionState(updateVoucherAction, initialState);
  const [deleteState, deleteFormAction] = useActionState(deleteVoucherAction, initialState);
  
  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) =>
      v.code.toLowerCase().includes(filter.toLowerCase())
    ).sort((a, b) => {
        const dateA = a.createdAt ? parseISO(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? parseISO(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
  }, [vouchers, filter]);

  useEffect(() => {
    if(addState.message) {
        toast({ variant: addState.success ? 'default' : 'destructive', title: addState.success ? 'Success' : 'Error', description: addState.message });
        if(addState.success) {
            setIsAddDialogOpen(false);
            addFormRef.current?.reset();
        }
    }
  }, [addState, toast]);

   useEffect(() => {
    if(updateState.message) {
        toast({ variant: updateState.success ? 'default' : 'destructive', title: updateState.success ? 'Success' : 'Error', description: updateState.message });
        if(updateState.success) {
            setIsEditDialogOpen(false);
            editFormRef.current?.reset();
        };
    }
  }, [updateState, toast]);

  useEffect(() => {
    if(deleteState.message) {
        toast({ variant: deleteState.success ? 'default' : 'destructive', title: deleteState.success ? 'Success' : 'Error', description: deleteState.message });
    }
  }, [deleteState, toast]);

  const openEditDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsEditDialogOpen(true);
  }
  
  const getStatusBadge = (status: Voucher['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'Available':
        return <Badge variant="outline">Available</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by voucher code..."
            className="pl-9"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Voucher
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Voucher</DialogTitle>
                    <DialogDescription>
                        Enter the code for the new voucher. It will be added to this package.
                    </DialogDescription>
                </DialogHeader>
                <form ref={addFormRef} action={addFormAction} className="space-y-4">
                    <input type="hidden" name="packageSlug" value={packageSlug} />
                    <div>
                        <Label htmlFor="voucherCode">Voucher Code</Label>
                        <Input id="voucherCode" name="voucherCode" required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <SubmitButton>Add Voucher</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg w-full max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead>Voucher Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Activated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono">{voucher.code}</TableCell>
                    <TableCell>
                      {getStatusBadge(voucher.status)}
                    </TableCell>
                    <TableCell>
                        <FormattedDate dateString={voucher.createdAt} />
                    </TableCell>
                    <TableCell>
                        <FormattedDate dateString={voucher.usedAt} />
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => openEditDialog(voucher)}>
                           <Edit className="h-4 w-4" />
                           <span className="sr-only">Edit</span>
                       </Button>
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                   <Trash2 className="h-4 w-4" />
                                   <span className="sr-only">Delete</span>
                               </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the voucher <span className="font-mono font-bold">{voucher.code}</span>. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <form action={deleteFormAction}>
                                        <input type="hidden" name="packageSlug" value={packageSlug} />
                                        <input type="hidden" name="voucherId" value={voucher.id} />
                                        <SubmitButton variant="destructive">Delete</SubmitButton>
                                    </form>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No vouchers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Voucher</DialogTitle>
                    <DialogDescription>
                        Update the voucher code or its activation date.
                    </DialogDescription>
                </DialogHeader>
                {selectedVoucher && (
                     <form ref={editFormRef} action={updateFormAction} className="space-y-4">
                        <input type="hidden" name="packageSlug" value={packageSlug} />
                        <input type="hidden" name="voucherId" value={selectedVoucher.id} />
                        <div>
                            <Label htmlFor="editVoucherCode">Voucher Code</Label>
                            <Input id="editVoucherCode" name="voucherCode" defaultValue={selectedVoucher.code} required />
                        </div>
                        <div>
                            <Label htmlFor="usedAt">Activation Date (leave blank to clear)</Label>
                            <Input id="usedAt" name="usedAt" defaultValue={selectedVoucher.usedAt || ''} placeholder="YYYY-MM-DDTHH:mm:ss.sssZ" />
                             <p className="text-sm text-muted-foreground">Setting or changing this will reset the voucher's timer.</p>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <SubmitButton>Save Changes</SubmitButton>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
