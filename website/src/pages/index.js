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
          a modding framework for my MooMoo.io-style private server. you write mods against an API
          that doesn't change, and the loader deals with the websocket, the crypto, and the packets
          so your mods don't break every time i touch the server.
        </p>
        <div className="hero--buttons">
          <Link className="button button--primary button--lg" to="/docs/intro">get started →</Link>
          <Link className="button button--secondary button--lg" to="/playground/">open the playground</Link>
        </div>
      </header>

      <main>
        <div className="features">
          <Feature ico="🧩" title="two parts">
            a <b>loader</b> that gets updated when the server changes, and a <b>runtime + language</b> that
            doesn't. a mod you write today keeps working after the server moves everything around.
          </Feature>
          <Feature ico="🔌" title="no websocket stuff">
            mods just listen for events — <code>on health(sid, value)</code> — and send actions —
            <code> send.chat("gg")</code>. no hooking, no msgpack, no packet letters to memorize.
          </Feature>
          <Feature ico="📝" title="its own little language">
            write mods in <b>moomoo.js</b> and compile them to a Tampermonkey plugin, either from the
            command line or right in the playground.
          </Feature>
          <Feature ico="🎛️" title="mods menu in-game">
            the loader drops a <b>Mods</b> tab into the pause menu. flip any mod on or off while you play
            and open up its settings.
          </Feature>
          <Feature ico="🛡️" title="the hook stays hidden">
            the socket hook is a <code>Proxy</code> that goes in before the client loads and leaves
            <code> WebSocket.prototype</code> alone, so the anti-tamper checks don't notice it.
          </Feature>
          <Feature ico="📦" title="one @require">
            you install one loader userscript. every mod is a tiny script that <code>@require</code>s it,
            so updating the loader updates all your mods at once.
          </Feature>
        </div>
      </main>
    </Layout>
  );
}
