/*
 * Google tag + lead tracking for jarredmarks.com
 *
 * IDs below are replaced at deploy time. If an ID still contains
 * "PLACEHOLDER", that tag is skipped so nothing breaks pre-configuration.
 *
 * PRIVACY RULE, DO NOT BREAK IT: no name, email, phone, other-party name, or
 * free-text message is ever sent to Google. Only the closed-list screening
 * answers (amount in dispute, counsel category, deadline status) are sent,
 * because those are categories rather than client information. Sending
 * personal data to Analytics violates Google's terms and is not consistent
 * with the firm's confidentiality obligations.
 */
(function () {
  var GA4_ID = 'G-2GE2232SF1';
  var ADS_ID = 'AW-18199134875';
  var FORM_CONVERSION_LABEL = '0j32CNzvmc8cEJuFg-ZD';
  var PHONE_CONVERSION_LABEL = '8hOhCN_vmc8cEJuFg-ZD';

  var STASH_KEY = 'jml_lead_context';
  var FIRST_TOUCH_KEY = 'jml_first_touch';

  function configured(id) { return id.indexOf('PLACEHOLDER') === -1; }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  gtag('js', new Date());

  /* ---------------------------------------------------------------
     Page classification. Every hit carries the practice area and the
     page type, so reports can be read by service line rather than by
     filename.
     --------------------------------------------------------------- */

  var PAGE_MAP = {
    'index.html':                ['home',              'general'],
    '':                          ['home',              'general'],
    'services.html':             ['services_overview', 'general'],
    'real-estate-disputes.html': ['practice',          'real_estate'],
    'civil-litigation.html':     ['practice',          'civil_commercial'],
    'estate-litigation.html':    ['practice',          'estate_probate'],
    'evictions.html':            ['practice',          'landlord_eviction'],
    'fees.html':                 ['fees',              'general'],
    'contact.html':              ['contact',           'general'],
    'about.html':                ['about',             'general'],
    'thank-you.html':            ['thank_you',         'general']
  };

  var file = window.location.pathname.split('/').pop() || '';
  var classified = PAGE_MAP[file] || ['other', 'general'];
  var PAGE_TYPE = classified[0];
  var PRACTICE_AREA = classified[1];

  /* First-touch source, kept for the life of the browser so a lead that
     arrives on an ad, leaves, and returns direct is still attributed. */
  function captureFirstTouch() {
    try {
      if (localStorage.getItem(FIRST_TOUCH_KEY)) { return; }
      var q = new URLSearchParams(window.location.search);
      var touch = {
        source: q.get('utm_source') || (q.get('gclid') ? 'google_ads' : ''),
        medium: q.get('utm_medium') || (q.get('gclid') ? 'cpc' : ''),
        campaign: q.get('utm_campaign') || '',
        term: q.get('utm_term') || '',
        landing: file || 'index.html',
        at: new Date().toISOString().slice(0, 10)
      };
      if (!touch.source && document.referrer &&
          document.referrer.indexOf(window.location.hostname) === -1) {
        touch.source = 'referral';
        touch.medium = 'referral';
      }
      if (touch.source) { localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch)); }
    } catch (e) { /* private browsing: attribution degrades, nothing breaks */ }
  }
  captureFirstTouch();

  function firstTouch() {
    try { return JSON.parse(localStorage.getItem(FIRST_TOUCH_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  var loaderId = configured(GA4_ID) ? GA4_ID : (configured(ADS_ID) ? ADS_ID : null);
  if (loaderId) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + loaderId;
    document.head.appendChild(s);
  }
  if (configured(GA4_ID)) {
    gtag('config', GA4_ID, {
      page_type: PAGE_TYPE,
      practice_area: PRACTICE_AREA
    });
    /* Repeat as a global so the dimensions survive into custom events. */
    gtag('set', { page_type: PAGE_TYPE, practice_area: PRACTICE_AREA });
  }
  if (configured(ADS_ID)) {
    gtag('config', ADS_ID);
    /* Google forwarding number: swaps the displayed number for visitors
       arriving from ads so calls are measured as conversions by duration */
    if (configured(PHONE_CONVERSION_LABEL)) {
      gtag('config', ADS_ID + '/' + PHONE_CONVERSION_LABEL, {
        phone_conversion_number: '(801) 823-4379'
      });
    }
  }

  function track(name, params) {
    params = params || {};
    params.page_type = PAGE_TYPE;
    params.practice_area = PRACTICE_AREA;
    gtag('event', name, params);
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* -------------------------------------------------------------
       Scroll depth. Tells you whether a visitor read the page or
       bounced off the masthead, which raw pageviews cannot.
       ------------------------------------------------------------- */
    (function () {
      var marks = [25, 50, 75, 90];
      var hit = {};
      function check() {
        var doc = document.documentElement;
        var height = doc.scrollHeight - window.innerHeight;
        if (height <= 0) { return; }
        var pct = Math.round((window.scrollY / height) * 100);
        for (var i = 0; i < marks.length; i++) {
          var m = marks[i];
          if (pct >= m && !hit[m]) {
            hit[m] = true;
            track('scroll_milestone', { scroll_depth: m });
          }
        }
      }
      var throttled = false;
      window.addEventListener('scroll', function () {
        if (throttled) { return; }
        throttled = true;
        setTimeout(function () { throttled = false; check(); }, 400);
      }, { passive: true });
    })();

    /* -------------------------------------------------------------
       Engaged time. Counts only while the tab is visible, so an
       abandoned tab does not read as an hour of rapt attention.
       ------------------------------------------------------------- */
    (function () {
      var seconds = 0;
      var marks = [15, 30, 60, 120, 240];
      var idx = 0;
      setInterval(function () {
        if (document.visibilityState !== 'visible') { return; }
        seconds++;
        if (idx < marks.length && seconds >= marks[idx]) {
          track('engaged_time', { engaged_seconds: marks[idx] });
          idx++;
        }
      }, 1000);
    })();

    /* -------------------------------------------------------------
       Contact clicks. A tel: tap is NOT a phone call and must not be
       counted as one. The real call conversion is measured in Google
       Ads by call duration (40 seconds) through the forwarding number
       configured above. Keep this event OUT of GA4 key events.
       ------------------------------------------------------------- */
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('phone_click', { event_category: 'lead', event_label: window.location.pathname });
      });
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('email_click', { event_category: 'lead', event_label: window.location.pathname });
      });
    });

    /* Outbound clicks, so referrals out of the site are visible. */
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.hostname === window.location.hostname) { return; }
      a.addEventListener('click', function () {
        track('outbound_click', { link_domain: a.hostname, link_url: a.href });
      });
    });

    /* -------------------------------------------------------------
       Thank-you page: fire the lead conversion exactly once, carrying
       the screening answers stashed at submit time.
       ------------------------------------------------------------- */
    if (document.body.hasAttribute('data-conversion-page')) {
      var ctx = {};
      try { ctx = JSON.parse(sessionStorage.getItem(STASH_KEY) || '{}'); } catch (e) { ctx = {}; }
      var ft = firstTouch();
      gtag('event', 'generate_lead', {
        event_category: 'lead',
        event_label: 'contact_form',
        matter_value: ctx.matter_value || 'unknown',
        counsel_category: ctx.counsel_category || 'unknown',
        deadline_status: ctx.deadline_status || 'unknown',
        form_page: ctx.form_page || 'unknown',
        form_seconds: ctx.form_seconds || 0,
        first_touch_source: ft.source || 'unknown',
        first_touch_campaign: ft.campaign || 'unknown',
        first_touch_landing: ft.landing || 'unknown'
      });
      if (configured(ADS_ID) && configured(FORM_CONVERSION_LABEL)) {
        gtag('event', 'conversion', { send_to: ADS_ID + '/' + FORM_CONVERSION_LABEL });
      }
      try { sessionStorage.removeItem(STASH_KEY); } catch (e) {}
      return;
    }

    /* -------------------------------------------------------------
       Lead forms.
       ------------------------------------------------------------- */
    document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
      var started = false;
      var submitted = false;
      var startedAt = 0;
      var deepest = '';

      /* Names safe to report. Everything else is client information. */
      var SAFE = ['amount_in_dispute', 'counsel_category', 'deadline_status', 'page_source'];

      function fieldLabel(el) {
        var n = el.getAttribute('name') || '';
        return SAFE.indexOf(n) !== -1 ? n : (n ? 'field:' + n : 'field');
      }

      form.addEventListener('focusin', function (e) {
        deepest = fieldLabel(e.target);
        if (started) { return; }
        started = true;
        startedAt = Date.now();
        track('form_start', { form_id: 'contact_form' });
      });

      /* Abandonment: started the form, never submitted. The field named
         is the last one touched, which is where the form loses people. */
      window.addEventListener('pagehide', function () {
        if (!started || submitted) { return; }
        track('form_abandon', {
          form_id: 'contact_form',
          last_field: deepest,
          form_seconds: Math.round((Date.now() - startedAt) / 1000)
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitted = true;

        /* Stash ONLY the closed-list screening answers for the thank-you
           page. No name, email, phone, other party, or message. */
        try {
          var data = new FormData(form);
          sessionStorage.setItem(STASH_KEY, JSON.stringify({
            matter_value: data.get('amount_in_dispute') || 'unknown',
            counsel_category: data.get('counsel_category') || 'unknown',
            deadline_status: data.get('deadline_status') || 'unknown',
            form_page: data.get('page_source') || file,
            form_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0
          }));
        } catch (err) { /* storage blocked: conversion still fires, unlabelled */ }

        var btn = form.querySelector('button[type="submit"]');
        var original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending…';
        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        }).then(function (res) {
          if (!res.ok) { throw new Error('Formspree responded ' + res.status); }
          window.location.href = 'thank-you.html';
        }).catch(function () {
          btn.disabled = false;
          btn.textContent = original;
          form.submit();
        });
      });
    });
  });
})();
