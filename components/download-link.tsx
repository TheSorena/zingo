'use client';

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { isChromeBrowser, getDownloadMessage } from "../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";

interface DownloadLinkProps {
  url: string;
  type: string;
  quality: string | null;
}

export function DownloadLink({ url, type, quality }: DownloadLinkProps) {
  const [showAlert, setShowAlert] = useState(false);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("لینک با موفقیت کپی شد", {
        description: "لینک در کلیپ‌بورد شما ذخیره شد",
        duration: 3000,
        position: "top-center",
        className: "bg-green-500/10 border-green-500/20 text-green-500",
        icon: <Copy className="w-5 h-5" />,
      });
    } catch (err) {
      toast.error("خطا در کپی لینک", {
        description: "لطفاً دوباره تلاش کنید",
        duration: 3000,
        position: "top-center",
        className: "bg-red-500/10 border-red-500/20 text-red-500",
      });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isChromeBrowser()) {
      setShowAlert(true);
      return;
    }

    // Create a hidden anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = ''; // This forces download behavior
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex gap-2">
        <a
          href={url}
          onClick={handleDownload}
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
        >
          <span>دانلود {type && `(${type})`}</span>
          {quality && (
            <Badge variant="outline">{quality}</Badge>
          )}
        </a>
        <Button className="flex-2">
          <a href={'vlc://' + url}>
         VLC تماشا با
          </a>
        </Button>

        <Button
          onClick={() => copyToClipboard(url)}
          variant="outline"
          className="px-3"
          title="Copy link / کپی لینک"
        >
          <Copy className="h-4 w-4" />
        </Button>

      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">دانلود در مرورگر کروم</AlertDialogTitle>
            <AlertDialogDescription className="text-right whitespace-pre-line mt-4 leading-relaxed">
              {getDownloadMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogAction 
              onClick={() => {
                copyToClipboard(url);
                setShowAlert(false);
              }}
              className="w-full sm:w-auto"
            >
              کپی لینک دانلود
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 