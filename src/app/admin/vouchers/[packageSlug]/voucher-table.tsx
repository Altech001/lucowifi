
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Voucher } from '@/lib/definitions';
import { useFormState } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { addVoucherAction, updateVoucherAction, deleteVoucherAction } from '@/app/actions';

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
import { Checkbox } from '@/components/ui/checkbox';
import { SubmitButton } from '@/components/submit-button';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

type VoucherTableProps = {
  vouchers: Voucher[];
  packageSlug: string;
};

const initialState = {
    message: '',
    success: false,
};

export function VoucherTable({ vouchers, packageSlug }: VoucherTableProps) {
  const [filter, setFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  const { toast } = useToast();

  const [addState, addFormAction] = useFormState(addVoucherAction, initialState);
  const [updateState, updateFormAction] = useFormState(updateVoucherAction, initialState);
  const [deleteState, deleteFormAction] = useFormState(deleteVoucherAction, initialState);
  
  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) =>
      v.code.toLowerCase().includes(filter.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [vouchers, filter]);

  useEffect(() => {
    if(addState.message) {
        toast({ variant: addState.success ? 'default' : 'destructive', title: addState.success ? 'Success' : 'Error', description: addState.message });
        if(addState.success) setIsAddDialogOpen(false);
    }
  }, [addState, toast]);

   useEffect(() => {
    if(updateState.message) {
        toast({ variant: updateState.success ? 'default' : 'destructive', title: updateState.success ? 'Success' : 'Error', description: updateState.message });
        if(updateState.success) setIsEditDialogOpen(false);
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

      <div className="border rounded-lg w-full">
        <div className="relative w-full overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead>Voucher Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono">{voucher.code}</TableCell>
                    <TableCell>
                      <Badge variant={voucher.used ? 'destructive' : 'secondary'}>
                        {voucher.used ? 'Used' : 'Unused'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {format(new Date(voucher.createdAt), "dd MMM yyyy, HH:mm")}
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
                                        <AlertDialogAction asChild>
                                           <SubmitButton variant="destructive">Delete</SubmitButton>
                                        </AlertDialogAction>
                                    </form>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No vouchers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Voucher</DialogTitle>
                    <DialogDescription>
                        Update the voucher code or its usage status.
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
                        <div className="flex items-center space-x-2">
                            <Checkbox id="used" name="used" defaultChecked={selectedVoucher.used} />
                            <Label htmlFor="used">Mark as used</Label>
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
