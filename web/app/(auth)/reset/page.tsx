'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Password from '@/components/password';

function Reset() {
  const t = useTranslations('Reset');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  // const handleUpdatePassword = async () => {
  //   const newPassword = password?.trim();
  //   if (!newPassword) {
  //     setError('Password is required.');
  //     return;
  //   }
  //   setError('');
  //   const { data, error } = await supabase.auth.updateUser({
  //     password: newPassword,
  //   });

  //   if (error) {
  //     setError(error.message);
  //   } else {
  //     setIsSuccess(true);
  //   }
  // };
  return null;

  // return (
  //   <div className='m-auto max-w-md space-y-4 pt-20'>
  //     {isSuccess ? (
  //       <div>
  //         <p>Password updated successfully!</p>
  //         <Button onClick={() => setIsSuccess(false)}>{t('toLogin')}</Button>
  //       </div>
  //     ) : (
  //       <>
  //         <Password value={password} onChange={setPassword} />
  //         {error && <p className='text-red-500'>{error}</p>}
  //         <Button onClick={password ? handleUpdatePassword : undefined}>
  //           {t('submit')}
  //         </Button>
  //       </>
  //     )}
  //   </div>
  // );
}

export default Reset;
