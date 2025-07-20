'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { login, signup } from '../action';
// import { resetPassword } from '@/components/forgot';
import Password from '@/components/password';

export default function LoginPage() {
  const t = useTranslations('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = username.trim();
    const pwd = password.trim();

    if (email && pwd) {
      const { error } = await login({
        email,
        password,
      });
      console.log('0000000000');
      if (error) {
        toast({
          title: t('result.failed'),
          description: error.message || t('result.contentError'),
          variant: 'destructive',
        });
      } else {
        window.location.href = '/';
      }
    } else {
      toast({
        title: t('result.failed'),
        description: t('result.contentEmpty'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='flex min-h-screen flex-col lg:flex-row'>
      <div className='order-2 flex flex-1 items-center justify-center bg-white p-6 lg:order-1 lg:p-12'>
        <div className='w-full max-w-md'>
          <div className='mb-10 text-center text-3xl font-semibold'>
            {t('loginTitle')}
          </div>
          <div className='space-y-4'>
            <Input
              type='text'
              placeholder={t('username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Password value={password} onChange={setPassword} />
            {/* <Button
              variant='link'
              className='p-0'
              // onClick={() => resetPassword('s356@qq.com')}
            >
              Forgot password?
            </Button> */}

            <Button className='w-full' onClick={handleLogin}>
              {t('loginTitle')}
            </Button>
          </div>
        </div>
      </div>
      <div className='relative order-1 flex-1 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 p-6 lg:order-2 lg:p-12'>
        {/* Content */}
        <div className='relative z-10 flex h-full flex-col justify-center'>
          <div
            className={`flex h-full flex-col justify-center space-y-8 transition-opacity duration-700 ease-in-out`}
          >
            <div className='space-y-4'>
              <h1
                className='animate-slide-up text-4xl font-bold tracking-tight md:text-4xl'
                style={{ animationDelay: '100ms' }}
              >
                {t('appName')}
              </h1>

              <p
                className='animate-slide-up max-w-md text-lg text-muted-foreground'
                style={{ animationDelay: '200ms' }}
              >
                {t('appDescription')}
              </p>
            </div>

            <div
              className='leading-8'
              dangerouslySetInnerHTML={{ __html: t('appTexts') }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
