'use client';

import { Leaf, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/context/i18n-provider";
import { languages } from "@/lib/i18n";

export function Header() {
  const { t, setLanguage, language } = useI18n();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <div className="flex items-center gap-2">
        <Leaf className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">
          {t('title')}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Languages className="w-5 h-5" />
              <span className="sr-only">{t('changeLanguage')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.value}
                onSelect={() => setLanguage(lang.value)}
                className={lang.value === language ? "bg-accent" : ""}
              >
                {t(lang.labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
