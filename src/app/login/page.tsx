'use client';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-sans antialiased">
      <Card className="w-full max-w-[440px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden pt-4">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transform transition-transform hover:rotate-0">
               <span className="text-white font-black text-2xl tracking-tighter">IT</span>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
              InternTrack
            </CardTitle>
            <CardDescription className="text-base text-[#64748B] px-8">
              The professional visibility platform for the modern workforce.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-12 space-y-8">
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#334155] font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94L5.84 14.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#F1F5F9]"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[#94A3B8] font-medium tracking-widest">or Enterprise SSO</span>
              </div>
            </div>

            <button className="w-full text-sm font-bold text-primary hover:text-primary/80 transition-colors py-2">
              Sign in with Work Email
            </button>
          </div>
          
          <footer className="text-center text-xs text-[#94A3B8] leading-relaxed">
            By signing in, you agree to our <span className="text-[#64748B] font-medium underline cursor-pointer">Terms of Service</span> and <span className="text-[#64748B] font-medium underline cursor-pointer">Privacy Policy</span>.
          </footer>
        </CardContent>
      </Card>
    </div>
  );
}
