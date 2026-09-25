import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { supabase } from '@/lib/supabase';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user && user.email) {
        try {
          if (supabase) {
            // Upsert user profile in Supabase
            await supabase.from('users').upsert({
              email: user.email,
              name: user.name || 'User',
              image: user.image || null,
              google_access_token: account?.access_token || null,
              google_refresh_token: account?.refresh_token || null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });
          }
        } catch (dbError) {
          console.warn('Could not upsert user to Supabase:', dbError);
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
