/* Apply the saved colour theme before first paint (load in <head>). */
(function(){ var t='slate'; try{ t=localStorage.getItem('pa-theme')||t; }catch(e){}
  document.documentElement.setAttribute('data-theme', t); })();
