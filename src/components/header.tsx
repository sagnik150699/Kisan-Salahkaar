import { Leaf, Languages, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <div className="flex items-center gap-2">
        <Leaf className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">
          Kisan Salahkaar
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Languages className="w-5 h-5" />
              <span className="sr-only">Change language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>हिंदी (Hindi)</DropdownMenuItem>
            <DropdownMenuItem>தமிழ் (Tamil)</DropdownMenuItem>
            <DropdownMenuItem>ಕನ್ನಡ (Kannada)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon">
          <Mic className="w-5 h-5" />
          <span className="sr-only">Use voice interface</span>
        </Button>
      </div>
    </header>
  );
}
