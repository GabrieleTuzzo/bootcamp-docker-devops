import { useEffect, useState } from 'react';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/accounts')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setAccounts)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: 720 }}>
      <h1>Lipari Accounts</h1>
      {error && (
        <p style={{ color: 'crimson' }}>
          Errore: <strong>{error}</strong>
        </p>
      )}
      <ul>
        {accounts.map((a) => (
          <li key={a.id}>
            <code>{a.iban}</code> — €{a.balance}
          </li>
        ))}
      </ul>
    </main>
  );
}
