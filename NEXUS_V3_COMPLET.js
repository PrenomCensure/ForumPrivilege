/*
 * PRIVILÈGE — NEXUS V3.1 / Terminal citoyen + Échos de New York
 * Version de travail 2026-10-31 — annexe 10 intégrée
 * AUCUN appel réseau, stockage, accès aux données de compte ou publication automatique.
 * Assistant guidé hors-jeu : réponses scénarisées, liens publics et brouillons locaux.
 * Installation : remplacer la référence au script nexus-v2-terminal.js APRÈS test.
 * Compatible avec les attributs data-nx-* et #nx-dialogue de la V2.
 */
(function () {
  'use strict';
  if (window.__PRIVILEGE_NEXUS_V3_INITIALIZED__) return;
  window.__PRIVILEGE_NEXUS_V3_INITIALIZED__ = true;

  // Conserve le chargement du CSS des Échos assuré par l'ancien script.
  var loadedFrom = document.currentScript || document.querySelector('script[data-nx-echos-script]');
  if (loadedFrom && loadedFrom.src && !document.getElementById('nx-echos-styles')) {
    try {
      var echoStyle = document.createElement('link');
      echoStyle.id = 'nx-echos-styles';
      echoStyle.rel = 'stylesheet';
      echoStyle.href = new URL('nexus-echos.css?version=11', loadedFrom.src).href;
      document.head.appendChild(echoStyle);
    } catch (e) { /* Aucun style ajouté si l'URL est indisponible. */ }
  }
  var ORIGIN = 'https://forumprivilege.forumactif.com';
  var URLS = {
    ville: ORIGIN + '/t26-01-new-york-2046',
    link: ORIGIN + '/t28-03-le-link-citoyen',
    guide: ORIGIN + '/t110-10-guide-pratique-2046',
    societe: ORIGIN + '/t29-04-la-societe-en-2046',
    augmentations: ORIGIN + '/t31-06-les-augmentations',
    organisations: ORIGIN + '/t33-08-les-organisations',
    chronologie: ORIGIN + '/t39-09-chronologie',
    groupes: ORIGIN + '/t44-02-choisir-son-groupe',
    annexes: ORIGIN + '/f10-annexes',
    syn: ORIGIN + '/h2-syn_code',
    annonces: ORIGIN + '/t81-nexus-annonces-du-staff#201'
  };
  function src(name, key) { return { label: name, url: URLS[key] }; }
  function opt(label, next, set) { var v={label:label,next:next}; if(set) v.set=set; return v; }
  function add(data, key, title, reply, choices, sources, keywords) {
    data[key] = { title:title, reply:reply, choices:choices || [], annexes:sources || [], keywords:keywords || '' };
  }
  function txt(tag, cls, value) {
    var el=document.createElement(tag); if(cls)el.className=cls;
    if(value!==undefined)el.textContent=String(value); return el;
  }
  function val(v) { return String(v == null ? '' : v).trim(); }
  function normalize(s) {
    return val(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  }
  function safeForumURL(value) {
    if(!value)return '';
    try {
      var url = new URL(value, ORIGIN);
      return url.protocol==='https:' && url.hostname==='forumprivilege.forumactif.com' ? url.href : '';
    } catch(e) { return ''; }
  }
  function cleanBB(value) { return val(value).replace(/\[/g,'［').replace(/\]/g,'］'); }
  function copyText(value, output, feedback) {
    if (!value) return;
    function fallback() {
      if (output && output.select) { output.focus(); output.select(); }
      if (feedback) feedback.textContent='Copie indisponible : sélectionnez puis copiez le texte.';
    }
    if(navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function(){
        if(feedback) feedback.textContent='Texte copié. Aucune publication automatique.';
      }).catch(fallback);
    } else fallback();
  }
  function fields(root) {
    var out={}; if (!root) return out;
    root.querySelectorAll('[name]').forEach(function(el){ if(!(el.name in out))out[el.name]=el; });
    return out;
  }
  function issue(form, field, feedback, message) {
    if(feedback) { feedback.textContent=message; feedback.hidden=false; }
    var input=fields(form)[field];
    if(input){ input.setAttribute('aria-invalid','true'); input.focus(); }
  }
  function resetFields(root) {
    root.querySelectorAll('input,select,textarea').forEach(function(el){
      if(el.type==='checkbox'||el.type==='radio')el.checked=false;
      else if(el.tagName==='SELECT')el.selectedIndex=0;
      else el.value='';
      el.removeAttribute('aria-invalid');
    });
  }

  /* Toutes les réponses publiques de NEXUS V3. Pas de secrets STAFF. */
  var N = {};
  add(N,'home','NEXUS — Terminal citoyen',
    'Bienvenue sur PRIVILÈGE. Ce terminal est une assistance HORS-JEU : il aide à comprendre New York en 2046 et à imaginer un personnage.\n\nLes réponses sont écrites à l’avance. NEXUS ne lit ni votre fiche, ni vos RP, ni vos données personnelles. Aucun choix ne constitue une validation du staff.',
    [opt('Créer un personnage','create'),opt('Le Link et la déconnexion','link'),opt('Annexe 10 · Guide pratique','guide'),opt('Vivre à New York','everyday'),opt('Groupes et organisations','affiliations'),opt('Histoire et institutions','history'),opt('Trouver une idée de RP','ideas')],
    [src('Index des annexes','annexes'),src('Guide pratique · Annexe 10','guide'),src('Annonces du staff','annonces')], 'accueil bienvenue aide début interface');

  add(N,'create','Construire un personnage',
    'Un personnage crédible n’a pas besoin de contrôler la ville. Choisissez ce qu’il désire, ce qu’il risque de perdre, ce qui l’attache à New York et ce que la société attend de lui.\n\nVous pouvez bâtir une ébauche guidée, consulter les règles ou simplement explorer le monde.',
    [opt('Commencer mon ébauche','build_bloc'),opt('Choisir un groupe','groups'),opt('Link et augmentations','technology'),opt('Travail et vie ordinaire','work'),opt('Vérifier une idée difficile','validation'),opt('Sommaire','home')],
    [src('Choisir son groupe','groupes'),src('Annexes','annexes')], 'fiche personnage présentation création');
  add(N,'validation','Un concept est-il jouable ?',
    'En règle générale : les personnages joueurs sont des humains majeurs. Les androïdes ne sont pas jouables. Les dispositifs technologiques ont des limites, et aucune relation ou action importante ne peut être imposée à un autre joueur.\n\nUn poste décisif, une opération à portée collective ou une capacité exceptionnelle peut nécessiter une concertation avec le staff. NEXUS fournit des repères, pas des validations.',
    [opt('Personnage très augmenté','augments'),opt('Un androïde dans une histoire','android'),opt('Organisation clandestine','orgs'),opt('Choisir son groupe','groups'),opt('Retour à la création','create')],
    [src('Augmentations','augmentations'),src('Organisations','organisations')], 'jouable validation staff pouvoirs limites');
  add(N,'technology','Comprendre la technologie',
    'Le Link Citoyen, les augmentations corporelles, les androïdes et les services de NEXUS sont des réalités distinctes. Les posséder ou les fréquenter ne donne pas un accès universel aux systèmes et aux informations.',
    [opt('Le Link standard','link'),opt('Pannes et déconnexion','offline'),opt('Augmentations corporelles','augments'),opt('Androïdes','android'),opt('Confidentialité','privacy'),opt('Retour','home')],
    [src('Link Citoyen','link'),src('Augmentations','augmentations')], 'implant technologie IA cybernétique');

  add(N,'link','Qu’est-ce que le Link Citoyen ?',
    'Le Link est une interface neuronale associée à un discret module sous-cutané. Il facilite l’assistance cognitive, les expériences sensorielles, certaines applications somatiques encadrées et les interactions avec les systèmes connectés.\n\nIl peut aider à payer, valider un trajet, ouvrir un accès autorisé ou communiquer. Il ne lit pas librement les pensées et ne contrôle pas tous les appareils. Son implantation est facultative.',
    [opt('Quand est-il implanté ?','implantation'),opt('Se déconnecter temporairement','offline'),opt('Vivre sans Link','no_link'),opt('Le Link dans la vie courante','guide'),opt('Quatre domaines fonctionnels','functions'),opt('Confidentialité','privacy'),opt('Retour aux technologies','technology')],
    [src('Annexe 03 · Link Citoyen','link'),src('Annexe 10 · Guide pratique','guide')], 'link citoyen implant neural payer ouvrir porte transport obligation');
  add(N,'implantation','Pose, réparation et retrait du Link',
    'L’implantation ordinaire est autorisée à la majorité. Une implantation plus précoce n’est admise qu’en cas de nécessité médicale, dans un cadre réglementé.\n\nLe Link peut subir des pannes, nécessiter un entretien ou un remplacement de composant. Son retrait définitif est légal, mais demande une prise en charge médicale, avec ses contraintes et risques. Les données déjà transmises à des tiers ne disparaissent pas automatiquement.',
    [opt('Et si mon Link tombe en panne ?','pannes'),opt('Déconnexion temporaire','offline'),opt('Vivre sans implant','no_link'),opt('Retour au Link','link')],
    [src('Annexe 03','link')], 'âge majorité mineur pose sous cutané retrait implant réparer remplacer risques');
  add(N,'offline','Puis-je couper mon Link ?',
    'Oui. Une déconnexion RÉSEAU temporaire est possible. Certaines fonctions locales restent accessibles ; les services qui exigent une vérification en temps réel peuvent cesser de fonctionner.\n\nDes informations conservées localement peuvent être synchronisées plus tard. Attention : les caméras, terminaux et services extérieurs peuvent enregistrer leurs propres traces. Être hors ligne ne rend pas invisible.',
    [opt('Différence avec un retrait','implantation'),opt('Protection des données','privacy'),opt('Conséquences au quotidien','no_link'),opt('Retour au Link','link')],
    [src('Annexe 03','link'),src('Annexe 10 · Guide pratique','guide')], 'wifi avion hors ligne deconnexion sync synchronisation différée upload');
  add(N,'functions','Les quatre fonctions du Link',
    '1. Assistance cognitive : traduction, navigation, informations contextualisées.\n2. Expérience sensorielle : immersion et flux émotionnels médiatisés.\n3. Applications somatiques : usages médicaux spécialisés, encadrés.\n4. Interaction environnementale : paiements, accès, transports et appareils compatibles.\n\nChaque fonction dépend de droits, de configurations et parfois d’une connexion active.',
    [opt('Blue Stream et Raw Heart','flux'),opt('Applications somatiques','somatique'),opt('Payer et circuler','paiement'),opt('Retour au Link','link')],
    [src('Annexe 03','link'),src('Annexe 10 · Guide pratique','guide')], 'cognitif sensoriel somatique payer portes interactif');
  add(N,'flux','Blue Stream et Raw Heart',
    'Blue Stream propose des expériences émotionnelles filtrées ou éditées. Raw Heart privilégie des flux moins filtrés, potentiellement plus intenses et irréguliers.\n\nCe sont des expériences technologiques médiatisées, pas une télépathie, une preuve des émotions réelles d’autrui ou un transfert exact de souvenirs.',
    [opt('Link Poreux de Cordis','cordis'),opt('Vie intime et loisirs','leisure'),opt('Retour au Link','link')],
    [src('Annexe 03','link'),src('Annexe 06','augmentations')], 'blue stream raw heart émotion sensation mémoire');
  add(N,'somatique','Peut-on contrôler le corps ?',
    'Le Link standard n’est pas une télécommande universelle du corps. Certaines interventions médicales peuvent agir sur des fonctions neurologiques précises dans un cadre strict. Les dispositifs plus avancés, notamment clandestins, restent limités par la biologie, leur maintenance et leur compatibilité.\n\nAucun joueur ne peut imposer un contrôle physique ou psychique à un autre personnage par simple invocation d’une technologie.',
    [opt('Augmentations','augments'),opt('Les cinq limites','limits'),opt('Retour au Link','link')],
    [src('Annexe 03','link'),src('Annexe 06','augmentations')], 'neurochimie contrôler mouvement corps somatique');
  add(N,'privacy','NEXUS connaît-elle mes pensées ?',
    'Non. Le Link ne donne pas automatiquement accès aux pensées, aux souvenirs ou à l’intégralité des données privées. Des protections, autorisations et procédures d’accès existent.\n\nDes permissions abusives, erreurs ou failles peuvent toutefois compromettre certaines informations. Inversement, la déconnexion ne garantit pas l’anonymat face aux capteurs et systèmes tiers.',
    [opt('Pirater un Link','hacking'),opt('Se déconnecter','offline'),opt('La surveillance de la ville','surveillance'),opt('Retour','technology')],
    [src('Annexe 03','link'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'pensées vie privée données confidentialité surveillance secrets');
  add(N,'hacking','Que permet un piratage ?',
    'Des intrusions peuvent exploiter des failles, des permissions ou des dispositifs modifiés. Elles ne donnent pas accès à tous les souvenirs, à la conscience ou aux mouvements de quelqu’un, et elles ne permettent pas de commander NEXUS tout entière.\n\nLes intrusions importantes sont soumises à la cohérence technologique et à l’accord des partenaires de RP.',
    [opt('Link Blindé','forge'),opt('Interface Fantôme','archivarium_tech'),opt('Limites RP','limits'),opt('Retour','privacy')],
    [src('Annexe 03','link'),src('Annexe 06','augmentations')], 'hack pirater spyware intrusion données');
  add(N,'no_link','Peut-on vivre sans Link ?',
    'Oui. Refuser l’implant est légal et ne retire ni l’identité, ni les droits essentiels, ni l’accès à un compte bancaire ou aux appareils numériques externes.\n\nEn revanche, la société privilégie la connexion : démarches plus lentes, vérifications supplémentaires et possibilités réduites dans certains emplois ou services. C’est une discrimination technologique, pas un délit. Sans Link ne veut pas dire UNREGISTERED ou membre d’une faction.',
    [opt('Comparer les 9 situations du guide','guide'),opt('Paiements et déplacements','paiement'),opt('Administration','administration'),opt('Santé sans Link','health'),opt('Groupes et statuts','groups'),opt('Retour au Link','link')],
    [src('Annexe 03','link'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'déconnecté refus pas de link légal discriminate exclusion inégalité');
  add(N,'pannes','Et si la connexion tombe ?',
    'Une panne peut empêcher l’accès à certains services connectés, sans interrompre toute la ville ni paralyser automatiquement les corps. Des alternatives subsistent : paiements externes, documents, accès manuels, équipements autonomes.\n\nCertaines personnes sont plus vulnérables que d’autres à ces interruptions. Les conséquences d’un incident collectif majeur doivent être validées par le staff.',
    [opt('Fréquence Zéro et ses actions','frequence'),opt('Enfants du Néant','enfants'),opt('Vivre sans Link','no_link'),opt('Idée de RP autour d’une panne','rp_panne')],
    [src('Annexe 03','link'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'bug dysfonctionnement panne réseau black-out coupure');
  add(N,'augments','Les augmentations : que peut-on jouer ?',
    'Trois catégories : dispositifs thérapeutiques, améliorations certifiées et modifications clandestines. Les augmentations restaurent, assistent ou améliorent des fonctions précises.\n\nIl n’existe pas de plafond numérique universel, mais les combinaisons doivent rester compatibles, entretenues et plausibles. Aucun dispositif ne confère invulnérabilité, télépathie ou perfection motrice absolue.',
    [opt('Les cinq limites','limits'),opt('Les trois Links modifiés','mods'),opt('Exemples concrets','aug_examples'),opt('Un androïde jouable ?','android'),opt('Retour aux technologies','technology')],
    [src('Annexe 06','augmentations')], 'augmentations cybernetiques prothèses améliorations');
  add(N,'aug_examples','Exemples d’augmentations',
    'Une prothèse de main peut améliorer la précision de certains gestes, mais demande de l’entretien. Un implant optique peut aider dans des conditions définies sans offrir une vision sans limites. Un renfort mécanique ne rend pas tout le squelette capable d’encaisser des forces extrêmes.\n\nLa fonction précise, le coût et les contraintes sont à décrire en fiche. Le staff peut demander des ajustements pour les montages exceptionnels.',
    [opt('Les cinq limites','limits'),opt('Règles du cumul','cumul'),opt('Retour aux augmentations','augments')],
    [src('Annexe 06','augmentations')], 'vue bras force audition jambe implants');
  add(N,'limits','Les cinq limites communes',
    'Surcharge : chaque appareil possède un seuil.\nCompatibilité : deux dispositifs peuvent interférer.\nRessources : entretien, énergie et composants sont nécessaires.\nConnectivité : protéger ou isoler peut réduire certaines fonctions.\nVulnérabilité : aucune protection n’est absolue.\n\nCe sont des limites narratives, pas un système de dés ni une obligation de blessure à chaque usage.',
    [opt('Cumul des modifications','cumul'),opt('Piratage','hacking'),opt('Retour aux augmentations','augments')],
    [src('Annexe 06','augmentations')], 'limites compatibles puissance surcharge batterie maintenance');
  add(N,'cumul','Puis-je cumuler des augmentations ?',
    'Oui, aucun maximum numérique universel ne s’applique. Cependant, les équipements ne s’additionnent pas automatiquement : une combinaison peut coûter cher, se révéler instable ou demander une adaptation médicale.\n\nUne configuration très avancée doit être expliquée et peut nécessiter une validation du staff.',
    [opt('Link Poreux, Blindé et Fantôme','mods'),opt('Les cinq limites','limits'),opt('Retour aux augmentations','augments')],
    [src('Annexe 06','augmentations')], 'nombre implants cumul addition pouvoir');
  add(N,'mods','Trois modifications clandestines',
    'Cordis et son Link Poreux amplifient certaines expériences sensorielles. Forge et le Link Blindé renforcent la protection de l’interface. L’Archivarium et l’Interface Fantôme travaillent le stockage local et une discrétion numérique limitée.\n\nAucun de ces systèmes ne garantit lecture de pensée, invulnérabilité ou invisibilité.',
    [opt('Cordis','cordis'),opt('Forge','forge'),opt('Archivarium','archivarium_tech'),opt('Retour aux augmentations','augments')],
    [src('Annexe 06','augmentations')], 'poreux blindé fantôme cordis forge');
  add(N,'cordis','Cordis — Link Poreux',
    'Cette modification clandestine peut amplifier certaines sensations et expériences émotionnelles compatibles. Elle ne révèle pas les émotions réelles ni les pensées d’autrui. La surcharge perceptive et la fatigue font partie des contraintes possibles.',
    [opt('Blue Stream et Raw Heart','flux'),opt('Autres modifications','mods'),opt('Organisation Cordis','orgs')],
    [src('Annexe 06','augmentations'),src('Annexe 08','organisations')], 'Cordis sensation émotion filtre');
  add(N,'forge','Forge — Link Blindé',
    'Cette modification clandestine renforce certaines protections physiques et numériques du Link. Elle ne rend ni invulnérable au piratage ni insensible aux perturbations et ne donne aucune force musculaire nouvelle.',
    [opt('Autres modifications','mods'),opt('Piratage','hacking'),opt('Organisations','orgs')],
    [src('Annexe 06','augmentations'),src('Annexe 08','organisations')], 'Forge résistance blindé');
  add(N,'archivarium_tech','Archivarium — Interface Fantôme',
    'Cette technologie clandestine peut permettre des stockages locaux, des communications atypiques et la réduction de certaines traces. Elle ne fait pas disparaître un citoyen de tous les registres et ne donne pas libre accès aux archives NEXUS.\n\nLa façade publique de l’Archivarium concerne la préservation des technologies et androïdes anciens et la réflexion éthique.',
    [opt('L’Archivarium public','archivarium'),opt('Autres modifications','mods'),opt('Vie privée','privacy')],
    [src('Annexe 06','augmentations'),src('Annexe 08','organisations')], 'Fantôme archives traçage anonymat');
  add(N,'android','Les androïdes sont-ils jouables ?',
    'Non. Les personnages joueurs de PRIVILÈGE sont humains et majeurs. Les androïdes existent dans la société et peuvent servir de personnages non joueurs, dans le respect de leurs capacités établies.\n\nUn humain même très augmenté ne devient pas un androïde. La question de la conscience artificielle peut nourrir des histoires sans recevoir une réponse imposée.',
    [opt('L’Archivarium','archivarium'),opt('Enseignement par androïdes','education'),opt('Idée de RP avec un androïde','rp_android'),opt('Retour','technology')],
    [src('Annexe 06','augmentations'),src('Annexe 08','organisations')], 'robot conscience cybernétique personnage joueur');


  /* ANNEXE 10 — Guide pratique officiel. Exemples indicatifs, non-obligations RP. */
  add(N,'guide','Annexe 10 — Guide pratique 2046',
    'Comment vit-on avec ou sans Link ? Ce guide officiel compare neuf situations de la vie new-yorkaise. Les droits essentiels demeurent, mais les délais, les coûts et l’accès aux équipements peuvent varier.\n\nCes exemples donnent des pistes de RP, pas des obligations qui s’appliquent à tous les habitants. Choisissez un domaine ou ouvrez le tableau complet dans la source ci-dessous.',
    [opt('01 · Achats et argent','guide_money'),opt('02 · Démarches et citoyenneté','guide_admin'),opt('03 · Santé','guide_health'),opt('04 · Éducation','guide_education'),opt('05 · Travail et emploi','guide_work'),opt('06 · Logement et énergie','guide_housing'),opt('07 · Mobilité et transports','guide_transport'),opt('08 · Sécurité et justice','guide_justice'),opt('09 · Relations et loisirs','guide_social'),opt('Revenir au Link','link'),opt('Sommaire','home')],
    [src('Annexe 10 · Tableau complet','guide'),src('Annexe 03 · Le Link Citoyen','link')], 'annexe 10 guide pratique quotidien lien link sans link comparatif tableau neuf onglets payer santé école transports logement démarches');
  add(N,'guide_money','Guide pratique · Achats et argent',
    'Avec un Link configuré, un achat ou une facture peut être validé par un service compatible. Sans Link, carte, appareil externe, virement ou espèces restent possibles selon le commerce.\n\nPour un prêt, un dossier classique peut demander davantage de justificatifs ; l’absence d’implant ne bloque pas automatiquement l’argent. Exemple RP : le lecteur de carte d’un commerce refuse une transaction pourtant légitime.',
    [opt('Les transports','guide_transport'),opt('Les démarches','guide_admin'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Achats et argent','guide')], 'courses argent payer factures carte espèces cash crédit prêt compte bancaire boutique commerce sans link');
  add(N,'guide_admin','Guide pratique · Démarches et citoyenneté',
    'Avec Link : authentification et dossiers préremplis lorsque les services sont compatibles. Sans Link : carte d’identité, portail externe, borne ou rendez-vous physique. Des guichets se raréfient dans certains quartiers.\n\nLes droits sont identiques, pas les délais. Exemple RP : une journée de travail perdue pour un document que le voisin a renouvelé en quelques secondes.',
    [opt('Sécurité et justice','guide_justice'),opt('Travail','guide_work'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Démarches et citoyenneté','guide')], 'identité papier formulaire renouveler document aides sociales déclaration adresse bureaucratie sans link');
  add(N,'guide_health','Guide pratique · Santé',
    'Avec Link et autorisations adaptées, un patient peut bénéficier de rappels, d’une orientation médicale et d’alertes via des dispositifs compatibles. Sans Link, rendez-vous par téléphone, bilans et examens médicaux restent possibles.\n\nLe diagnostic précoce et les soins essentiels n’exigent pas obligatoirement un Link ; les délais, le centre et les ressources créent des inégalités. Exemple RP : deux patientes, deux vitesses d’accès à un examen.',
    [opt('Augmentations thérapeutiques','augments'),opt('Vie privée','privacy'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Santé','guide'),src('Annexe 04 · Société','societe')], 'rendez vous médecin clinique urgent secours examens prévention diagnostic sans link sante');
  add(N,'guide_education','Guide pratique · Éducation',
    'Tuteurs IA, androïdes pédagogiques et cours personnalisés sont répandus ; des enseignants humains exercent toujours. Sans Link, supports physiques, cours collectifs et terminaux externes permettent d’apprendre.\n\nLes évaluations et la traduction varient selon les établissements, mais aucune interface ne télécharge une compétence dans un cerveau. Exemple RP : un androïde anime une classe, tandis qu’une enseignante humaine accompagne quelques élèves.',
    [opt('Le travail','guide_work'),opt('Assistance cognitive','functions'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Éducation','guide')], 'école scolarité étudiant examen diplôme langues traduction apprendre étude enseignement androide sans link');
  add(N,'guide_work','Guide pratique · Travail et emploi',
    'Le Link peut faciliter une candidature, la vérification de diplômes et l’usage d’outils professionnels compatibles. Sans Link, CV, attestations, compte bancaire et moyens de travail classiques existent toujours.\n\nLes employeurs peuvent favoriser les profils facilement vérifiables, mais un implant n’est ni obligatoire pour tous les métiers ni la preuve d’une compétence. Exemple RP : un recrutement retardé par un certificat manquant.',
    [opt('Démarches administratives','guide_admin'),opt('Logement','guide_housing'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Travail et emploi','guide')], 'emploi travail salaire banque entretien recrutement candidature certificat patron sans link');
  add(N,'guide_housing','Guide pratique · Logement et énergie',
    'Avec un Link compatible, certains logements ouvrent leurs portes et automatisent les paiements ou la consommation. Sans Link, clés, badges, codes, virements et compteurs classiques peuvent fonctionner.\n\nLes immeubles ne sont pas tous équipés pareil ; un impayé ne déclenche pas partout une coupure instantanée des services. Exemple RP : serrure dernier cri d’un côté, ascenseur vétuste de l’autre.',
    [opt('Achats et argent','guide_money'),opt('Défaillance du réseau','pannes'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Logement et énergie','guide')], 'loyer facture électricité chauffage logement maison appartement serrure badge impayé énergie sans link');
  add(N,'guide_transport','Guide pratique · Mobilité et transports',
    'Avec le Link, titres de transport et informations de trajet peuvent être intégrés aux accès compatibles. Sans Link, cartes, tickets, bornes et applications externes subsistent. Certains lecteurs physiques sont moins nombreux ou tombent en panne.\n\nLa certification de certaines voies dépend du véhicule, pas seulement de l’implant du conducteur. Exemple RP : un badge valide qu’un portique refuse trois fois.',
    [opt('Payer un trajet','guide_money'),opt('Panne de réseau','pannes'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Mobilité et transports','guide')], 'métro bus train ticket pass carte portique voiture conduire stationnement sans link');
  add(N,'guide_justice','Guide pratique · Sécurité et justice',
    'Avec Link, certaines identifications ou alertes peuvent être facilitées si les services sont activés. Sans Link, documents, témoins, enregistrements et autres preuves licites demeurent recevables dans les procédures adaptées.\n\nLa présomption d’innocence ne dépend pas du Link. NEXUS n’a pas accès sans limite aux données ou aux lieux. Exemple RP : reconstituer un trajet à partir d’un ticket et de témoins.',
    [opt('Confidentialité','privacy'),opt('Démarches administratives','guide_admin'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Sécurité et justice','guide')], 'justice police preuve innocence contrôle droits surveillance sécurité sans link');
  add(N,'guide_social','Guide pratique · Relations et loisirs',
    'SYN reste utilisable par certains appareils externes, même sans Link. Les messages peuvent passer par un téléphone ou un ordinateur ; les expériences immersives, notamment Blue Stream et Raw Heart, utilisent des interfaces compatibles.\n\nLe Link ne lit pas les pensées et le mode hors ligne ne fait pas disparaître les caméras ou traces tierces. Exemple RP : un rendez-vous organisé sur SYN, dans un café toujours connecté.',
    [opt('Découvrir SYN','syn'),opt('Déconnexion réseau','offline'),opt('Toutes les rubriques','guide')],
    [src('Annexe 10 · Relations et loisirs','guide'),src('Annexe 03 · Link Citoyen','link')], 'SYN rencontre couple amoureux message sms loisir jeu vidéo blue stream raw heart vie privée sans link');

  add(N,'everyday','La vie en 2046',
    'New York fonctionne. La technologie rend certains gestes presque invisibles, mais les écarts de moyens et d’accès demeurent. Le confort connecté n’est ni universel ni gratuit ; les alternatives existent, souvent plus lentes et moins visibles.\n\nDans quel domaine souhaitez-vous vous projeter ?',
    [opt('Guide pratique · 9 domaines','guide'),opt('Argent et transports','paiement'),opt('Santé et assurance','health'),opt('Éducation','education'),opt('Travail et logement','work'),opt('Relations et loisirs','leisure'),opt('Justice et démarches','administration')],
    [src('Annexe 04 · Société','societe'),src('Annexe 10 · Guide pratique','guide')], 'quotidien guide pratique vie ville');
  add(N,'paiement','Payer, circuler, entrer',
    'Avec un Link, un habitant peut valider un achat, un trajet ou un accès autorisé à partir d’une interface compatible. Sans Link, il peut utiliser un terminal, un badge, un titre de transport ou une vérification externe.\n\nLes accès manuels sont parfois moins nombreux ou moins fiables. Cela ne signifie pas que tous les non-porteurs doivent avoir un permis de circulation.',
    [opt('Prendre le métro sans Link','transport'),opt('Démarches administratives','administration'),opt('Retour au quotidien','everyday')],
    [src('Annexe 03','link'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'carte crédit compte courses commerce metro portiques portes');
  add(N,'transport','Se déplacer à New York',
    'Les cinq blocs restent reliés. Le Link facilite certains contrôles et paiements, mais les transports physiques et l’accès par d’autres moyens demeurent possibles.\n\nLes équipements, les dessertes et les temps d’attente varient. Une panne peut ralentir un trajet ; elle ne justifie pas d’inventer sans validation une fermeture générale du réseau.',
    [opt('Découvrir les cinq blocs','city'),opt('Pannes réseau','pannes'),opt('Retour au quotidien','everyday')],
    [src('Annexe 01','ville'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'train bus métro mobilité quartiers déplacements');
  add(N,'administration','Démarches, droits et recours',
    'Les services connectés peuvent accélérer une demande, un renouvellement de document ou une authentification. Sans Link, des procédures externes existent, mais elles peuvent multiplier rendez-vous, pièces justificatives et délais.\n\nL’absence de Link reste légale et n’efface pas les droits essentiels. Un contrôle plus long ou une décision algorithmique contestable peut servir d’intrigue, sans renverser automatiquement la présomption d’innocence.',
    [opt('NEXUS et les institutions','institutions'),opt('Justice et surveillance','surveillance'),opt('Idée de RP administratif','rp_error'),opt('Retour au quotidien','everyday')],
    [src('Annexe 03','link'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'discrimination dossier social identité mairie papier aides justice voter');
  add(N,'health','La médecine en 2046',
    'Les diagnostics assistés et les outils prédictifs améliorent la prévention et la prise en charge. Les médecins humains demeurent essentiels. Les délais, équipements spécialisés et traitements avancés varient selon les ressources des patients.\n\nSans Link, une personne peut toujours se soigner et bénéficier d’examens ; elle peut toutefois perdre certaines facilités de coordination et d’automatisation.',
    [opt('Assurances et données','insurance'),opt('Augmentations thérapeutiques','augments'),opt('Retour au quotidien','everyday')],
    [src('Annexe 04','societe'),src('Annexe 06','augmentations'),src('Annexe 10 · Guide pratique','guide')], 'médecin hopital chirurgie handicap maladie clinique prévention urgence');
  add(N,'insurance','Et les assurances de santé ?',
    'Les données et évaluations peuvent intervenir dans l’accès à certains services et garanties, sous les règles de protection établies. Les écarts de ressources restent décisifs.\n\nUn « Score de Prévention » universel et obligatoire n’a pas été établi comme règle canonique. On ne doit pas affirmer qu’un système unique lit librement toutes les données médicales.',
    [opt('Vie privée','privacy'),opt('Santé','health'),opt('Retour au quotidien','everyday')],
    [src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'score de prévention prime assurance données santé');
  add(N,'education','École et formation',
    'Une grande part de l’enseignement est assurée ou encadrée par des IA pédagogiques et des androïdes. Les enseignants humains n’ont pas disparu : leurs rôles varient selon les établissements, les disciplines et les moyens disponibles.\n\nLe Link peut faciliter l’apprentissage ou la traduction, jamais transmettre instantanément une compétence. Les parcours restent inégaux.',
    [opt('Métiers humains','work'),opt('Link et apprentissage','functions'),opt('Retour au quotidien','everyday')],
    [src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'prof école lycée université androïde élève diplome');
  add(N,'work','Le travail en 2046',
    'L’automatisation a remplacé de nombreuses tâches, pas toute l’activité humaine. Artisans, soignants, enseignants, artistes, salariés, indépendants, personnels de sécurité et travailleurs précaires continuent d’exister.\n\nLes outils algorithmiques peuvent favoriser certains profils, et l’absence de Link peut limiter des opportunités, sans empêcher toute profession.',
    [opt('Inégalités sociales','inequality'),opt('Habiter New York','housing'),opt('Groupes de personnages','groups'),opt('Retour au quotidien','everyday')],
    [src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'emploi carrière licenciement travail chômage salaire métier');
  add(N,'housing','Se loger en 2046',
    'Immeubles intelligents, résidences prestigieuses, appartements modestes, colocations et bâtiments vieillissants coexistent. Les critères automatisés d’accès au logement peuvent défavoriser certains dossiers.\n\nAucun des cinq blocs n’impose une classe sociale unique. Des coupures automatiques abusives peuvent nourrir une intrigue locale, mais elles ne sont pas une règle universelle de New York.',
    [opt('Cinq blocs de New York','city'),opt('Disparités sociales','inequality'),opt('Retour au quotidien','everyday')],
    [src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'loyer propriétaire appartement domotique énergie logements');
  add(N,'inequality','Qu’est-ce qui détermine ma place ?',
    'Les écarts de revenus, de formation, d’accès aux soins, de réseau social et de connexion peuvent peser sur les trajectoires. Les quatre groupes du forum ne sont pas des castes juridiques ; la mobilité sociale reste possible.\n\nPRIVILÈGE raconte notamment comment une société peut préserver des droits sur le papier tout en rendant leur exercice plus coûteux.',
    [opt('Choisir son groupe','groups'),opt('Vivre sans Link','no_link'),opt('Retour au quotidien','everyday')],
    [src('Annexe 04','societe'),src('Groupes','groupes'),src('Annexe 10 · Guide pratique','guide')], 'privilège caste inégalité discrimination classe sociale');
  add(N,'leisure','Rencontres, loisirs et intimité',
    'La culture humaine coexiste avec la création assistée. Les expériences immersives, loisirs traditionnels, spectacles, jeux et rencontres restent multiples. SYN fait partie de la vie relationnelle connectée, mais les relations ne se limitent pas à une application.\n\nIl n’est pas nécessaire d’avoir un Link pour nouer des liens ou utiliser tout appareil numérique.',
    [opt('Découvrir SYN','syn'),opt('Flux émotionnels','flux'),opt('Idées de liens RP','rp_social'),opt('Retour au quotidien','everyday')],
    [src('SYN','syn'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'amour tinder rendez-vous rencontre couple famille réseaux jeux');
  add(N,'syn','SYN — Rencontrer, choisir, hésiter',
    'SYN est une interface de rencontres et de mise en relation intégrée à l’univers de PRIVILÈGE. Son existence n’implique pas qu’une compatibilité calculée soit la vérité d’un sentiment ou qu’une rencontre soit imposée.\n\nLa relation appartient toujours aux personnages et à leurs partenaires de jeu.',
    [opt('Relations et loisirs','leisure'),opt('Créer des liens RP','rp_social'),opt('Sommaire','home')],
    [src('Ouvrir SYN','syn'),src('Annexe 10 · Guide pratique','guide')], 'syn application profil dating matching compatibilité');
  add(N,'surveillance','Surveillance et justice',
    'NEXUS n’est ni omnisciente ni un gouvernement autonome. Des systèmes de contrôle existent, mais leur accès aux données dépend des procédures et des infrastructures. Les institutions et les recours humains n’ont pas disparu.\n\nUn citoyen sans Link peut subir des contrôles et délais supplémentaires ; cela ne fait pas de lui un suspect automatique ou un individu dépourvu de droits.',
    [opt('Vie privée','privacy'),opt('D.R.A. et institutions','institutions'),opt('Démarches et recours','administration')],
    [src('Annexe 03','link'),src('Annexe 04','societe'),src('Annexe 10 · Guide pratique','guide')], 'police drone tribunal preuve judiciaire');

  add(N,'city','Cinq blocs, une métropole',
    'CROWN correspond à Manhattan, VOLT à Brooklyn, PULSE au Queens, RIFT au Bronx et VEIL à Staten Island.\n\nCes noms désignent des blocs administratifs et narratifs, pas des castes. Chaque bloc mêle différents milieux et modes de vie.',
    [opt('CROWN / Manhattan','crown'),opt('VOLT / Brooklyn','volt'),opt('PULSE / Queens','pulse'),opt('RIFT / Bronx','rift'),opt('VEIL / Staten Island','veil'),opt('Groupes sociaux','groups')],
    [src('Annexe 01','ville')], 'quartiers territoire borough new york map');
  ['crown','volt','pulse','rift','veil'].forEach(function(key,i){
    var labels=['CROWN — Manhattan','VOLT — Brooklyn','PULSE — Queens','RIFT — Bronx','VEIL — Staten Island'];
    var messages=[
      'CROWN concentre des lieux de pouvoir, de prestige et de grandes institutions. Des vies modestes et des fractures sociales y subsistent.',
      'VOLT mêle activités, communautés et trajectoires variées. Il ne se réduit pas à une unique esthétique ou classe sociale.',
      'PULSE est un bloc aux réalités contrastées. Aucun profil professionnel ou niveau de richesse n’y est obligatoire.',
      'RIFT n’est pas un territoire exclusivement pauvre ou criminel. Les habitants y vivent des parcours multiples.',
      'VEIL ne détermine ni une conviction particulière ni le degré de connexion technologique de ses habitants.'
    ];
    add(N,key,labels[i],messages[i],[opt('Comparer les cinq blocs','city'),opt('Se loger','housing'),opt('Créer un personnage','create')],[src('Annexe 01','ville')],labels[i]);
  });
  add(N,'groups','Quatre groupes, pas quatre castes',
    'STANDARD : profils ordinaires et position sociale courante.\nGILDED : privilèges et ressources importantes.\nACCREDITED : autorité, habilitation ou légitimité reconnue.\nUNREGISTERED : situations à la marge des circuits dominants.\n\nCe sont des repères de forum, pas quatre statuts juridiques. Un citoyen sans Link peut rester STANDARD ; un agent peu rémunéré peut être ACCREDITED.',
    [opt('Groupe et organisation : différence','affiliations'),opt('Choisir son groupe','group_choice'),opt('Sans Link, suis-je UNREGISTERED ?','no_link'),opt('Créer mon ébauche','build_bloc'),opt('Sommaire','home')],
    [src('Guide des groupes','groupes')], 'STANDARD GILDED ACCREDITED UNREGISTERED statut couleur');
  add(N,'group_choice','Quel groupe choisir ?',
    'Choisissez la dimension PUBLIQUE dominante de votre personnage : place ordinaire dans la société, privilèges, habilitation reconnue ou vie en marge. Ce choix ne révèle pas automatiquement une appartenance clandestine.\n\nLe staff valide la cohérence de la fiche ; un groupe peut évoluer au fil des RP.',
    [opt('Voir les quatre groupes','groups'),opt('Organisations et affiliations','orgs'),opt('Créer une ébauche','build_bloc')],
    [src('Choisir son groupe','groupes')], 'changer groupe organisation faction membre');
  add(N,'affiliations','Groupes et organisations',
    'Le groupe Forumactif décrit une position publique dominante. Une organisation est une affiliation ou un engagement narratif. Il est possible de n’appartenir à aucune organisation, de masquer certaines convictions dans le RP ou de vivre une contradiction entre statut et engagement.',
    [opt('Quatre groupes','groups'),opt('Organisations','orgs'),opt('Institutions et pouvoirs','institutions'),opt('Sommaire','home')],
    [src('Groupes','groupes'),src('Annexe 08','organisations')], 'factions affiliations organisation famille');
  add(N,'orgs','Les organisations de PRIVILÈGE',
    'La ville comporte des structures officielles, économiques, spirituelles et contestataires. Leurs membres ne pensent pas nécessairement de la même manière, et leur appartenance n’offre aucun pouvoir automatique sur les autres personnages.',
    [opt('Fréquence Zéro','frequence'),opt('Enfants du Néant','enfants'),opt('Forge et Cordis','pacte'),opt('L’Archivarium','archivarium'),opt('Croyances et spiritualités','faith'),opt('Institutions','institutions')],
    [src('Annexe 08','organisations')], 'faction réseau clandestin politique groupe');
  add(N,'frequence','Fréquence Zéro',
    'Fréquence Zéro rassemble des trajectoires de refus de l’hyperconnexion et de critique de la dépendance aux systèmes. Ses sympathisants ne sont pas tous clandestins, violents, sans Link ou opposés à toute technologie.\n\nCertaines mouvances sont toutefois plus radicales que d’autres.',
    [opt('Enfants du Néant','enfants'),opt('Vivre sans Link','no_link'),opt('Autres organisations','orgs')],
    [src('Annexe 08','organisations')], 'deconnexion résistance activistes fréquence zéro');
  add(N,'enfants','Les Enfants du Néant',
    'Des actions offensives contre des infrastructures de connexion peuvent provoquer des interruptions de service et des conséquences réelles pour les habitants. Les Enfants du Néant sont associés à cette orientation radicale.\n\nCela n’autorise pas chaque membre à décréter une panne à l’échelle de New York : la portée des attaques collectives relève du staff.',
    [opt('Fréquence Zéro','frequence'),opt('Que se passe-t-il lors d’une panne ?','pannes'),opt('Idée de RP local','rp_panne'),opt('Organisations','orgs')],
    [src('Annexe 08','organisations')], 'sabotage braquage lignes connexion interruption flux');
  add(N,'pacte','Forge, Cordis et le Pacte',
    'Forge travaille notamment les modifications matérielles et les protections ; Cordis explore les expériences sensorielles et émotionnelles. Leur coopération formalisée en 2039 est connue sous le nom de Pacte du Sang et du Métal.\n\nLeurs technologies comportent des risques et ne garantissent pas des capacités illimitées.',
    [opt('Link Blindé de Forge','forge'),opt('Link Poreux de Cordis','cordis'),opt('Retour aux organisations','orgs')],
    [src('Annexe 08','organisations'),src('Annexe 06','augmentations')], 'pacte sang métal forge cordis');
  add(N,'archivarium','L’Archivarium : façade publique',
    'Apparu publiquement en 2040, l’Archivarium est associé à la préservation des technologies et androïdes anciens ainsi qu’aux questions éthiques qui entourent leur traitement.\n\nLes activités clandestines ne se confondent pas avec cette présentation institutionnelle. Un terminal public ne révèle pas d’éventuels secrets du staff.',
    [opt('Interface Fantôme','archivarium_tech'),opt('Les androïdes','android'),opt('Autres organisations','orgs')],
    [src('Annexe 08','organisations'),src('Annexe 09','chronologie')], 'archivarium archive conservation musée');
  add(N,'faith','Croyances en 2046',
    'L’Église du Signal Absolu propose une lecture spirituelle de NEXUS. La Communion des Vivants, issue d’une évolution de traditions chrétiennes, défend une autre conception de l’humain et de sa place face à la technologie.\n\nAucune appartenance religieuse ne détermine automatiquement le groupe du forum ni le comportement d’un personnage.',
    [opt('Communion des Vivants','communion'),opt('Église du Signal Absolu','signal'),opt('Retour aux organisations','orgs')],
    [src('Annexe 08','organisations')], 'religion foi culte christianisme croyance');
  add(N,'communion','Communion des Vivants',
    'La Communion des Vivants est issue d’une évolution de traditions chrétiennes et réaffirme la valeur de l’expérience humaine. Elle peut partager certaines inquiétudes sur l’hyperconnexion avec des groupes contestataires, sans être confondue avec eux.',
    [opt('Autres croyances','faith'),opt('Fréquence Zéro','frequence'),opt('Organisations','orgs')],
    [src('Annexe 08','organisations')], 'communion vivant humain spiritualité');
  add(N,'signal','Église du Signal Absolu',
    'L’Église du Signal Absolu donne une dimension religieuse à certaines interprétations de NEXUS. La foi des membres ne prouve aucune nature divine ou omnisciente de l’intelligence artificielle. Les croyances restent des convictions de personnages.',
    [opt('Communion des Vivants','communion'),opt('Croyances en 2046','faith'),opt('Organisations','orgs')],
    [src('Annexe 08','organisations')], 'signal absolu NEXUS dieu culte');
  add(N,'institutions','Qui gouverne New York ?',
    'NEXUS coordonne et optimise des systèmes, mais ne remplace pas officiellement toutes les institutions humaines. Autorités publiques, opérateurs privés, organismes de régulation et organisations défendent des intérêts parfois contradictoires.\n\nAucun acteur ne possède seul toute la ville.',
    [opt('NEXUS : ses véritables limites','nexus_scope'),opt('D.R.A. : régulation','dra'),opt('Archivarium public','archivarium'),opt('Contre-pouvoirs','counterpowers'),opt('Histoire de la ville','history')],
    [src('Annexe 04','societe'),src('Annexe 08','organisations')], 'gouvernement politique maire police DRA pouvoir');
  add(N,'nexus_scope','Que sait faire NEXUS ?',
    'NEXUS analyse et coordonne des services dans la limite des données, accès et infrastructures dont elle dispose. Elle n’est pas omnisciente, ne lit pas toutes les pensées, ne décide pas librement du destin de chacun et ne constitue pas un gouvernement autonome.\n\nSes décisions peuvent être discutées ou contestées. Une réponse de ce terminal reste une assistance hors-jeu, pas une information confidentielle de l’IA fictive.',
    [opt('D.R.A. et recours','dra'),opt('Vie privée','privacy'),opt('Retour aux institutions','institutions')],
    [src('Annexe 03','link'),src('Annexe 04','societe')], 'pouvoir NEXUS IA savoir conscience contrôle');
  add(N,'dra','Direction de la Régulation Algorithmique',
    'La D.R.A. intervient dans l’encadrement des pratiques algorithmiques. Son rôle s’est consolidé en 2036. Elle ne doit pas être confondue avec tous les guichets municipaux, les tribunaux ou les services sociaux.\n\nElle représente un cadre institutionnel de régulation, dont l’efficacité peut faire l’objet d’intrigues et de tensions.',
    [opt('Contre-pouvoirs','counterpowers'),opt('Démarches citoyennes','administration'),opt('Retour aux institutions','institutions')],
    [src('Annexe 04','societe'),src('Annexe 09','chronologie')], 'D.R.A régulation gouvernement recours');
  add(N,'counterpowers','Existe-t-il un contre-pouvoir ?',
    'Oui : régulation institutionnelle, contestation sociale, mouvements de déconnexion, résistance spirituelle et intérêts économiques concurrents participent à un équilibre instable.\n\nFréquence Zéro, la Communion des Vivants et d’autres organisations n’adoptent pas les mêmes méthodes. Les actions offensives des Enfants du Néant ne représentent pas tous les opposants à l’hyperconnexion.',
    [opt('Fréquence Zéro','frequence'),opt('Enfants du Néant','enfants'),opt('Communion des Vivants','communion'),opt('Institutions','institutions')],
    [src('Annexe 04','societe'),src('Annexe 08','organisations')], 'opposition révolte résistance contre nexus');

  add(N,'history','Chronologie publique : 2026–2046',
    'L’évolution de New York s’inscrit dans trois cycles : premiers signes de rupture (2026–2032), installation du nouveau monde (2033–2040) et normalisation des fractures (2041–2046).\n\nLe Grand Échauffement n’est pas une guerre civile ; NEXUS ne prend pas officiellement le pouvoir en 2046.',
    [opt('2026–2032','period1'),opt('2033–2040','period2'),opt('2041–2046','period3'),opt('Le Grand Échauffement','echauffement'),opt('NEXUS dans le monde','international'),opt('Sommaire','home')],
    [src('Annexe 09','chronologie')], 'chronologie dates 2028 2046 historique passé');
  add(N,'period1','2026–2032 : signes de rupture',
    '2026–2027 : vulnérabilités climatiques, énergétiques et économiques croissantes.\n2028 : Grand Échauffement, convergence de crises.\n2029 : premiers usages privés de NEXUS.\n2030–2032 : trois étés de rupture, puis premiers usages institutionnels ciblés de NEXUS en 2032.\n\nLa ville ne s’effondre pas : les conditions de vie changent.',
    [opt('Le Grand Échauffement','echauffement'),opt('Évolution de NEXUS','nexus_dates'),opt('2033–2040','period2'),opt('Chronologie','history')],
    [src('Annexe 09','chronologie')], '2026 2027 2028 2029 2030 2032');
  add(N,'echauffement','Que fut le Grand Échauffement ?',
    'En 2028, crises climatiques, énergétiques, économiques et logistiques convergent. La vie continue pourtant : habitants privés de fraîcheur, réseaux sous tension, hôpitaux éprouvés, approvisionnements incertains. Les effets varient fortement selon les ressources et le lieu de vie.\n\nLes personnages plus âgés peuvent se souvenir de ces renoncements ordinaires, puis des trois étés de rupture de 2030 à 2032. Ce n’est ni une guerre ni une apocalypse.',
    [opt('Écrire des souvenirs','bio'),opt('Les premiers signes de rupture','period1'),opt('Chronologie','history')],
    [src('Annexe 09','chronologie')], 'grand échauffement chaleur coupure météo climat souvenirs crise');
  add(N,'nexus_dates','Quand NEXUS apparaît-elle ?',
    'Exploitation privée à partir de 2029 ; premiers usages institutionnels ciblés en 2032. Déploiements spécialisés du Link en 2034, commercialisation civile en 2035, consolidation de la D.R.A. en 2036.\n\nCes dates ne font pas de NEXUS un gouvernement mondial.',
    [opt('Link Citoyen','link'),opt('Chronologie','history'),opt('2033–2040','period2')],
    [src('Annexe 09','chronologie')], '2029 2032 2034 2035 DRA');
  add(N,'period2','2033–2040 : installation',
    '2034 : premiers déploiements spécialisés du Link.\n2035 : commercialisation civile.\n2036 : rôle de la D.R.A. consolidé ; Forge se structure.\n2037 : Cordis et Église du Signal Absolu.\n2038 : Fréquence Zéro.\n2039 : Pacte du Sang et du Métal ; Communion des Vivants.\n2040 : apparition publique de l’Archivarium.',
    [opt('Organisations','orgs'),opt('Link Citoyen','link'),opt('2041–2046','period3'),opt('Chronologie','history')],
    [src('Annexe 09','chronologie')], '2033 2034 2035 2036 2037 2038 2039 2040');
  add(N,'period3','2041–2046 : fractures normalisées',
    '2041–2042 : les services connectés deviennent quotidiens ; le Link reste légalement facultatif.\n2043–2044 : institutions, opérateurs et organisations négocient un équilibre sans pouvoir unique.\n2045–2046 : New York fonctionne malgré ses tensions, sans révolution généralisée ou guerre civile.\n\nLes actions clandestines locales peuvent créer des conflits, mais leur ampleur collective est encadrée par le staff.',
    [opt('Enfants du Néant','enfants'),opt('Vivre sans Link','no_link'),opt('Chronologie','history')],
    [src('Annexe 09','chronologie')], '2041 2042 2043 2044 2045 2046');
  add(N,'international','NEXUS existe-t-elle partout ?',
    'La transformation algorithmique dépasse New York. En revanche, la carte exacte des déploiements internationaux de NEXUS et de ses concurrents n’est pas arrêtée dans les éléments validés ici.\n\nPour un personnage venant de l’étranger, évitez d’affirmer qu’un pays entier dépend d’une version donnée de NEXUS avant accord du staff.',
    [opt('Écrire une biographie','bio'),opt('Chronologie','history'),opt('Sommaire','home')],
    [src('Annexe 09','chronologie')], 'monde pays international Europe Asie mondial concurrent');
  add(N,'bio','Écrire un passé cohérent',
    'Partez de l’âge du personnage en 2046. Situez son enfance face au Grand Échauffement, son éventuel premier Link après 2035 et les organisations aux dates établies. Les changements personnels sont libres, mais un joueur ne peut s’attribuer seul l’origine d’un événement historique majeur.',
    [opt('Dates 2026–2032','period1'),opt('Dates 2033–2040','period2'),opt('Créer une ébauche','build_bloc')],
    [src('Annexe 09','chronologie')], 'âge anniversaire naissance passé histoire personnage');

  add(N,'ideas','Quelques pistes de RP',
    'PRIVILÈGE n’exige ni catastrophe, ni complot, ni personnage exceptionnel. Une panne locale, une procédure injuste, une relation conflictuelle, un emploi, une famille ou un désaccord autour de la technologie suffisent à lancer un récit.\n\nCes pistes ne sont PAS des événements déjà actés dans la chronologie.',
    [opt('Erreur administrative','rp_error'),opt('Panne et solidarité','rp_panne'),opt('Rencontre et conflit','rp_social'),opt('Un androïde dans sa vie','rp_android'),opt('Souvenirs de 2028','rp_memory'),opt('Créer une ébauche','build_bloc')],
    [src('Annexe 04','societe'),src('Annexe 09','chronologie')], 'idée lien intrigue scène rp inspiration');
  add(N,'rp_error','Amorce RP : décision contestée',
    'Une aide est suspendue ou un dossier connaît un refus inexpliqué. Votre personnage doit trouver un interlocuteur, patienter, déposer un recours ou s’appuyer sur ses proches.\n\nL’intrigue peut explorer une discrimination sans affirmer que la même décision s’applique à tous les habitants.',
    [opt('Démarches administratives','administration'),opt('Autres idées de RP','ideas')],
    [src('Annexe 04','societe')], 'recours refus dossier social injustice');
  add(N,'rp_panne','Amorce RP : interruption locale',
    'Une coupure limitée perturbe un immeuble, un commerce ou un service. Certains habitants cherchent une solution autonome ; d’autres dépendent de terminaux connectés. Un désaccord naît sur la cause de l’incident.\n\nNe l’attribuez pas automatiquement aux Enfants du Néant et ne décrétez pas une panne de toute la ville sans accord du staff.',
    [opt('Comment fonctionnent les pannes ?','pannes'),opt('Les Enfants du Néant','enfants'),opt('Autres idées','ideas')],
    [src('Annexe 03','link')], 'panne sabotage évènement coupure RP');
  add(N,'rp_social','Amorce RP : ce que l’on cache',
    'Deux habitants se rencontrent par SYN, au travail ou dans leur immeuble. L’un coupe régulièrement son Link ; l’autre utilise les services connectés au quotidien. Ils ne partagent ni leurs habitudes ni leurs certitudes.\n\nLa relation se construit par consentement mutuel entre partenaires RP, pas par un score de compatibilité.',
    [opt('Découvrir SYN','syn'),opt('Relations et loisirs','leisure'),opt('Autres idées','ideas')],
    [src('SYN','syn')], 'couple rencontre intimité amour liens rp');
  add(N,'rp_android','Amorce RP : une présence artificielle',
    'Un androïde ancien apparaît dans le quotidien d’un personnage : entretien, réparation, service, attachement ou désaccord éthique. On peut interroger la façon dont on le traite sans en faire un second personnage joueur ni établir officiellement sa conscience.',
    [opt('Statut des androïdes','android'),opt('L’Archivarium','archivarium'),opt('Autres idées','ideas')],
    [src('Annexe 08','organisations')], 'robot amitié réparation android');
  add(N,'rp_memory','Amorce RP : les souvenirs de 2028',
    'Deux personnages se rappellent les étés difficiles : file d’attente, immeuble surchauffé, entraide familiale, disparition d’une activité économique. Leurs souvenirs peuvent diverger selon leur âge et leur milieu.\n\nN’inventez pas un événement historique collectif majeur pour justifier cette histoire.',
    [opt('Le Grand Échauffement','echauffement'),opt('Chronologie','history'),opt('Autres idées','ideas')],
    [src('Annexe 09','chronologie')], '2028 chaleur parents souvenir');
  add(N,'restricted','Informations sensibles',
    'Cette interface de consultation ne dispose pas de renseignements confidentiels. Elle ne confirme ni l’existence ni l’absence d’un dossier secret, et ne transforme pas une hypothèse de joueur en révélation canonique.\n\nPour une intrigue institutionnelle sensible, contactez le staff.',
    [opt('Ce que NEXUS peut savoir','nexus_scope'),opt('Annonces du staff','annonces_info'),opt('Sommaire','home')],
    [src('Annonces','annonces')], 'secret staff dossiers confidentiels infiltration');
  add(N,'annonces_info','Informations et annonces',
    'Les annonces officielles sont publiées par le staff. Ce terminal ne reçoit pas de flux d’actualité en direct et ne peut inventer une alerte, une fermeture de ligne, une arrestation ou un changement du canon.',
    [opt('Chronologie','history'),opt('Sommaire','home')],
    [src('Annonces du staff','annonces')], 'nouvelles nouvelles officiels infos annonces');

  /* Parcours guidé de création : aucune saisie sensible, rien envoyé. */
  add(N,'build_bloc','Ébauche — 1/7 · Bloc',
    'Où situer l’existence ordinaire de votre personnage ? Aucun bloc ne détermine automatiquement son milieu social.',
    [opt('CROWN — Manhattan','build_group',{bloc:'CROWN / Manhattan'}),opt('VOLT — Brooklyn','build_group',{bloc:'VOLT / Brooklyn'}),opt('PULSE — Queens','build_group',{bloc:'PULSE / Queens'}),opt('RIFT — Bronx','build_group',{bloc:'RIFT / Bronx'}),opt('VEIL — Staten Island','build_group',{bloc:'VEIL / Staten Island'}),opt('À décider plus tard','build_group',{bloc:'À définir'})],
    [src('Annexe 01','ville')], 'générateur personnage étape');
  add(N,'build_group','Ébauche — 2/7 · Groupe',
    'Choisissez un groupe envisagé. C’est un repère narratif et visuel, pas un statut juridique automatique.',
    [opt('STANDARD','build_job',{groupe:'STANDARD'}),opt('GILDED','build_job',{groupe:'GILDED'}),opt('ACCREDITED','build_job',{groupe:'ACCREDITED'}),opt('UNREGISTERED','build_job',{groupe:'UNREGISTERED'}),opt('À définir','build_job',{groupe:'À définir'})],
    [src('Guide des groupes','groupes')], 'groupe rédaction');
  add(N,'build_job','Ébauche — 3/7 · Occupation',
    'Qu’est-ce qui organise ses journées ? Une activité ordinaire peut soutenir de nombreuses intrigues.',
    [opt('Emploi et carrière','build_link',{activite:'Emploi ou carrière'}),opt('Études et formation','build_link',{activite:'Études et formation'}),opt('Art, création, indépendance','build_link',{activite:'Création ou indépendance'}),opt('Précarité ou reconversion','build_link',{activite:'Précarité ou reconversion'}),opt('Famille et relations','build_link',{activite:'Famille et relations'}),opt('À définir','build_link',{activite:'À définir'})],
    [src('Annexe 04','societe')], 'métier activité travail');
  add(N,'build_link','Ébauche — 4/7 · Rapport au Link',
    'Son rapport au Link influence son quotidien, sans dicter son groupe ou ses convictions.',
    [opt('Link standard, connecté','build_values',{link:'Link standard, connecté'}),opt('Connexion intermittente','build_values',{link:'Connexion intermittente'}),opt('Aucun Link','build_values',{link:'Sans Link'}),opt('Link ou équipement modifié','build_values',{link:'Link ou équipement modifié (à préciser)'}),opt('À définir','build_values',{link:'À définir'})],
    [src('Annexe 03','link'),src('Annexe 10 · Guide pratique','guide')], 'implant choix');
  add(N,'build_values','Ébauche — 5/7 · Désir',
    'Quel désir pourrait mettre ce personnage en mouvement ?',
    [opt('Protéger une relation','build_conflit',{desir:'Protéger une relation'}),opt('Changer de place sociale','build_conflit',{desir:'Changer de place sociale'}),opt('Défendre une conviction','build_conflit',{desir:'Défendre une conviction'}),opt('Préserver son autonomie','build_conflit',{desir:'Préserver son autonomie'}),opt('Comprendre un événement passé','build_conflit',{desir:'Comprendre un événement passé'})],
    [src('Annexe 04','societe')], 'motivation objectif désir');
  add(N,'build_conflit','Ébauche — 6/7 · Contradiction',
    'Une contradiction ouvre des scènes sans imposer de pouvoir exceptionnel.',
    [opt('Il dépend de ce qu’il critique','build_faille',{conflit:'Dépend de ce qu’il critique'}),opt('Il cache une affiliation','build_faille',{conflit:'Cache une affiliation'}),opt('Il veut réussir sans se trahir','build_faille',{conflit:'Réussir sans se trahir'}),opt('Il refuse une aide nécessaire','build_faille',{conflit:'Refuse une aide nécessaire'}),opt('Il privilégie la sécurité à la liberté','build_faille',{conflit:'Sécurité contre liberté'})],
    [src('Annexe 04','societe')], 'tension contradiction conflit');
  add(N,'build_faille','Ébauche — 7/7 · Fragilité',
    'Quelle fragilité le rendra profondément humain ?',
    [opt('Peur d’être abandonné','bilan',{faille:'Peur d’être abandonné'}),opt('Orgueil et difficulté à demander de l’aide','bilan',{faille:'Orgueil'}),opt('Dette ou dépendance matérielle','bilan',{faille:'Dette ou dépendance'}),opt('Mensonge ancien','bilan',{faille:'Mensonge ancien'}),opt('Un deuil non résolu','bilan',{faille:'Deuil non résolu'}),opt('À définir','bilan',{faille:'À définir'})],
    [src('Annexe 04','societe')], 'faiblesse vulnérabilité');
  add(N,'bilan','Votre ébauche de personnage',
    'Voici les repères sélectionnés. Ils ne constituent pas une fiche validée et ne sont transmis à personne. Vous pouvez copier cette synthèse, la modifier librement et la soumettre ensuite au staff dans le cadre habituel du forum.',
    [opt('Recommencer l’ébauche','build_bloc'),opt('Vérifier mon concept','validation'),opt('Choisir un groupe','groups'),opt('Sommaire','home')],
    [src('Choisir son groupe','groupes'),src('Chronologie','chronologie')], 'bilan récapitulatif copier');

  function buildBilan(answers) {
    return N.bilan.reply + '\n\n— ÉBAUCHE HORS-JEU —' +
      '\n• Bloc : ' + (answers.bloc||'À définir') +
      '\n• Groupe envisagé : ' + (answers.groupe||'À définir') +
      '\n• Activité : ' + (answers.activite||'À définir') +
      '\n• Link : ' + (answers.link||'À définir') +
      '\n• Désir : ' + (answers.desir||'À définir') +
      '\n• Contradiction : ' + (answers.conflit||'À définir') +
      '\n• Fragilité : ' + (answers.faille||'À définir') +
      '\n\nAucune validation automatique. Ajustez votre idée avec vos partenaires et le staff.';
  }
  function initTerminal(root) {
    var frame=root.querySelector('#nx-dialogue');
    if(!frame || frame.dataset.nexusV3==='true') return;
    var feed=frame.querySelector('[data-nx-feed]');
    var choiceBox=frame.querySelector('[data-nx-choices]');
    var btnBack=frame.querySelector('[data-nx-back]');
    var btnReset=frame.querySelector('[data-nx-reset]');
    var btnHome=frame.querySelector('[data-nx-home]');
    var btnCopy=frame.querySelector('[data-nx-copy-bilan]');
    var search=frame.querySelector('[data-nx-search]');
    var searchResults=frame.querySelector('[data-nx-search-results]');
    if(!feed||!choiceBox||!btnBack||!btnReset)return;
    frame.dataset.nexusV3='true';
    var current='home', history=[], answers={}, transcript=[];
    function reply(key) { return key==='bilan' ? buildBilan(answers) : N[key].reply; }
    function bubble(entry) {
      var el=txt('div','nx-dialogue__bubble '+(entry.mine?'nx-dialogue__bubble--member':'nx-dialogue__bubble--nexus'));
      el.appendChild(txt('span','nx-dialogue__who',entry.mine?'VOUS':'NEXUS · ASSISTANCE'));
      el.appendChild(txt('div','nx-dialogue__body',entry.text));
      if(!entry.mine && entry.sources && entry.sources.length) {
        var links=txt('div','nx-dialogue__sources');
        entry.sources.forEach(function(source){
          var url=safeForumURL(source.url);
          if(!url)return;
          var a=txt('a','nx-dialogue__source','↗ '+source.label);
          a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.appendChild(a);
        });
        if(links.childNodes.length)el.appendChild(links);
      }
      return el;
    }
    function render() {
      feed.replaceChildren();
      transcript.forEach(function(entry){feed.appendChild(bubble(entry));});
      choiceBox.replaceChildren();
      N[current].choices.forEach(function(c){
        var button=txt('button','nx-dialogue__choice',c.label);
        button.type='button';
        button.addEventListener('click',function(){visit(c.next,c.label,c.set);});
        choiceBox.appendChild(button);
      });
      btnBack.disabled=!history.length;
      if(btnCopy)btnCopy.hidden=current!=='bilan';
      feed.scrollTop=feed.scrollHeight;
    }
    function visit(next,label,set) {
      if(!N[next])return;
      history.push({current:current,answers:Object.assign({},answers),transcript:transcript.slice()});
      if(history.length>50)history.shift();
      if(set)Object.assign(answers,set);
      current=next;
      transcript.push({mine:true,text:label});
      transcript.push({mine:false,text:reply(next),sources:N[next].annexes});
      if(search){search.value='';}
      if(searchResults){searchResults.hidden=true;searchResults.replaceChildren();}
      render();
    }
    function reset() {
      current='home';answers={};history=[];
      transcript=[{mine:false,text:reply('home'),sources:N.home.annexes}];
      if(search)search.value='';
      if(searchResults){searchResults.hidden=true;searchResults.replaceChildren();}
      render();
    }
    function runSearch() {
      if(!search||!searchResults)return;
      var q=normalize(search.value);
      searchResults.replaceChildren(); searchResults.hidden=q.length<2;
      if(q.length<2)return;
      var words=q.split(' ').filter(function(w){return w.length>1;});
      var matches=[];
      Object.keys(N).forEach(function(key){
        var item=N[key];
        var title=normalize(item.title), rest=normalize(item.reply+' '+item.keywords);
        var score=title===q?100:title.indexOf(q)!==-1?25:rest.indexOf(q)!==-1?10:0;
        if(!score&&words.length)score=words.reduce(function(sum,w){return sum+(title.indexOf(w)!==-1?4:rest.indexOf(w)!==-1?1:0);},0);
        if(score>0)matches.push({key:key,title:item.title,score:score});
      });
      matches.sort(function(a,b){return b.score-a.score||a.title.localeCompare(b.title,'fr');});
      matches.slice(0,8).forEach(function(found){
        var b=txt('button','nx-dialogue__searchhit','↗ '+found.title);
        b.type='button';b.addEventListener('click',function(){visit(found.key,'Question : '+found.title);});
        searchResults.appendChild(b);
      });
      if(!matches.length)searchResults.appendChild(txt('div','nx-dialogue__searchnone','Aucune réponse correspondante. Essayez « payer sans Link », « guide pratique », « métro », « santé » ou consultez les annexes.'));
    }
    btnBack.addEventListener('click',function(){
      if(!history.length)return;
      var p=history.pop();current=p.current;answers=p.answers;transcript=p.transcript;render();
    });
    btnReset.addEventListener('click',reset);
    if(btnHome)btnHome.addEventListener('click',function(){if(current!=='home')visit('home','Retour au sommaire');});
    if(search){search.addEventListener('input',runSearch);search.addEventListener('keydown',function(e){if(e.key==='Escape'){search.value='';runSearch();}});}
    if(btnCopy)btnCopy.addEventListener('click',function(){
      if(current==='bilan')copyText(buildBilan(answers),null,btnCopy);
    });
    reset();
  }

  /* Échos — interface citoyenne et outils STAFF ; génération locale de brouillons BBCode. */
  function initEchoes(root) {
    if(!root||root.dataset.nexusEchoesV3==='true'||root.dataset.initialized==='true')return;
    root.dataset.nexusEchoesV3='true';
    root.dataset.initialized='true';
    var tabs=Array.prototype.slice.call(root.querySelectorAll('[role="tab"][data-target]'));
    var panels=Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"][data-panel]'));
    function tab(name,focus){
      var active;
      tabs.forEach(function(el){
        var yes=el.dataset.target===name;
        el.classList.toggle('is-active',yes);el.setAttribute('aria-selected',String(yes));el.tabIndex=yes?0:-1;
        if(yes)active=el;
      });
      panels.forEach(function(el){el.hidden=el.dataset.panel!==name;});
      if(focus&&active)active.focus();
    }
    tabs.forEach(function(el,i){
      el.addEventListener('click',function(){tab(el.dataset.target,false);});
      el.addEventListener('keydown',function(e){
        var index=-1;
        if(e.key==='ArrowRight'||e.key==='ArrowDown')index=(i+1)%tabs.length;
        else if(e.key==='ArrowLeft'||e.key==='ArrowUp')index=(i+tabs.length-1)%tabs.length;
        else if(e.key==='Home')index=0;
        else if(e.key==='End')index=tabs.length-1;
        if(index>=0){e.preventDefault();tab(tabs[index].dataset.target,true);}
      });
    });
    root.querySelectorAll('[data-go]').forEach(function(el){el.addEventListener('click',function(){tab(el.dataset.go,true);});});
    root.classList.add('is-ready');if(tabs.length)tab('home',false);
    [
      ['data-fiche-url','[data-fiche-link]','[data-fiche-message]','Consulter les dossiers sur le forum.'],
      ['data-annonces-url','[data-comm-link]','[data-comm-message]','Consulter les communiqués publics.'],
      ['data-echo-topic-url','[data-echo-link]','[data-unconfigured]','']
    ].forEach(function(pair){
      var address=safeForumURL(root.getAttribute(pair[0]));
      var link=root.querySelector(pair[1]);if(!address||!link)return;
      link.href=address;link.hidden=false;
      var note=root.querySelector(pair[2]);if(note){if(pair[0]==='data-echo-topic-url')note.hidden=true;else note.textContent=pair[3];}
    });
    var form=root.querySelector('#nx-e-form');
    var result=root.querySelector('#nx-e-result');
    var output=root.querySelector('#nx-e-output');
    var feedback=root.querySelector('#nx-e-feedback');
    var err=root.querySelector('#nx-e-error');
    if(form&&result&&output){
      var resetBtn=form.querySelector('[data-nx-clear]'), genBtn=form.querySelector('[data-nx-prepare]');
      if(resetBtn)resetBtn.addEventListener('click',function(){resetFields(form);output.value='';result.hidden=true;if(err){err.textContent='';err.hidden=true;}if(feedback)feedback.textContent='';});
      if(genBtn)genBtn.addEventListener('click',function(){
        var f=fields(form);if(err){err.textContent='';err.hidden=true;}
        for(var i=0;i<4;i++){
          var required=['categorie','auteur','titre','resume'][i];
          if(!f[required]||!val(f[required].value)){issue(form,required,err,'Merci de remplir les champs obligatoires.');return;}
        }
        if(f.rp&&val(f.rp.value)&&(!/^https:\/\//i.test(val(f.rp.value))||!safeForumURL(f.rp.value))){issue(form,'rp',err,'Veuillez indiquer une adresse HTTPS du forum PRIVILÈGE.');return;}
        if(!f.accord||!f.accord.checked){issue(form,'accord',err,'Veuillez confirmer les conditions de participation.');return;}
        output.value=[
          '[b]ÉCHOS DE NEW YORK // CONTRIBUTION[/b]',
          '[b]Nature :[/b] '+cleanBB(f.categorie.value),
          '[b]Titre :[/b] '+cleanBB(f.titre.value),
          '[b]Personnage :[/b] '+cleanBB(f.auteur.value),
          '[b]Secteur :[/b] '+(f.quartier&&val(f.quartier.value)?cleanBB(f.quartier.value):'Non précisé'),
          '[b]RP source :[/b] '+(f.rp&&val(f.rp.value)?val(f.rp.value):'Non renseigné'),'',
          '[b]Écho transmis :[/b]',cleanBB(f.resume.value),'',
          '[i]Contribution volontaire. Aucun événement n’est officialisé automatiquement.[/i]'
        ].join('\n');
        result.hidden=false;
        if(feedback)feedback.textContent='Brouillon prêt. Aucun envoi automatique.';
        if(result.scrollIntoView)result.scrollIntoView({behavior:'smooth',block:'nearest'});
      });
      var copy=root.querySelector('#nx-e-copy');if(copy)copy.addEventListener('click',function(){copyText(output.value,output,feedback);});
    }
  }
  function initAdmin(root) {
    if(!root||root.dataset.nexusAdminV3==='true'||root.dataset.initialized==='true')return;
    root.dataset.nexusAdminV3='true';
    root.dataset.initialized='true';
    var link=root.querySelector('[data-admin-source-link]');
    var url=safeForumURL(root.getAttribute('data-admin-source-url'));
    if(link&&url){link.href=url;link.hidden=false;}
    var form=root.querySelector('#nx-e-admin-form');
    var output=root.querySelector('#nx-e-admin-output');
    var result=root.querySelector('#nx-e-admin-result');
    var feedback=root.querySelector('#nx-e-admin-feedback');
    var err=root.querySelector('#nx-e-admin-error');
    if(!form||!output||!result)return;
    var clear=form.querySelector('[data-nx-clear]'),generate=form.querySelector('[data-nx-prepare]');
    if(clear)clear.addEventListener('click',function(){resetFields(form);output.value='';result.hidden=true;if(err){err.textContent='';err.hidden=true;}if(feedback)feedback.textContent='';});
    if(generate)generate.addEventListener('click',function(){
      if(err){err.textContent='';err.hidden=true;}
      var f=fields(form);
      if(!f.idee||!val(f.idee.value)){issue(form,'idee',err,'Indiquez une idée de départ.');return;}
      if(f.source&&val(f.source.value)&&(!/^https:\/\//i.test(val(f.source.value))||!safeForumURL(f.source.value))){issue(form,'source',err,'Le lien RP doit appartenir au forum PRIVILÈGE.');return;}
      var idea=cleanBB(f.idee.value).replace(/\s+/g,' ');
      var place=(f.lieu&&cleanBB(f.lieu.value))||'un secteur de New York';
      var format=f.format&&f.format.value || 'rumeur';
      var text='';
      if(format==='communique') text='[b]NEXUS — INFORMATION INSTITUTIONNELLE[/b]\n[small]Secteur : '+place+'[/small]\n\nLes services compétents ont pris connaissance de ce signalement : '+idea+'\n\nLes informations disponibles ne permettent pas, à ce stade, de formuler davantage de conclusions.\n\n[i]Votre coopération contribue à la continuité de la cité.[/i]';
      else if(format==='actualite') text='[b]BRÈVE DE NEW YORK — '+place+'[/b]\n\n'+idea+'\n\nD’autres éléments pourraient émerger au fil des témoignages.';
      else if(format==='amorce') text='[b]AMORCE DE RP — '+place+'[/b]\n\nUn fait retient l’attention : '+idea+'\n\nLes personnages intéressés peuvent s’en saisir, dans le respect des accords RP.';
      else text='[b]ON MURMURE À NEW YORK…[/b]\n\nDans '+place+', une rumeur circule : '+idea+'\n\n[i]Rien ne permet encore de distinguer la vérité des murmures de la ville.[/i]';
      output.value=text;result.hidden=false;
      if(feedback){
        var unchecked=['canon','consentement','portee'].filter(function(key){return !f[key]||!f[key].checked;}).length;
        feedback.textContent=unchecked?'Canevas prêt. '+unchecked+' point(s) de vigilance à vérifier avant publication.':'Canevas prêt. Vérifiez le texte avant publication.';
      }
      if(result.scrollIntoView)result.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
    var copy=root.querySelector('#nx-e-admin-copy');if(copy)copy.addEventListener('click',function(){copyText(output.value,output,feedback);});
  }
  function boot() {
    var citizen=document.getElementById('nx-echos-citizen');
    var admin=document.getElementById('nx-echos-admin');
    if(citizen){initEchoes(citizen);initTerminal(citizen);}
    if(admin)initAdmin(admin);
    // Les modèles Echos possèdent normalement une feuille CSS indépendante déjà installée.
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
