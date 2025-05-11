import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Globe, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '../../components/ui/input';
import { countries } from '../config/countries';

interface CountryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentCountry: string;
}

export function CountryDialog({ isOpen, onOpenChange, currentCountry }: CountryDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-center text-2xl mb-4">انتخاب منطقه</DialogTitle>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="جستجوی کشور..."
              className="w-full pl-4 pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-2">
            {filteredCountries.map((country) => (
              <Link 
                key={country.code}
                href={window.location.pathname + (window.location.pathname.includes('?') ? '&' : '?') + `c=${country.code}`}
                onClick={() => onOpenChange(false)}
              >
                <div className={`flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer
                  ${currentCountry === country.code ? 
                    'bg-primary text-primary-foreground' : 
                    'hover:bg-accent'}`}
                >
                  <div className="relative w-12 h-12 overflow-hidden rounded-lg border-2 border-white/10">
                    <Image
                      src={`https://flagcdn.com/w160/${country.flag}.png`}
                      alt={country.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{country.name}</h3>
                    <p className="text-sm text-muted-foreground">{country.description}</p>
                  </div>
                </div>
              </Link>
            ))}
            
            {filteredCountries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">هیچ کشوری یافت نشد</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CountryButton({ currentCountry }: { currentCountry: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentCountryData = countries.find(c => c.code === currentCountry);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-4 h-4 overflow-hidden rounded-sm">
          <Image
            src={`https://flagcdn.com/w40/${currentCountryData?.flag || currentCountry}.png`}
            alt={currentCountryData?.name || ''}
            fill
            className="object-cover"
          />
        </div>
        <span>{currentCountryData?.name}</span>
        <Globe className="w-4 h-4 text-muted-foreground" />
      </Button>

      <CountryDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        currentCountry={currentCountry}
      />
    </>
  );
} 