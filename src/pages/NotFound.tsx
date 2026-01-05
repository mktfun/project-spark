import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <p className="text-slate-400 mb-8">Página não encontrada</p>
            <Link 
                to="/" 
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
                <Home size={18} />
                Voltar ao início
            </Link>
        </div>
    );
}
