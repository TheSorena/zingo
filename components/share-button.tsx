import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  type: 'movie' | 'serie';
  id: string | number;
}

export function ShareButton({ title }: ShareButtonProps) {
  const handleShare = async () => {
    const shareText = `تماشای ${title} در زینگو`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
        });
        toast.success('محتوا با موفقیت به اشتراک گذاشته شد');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('متن با موفقیت کپی شد', {
        description: 'متن در کلیپ‌بورد شما ذخیره شد',
        duration: 3000,
        position: 'top-center',
      });
    } catch (err) {
      toast.error('خطا در کپی متن', {
        description: 'لطفاً دوباره تلاش کنید',
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="ghost"
      size="icon"
      className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
    >
      <Share2 className="h-5 w-5" />
    </Button>
  );
}