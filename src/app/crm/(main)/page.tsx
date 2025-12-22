import { Card } from "@/components/crm/Card"
import { Button } from "@/components/crm/Button"
import Link from "next/link"

export default function CRMPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Bem-vindo ao Tork CRM</h1>
            <p className="text-slate-500 max-w-md">
                O sistema operacional da sua corretora. Gerencie leads, renovações e documentos em um só lugar.
            </p>
            <div className="flex gap-4">
                <Link href="/crm/styleguide">
                    <Button variant="secondary">Ver Styleguide</Button>
                </Link>
                <Button variant="ghost">Dashboard (Em breve)</Button>
            </div>
        </div>
    )
}
