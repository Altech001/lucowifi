
'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Membership } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { approveMembershipAction, rejectMembershipAction } from '@/app/actions';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type MembersTableProps = {
  members: Membership[];
};

export function MembersTable({ members }: MembersTableProps) {
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [memberToReject, setMemberToReject] = useState<Membership | null>(null);

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) =>
        m.name.toLowerCase().includes(filter.toLowerCase()) ||
        m.username.toLowerCase().includes(filter.toLowerCase()) ||
        m.phoneNumber.includes(filter)
      )
      .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
  }, [members, filter]);

  const viewDocument = (dataUri: string) => {
    if (!dataUri) return;
    if (dataUri.startsWith('data:image/')) {
        const newWindow = window.open();
        newWindow?.document.write(`<img src="${dataUri}" style="max-width: 100%; height: auto;" />`);
        newWindow?.document.title = "Document Preview";
    } 
    else if (dataUri.startsWith('data:application/pdf')) {
         const newWindow = window.open();
         newWindow?.document.write(`<iframe src="${dataUri}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
         newWindow?.document.title = "Document Preview";
    }
    else {
        window.open(dataUri, '_blank');
    }
  }

  const getStatusBadge = (status: Membership['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleAction = (action: 'approve' | 'reject', memberId: string) => {
    startTransition(async () => {
        const serverAction = action === 'approve' ? approveMembershipAction : rejectMembershipAction;
        const result = await serverAction(memberId);
        toast({
            variant: result.success ? 'default' : 'destructive',
            title: result.success ? 'Success' : 'Error',
            description: result.message
        });
        if (action === 'reject') {
            setMemberToReject(null);
        }
    });
  }


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, username, or phone..."
            className="pl-9"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg w-full">
        <div className="relative w-full overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
              )}
              {!isPending && filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium whitespace-nowrap">{member.name}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm">{member.phoneNumber}</span>
                        </div>
                    </TableCell>
                    <TableCell>{member.username}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(parseISO(member.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                 <DropdownMenuItem
                                    onClick={() => viewDocument(member.documentDataUri!)}
                                    disabled={!member.documentDataUri || isPending}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Document
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 {member.status === 'pending' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleAction('approve', member.id)} disabled={isPending}>
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                            Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setMemberToReject(member)} disabled={isPending}>
                                             <XCircle className="mr-2 h-4 w-4" />
                                             Reject
                                        </DropdownMenuItem>
                                    </>
                                 )}
                                 {member.status === 'rejected' && (
                                    <DropdownMenuItem onClick={() => handleAction('approve', member.id)} disabled={isPending}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                        Re-Approve
                                    </DropdownMenuItem>
                                 )}
                                 {member.status === 'approved' && (
                                     <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setMemberToReject(member)} disabled={isPending}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                 )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 !isPending && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No members found.
                      </TableCell>
                    </TableRow>
                 )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {memberToReject && (
        <AlertDialog open={!!memberToReject} onOpenChange={() => setMemberToReject(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to reject this membership?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will mark the application for <strong>{memberToReject.name}</strong> as rejected. This can be undone later.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={() => handleAction('reject', memberToReject.id)} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm Rejection
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
