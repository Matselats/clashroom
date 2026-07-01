function getLang(){return localStorage.getItem('lang')||'no'}
function setLang(l){localStorage.setItem('lang',l);if(typeof onLangChange==='function')onLangChange()}
