"use client"

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon } from 'lucide-react';
import { ModeToggle } from '../theme-toggle';

const mobileItems = ['Home', 'About', 'More'];

export default function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <ModeToggle />
            <SheetTrigger asChild>
                <Button variant="link" size="icon">
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
                            className='text-2xl p-4 m-2'
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            {item}
                        </Button>
                    ))}
                </div>
                <SheetFooter>
                    <footer className='w-full flex justify-center text-primary'>
                        Crafted with ❤️ by <a href="https://www.github.com/ayushsingh-ayushsingh" className='ml-2 underline cursor-pointer' target='_blank' rel="noopener noreferrer">Ayush Singh</a>
                    </footer>
                    <SheetClose>
                        <Button className='w-full mt-4'>
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}