import { AudioWaveform } from 'lucide-react';
import MainNav from './mainNav';
import MobileNav from './mobileNav';

export default function SiteHeader() {
    return (
        <header className="w-full">
            <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center">
                    <span className="text-lg font-semibold flex gap-2">
                        <AudioWaveform />
                        <span>
                            Stack<span className='text-red-600'>It</span>
                        </span>
                    </span>
                </div>
                <div className="hidden md:block">
                    <MainNav />
                </div>
                <div className="md:hidden">
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}