import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChannelConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  channelName: string;
  channelId: string;
  selectedCountry: string;
}

export function ChannelConfirmDialog({
  isOpen,
  onOpenChange,
  channelName,
  channelId,
  selectedCountry
}: ChannelConfirmDialogProps) {
  const router = useRouter();

  const handleWatchLive = () => {
    router.push(`/live/${channelId}?c=${selectedCountry}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            <div className="flex items-center justify-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              {channelName}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            آیا می‌خواهید به تماشای پخش زنده این کانال بروید؟
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0 mx-auto">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            انصراف
          </Button>
          <Button
            variant="default"
            onClick={handleWatchLive}
            className="flex-1 sm:flex-none"
          >
            تماشای پخش زنده
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 