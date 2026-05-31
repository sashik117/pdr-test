import { X } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LimitModal({ isOpen, onClose }: LimitModalProps) {
    const router = useRouter();

    const handleClose = () => {
        onClose();
        router.push("/dashboard");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Daily Limit Reached"
            size="md"
        >
            <div className="text-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🛑</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Ви вичерпали ліміт тестів
                </h3>
                <p className="text-gray-600 mb-6">
                    Безкоштовний тариф дозволяє проходити лише 3 тести на день.
                    Оновіть підписку до Premium, щоб отримати безлімітний доступ.
                </p>
                <div className="flex flex-col gap-3">
                    <Link href="/pricing" className="w-full">
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-none">
                            Отримати Premium
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={handleClose}>
                        Повернутися на головну
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
