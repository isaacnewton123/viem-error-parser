'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { useErrorParser } from 'viem-error-parser/react';
import { myAbis } from '@/lib/abis';

export default function HomePage() {
  const { getErrorMessage } = useErrorParser({ abis: myAbis });
  const { writeContractAsync } = useWriteContract();
  const [message, setMessage] = useState<string | null>(null);

  async function trigger() {
    setMessage(null);
    try {
      await writeContractAsync({
        // Intentionally bogus — this will fail with a wallet/RPC error
        // that the parser can classify.
        abi: [
          {
            type: 'function',
            name: 'doSomething',
            stateMutability: 'nonpayable',
            inputs: [],
            outputs: [],
          },
        ],
        address: '0x0000000000000000000000000000000000000000',
        functionName: 'doSomething',
      });
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  }

  return (
    <main>
      <h1>viem-error-parser — Next.js example</h1>
      <p>
        Click the button to trigger a failing <code>writeContract</code>. The
        parsed error message will appear below.
      </p>
      <button
        type="button"
        onClick={trigger}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Trigger failure
      </button>
      {message !== null && (
        <pre
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f4f4f5',
            borderRadius: 6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </pre>
      )}
    </main>
  );
}
