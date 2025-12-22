import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Deal } from './kanban/KanbanCard'; // Reuse interface

interface PDFUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PDFUploadModal = ({ isOpen, onClose }: PDFUploadModalProps) => {
    const [step, setStep] = useState<'upload' | 'review'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extracted Data State
    const [extractedData, setExtractedData] = useState<Partial<Deal> | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('tork_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crm/leads/extract`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Erro ao processar PDF');
            }

            const data = await res.json();
            setExtractedData(data); // Expects { name, value, priority, email, phone }
            setStep('review');
        } catch (e: any) {
            console.error(e);
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Final Create Call
        try {
            const token = localStorage.getItem('tork_token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crm/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...extractedData,
                    status: 'new'
                })
            });
            window.location.reload(); // Refresh Kanban
        } catch (e) {
            console.error(e);
            setError("Falha ao criar lead.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setStep('upload');
        setFile(null);
        setExtractedData(null);
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={reset} title={step === 'upload' ? "Importar Apólice (PDF)" : "Revisar Dados Extraídos"}>
            {step === 'upload' ? (
                <div className="space-y-6">
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
                            file ? "border-crm-secondary bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-300 dark:border-slate-700"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <>
                                <FileText className="w-10 h-10 text-crm-secondary mb-3" />
                                <p className="font-semibold text-slate-700 dark:text-slate-200">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                                <p className="font-medium text-slate-600 dark:text-slate-300">Clique para selecionar ou arraste o PDF</p>
                                <p className="text-xs text-slate-500 mt-1">Suporta apólices de Seguradoras (PDF Pesquisável)</p>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button disabled={!file || isProcessing} onClick={handleUpload} isLoading={isProcessing}>
                            {isProcessing ? 'Lendo PDF...' : 'Processar com IA'}
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleConfirm} className="space-y-4">
                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        A IA leu o documento com sucesso. Verifique os dados abaixo.
                    </div>

                    <Input
                        name="name"
                        label="Nome do Segurado"
                        defaultValue={extractedData?.name || ''}
                        onChange={e => setExtractedData({ ...extractedData, name: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="email"
                            label="E-mail"
                            defaultValue={extractedData?.email || ''}
                            onChange={e => setExtractedData({ ...extractedData, email: e.target.value })}
                        />
                        <Input
                            name="phone"
                            label="Telefone"
                            defaultValue={extractedData?.phone || ''}
                            onChange={e => setExtractedData({ ...extractedData, phone: e.target.value } as any)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="value"
                            label="Valor do Prêmio (R$)"
                            type="number"
                            defaultValue={extractedData?.value || 0}
                            onChange={e => setExtractedData({ ...extractedData, value: parseFloat(e.target.value) })}
                            required
                        />
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prioridade Sugerida</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-crm-secondary dark:bg-crm-primary/50 dark:border-slate-700 dark:text-white"
                                defaultValue={extractedData?.priority}
                                onChange={e => setExtractedData({ ...extractedData, priority: e.target.value as any })}
                            >
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                                <option value="low">Baixa</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setStep('upload')}>Voltar</Button>
                        <Button type="submit" isLoading={isProcessing}>Confirmar e Criar Lead</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};
