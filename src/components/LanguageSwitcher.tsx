import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export type Language = "ar" | "fr" | "en";

interface LanguageSwitcherProps {
  onLanguageChange: (lang: Language) => void;
  currentLanguage: Language;
}

export const LanguageSwitcher = ({ onLanguageChange, currentLanguage }: LanguageSwitcherProps) => {
  const languages = [
    { code: "ar" as Language, name: "العربية", flag: "🇩🇿" },
    { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
    { code: "en" as Language, name: "English", flag: "🇬🇧" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-border/50">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={currentLanguage === lang.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};