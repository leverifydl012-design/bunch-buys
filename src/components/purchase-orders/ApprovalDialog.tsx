import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poId: string;
  poNumber: string;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
  isLoading?: boolean;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  poNumber,
  onApprove,
  onReject,
  isLoading,
}: ApprovalDialogProps) {
  const [notes, setNotes] = useState('');

  const handleApprove = () => {
    onApprove(notes);
    setNotes('');
  };

  const handleReject = () => {
    onReject(notes);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Purchase Order {poNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Comments (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this approval..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="gap-2 bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
