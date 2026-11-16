/* PRIVILÈGE — Échos publics / anonymes.
   Couche complémentaire : ne modifie ni le dialogue NEXUS ni le générateur STAFF. */
(function(){
  'use strict';
  function init(){
    var root=document.getElementById('nx-echos-citizen');
    if(!root || root.dataset.echoModesReady==='true') return;
    var form=root.querySelector('#nx-e-form');
    var result=root.querySelector('#nx-e-result');
    var output=root.querySelector('#nx-e-output');
    if(!form || !result || !output) return;
    root.dataset.echoModesReady='true';

    var authorField=form.querySelector('[data-echo-author-field]');
    var error=root.querySelector('#nx-e-error');
    var feedback=root.querySelector('#nx-e-feedback');
    var copy=root.querySelector('#nx-e-copy');
    var link=root.querySelector('[data-echo-link]');
    var title=result.querySelector('[data-echo-result-title]');
    var description=result.querySelector('[data-echo-result-text]');
    var publicURL='https://forumprivilege.forumactif.com/f34-echo';
    var privateURL='https://forumprivilege.forumactif.com/privmsg?mode=post&u=1';

    function fields(){
      var out={};
      form.querySelectorAll('[name]').forEach(function(el){if(!(el.name in out))out[el.name]=el;});
      return out;
    }
    function mode(){
      var selected=form.querySelector('[name="echo-mode"]:checked');
      return selected && selected.value==='anonymous'?'anonymous':'public';
    }
    function setMode(){
      var anonymous=mode()==='anonymous';
      if(authorField) authorField.hidden=anonymous;
      var f=fields();
      if(f.auteur){
        f.auteur.required=!anonymous;
        if(anonymous){f.auteur.value='';f.auteur.removeAttribute('aria-invalid');}
      }
      if(error){error.hidden=true;error.textContent='';}
    }
    form.querySelectorAll('[name="echo-mode"]').forEach(function(el){
      el.addEventListener('change',setMode);
    });
    setMode();

    function clean(value){
      return String(value==null?'':value).trim().replace(/\[/g,'［').replace(/\]/g,'］');
    }
    function showError(field,message){
      if(error){error.textContent=message;error.hidden=false;}
      var f=fields();
      if(f[field]){f[field].setAttribute('aria-invalid','true');f[field].focus();}
    }
    function resetForm(){
      form.querySelectorAll('input,select,textarea').forEach(function(el){
        if(el.type==='checkbox')el.checked=false;
        else if(el.type==='radio')el.checked=el.value==='public';
        else if(el.tagName==='SELECT')el.selectedIndex=0;
        else el.value='';
        el.removeAttribute('aria-invalid');
      });
      setMode();
      output.value='';
      result.hidden=true;
      if(link)link.hidden=true;
      if(error){error.textContent='';error.hidden=true;}
      if(feedback)feedback.textContent='';
    }
    function prepare(){
      var f=fields(), anonymous=mode()==='anonymous';
      if(error){error.textContent='';error.hidden=true;}
      var required=anonymous?['categorie','titre','resume']:['categorie','auteur','titre','resume'];
      for(var i=0;i<required.length;i++){
        var key=required[i];
        if(!f[key] || !String(f[key].value||'').trim()){
          showError(key,'Merci de remplir les champs obligatoires.');
          return;
        }
      }
      var rp=String(f.rp&&f.rp.value||'').trim();
      if(rp){
        try{
          var parsed=new URL(rp);
          if(parsed.protocol!=='https:' || parsed.hostname!=='forumprivilege.forumactif.com'){
            showError('rp','Veuillez indiquer une adresse HTTPS du forum PRIVILÈGE.');
            return;
          }
        }catch(e){showError('rp','Veuillez indiquer une adresse HTTPS valide du forum PRIVILÈGE.');return;}
      }
      if(!f.accord || !f.accord.checked){
        showError('accord','Veuillez confirmer les conditions de participation.');
        return;
      }

      var lines=[
        anonymous?'[b]ÉCHOS DE NEW YORK // CONTRIBUTION ANONYME[/b]':'[b]ÉCHOS DE NEW YORK // CONTRIBUTION[/b]',
        '[b]Nature :[/b] '+clean(f.categorie.value),
        '[b]Titre :[/b] '+clean(f.titre.value)
      ];
      if(!anonymous) lines.push('[b]Personnage :[/b] '+clean(f.auteur.value));
      lines.push(
        '[b]Secteur :[/b] '+(f.quartier&&String(f.quartier.value||'').trim()?clean(f.quartier.value):'Non précisé'),
        '[b]RP source :[/b] '+(rp||'Non renseigné'),
        '',
        '[b]Écho transmis :[/b]',
        clean(f.resume.value),
        '',
        anonymous
          ? '[i]Contribution transmise anonymement au public. Soumise à validation du staff ; aucune publication ni officialisation automatique.[/i]'
          : '[i]Contribution volontaire. Aucun événement n’est officialisé automatiquement.[/i]'
      );
      output.value=lines.join('\n');
      result.hidden=false;
      if(title) title.textContent=anonymous?'Écho prêt à transmettre anonymement':'Écho prêt à publier';
      if(description) description.textContent=anonymous
        ? 'Copiez le brouillon, puis envoyez-le par message privé au compte NEXUS. Votre identité sera visible du staff dans le MP, mais ne figurera pas dans le texte public.'
        : 'Copiez le brouillon, puis publiez-le dans l’espace public des Échos. Votre personnage sera indiqué dans la contribution.';
      if(link){
        link.href=anonymous?privateURL:publicURL;
        link.textContent=anonymous?'Transmettre à NEXUS ↗':'Publier mon écho ↗';
        link.hidden=false;
      }
      var note=root.querySelector('[data-unconfigured]');
      if(note)note.hidden=true;
      if(feedback)feedback.textContent='Brouillon prêt. Aucun envoi ni publication automatique.';
      if(result.scrollIntoView)result.scrollIntoView({behavior:'smooth',block:'nearest'});
    }

    var prepareButton=form.querySelector('[data-nx-prepare]');
    var resetButton=form.querySelector('[data-nx-clear]');
    if(prepareButton)prepareButton.addEventListener('click',function(e){
      e.preventDefault();e.stopImmediatePropagation();prepare();
    },true);
    if(resetButton)resetButton.addEventListener('click',function(e){
      e.preventDefault();e.stopImmediatePropagation();resetForm();
    },true);
    if(copy)copy.addEventListener('click',function(){
      if(!output.value)return;
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(output.value).then(function(){
          if(feedback)feedback.textContent='Texte copié. Aucun envoi automatique.';
        }).catch(function(){
          output.focus();output.select();
          if(feedback)feedback.textContent='Sélectionnez puis copiez le texte.';
        });
      }else{
        output.focus();output.select();
        if(feedback)feedback.textContent='Sélectionnez puis copiez le texte.';
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
