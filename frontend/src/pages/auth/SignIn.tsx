import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useSignIn } from '@/hooks/auth.hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInForm = z.infer<typeof signInSchema>;

export const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const signInMutation = useSignIn();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      await signInMutation.mutateAsync(data);
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-900 dark:to-black">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-zinc-900 text-white font-bold text-xl mb-4 shadow-[0_6px_18px_rgba(0,0,0,0.35),inset_0_-2px_6px_rgba(255,255,255,0.05)]">
            <span className="relative">
              R
              <span className="absolute -right-2 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-500/40" />
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome back</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Sign in to your Renewly account</p>
        </div>

        {/* Sign in form */}
        <Card className="rounded-[22px] bg-zinc-900/95 text-zinc-100 border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-zinc-50">Sign in</CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100 placeholder:text-zinc-400 shadow-inner focus-visible:ring-red-500/60 focus-visible:border-red-500/40 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={`pr-10 rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100 placeholder:text-zinc-400 shadow-inner focus-visible:ring-red-500/60 focus-visible:border-red-500/40 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_24px_-8px_rgba(239,68,68,0.7)]"
                disabled={signInMutation.isPending}
              >
                {signInMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-zinc-400">Don't have an account? </span>
              <Link 
                to="/auth/sign-up" 
                className="font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};