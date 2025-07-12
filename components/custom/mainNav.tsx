import { Button } from '@/components/ui/button';

const mainNavItems = ['About', 'More', 'Home'];

export default function MainNav() {
    return (
        <div className="flex gap-2">
            {mainNavItems.map((item, index) => (
                <Button key={index} variant="link">
                    {item}
                </Button>
            ))}
        </div>
    );
}