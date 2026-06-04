import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/student/dashboard`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (!error) return;

  if (error.message?.toLowerCase().includes('unsupported provider')) {
    toast.error('Google sign-in is not enabled in Supabase. Enable the Google provider in your Supabase Auth settings.');
    return;
  }

  toast.error(`Google sign-in failed: ${error.message}`);
};
