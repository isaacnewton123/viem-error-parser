import type { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'viem-error-parser — Next.js example',
  description: 'Decode Viem/Wagmi errors with useErrorParser.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          padding: '2rem',
          maxWidth: 720,
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
