"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
    Zap, Shield, Server, ArrowRight, PlayCircle, Globe, Lock, CheckCircle
} from "lucide-react";

// IMPORTS DOS SEUS COMPONENTES (Ajuste os caminhos se necessário)
import { SmartNavbar } from "@/components/landing/SmartNavbar";
import { MegaFooter } from "@/components/landing/MegaFooter";
import { SectionDivider } from "@/components/landing/SectionDivider";
import { HeroMockups } from "@/components/landing/HeroMockups";
// Caso não tenha HeroMockups, use um placeholder ou imagem

// --- UTILS: FADE IN COMPONENT ---
function FadeInWhenVisible({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export default function Home() {
    // LÓGICA DA SEÇÃO DE INFRAESTRUTURA (Scroll Spy)
    const infraRef = useRef<HTMLDivElement>(null);
    const [activeFeature, setActiveFeature] = useState(0);
    const { scrollYProgress } = useScroll({
        target: infraRef,
        offset: ["start start", "end end"],
    });

    // Listener simples para trocar o activeFeature baseado no scroll da seção
    useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 2]);

    // Hook para detectar qual passo está ativo na infra (Fallback manual se transform n funcionar direto)
    useEffect(() => {
        const handleScroll = () => {
            if (!infraRef.current) return;
            const rect = infraRef.current.getBoundingClientRect();
            const progress = Math.abs(rect.top) / rect.height;
            if (progress < 0.33) setActiveFeature(0);
            else if (progress < 0.66) setActiveFeature(1);
            else setActiveFeature(2);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    return (
        <main className="flex flex-col min-h-screen w-full overflow-x-hidden bg-slate-950 selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* 1. HEADER (Unificado e Apple Glass) */}
            <SmartNavbar />

            {/* 2. HERO SECTION (Minimalist Premium) */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-slate-950">
                {/* Ambient Light */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <FadeInWhenVisible>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 mb-8 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-slate-300">Tork v2.0 Live</span>
                        </div>
                    </FadeInWhenVisible>

                    <FadeInWhenVisible delay={0.1}>
                        <h1 className="text-4xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
                            A espinha dorsal da <br />
                            sua operação de seguros.
                        </h1>
                    </FadeInWhenVisible>

                    <FadeInWhenVisible delay={0.2}>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
                            Conecte WhatsApp, CRM e automação em um único fluxo contínuo.
                            Sem complexidade. Apenas resultados.
                        </p>
                    </FadeInWhenVisible>

                    <FadeInWhenVisible delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#" className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-950 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5">
                                Começar Agora
                            </a>
                            <button className="w-full sm:w-auto px-8 py-3.5 text-slate-300 hover:text-white transition-colors font-medium flex items-center justify-center gap-2">
                                <PlayCircle size={20} /> Ver Demo
                            </button>
                        </div>
                    </FadeInWhenVisible>
                </div>

                {/* Floating Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    className="relative mt-16 md:mt-24 max-w-6xl w-full px-4"
                >
                    <div className="relative rounded-2xl bg-[#0F1117] border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden">
                        <div className="h-8 md:h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        </div>
                        {/* Coloque sua imagem ou componente de mockup aqui */}
                        <div className="aspect-[16/9] bg-slate-900/50 flex items-center justify-center text-slate-600">
                            <HeroMockups /> {/* Se não tiver, use <img src="/dashboard.png" className="w-full"/> */}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 3. DIVIDER (Dark Glow) */}
            <SectionDivider variant="dark-glow" />

            {/* 4. ENGINE SECTION (The Sticky Backdrop) */}
            {/* Esta seção fica presa (sticky) no fundo enquanto a próxima sobe */}
            <section className="relative lg:sticky lg:top-0 lg:z-0 min-h-screen bg-slate-950 py-24 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div className="order-2 md:order-1 space-y-8">
                            <FadeInWhenVisible>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-violet-500/10 rounded-lg"><Zap className="text-violet-400" size={24} /></div>
                                    <span className="text-violet-400 font-medium">Automação Invisível</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                    Você conversa. <br /> <span className="text-slate-500">O Tork trabalha.</span>
                                </h2>
                                <p className="text-lg text-slate-400 leading-relaxed">
                                    Esqueça configurar fluxos complexos. O sistema identifica intenção de compra, cria o lead no CRM e agenda o follow-up automaticamente.
                                </p>
                            </FadeInWhenVisible>

                            {/* Feature List */}
                            <div className="space-y-4">
                                {[
                                    "Captura de Leads via WhatsApp Oficial",
                                    "Enriquecimento de Dados Automático",
                                    "Distribuição Inteligente para Corretores"
                                ].map((item, i) => (
                                    <FadeInWhenVisible key={i} delay={i * 0.1}>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <CheckCircle size={18} className="text-emerald-500" />
                                            {item}
                                        </div>
                                    </FadeInWhenVisible>
                                ))}
                            </div>
                        </div>

                        {/* Visualização de Causa e Efeito (Dark Glass) */}
                        <div className="order-1 md:order-2">
                            <FadeInWhenVisible delay={0.2}>
                                <div className="bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                                    <div className="flex flex-col gap-6">
                                        {/* Chat Bubble */}
                                        <div className="self-start bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-sm max-w-[200px]">
                                            <div className="h-2 w-24 bg-slate-700 rounded mb-2"></div>
                                            <p className="text-xs text-slate-400">Gostaria de uma cotação...</p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="self-center text-violet-500 animate-pulse">
                                            <ArrowRight size={24} className="rotate-90 md:rotate-0" />
                                        </div>

                                        {/* CRM Card */}
                                        <div className="self-end bg-slate-800 border-l-4 border-l-emerald-500 p-4 rounded-xl w-full max-w-[240px] shadow-lg">
                                            <div className="flex justify-between mb-2">
                                                <div className="h-2 w-16 bg-slate-700 rounded"></div>
                                                <div className="h-2 w-8 bg-emerald-500/20 rounded"></div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-700/50 rounded mb-2"></div>
                                            <div className="h-2 w-2/3 bg-slate-700/50 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </FadeInWhenVisible>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. INFRASTRUCTURE SECTION (The Curtain Reveal) */}
            {/* Z-Index 10 e sombra para cobrir a seção anterior */}
            <section
                ref={infraRef}
                className="relative z-10 bg-zinc-50 py-32 shadow-[0_-50px_100px_-20px_rgba(0,0,0,0.5)] min-h-[200vh]"
            >
                <div className="sticky top-0 hidden lg:block h-4 w-full bg-gradient-to-b from-black/5 to-transparent z-20 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row">

                    {/* ESQUERDA: VISUALIZADOR FIXO (STICKY) */}
                    <div className="hidden lg:flex w-1/2 sticky top-0 h-screen items-center justify-center">
                        <div className="w-full max-w-md aspect-square bg-white rounded-3xl shadow-2xl border border-zinc-100 p-8 relative overflow-hidden ring-1 ring-zinc-900/5 transition-all duration-500">

                            {/* Grid de Fundo */}
                            <div className="absolute inset-0 grid grid-cols-8 gap-4 p-8 opacity-[0.03]">
                                {Array.from({ length: 64 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-black" />
                                ))}
                            </div>

                            {/* Camadas Animadas */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center">
                                {activeFeature === 0 && (
                                    <motion.div key="lat" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20 animate-pulse" />
                                            <Globe size={80} className="text-cyan-500 relative z-10" strokeWidth={1} />
                                        </div>
                                        <p className="text-center mt-6 font-bold text-cyan-700 text-lg">São Paulo, BR (South-1)</p>
                                    </motion.div>
                                )}
                                {activeFeature === 1 && (
                                    <motion.div key="sec" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <Shield size={80} className="text-emerald-500 mx-auto" strokeWidth={1} />
                                        <div className="mt-6 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200 shadow-sm">
                                            AES-256 Encrypted
                                        </div>
                                    </motion.div>
                                )}
                                {activeFeature === 2 && (
                                    <motion.div key="up" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                                                <div className="text-3xl font-bold text-slate-900">99.99%</div>
                                                <div className="text-xs text-zinc-500 uppercase mt-1 font-semibold">Uptime</div>
                                            </div>
                                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                                                <div className="text-3xl font-bold text-slate-900">50ms</div>
                                                <div className="text-xs text-zinc-500 uppercase mt-1 font-semibold">Latency</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DIREITA: TEXTO SCROLLÁVEL */}
                    <div className="w-full lg:w-1/2 lg:pl-24">

                        {/* Bloco 1: Latência */}
                        <div className="h-screen flex flex-col justify-center pointer-events-none"> {/* pointer-events-none para não atrapalhar scroll */}
                            <div className="pointer-events-auto">
                                <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 text-cyan-600">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                                    Latência Zero. <br />
                                    <span className="text-zinc-400">Servidores no Brasil.</span>
                                </h3>
                                <p className="text-xl text-zinc-500 leading-relaxed max-w-md">
                                    Esqueça o delay. Nossa infraestrutura roda em São Paulo, garantindo que suas mensagens cheguem instantaneamente.
                                </p>
                            </div>
                        </div>

                        {/* Bloco 2: Segurança */}
                        <div className="h-screen flex flex-col justify-center pointer-events-none">
                            <div className="pointer-events-auto">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                                    <Lock size={24} />
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                                    Blindagem Militar. <br />
                                    <span className="text-zinc-400">Seus dados são seus.</span>
                                </h3>
                                <p className="text-xl text-zinc-500 leading-relaxed max-w-md">
                                    Criptografia de ponta a ponta e conformidade total com a LGPD. Nem nós temos acesso às suas conversas.
                                </p>
                            </div>
                        </div>

                        {/* Bloco 3: Redundância */}
                        <div className="h-screen flex flex-col justify-center pointer-events-none">
                            <div className="pointer-events-auto">
                                <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mb-6 text-violet-600">
                                    <Server size={24} />
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                                    Sempre Online. <br />
                                    <span className="text-zinc-400">Redundância tripla.</span>
                                </h3>
                                <p className="text-xl text-zinc-500 leading-relaxed max-w-md">
                                    Arquitetura distribuída que garante disponibilidade mesmo em picos de tráfego. Seu negócio nunca para.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. CTA (Event Horizon - Dark Mode Return) */}
            <SectionDivider variant="light-to-dark" className="relative z-20" />

            <section className="relative flex flex-col items-center justify-center bg-slate-950 overflow-hidden py-32 pb-40 z-20">
                {/* Background Floor Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-violet-600/20 blur-[180px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <FadeInWhenVisible>
                        <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                            O futuro da sua <br /> corretora é agora.
                        </h2>
                    </FadeInWhenVisible>

                    <FadeInWhenVisible delay={0.2}>
                        <p className="text-xl text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
                            Sem cartão de crédito necessário no início. Setup em 2 minutos.
                            Junte-se à elite do mercado.
                        </p>
                    </FadeInWhenVisible>

                    <FadeInWhenVisible delay={0.4}>
                        <div className="flex flex-col items-center gap-6">
                            <a
                                href="#"
                                className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-white px-12 font-medium text-slate-950 transition-all duration-300 hover:bg-zinc-200 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
                            >
                                <span className="relative z-10 text-lg font-bold mr-2">Começar Gratuitamente</span>
                                <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent z-0 opacity-50" />
                            </a>
                        </div>
                    </FadeInWhenVisible>
                </div>
            </section>

            {/* 7. FOOTER */}
            <MegaFooter />

        </main>
    );
}
