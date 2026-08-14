import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { generateShareUrl } from '../lib/utils';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  type: 'movie' | 'serie';
  id: string | number;
}

export function ShareButton({ title, type, id }: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${generateShareUrl(title, type, id)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `تماشای ${title} در زینگو`,
          url: shareUrl,
        });
        toast.success('محتوا با موفقیت به اشتراک گذاشته شد');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('لینک با موفقیت کپی شد', {
        description: 'لینک در کلیپ‌بورد شما ذخیره شد',
        duration: 3000,
        position: 'top-center',
      });
    } catch (err) {
      toast.error('خطا در کپی لینک', {
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