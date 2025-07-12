import MainNav from './mainNav';
import MobileNav from './mobileNav';

export default function SiteHeader() {
    return (
        <header className="w-full shadow-xs">
            <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center">
                    <span className="text-lg font-semibold">Logo</span>
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