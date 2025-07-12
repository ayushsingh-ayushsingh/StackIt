"use client"

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon } from 'lucide-react';

const mobileItems = ['Home', 'About', 'More'];

export default function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MenuIcon />
                </Button>
            </SheetTrigger>

            <SheetContent side="right">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col items-start mt-15">
                    {mobileItems.map((item, index) => (
                        <Button
                            key={index}
                            variant="link"
                            className='text-2xl p-4 m-4'
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            {item}
                        </Button>
                    ))}
                </div>
                <SheetFooter>
                    <footer className='w-full flex justify-center'>
                        Crafted with ❤️ by <a href="https://www.github.com/ayushsingh-ayushsingh" className='underline cursor-pointer' target='_blank' rel="noopener noreferrer">Ayush Singh</a>
                    </footer>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}