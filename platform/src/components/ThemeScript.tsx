// Script inline executado antes da pintura, para evitar "flash" de tema errado.
export default function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark'||t==='light'){d.setAttribute('data-theme',t);}else{d.removeAttribute('data-theme');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
