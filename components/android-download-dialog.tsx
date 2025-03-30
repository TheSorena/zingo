'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Download, Smartphone, Chrome, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import Image from "next/image";
import { isChromeBrowser } from "../lib/utils";

interface AndroidDownloadDialogProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  onChromeDownload?: (url: string) => void;
}

export function AndroidDownloadDialog({ 
  url, 
  isOpen, 
  onClose, 
  onChromeDownload 
}: AndroidDownloadDialogProps) {
  const handleDownloadWithADM = () => {
    // ADM app uses this URL scheme
    window.location.href = `intent:${url}#Intent;package=com.dv.adm;end`;
    setTimeout(onClose, 500);
  };

  const handleDownloadWithBrowser = () => {
    // First check if Chrome browser and handle accordingly
    if (isChromeBrowser() && onChromeDownload) {
      // Close this dialog first
      onClose();
      
      // Then trigger the Chrome download handler
      setTimeout(() => {
        if (onChromeDownload) onChromeDownload(url);
      }, 100);
      return;
    }
    
    // For non-Chrome browsers, close the dialog and proceed with download
    onClose();
    
    // Small delay to ensure dialog closes first
    setTimeout(() => {
      // For other browsers, use default download mechanism
      const link = document.createElement('a');
      link.href = url;
      link.download = ''; // This forces download behavior
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  };

  const openPlayStore = () => {
    window.open('https://play.google.com/store/apps/details?id=com.dv.adm', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold">دانلود با چه برنامه‌ای؟</DialogTitle>
          <DialogDescription className="text-right mt-4">
            برای دانلود این فایل می‌توانید از یکی از روش‌های زیر استفاده کنید:
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 mt-5">
          <Button 
            onClick={handleDownloadWithADM}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 h-14 text-base text-white"
          >
            <Smartphone className="h-6 w-6" />
            <span>دانلود با ADM</span>
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            ADM (Advanced Download Manager) یک برنامه مدیریت دانلود قدرتمند برای اندروید است
            <button 
              onClick={openPlayStore} 
              className="text-primary block mx-auto mt-1 flex items-center gap-1 justify-center"
            >
              <ExternalLink className="h-3 w-3" />
              <span>دانلود ADM از گوگل پلی</span>
            </button>
          </div>
          
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                یا
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleDownloadWithBrowser}
            variant="outline"
            className="flex items-center gap-3 h-14 text-base"
          >
            <Chrome className="h-6 w-6" />
            <span>دانلود با مرورگر</span>
          </Button>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} className="w-full">
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 