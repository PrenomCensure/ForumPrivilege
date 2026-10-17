/* PRIVILÈGE / NEXUS ÉCHOS V1
   Aucun appel réseau, aucune publication automatique, aucune lecture des RP.
   Le JS active uniquement les interfaces explicitement présentes dans la page. */
(function () {
  'use strict';
  var citizen = document.getElementById('nx-echos-citizen');
  var admin = document.getElementById('nx-echos-admin');
  if (!citizen && !admin) return;

  var script = document.currentScript || document.querySelector('script[data-nx-echos-script]');
  if (script && script.src && !document.getElementById('nx-echos-styles')) {
    var css = document.createElement('link');
    css.id = 'nx-echos-styles';
    css.rel = 'stylesheet';
    css.href = new URL('nexus-echos.css?version=11', script.src).href;
    document.head.appendChild(css);
  }
  function clean(s) { return String(s || '').replace(/\r\n/g, '\n').trim(); }
  function bb(s) { return clean(s).replace(/\[/g, '［').replace(/\]/g, '］'); }
  function sourceUrl(text, restrictForum) {
    if (!text) return '';
    try {
      var value = /^https?:\/\//i.test(text) ? new URL(text) : new URL(text, window.location.origin === 'null' ? 'https://forumprivilege.forumactif.com' : window.location.origin);
      if (value.protocol !== 'https:' && value.protocol !== 'http:') return '';
      if (restrictForum && value.origin !== window.location.origin && value.hostname !== 'forumprivilege.forumactif.com') return '';
      return value.href;
    } catch (_) { return ''; }
  }
  function bindForumLink(root, attrName, selector, messageSelector, successText) {
    var href = sourceUrl(root.getAttribute(attrName), true);
    var link = root.querySelector(selector);
    if (!href || !link) return false;
    link.href = href; link.hidden = false;
    var msg = messageSelector ? root.querySelector(messageSelector) : null;
    if (msg) msg.textContent = successText;
    return true;
  }
  function error(field, msg, target) {
    if (target) { target.textContent = msg; target.hidden = false; }
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }
  // Les interfaces sont volontairement des DIV : un formulaire imbrique dans
  // l'editeur Forumactif peut empecher l'envoi du message (champs required).
  function namedFields(container) {
    var found = {};
    container.querySelectorAll('[name]').forEach(function (element) {
      if (!Object.prototype.hasOwnProperty.call(found, element.name)) found[element.name] = element;
    });
    return found;
  }
  function clearFields(container) {
    container.querySelectorAll('input,select,textarea').forEach(function (element) {
      if (element.type === 'checkbox' || element.type === 'radio') element.checked = false;
      else if (element.tagName === 'SELECT') element.selectedIndex = 0;
      else element.value = '';
    });
  }
  function resetErrors(form, dest) {
    if (dest) { dest.textContent = ''; dest.hidden = true; }
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }
  function requiredFields(form, names, dest) {
    for (var i = 0; i < names.length; i++) {
      var f = namedFields(form)[names[i]];
      if (!f || !clean(f.value)) { error(f, 'Merci de remplir les champs obligatoires.', dest); return false; }
    }
    return true;
  }
  function validRpURL(field, dest) {
    if (!clean(field.value)) return true;
    if (!sourceUrl(field.value, true) || !/^https?:\/\//i.test(clean(field.value))) {
      error(field, 'Indiquez un lien complet du forum PRIVILÈGE commençant par https://.', dest); return false;
    }
    return true;
  }
  function copyText(value, source, status) {
    function fallback() { source.focus(); source.select(); if (status) status.textContent = 'Copie indisponible : sélectionnez le texte affiché puis copiez-le.'; }
    if (!value) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { if (status) status.textContent = 'Texte copié. Aucune publication automatique.'; }).catch(fallback);
    } else {
      fallback();
    }
  }
  function attachFieldReset(form) {
    form.querySelectorAll('input,select,textarea').forEach(function (field) {
      field.addEventListener('input', function () { field.removeAttribute('aria-invalid'); });
      field.addEventListener('change', function () { field.removeAttribute('aria-invalid'); });
    });
  }
  if (citizen && citizen.dataset.initialized !== 'true') {
    citizen.dataset.initialized = 'true';
    var tabs = Array.prototype.slice.call(citizen.querySelectorAll('[role="tab"][data-target]'));
    var panels = Array.prototype.slice.call(citizen.querySelectorAll('[role="tabpanel"][data-panel]'));
    function showPanel(name, focusTab) {
      var activeTab = null;
      tabs.forEach(function (tab) {
        var active = tab.dataset.target === name;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active) activeTab = tab;
      });
      panels.forEach(function (panel) { panel.hidden = panel.dataset.panel !== name; });
      if (focusTab && activeTab) activeTab.focus();
    }
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { showPanel(tab.dataset.target, false); });
      tab.addEventListener('keydown', function (event) {
        var next = -1;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next >= 0) { event.preventDefault(); showPanel(tabs[next].dataset.target, true); }
      });
    });
    citizen.querySelectorAll('[data-go]').forEach(function (button) {
      button.addEventListener('click', function () { showPanel(button.dataset.go, true); });
    });
    citizen.classList.add('is-ready');
    showPanel('home', false);
    bindForumLink(citizen, 'data-fiche-url', '[data-fiche-link]', '[data-fiche-message]', 'Consulter la liste des dossiers sur le forum.');
    bindForumLink(citizen, 'data-annonces-url', '[data-comm-link]', '[data-comm-message]', 'Consulter les communiqués publics.');
    var configured = bindForumLink(citizen, 'data-echo-topic-url', '[data-echo-link]', '[data-unconfigured]', '');
    if (configured) {
      var hint = citizen.querySelector('[data-unconfigured]'); if (hint) hint.hidden = true;
    }
    var form = citizen.querySelector('#nx-e-form');
    var result = citizen.querySelector('#nx-e-result');
    var output = citizen.querySelector('#nx-e-output');
    var err = citizen.querySelector('#nx-e-error');
    var feedback = citizen.querySelector('#nx-e-feedback');
    var copy = citizen.querySelector('#nx-e-copy');
    if (form && result && output) {
      attachFieldReset(form);
      var citizenClear = form.querySelector('[data-nx-clear]');
      var citizenPrepare = form.querySelector('[data-nx-prepare]');
      if (citizenClear) citizenClear.addEventListener('click', function () {
        clearFields(form); result.hidden = true; output.value = ''; resetErrors(form, err);
        if (feedback) feedback.textContent = '';
      });
      if (citizenPrepare) citizenPrepare.addEventListener('click', function () {
        resetErrors(form, err);
        if (!requiredFields(form, ['categorie','auteur','titre','resume'], err)) return;
        var v = namedFields(form);
        if (!validRpURL(v.rp, err)) return;
        if (!v.accord.checked) { error(v.accord, 'Veuillez confirmer les conditions de participation.', err); return; }
        output.value = [
          '[b]ÉCHOS DE NEW YORK // CONTRIBUTION[/b]',
          '[b]Nature :[/b] ' + bb(v.categorie.value),
          '[b]Titre :[/b] ' + bb(v.titre.value),
          '[b]Personnage :[/b] ' + bb(v.auteur.value),
          '[b]Secteur :[/b] ' + (clean(v.quartier.value) ? bb(v.quartier.value) : 'Non précisé'),
          '[b]RP source :[/b] ' + (clean(v.rp.value) ? bb(v.rp.value) : 'Non renseigné'),
          '',
          '[b]Écho transmis :[/b]',
          bb(v.resume.value),
          '',
          '[i]Contribution volontaire. Aucune officialisation ou intervention RP automatique.[/i]'
        ].join('\n');
        result.hidden = false;
        if (feedback) feedback.textContent = 'Brouillon prêt. Rien n’a été transmis.';
        result.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest'});
      });
      if (copy) copy.addEventListener('click', function () { copyText(output.value, output, feedback); });
    }
  }
  // NEXUS V1.1: dialogue scénarisé (hors-jeu). Aucun réseau ni stockage.
  if (citizen) (function () {
    var frame=citizen.querySelector('#nx-dialogue');
    if(!frame || frame.getAttribute('data-initialized')==='true') return;
    frame.setAttribute('data-initialized','true');
    var DATA={"start":"accueil","nodes":{"accueil":{"title":"Bienvenue à New York","reply":"Bienvenue dans le module d’assistance de PRIVILÈGE. Je peux vous aider à concevoir un personnage, à vérifier une idée ou à comprendre les règles du monde.\n\nCette conversation est une aide hors-jeu : elle ne crée aucun dossier de personnage et ne transmet aucune information à NEXUS dans la fiction.\n\nQuelle question vous amène ?","choices":[{"label":"Je pars de zéro","next":"creation_idee"},{"label":"J’ai une idée à vérifier","next":"verification"},{"label":"Je cherche une réponse précise","next":"faq"},{"label":"Et le monde de New York ?","next":"territoires"}],"annexes":[{"label":"Index des annexes","url":"https://forumprivilege.forumactif.com/f10-annexes"}],"tags":["accueil","hors-jeu"]},"creation_idee":{"title":"Trouver son point de départ","reply":"Un personnage n’a pas besoin d’être exceptionnel pour être passionnant. Pensez d’abord à ce qu’il désire, à ce qui l’empêche de l’obtenir et aux liens qu’il pourrait créer avec d’autres personnes.\n\nQu’aimeriez-vous surtout écrire ?","choices":[{"label":"Une existence ordinaire","next":"ordinaire","set":{"intention":"Un quotidien à défendre"}},{"label":"Un rapport difficile au pouvoir","next":"riche_opposition","set":{"intention":"Une place au milieu du pouvoir"}},{"label":"Une rupture avec le système","next":"refus_link","set":{"intention":"Une existence en marge"}},{"label":"Un rapport complexe à la technologie","next":"augmentations","set":{"intention":"La technologie et ses limites"}}],"annexes":[{"label":"New York, 2046","url":"https://forumprivilege.forumactif.com/t26-01-new-york-2046"}],"tags":["creation"]},"verification":{"title":"Vérifier mon concept","reply":"Votre idée mérite d’être confrontée au monde, pas réduite à une case. Par quoi souhaitez-vous commencer ? Je vous indiquerai ce qui est établi, ce qui reste à choisir et ce qui demande une vérification.","choices":[{"label":"Je suis riche mais opposé à la D.R.A.","next":"riche_opposition"},{"label":"Je travaille pour une institution et cache quelque chose","next":"double_vie"},{"label":"Je vis sans Link","next":"refus_link"},{"label":"Je veux jouer quelqu’un de très puissant","next":"pouvoir"},{"label":"Je veux une histoire crédible","next":"chronologie"}],"annexes":[{"label":"Index des annexes","url":"https://forumprivilege.forumactif.com/f10-annexes"}],"tags":["verification"]},"faq":{"title":"Questions fréquentes","reply":"Vous pouvez poser une question en choisissant une situation. Les réponses sont préparées à partir des règles établies ; elles ne remplacent pas les annexes.","choices":[{"label":"Groupes et factions","next":"groupe_faction"},{"label":"Link et confidentialité","next":"link_confidentialite"},{"label":"Technologies et androïdes","next":"androides"},{"label":"Jouer sans être au cœur d’une intrigue","next":"ordinaire"},{"label":"Contribuer au monde","next":"echos"}],"annexes":[{"label":"Index des annexes","url":"https://forumprivilege.forumactif.com/f10-annexes"}],"tags":["faq"]},"groupe_faction":{"title":"Groupe ou faction ?","reply":"Les quatre groupes de PRIVILÈGE — STANDARD, GILDED, ACCREDITED et UNREGISTERED — permettent de situer les personnages. Ce ne sont pas quatre castes juridiques.\n\nUne faction, en revanche, est une organisation ou une affiliation narrative. Votre groupe ne détermine pas automatiquement vos convictions ni vos alliances.","choices":[{"label":"Un quartier détermine-t-il le groupe ?","next":"quartier_groupe"},{"label":"Puis-je n’avoir aucune faction ?","next":"sans_faction"},{"label":"Je suis riche mais opposé à la D.R.A.","next":"riche_opposition"},{"label":"Retour aux questions","next":"faq"}],"annexes":[{"label":"Choisir son groupe","url":"https://forumprivilege.forumactif.com/t44-02-choisir-son-groupe"},{"label":"Les organisations","url":"https://forumprivilege.forumactif.com/t33-08-les-organisations"}],"tags":["canon"]},"quartier_groupe":{"title":"Quartier et groupe social","reply":"Habiter un territoire de New York ne suffit pas à attribuer un groupe. Le lieu de résidence, le statut social et les affiliations sont des dimensions distinctes.\n\nPour choisir, partez de la situation concrète de votre personnage et vérifiez les critères du guide officiel.","choices":[{"label":"Comprendre les groupes","next":"groupe_faction"},{"label":"Explorer la ville","next":"territoires"},{"label":"Retour aux questions","next":"faq"}],"annexes":[{"label":"Choisir son groupe","url":"https://forumprivilege.forumactif.com/t44-02-choisir-son-groupe"},{"label":"New York, 2046","url":"https://forumprivilege.forumactif.com/t26-01-new-york-2046"}],"tags":["canon"]},"territoires":{"title":"Trouver sa place dans la ville","reply":"New York offre cinq territoires de jeu : CROWN, VOLT, PULSE, RIFT et VEIL. Le territoire peut modeler le quotidien, les rencontres et les tensions de votre personnage ; il ne lui attribue pas automatiquement un groupe ou une faction.\n\nChoisissez d’abord une manière d’habiter la ville, puis consultez les descriptions publiques.","choices":[{"label":"Un quartier détermine-t-il le groupe ?","next":"quartier_groupe"},{"label":"Je veux une vie ordinaire","next":"ordinaire"},{"label":"Construire mon histoire","next":"chronologie"}],"annexes":[{"label":"New York, 2046","url":"https://forumprivilege.forumactif.com/t26-01-new-york-2046"},{"label":"Choisir son groupe","url":"https://forumprivilege.forumactif.com/t44-02-choisir-son-groupe"}],"tags":["canon"]},"sans_faction":{"title":"Rester indépendant","reply":"Bien sûr. Un personnage n’a pas besoin d’appartenir à une organisation pour faire vivre le forum. Son métier, ses relations, ses besoins et ses contradictions peuvent suffire à le relier aux intrigues.\n\nL’indépendance n’est ni une protection absolue ni un défaut de conception.","choices":[{"label":"Une vie quotidienne intéressante","next":"ordinaire"},{"label":"Et s’il refuse le Link ?","next":"refus_link"},{"label":"Retour aux factions","next":"groupe_faction"}],"annexes":[{"label":"Les organisations","url":"https://forumprivilege.forumactif.com/t33-08-les-organisations"}],"tags":["creation"]},"ordinaire":{"title":"Créer sans être exceptionnel","reply":"Commencez par trois choses : un désir accessible, une contrainte quotidienne et une relation qui pourrait tout compliquer.\n\nExemple : une personne cherche à garder son travail, évite une démarche administrative et dissimule un conflit familial. Aucun pouvoir extraordinaire n’est nécessaire pour créer du jeu.\n\nCet exemple est une piste d’écriture, pas un fait du canon.","choices":[{"label":"Comment créer des liens RP ?","next":"relations"},{"label":"Choisir son quartier","next":"territoires"},{"label":"Revenir à la création","next":"creation_idee"},{"label":"Continuer mon personnage →","next":"parcours_link"}],"annexes":[{"label":"New York, 2046","url":"https://forumprivilege.forumactif.com/t26-01-new-york-2046"}],"tags":["creation"]},"relations":{"title":"Des accroches pour jouer avec les autres","reply":"Pensez à ce que votre personnage peut donner, demander ou refuser aux autres : un service, un secret, une dette, un emploi, une place, une promesse. Une fiche intéressante ouvre des portes aux autres joueurs.\n\nLes conséquences concernant leurs personnages restent à construire ensemble.","choices":[{"label":"Faire vivre une idée dans la ville","next":"echos"},{"label":"Revenir au quotidien","next":"ordinaire"},{"label":"Vérifier un autre concept","next":"verification"}],"annexes":[],"tags":["creation"]},"riche_opposition":{"title":"Riche et hostile à la D.R.A. ?","reply":"Votre aisance sociale et vos opinions politiques ne sont pas la même chose. Une personne privilégiée peut contester l’institution dont elle tire parfois avantage.\n\nCe qui rendra le concept crédible, ce sont les contradictions : que risque-t-elle de perdre, que protège-t-elle malgré elle, jusqu’où est-elle prête à aller ?\n\nPour son groupe précis et les pouvoirs qu’elle peut exercer, référez-vous aux critères publics ; cette réponse n’accorde aucun privilège supplémentaire.","choices":[{"label":"Et si elle travaille pour la D.R.A. ?","next":"double_vie"},{"label":"Choisir son groupe","next":"groupe_faction"},{"label":"Créer ses relations","next":"relations"},{"label":"Continuer mon personnage →","next":"parcours_link"}],"annexes":[{"label":"Choisir son groupe","url":"https://forumprivilege.forumactif.com/t44-02-choisir-son-groupe"},{"label":"Les organisations","url":"https://forumprivilege.forumactif.com/t33-08-les-organisations"}],"tags":["nuance"]},"double_vie":{"title":"Institution et activité secrète","reply":"Une double vie est une excellente tension narrative, mais elle n’accorde pas automatiquement à votre personnage un accès illimité aux secrets de l’institution.\n\nDéfinissez sa fonction réelle, ce qu’il peut savoir, ce qu’il ignore et les risques qu’il accepte de prendre. Toute responsabilité importante ou information sensible devra respecter les annexes et, si besoin, être validée avec le staff.","choices":[{"label":"Quelles données NEXUS connaît-elle ?","next":"link_confidentialite"},{"label":"Comment gérer un secret ?","next":"secrets"},{"label":"Un personnage puissant a-t-il des limites ?","next":"pouvoir"}],"annexes":[{"label":"Les organisations","url":"https://forumprivilege.forumactif.com/t33-08-les-organisations"}],"tags":["nuance"]},"secrets":{"title":"Protéger les secrets de jeu","reply":"Un secret écrit dans une fiche ou un RP n’est pas automatiquement connu de NEXUS dans la fiction. Distinguez ce que le joueur sait, ce que les autres personnages savent et ce que l’institution pourrait établir.\n\nPour une intrigue partagée, les révélations importantes se construisent avec les personnes concernées, sans présumer de leur consentement.","choices":[{"label":"NEXUS est-elle omnisciente ?","next":"link_confidentialite"},{"label":"Retour à la double vie","next":"double_vie"},{"label":"Reprendre la création","next":"creation_idee"}],"annexes":[{"label":"Le Link Citoyen","url":"https://forumprivilege.forumactif.com/t28-03-le-link-citoyen"}],"tags":["canon"]},"refus_link":{"title":"Vivre sans Link Citoyen","reply":"Le Link est officiellement facultatif. Son absence entraîne pourtant des désavantages administratifs et sociaux significatifs. Cette tension peut nourrir le parcours d’un personnage, sans en dicter les choix.\n\nRefuser le Link ne rend pas automatiquement membre de Fréquence Zéro. L’affiliation à une organisation est une décision distincte.","choices":[{"label":"Sans Link, que sait NEXUS ?","next":"link_confidentialite"},{"label":"Et Fréquence Zéro ?","next":"frequence_zero"},{"label":"Choisir une place sociale","next":"groupe_faction"},{"label":"Continuer mon personnage →","next":"parcours_link"}],"annexes":[{"label":"Le Link Citoyen","url":"https://forumprivilege.forumactif.com/t28-03-le-link-citoyen"},{"label":"Les organisations","url":"https://forumprivilege.forumactif.com/t33-08-les-organisations"}],"tags":["canon"]},"frequence_zero":{"title":"Refus du Link et Fréquence Zéro","reply":"Fréquence Zéro est une organisation du lore, pas une étiquette automatiquement attribuée à toute personne non connectée. Les appellations Silencieux et Enfants du Néant ne doivent pas être traitées comme deux nouvelles factions distinctes.\n\nPour rejoindre ou fréquenter une organisation, il faut tenir compte de son histoire, de ses objectifs et des règles publiées.","choices":[{"label":"Je préfère rester indépendant","next":"sans_faction"},{"label":"Revenir au Link","next":"refus_link"},{"label":"Voir les organisations","next":"groupe_faction"}],"annexes":[{"label":"Les organisations","url":"https://forumprivilege.forumactif.com/t33-08-les-organisations"}],"tags":["canon"]},"link_confidentialite":{"title":"NEXUS lit-elle tout ?","reply":"Non. NEXUS est une IA institutionnelle puissante, mais dépendante de la D.R.A., des réseaux et des données auxquelles elle peut effectivement accéder. Elle ne connaît pas automatiquement les pensées ou tous les secrets d’un personnage.\n\nLe simple fait d’utiliser cette assistance hors-jeu n’enregistre pas de nouvelle information dans son dossier RP.","choices":[{"label":"Créer un personnage avec un secret","next":"secrets"},{"label":"Vivre sans Link","next":"refus_link"},{"label":"Retour aux questions","next":"faq"}],"annexes":[{"label":"Le Link Citoyen","url":"https://forumprivilege.forumactif.com/t28-03-le-link-citoyen"}],"tags":["canon"]},"pouvoir":{"title":"Un personnage trop puissant ?","reply":"Le pouvoir n’est pas interdit ; l’absence de limites pose davantage problème. Commencez par définir la source de son influence, son champ d’action et une dépendance qu’il ne peut pas contourner.\n\nUne position institutionnelle, un réseau d’alliés ou une augmentation technologique ne donnent ni toute-puissance ni droit de décider des actions d’autres joueurs.","choices":[{"label":"Et si je travaille pour une institution ?","next":"double_vie"},{"label":"J’imagine une augmentation","next":"augmentations"},{"label":"Construire ses faiblesses","next":"relations"}],"annexes":[{"label":"Les organisations","url":"https://forumprivilege.forumactif.com/t33-08-les-organisations"},{"label":"Les augmentations","url":"https://forumprivilege.forumactif.com/t31-06-les-augmentations"}],"tags":["nuance"]},"augmentations":{"title":"Augmentations et implants","reply":"Les augmentations humaines existent dans PRIVILÈGE, mais leurs effets et limites sont définis par le canon. Ne partez pas du principe qu’un implant permet n’importe quelle capacité ou qu’il est toujours détectable.\n\nDécrivez ce qu’il change concrètement dans la vie du personnage, puis vérifiez l’annexe avant de fixer ses possibilités.","choices":[{"label":"Puis-je jouer un androïde ?","next":"androides"},{"label":"Vérifier les limites de NEXUS","next":"link_confidentialite"},{"label":"Retour à mon concept","next":"verification"},{"label":"Continuer mon personnage →","next":"parcours_link"}],"annexes":[{"label":"Les augmentations","url":"https://forumprivilege.forumactif.com/t31-06-les-augmentations"}],"tags":["canon"]},"androides":{"title":"Puis-je jouer un androïde ?","reply":"À ce stade, les règles de création précédemment retenues réservent les personnages jouables aux humains majeurs ; les androïdes appartiennent à l’univers mais ne sont pas proposés comme personnages joueurs.\n\nSi les thèmes de l’intelligence artificielle et de l’humanité vous attirent, vous pouvez les explorer à travers un personnage humain. Vérifiez toujours la règle publiée avant de finaliser votre fiche.","choices":[{"label":"Construire un personnage augmenté","next":"augmentations"},{"label":"Imaginer un personnage humain","next":"creation_idee"},{"label":"Retour aux questions","next":"faq"}],"annexes":[{"label":"Les augmentations","url":"https://forumprivilege.forumactif.com/t31-06-les-augmentations"},{"label":"Index des annexes","url":"https://forumprivilege.forumactif.com/f10-annexes"}],"tags":["regle-a-reverifier"]},"chronologie":{"title":"Ancrer sa biographie","reply":"Votre personnage n’a pas besoin d’avoir participé à tous les grands événements du monde. Il doit seulement pouvoir y vivre de manière cohérente.\n\nRelevez son année de naissance, deux ou trois étapes personnelles marquantes, puis comparez-les à la chronologie de 2026 à 2046. N’inventons pas de guerre civile ou de catastrophe fondatrice absente du canon.","choices":[{"label":"J’ai besoin d’un quotidien crédible","next":"ordinaire"},{"label":"Vérifier son territoire","next":"territoires"},{"label":"Retour aux questions","next":"faq"}],"annexes":[{"label":"Chronologie 2026–2046","url":"https://forumprivilege.forumactif.com/t39-09-chronologie"}],"tags":["canon"]},"echos":{"title":"Laisser une trace dans New York","reply":"Une rumeur, un incident ou une initiative née de vos RP peut nourrir la mémoire collective de New York. Le module « Échos de New York » permettra de proposer volontairement ce type de matière narrative.\n\nUne contribution ne devient pas canonique automatiquement et n’oblige pas le staff à produire une intrigue.","choices":[{"label":"Trouver une idée de relation","next":"relations"},{"label":"Revenir aux questions","next":"faq"},{"label":"Recommencer","next":"accueil"}],"annexes":[],"tags":["fonctionnalite"]},"parcours_link":{"title":"Construire : son rapport au Link","reply":"Nous allons préciser votre point de départ, sans attribuer automatiquement de groupe, de métier ou de faction.\n\nQuel rapport imaginez-vous entre votre personnage et le Link Citoyen ?","choices":[{"label":"Il possède un Link","next":"parcours_conflit","set":{"link":"Présent"}},{"label":"Il vit sans Link","next":"parcours_conflit","set":{"link":"Absent"}},{"label":"Je ne sais pas encore","next":"parcours_conflit","set":{"link":"À définir"}}],"annexes":[{"label":"Le Link Citoyen","url":"https://forumprivilege.forumactif.com/t28-03-le-link-citoyen"}],"tags":["creation-guidée"]},"parcours_conflit":{"title":"Construire : la source du conflit","reply":"Une existence devient jouable lorsqu’elle rencontre d’autres existences. À quel endroit aimeriez-vous placer sa tension principale ?\n\nIl s’agit d’une piste narrative, pas d’une obligation de scénario.","choices":[{"label":"Face aux institutions","next":"parcours_faille","set":{"conflit":"Face aux institutions"}},{"label":"Entre plusieurs loyautés","next":"parcours_faille","set":{"conflit":"Entre des loyautés"}},{"label":"Dans ses relations intimes","next":"parcours_faille","set":{"conflit":"Dans ses relations personnelles"}}],"annexes":[],"tags":["creation-guidée"]},"parcours_faille":{"title":"Construire : ce qui lui résiste","reply":"Pour éviter un personnage sans prises pour le jeu, accordons-lui une faille. Il ne s’agit pas nécessairement d’un traumatisme : une ambition, une fidélité ou une peur peuvent suffire.\n\nQuelle fragilité souhaitez-vous explorer ?","choices":[{"label":"Un secret difficile à protéger","next":"bilan","set":{"faille":"Un secret à protéger"}},{"label":"Une ambition qui coûte cher","next":"bilan","set":{"faille":"Une ambition coûteuse"}},{"label":"Une loyauté fragile","next":"bilan","set":{"faille":"Une loyauté fragile"}},{"label":"La peur de perdre un lien","next":"bilan","set":{"faille":"La peur de perdre un lien"}}],"annexes":[],"tags":["creation-guidée"]},"bilan":{"title":"Votre première esquisse","reply":"Voici votre point de départ. Il n’a pas vocation à écrire votre personnage à votre place : il rassemble simplement les pistes choisies au fil de la conversation.\n\nCette proposition n’est ni une validation de fiche ni une attribution de groupe. Confrontez-la aux annexes et imaginez maintenant des liens avec d’autres personnages.","choices":[{"label":"Vérifier mon groupe","next":"groupe_faction"},{"label":"Choisir son territoire","next":"territoires"},{"label":"Construire ses relations","next":"relations"},{"label":"Recommencer","next":"accueil"}],"annexes":[{"label":"Choisir son groupe","url":"https://forumprivilege.forumactif.com/t44-02-choisir-son-groupe"},{"label":"Chronologie 2026–2046","url":"https://forumprivilege.forumactif.com/t39-09-chronologie"}],"tags":["creation-guidée"]}}};
    var feed=frame.querySelector('[data-nx-feed]');
    var choices=frame.querySelector('[data-nx-choices]');
    var back=frame.querySelector('[data-nx-back]');
    var reset=frame.querySelector('[data-nx-reset]');
    var current=DATA.start, history=[], transcript=[], answers={};
    function textEl(tag,className,value){
      var el=document.createElement(tag); el.className=className;el.textContent=value;return el;
    }
    function chatMessage(entry){
      var element=textEl('div','nx-dialogue__bubble '+(entry.role==='VOUS'?'nx-dialogue__bubble--member':'nx-dialogue__bubble--nexus'),'');
      element.appendChild(textEl('span','nx-dialogue__who',entry.role));
      element.appendChild(textEl('div','nx-dialogue__body',entry.text));
      if(entry.urls && entry.urls.length){
        var box=textEl('div','nx-dialogue__sources','');
        entry.urls.forEach(function (src){
          try {
            var url=new URL(src.url,window.location.href);
            if(url.protocol!=='https:' || url.hostname!=='forumprivilege.forumactif.com')return;
            var a=textEl('a','nx-dialogue__source','↗ '+src.label);
            a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';box.appendChild(a);
          }catch(e){}
        });
        if(box.children.length)element.appendChild(box);
      }
      return element;
    }
    function replyFor(key){
      var node=DATA.nodes[key];var reply=node.reply;
      if(key==='bilan')reply+='\n\n— ÉBAUCHE DE VOTRE PERSONNAGE —\n• Piste de départ : '+(answers.intention||'À définir')+'\n• Link Citoyen : '+(answers.link||'À définir')+'\n• Tension narrative : '+(answers.conflit||'À définir')+'\n• Fragilité : '+(answers.faille||'À définir');
      return reply;
    }
    function render(){
      feed.replaceChildren();
      transcript.forEach(function(m){feed.appendChild(chatMessage(m));});
      choices.replaceChildren();
      (DATA.nodes[current].choices||[]).forEach(function(option){
        var btn=textEl('button','nx-dialogue__choice',option.label);btn.type='button';
        btn.addEventListener('click',function(){
          if(!DATA.nodes[option.next])return;
          history.push({current:current,transcript:transcript.slice(),answers:Object.assign({},answers)});
          if(history.length>30)history.shift();
          Object.assign(answers,option.set||{});
          current=option.next;
          transcript.push({role:'VOUS',text:option.label},{role:'NEXUS · ASSISTANCE',text:replyFor(current),urls:DATA.nodes[current].annexes});
          render();
        });
        choices.appendChild(btn);
      });
      back.disabled=history.length===0;
      feed.scrollTop=feed.scrollHeight;
    }
    function doReset(){
      current=DATA.start;history=[];answers={};
      transcript=[{role:'NEXUS · ASSISTANCE',text:replyFor(current),urls:DATA.nodes[current].annexes}];
      render();
    }
    back.addEventListener('click',function(){
      if(!history.length)return;
      var previous=history.pop();current=previous.current;answers=previous.answers;transcript=previous.transcript;render();
    });
    reset.addEventListener('click',doReset);
    doReset();
  })();

  if (admin && admin.dataset.initialized !== 'true') {
    admin.dataset.initialized = 'true';
    bindForumLink(admin, 'data-admin-source-url', '[data-admin-source-link]');
    var aform = admin.querySelector('#nx-e-admin-form');
    var aresult = admin.querySelector('#nx-e-admin-result');
    var aoutput = admin.querySelector('#nx-e-admin-output');
    var aerr = admin.querySelector('#nx-e-admin-error');
    var afeedback = admin.querySelector('#nx-e-admin-feedback');
    var acopy = admin.querySelector('#nx-e-admin-copy');
    if (aform && aresult && aoutput) {
      attachFieldReset(aform);
      var adminClear = aform.querySelector('[data-nx-clear]');
      var adminPrepare = aform.querySelector('[data-nx-prepare]');
      if (adminClear) adminClear.addEventListener('click', function () {
        clearFields(aform); aresult.hidden = true; aoutput.value = ''; resetErrors(aform, aerr);
        if (afeedback) afeedback.textContent = '';
      });
      if (adminPrepare) adminPrepare.addEventListener('click', function () {
        resetErrors(aform, aerr);
        if (!requiredFields(aform, ['idee'], aerr)) return;
        var v = namedFields(aform);
        if (!validRpURL(v.source, aerr)) return;
        var idee = bb(v.idee.value).replace(/\n+/g, ' ');
        var lieu = bb(v.lieu.value) || 'un secteur de New York';
        var intro = '';
        switch (v.format.value) {
          case 'communique':
            intro = '[b]NEXUS — INFORMATION INSTITUTIONNELLE[/b]\n[small]Secteur : ' + lieu + '[/small]\n\nLes services compétents ont pris connaissance du signalement suivant : ' + idee + '\n\nLes informations disponibles ne permettent pas, à ce stade, de formuler davantage de conclusions.\n\n[i]Votre coopération contribue à la continuité de la cité.[/i]';
            break;
          case 'actualite':
            intro = '[b]BRÈVE DE NEW YORK — ' + lieu + '[/b]\n\n' + idee + '\n\nD’autres éléments pourraient émerger au fil des témoignages.';
            break;
          case 'amorce':
            intro = '[b]AMORCE DE RP — ' + lieu + '[/b]\n\nUn fait retient l’attention : ' + idee + '\n\nLes personnages désireux d’en savoir davantage peuvent s’en saisir librement, dans le respect des accords RP.';
            break;
          default:
            intro = '[b]ON MURMURE À NEW YORK…[/b]\n\nDans ' + lieu + ', une rumeur circule : ' + idee + '\n\n[i]Rien ne permet encore de distinguer la vérité des murmures de la ville.[/i]';
        }
        aoutput.value = intro;
        aresult.hidden = false;
        if (afeedback) {
          var unchecked = ['canon','consentement','portee'].filter(function (n) { return !v[n].checked; }).length;
          afeedback.textContent = unchecked ? 'Canevas généré. ' + unchecked + ' point(s) de vigilance non coché(s) : relisez avant publication.' : 'Canevas généré. Vérifiez le texte avant publication.';
        }
        aresult.scrollIntoView({behavior:'smooth', block:'nearest'});
      });
      if (acopy) acopy.addEventListener('click', function () { copyText(aoutput.value, aoutput, afeedback); });
    }
  }
})();
