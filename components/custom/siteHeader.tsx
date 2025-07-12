import { AudioWaveform, Shield } from 'lucide-react';
import { UserButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import MainNav from './mainNav';
import MobileNav from './mobileNav';
import NotificationBell from '@/components/notifications/NotificationBell';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SiteHeader() {
    const { user } = useUser();
    const router = useRouter();
    
    return (
        <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center">
                    <span className="text-xl font-bold flex gap-2 items-center">
                        <AudioWaveform className="w-6 h-6" />
                        <span>
                            Stack<span className='text-red-600'>It</span>
                        </span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <MainNav />
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        {user && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/admin')}
                                className="flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                Admin
                            </Button>
                        )}
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8"
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="flex md:hidden items-center gap-2">
                    <NotificationBell />
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8"
                            }
                        }}
                    />
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}