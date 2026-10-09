import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

function Feature({ ico, title, children }) {
  return (
    <div className="feature">
      <div className="ico">{ico}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export default function Home() {
  return (
    <Layout title="moomoo.js" description="A modding framework for MooMoo.io private servers">
      <header className="hero--moomoo">
        <div className="cow">🐮</div>
        <h1>moomoo<span style={{ color: 'var(--ifm-color-primary)' }}>.js</span></h1>
        <p className="tagline">
          A modding framework for MooMoo.io-style private servers. Write mods against a stable API —
          the loader handles the WebSocket, the crypto, and the packets, so your mods never break.
        </p>
        <div className="hero--buttons">
          <Link className="button button--primary button--lg" to="/docs/intro">Get started →</Link>
          <Link className="button button--secondary button--lg" to="/playground/">Open the playground</Link>
        </div>
      </header>

      <main>
        <div className="features">
          <Feature ico="🧩" title="Two parts, one stable">
            A <b>loader</b> you update when the server changes, and a <b>runtime + language</b> that never
            changes. Mods written today keep working forever.
          </Feature>
          <Feature ico="🔌" title="No WebSocket wrangling">
            Mods subscribe to named events — <code>on health(sid, value)</code> — and send named actions —
            <code> send.chat("gg")</code>. No hooking, no msgpack, no packet letters.
          </Feature>
          <Feature ico="🧱" title="Blocks or code">
            Build mods by snapping blocks together like Scratch, or write the <b>moomoo.js</b> language.
            Either way it compiles to a Tampermonkey plugin.
          </Feature>
          <Feature ico="🎛️" title="In-game Mods menu">
            The loader adds a <b>Mods</b> tab to the game menu. Toggle every mod on/off at runtime and
            expand its settings.
          </Feature>
          <Feature ico="🛡️" title="Undetectable loader">
            The socket hook is a <code>Proxy</code> installed before the client runs, leaving
            <code> WebSocket.prototype</code> pristine — the anti-tamper reference checks pass.
          </Feature>
          <Feature ico="📦" title="One @require">
            Players install one loader userscript. Every mod is a tiny userscript that
            <code> @require</code>s it. Updating the loader updates every mod.
          </Feature>
        </div>
      </main>
    </Layout>
  );
}
