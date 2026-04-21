'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMessage('Verifique seu email para confirmar o cadastro.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f12]">
      {/* Subtle pink glow in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[380px] relative">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-pink rounded-xl flex items-center justify-center shadow-pink">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-[-0.01em]">ShadowAds</span>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isSignUp ? 'Criar conta' : 'Entrar na sua conta'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isSignUp
              ? 'Preencha os dados para criar sua conta'
              : 'Gerencie suas campanhas TikTok Ads'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 bg-[#1c1c22] border border-[#2a2a35] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 px-3 bg-[#1c1c22] border border-[#2a2a35] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-gradient-pink hover:bg-gradient-pink-dark text-white text-sm font-bold rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-pink hover:shadow-pink-lg active:scale-[0.98]"
            >
              {loading ? (
                <div className="spinner" />
              ) : isSignUp ? (
                'Criar conta'
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
              }}
              className="text-gray-500 hover:text-accent-400 text-sm transition-colors font-medium"
            >
              {isSignUp
                ? 'Já tem conta? Entrar'
                : 'Não tem conta? Criar uma'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
