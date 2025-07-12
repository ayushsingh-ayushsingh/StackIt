import { Button } from '@/components/ui/button';
import { ModeToggle } from '../theme-toggle';

const mainNavItems = ['About', 'More', 'Home'];

export default function MainNav() {
    return (
        <div className="flex gap-2">
            {mainNavItems.map((item, index) => (
                <Button key={index} variant="link" className='cursor-pointer'>
                    {item}
                </Button>
            ))}
            <ModeToggle />
        </div>
    );
}