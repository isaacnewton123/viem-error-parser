import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { decoder } from './decoder';

export function App() {
  const { writeContractAsync } = useWriteContract();
  const [message, setMessage] = useState<string | null>(null);

  async function trigger() {
    setMessage(null);
    try {
      await writeContractAsync({
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
      setMessage(decoder.decode(err).message);
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>viem-error-parser — Vite example</h1>
      <p>
        Click the button to trigger a failing <code>writeContract</code>.
        The parsed error message will appear below.
      </p>
      <button
        type="button"
        onClick={trigger}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: 6, cursor: 'pointer' }}
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
