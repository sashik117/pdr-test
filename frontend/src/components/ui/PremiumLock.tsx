import Link from "next/link";
import { Lock } from "lucide-react";
import Button from "./Button";

interface PremiumLockProps {
    isPremium?: boolean;
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function PremiumLock({ 
    isPremium = false, 
    children, 
    title = "Premium Feature", 
    description = "Upgrade to Premium to access this feature." 
}: PremiumLockProps) {
    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            <div className="blur-sm select-none pointer-events-none opacity-50" aria-hidden="true">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[1px] rounded-xl z-10 p-6 text-center">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-sm mx-auto">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 mb-6">{description}</p>
                    <Link href="/pricing" className="w-full">
                         <Button className="w-full">Get Premium</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
