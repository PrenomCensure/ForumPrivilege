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
    css.href = new URL('nexus-echos.css', script.src).href;
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
  function resetErrors(form, dest) {
    if (dest) { dest.textContent = ''; dest.hidden = true; }
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }
  function requiredFields(form, names, dest) {
    for (var i = 0; i < names.length; i++) {
      var f = form.elements[names[i]];
      if (!clean(f.value)) { error(f, 'Merci de remplir les champs obligatoires.', dest); return false; }
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
      form.addEventListener('reset', function () {
        result.hidden = true; output.value = ''; resetErrors(form, err); if (feedback) feedback.textContent = '';
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault(); resetErrors(form, err);
        if (!requiredFields(form, ['categorie','auteur','titre','resume'], err)) return;
        if (!validRpURL(form.elements.rp, err)) return;
        if (!form.elements.accord.checked) { error(form.elements.accord, 'Veuillez confirmer les conditions de participation.', err); return; }
        var v = form.elements;
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
      aform.addEventListener('reset', function () {
        aresult.hidden = true; aoutput.value = ''; resetErrors(aform, aerr); if (afeedback) afeedback.textContent = '';
      });
      aform.addEventListener('submit', function (event) {
        event.preventDefault(); resetErrors(aform, aerr);
        if (!requiredFields(aform, ['idee'], aerr)) return;
        if (!validRpURL(aform.elements.source, aerr)) return;
        var v = aform.elements;
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
