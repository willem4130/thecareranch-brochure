export function getTemplate({ redirectPath, withError }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>The Care Ranch, Stats</title>
    <style>
      :root {
        --sand: #F7F4F0;
        --cream: #F2EDE4;
        --terracotta: #C47D5C;
        --saddle: #79584A;
        --charcoal: #3D3632;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: Arial, sans-serif;
        background: var(--sand);
        color: var(--charcoal);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
      }
      .card {
        background: #fff;
        padding: 2.5rem 2rem;
        border-radius: 6px;
        max-width: 360px;
        width: 100%;
        box-shadow: 0 1px 3px rgba(61, 54, 50, 0.08);
      }
      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.4rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(61, 54, 50, 0.85);
      }
      p.lede {
        margin: 0 0 1.5rem;
        color: var(--saddle);
        font-size: 0.95rem;
      }
      .error {
        background: rgba(196, 125, 92, 0.1);
        color: var(--terracotta);
        padding: 0.6rem 0.8rem;
        border-radius: 4px;
        font-size: 0.85rem;
        margin: 0 0 1rem;
      }
      input[type="password"] {
        width: 100%;
        padding: 0.7rem 0.9rem;
        border: 1px solid rgba(121, 88, 74, 0.2);
        border-radius: 4px;
        font: inherit;
        background: var(--cream);
        color: var(--charcoal);
        margin-bottom: 0.9rem;
      }
      input[type="password"]:focus {
        outline: none;
        border-color: var(--terracotta);
      }
      button {
        width: 100%;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        background: var(--terracotta);
        color: #fff;
        font: inherit;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        cursor: pointer;
        transition: background 0.15s;
      }
      button:hover { background: #b06d4d; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>The Care Ranch</h1>
      <p class="lede">Stats dashboard. Enter passphrase to continue.</p>
      ${withError ? `<p class="error">Incorrect passphrase, please try again.</p>` : ''}
      <form method="post" action="/cfp_login">
        <input type="hidden" name="redirect" value="${redirectPath}" />
        <input type="password" name="password" placeholder="Passphrase" aria-label="Passphrase" autocomplete="current-password" required autofocus />
        <button type="submit">Enter</button>
      </form>
    </div>
  </body>
</html>`;
}
