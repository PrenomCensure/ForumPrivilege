/* ============================================================
   PRIVILÈGE · NEXUS / MENU CITOYEN V3 / CORRECTIF SIDEBAR
   Déplace les comptes dans le panneau tout en gardant les outils sur la barre.
   SECURITE : si le CSS n’est pas chargé, ne touche pas au Switcheroo.
   À charger après l'initialisation de Switcheroo, une seule fois.
   ============================================================ */
(function () {
  'use strict';

  function initPrivilegeMenu() {
    if (document.getElementById('priv-burger-root')) return;

    var root = document.createElement('div');
    root.id = 'priv-burger-root';
    root.className = 'priv-burger';
    root.innerHTML = [
      '<button type="button" class="priv-burger-toggle" aria-label="Ouvrir le menu NEXUS" aria-expanded="false" aria-controls="priv-burger-panel" title="Menu NEXUS">',
        '<span class="priv-burger-toggle-lines" aria-hidden="true"><i></i><i></i><i></i></span>',
      '</button>',
      '<div class="priv-burger-backdrop" aria-hidden="true"></div>',
      '<aside class="priv-burger-panel" id="priv-burger-panel" aria-labelledby="priv-burger-title" aria-hidden="true">',
        '<header class="priv-burger-head">',
          '<div class="priv-burger-eyebrow">PRIVILÈGE / NEXUS / 2046</div>',
          '<h2 id="priv-burger-title">terminal citoyen.</h2>',
          '<div class="priv-burger-subtitle">identity is a privilege.</div>',
        '</header>',
        '<div class="priv-burger-content">',
          '<section class="priv-burger-section priv-burger-identities" aria-labelledby="priv-burger-identity-label">',
            '<div class="priv-burger-section-head">',
              '<h3 id="priv-burger-identity-label">MES IDENTITÉS</h3>',
              '<span class="priv-burger-section-code">01 / ACCOUNT ACCESS</span>',
            '</div>',
            '<div class="priv-burger-accounts" id="priv-burger-accounts"></div>',
          '</section>',
          '<section class="priv-burger-section" aria-labelledby="priv-burger-links-label">',
            '<div class="priv-burger-section-head">',
              '<h3 id="priv-burger-links-label">ACCÈS RAPIDES</h3>',
              '<span class="priv-burger-section-code">02 / NAVIGATION</span>',
            '</div>',
            '<nav class="priv-burger-links" aria-label="Liens utiles de PRIVILÈGE">',
              '<a class="priv-burger-link" href="/"><span class="priv-burger-link-index">01</span><span>Accueil du forum</span><span class="priv-burger-link-arrow" aria-hidden="true">↗</span></a>',
              '<a class="priv-burger-link" href="/h1-nexus-terminal-citoyen"><span class="priv-burger-link-index">02</span><span>Terminal NEXUS</span><span class="priv-burger-link-arrow" aria-hidden="true">↗</span></a>',
              '<a class="priv-burger-link" href="/t110-10-guide-pratique-2046"><span class="priv-burger-link-index">03</span><span>Guide pratique 2046</span><span class="priv-burger-link-arrow" aria-hidden="true">↗</span></a>',
              '<a class="priv-burger-link" href="/h2-syn_code"><span class="priv-burger-link-index">04</span><span>SYN / Rencontres</span><span class="priv-burger-link-arrow" aria-hidden="true">↗</span></a>',
              '<a class="priv-burger-link" href="/f5-insta_story_irl"><span class="priv-burger-link-index">05</span><span>INSTA / Stories</span><span class="priv-burger-link-arrow" aria-hidden="true">↗</span></a>',
              '<a class="priv-burger-link" href="/f31-conversations-syn"><span class="priv-burger-link-index">06</span><span>Conversations SYN</span><span class="priv-burger-link-arrow" aria-hidden="true">↗</span></a>',
            '</nav>',
          '</section>',
        '</div>',
        '<footer class="priv-burger-foot"><span class="priv-burger-status-dot" aria-hidden="true"></span>NEXUS / LIAISON ÉTABLIE <span class="priv-burger-foot-version">V.2046</span></footer>',
      '</aside>'
    ].join('');

    document.body.appendChild(root);

    // Si le CSS V3 n'est pas servi (GitHub/CDN), ne pas déplacer Switcheroo.
    // Cela évite de masquer les commandes de la sidebar.
    if (window.getComputedStyle(root.querySelector('.priv-burger-panel')).position !== 'fixed') {
      root.remove();
      console.warn('[PRIVILÈGE] Menu NEXUS non initialisé : menuburger.css absent ou obsolète.');
      return;
    }

    var button = root.querySelector('.priv-burger-toggle');
    var panel = root.querySelector('.priv-burger-panel');
    var overlay = root.querySelector('.priv-burger-backdrop');
    var accounts = root.querySelector('#priv-burger-accounts');
    panel.inert = true;

    function setOpen(open, restoreFocus) {
      root.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Fermer le menu NEXUS' : 'Ouvrir le menu NEXUS');
      button.title = open ? 'Fermer le menu NEXUS' : 'Menu NEXUS';
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
      if (!open && restoreFocus) button.focus();
    }

    button.addEventListener('click', function () {
      var open = !root.classList.contains('is-open');
      setOpen(open);
      if (open) {
        var focusTarget = panel.querySelector('.switcheroo__squircle[tabindex], .priv-burger-link');
        if (focusTarget) focusTarget.focus({ preventScroll: true });
      }
    });
    overlay.addEventListener('click', function () { setOpen(false, true); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && root.classList.contains('is-open')) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    panel.addEventListener('click', function (event) {
      if (event.target.closest('.priv-burger-link')) setOpen(false);
      // Switcheroo ouvre lui-même sa modale via un écouteur délégué.
      if (event.target.closest('[data-action="open-login"]')) setOpen(false);
    });
    // Les avatars et le bouton + de Switcheroo sont des <li> ;
    // cette adaptation permet aussi de les activer au clavier.
    panel.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      var item = event.target.closest('.switcheroo__squircle[data-action]');
      if (!item || event.target !== item) return;
      event.preventDefault();
      item.click();
    });

    function moveSwitcheroo() {
      var switcheroo = document.getElementById('switcheroo');
      if (!switcheroo) return false;
      var list = switcheroo.querySelector('.switcheroo__squircles');
      // Attendre que le plugin soit réellement initialisé.
      if (!list || !list.querySelector('[data-action="open-login"]')) return false;

      if (switcheroo.parentElement !== accounts) {
        // Garder une ancre dans la colonne d'origine : elle maintient sa
        // structure et la place occupée par Switcheroo dans la sidebar.
        var anchor = document.getElementById('priv-burger-rail-spacer');
        if (!anchor) {
          anchor = document.createElement('nav');
          anchor.id = 'priv-burger-rail-spacer';
          anchor.className = 'switcheroo priv-burger-rail-spacer';
          anchor.setAttribute('aria-label', 'Commandes rapides du forum');
          var railList = document.createElement('ul');
          railList.className = 'switcheroo__squircles';
          anchor.appendChild(railList);
          switcheroo.parentNode.insertBefore(anchor, switcheroo);
        }
        var rail = anchor.querySelector('.switcheroo__squircles');

        // Déplacer les vrais boutons personnalisés (jour/nuit, haut, bas,
        // messagerie si elle est dans Switcheroo), sans cloner leurs écouteurs.
        Array.from(list.children).forEach(function (item) {
          if (item.classList.contains('switcheroo__button') ||
              item.classList.contains('switcheroo__logo') ||
              item.classList.contains('switcheroo__divider')) {
            rail.appendChild(item);
          }
        });
        if (rail.children.length) anchor.classList.add('priv-burger-rail-spacer--has-tools');

        // Garder le VRAI #switcheroo autour des comptes, pour les actions
        // natives (changement, suppression, ajout et réorganisation).
        accounts.appendChild(switcheroo);
      }
      switcheroo.setAttribute('position', 'static');
      switcheroo.setAttribute('direction', 'horizontal');
      switcheroo.setAttribute('aria-label', 'Mes comptes Switcheroo');
      switcheroo.querySelectorAll('.switcheroo__squircle[data-action]').forEach(function (item) {
        var tip = item.querySelector('.switcheroo__popper-text');
        var label = tip ? tip.textContent.trim() : '';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        if (label) {
          item.setAttribute('aria-label', label);
          item.setAttribute('title', label);
        }
      });
      document.body.classList.add('priv-burger-ready');
      return true;
    }

    if (!moveSwitcheroo()) {
      // Certains templates injectent le plugin tardivement.
      // Ne pas recréer Switcheroo : attendre son nœud d'origine.
      accounts.textContent = 'Gestion des comptes indisponible sur cette page.';
      var observer = new MutationObserver(function () {
        if (moveSwitcheroo()) {
          if (accounts.firstChild && accounts.firstChild.nodeType === 3) {
            accounts.firstChild.remove();
          }
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivilegeMenu, { once: true });
  } else {
    initPrivilegeMenu();
  }
})();
