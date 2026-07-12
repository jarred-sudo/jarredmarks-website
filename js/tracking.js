/*
 * Google tag + lead tracking for jarredmarks.com
 * IDs below are replaced at deploy time. If an ID still contains
 * "PLACEHOLDER", that tag is skipped so nothing breaks pre-configuration.
 */
(function () {
  var GA4_ID = 'G-2GE2232SF1';
  var ADS_ID = 'AW-18199134875';
  var FORM_CONVERSION_LABEL = '0j32CNzvmc8cEJuFg-ZD';
  var PHONE_CONVERSION_LABEL = '8hOhCN_vmc8cEJuFg-ZD';

  function configured(id) { return id.indexOf('PLACEHOLDER') === -1; }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  gtag('js', new Date());

  var loaderId = configured(GA4_ID) ? GA4_ID : (configured(ADS_ID) ? ADS_ID : null);
  if (loaderId) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + loaderId;
    document.head.appendChild(s);
  }
  if (configured(GA4_ID)) {
    gtag('config', GA4_ID);
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

  document.addEventListener('DOMContentLoaded', function () {

    /* Phone-click analytics event (actual call conversions are measured by
       the forwarding-number config above, not by clicks) */
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        gtag('event', 'phone_click', {
          event_category: 'lead',
          event_label: window.location.pathname
        });
      });
    });

    /* Thank-you page: fire the form-submission conversion exactly once */
    if (document.body.hasAttribute('data-conversion-page')) {
      gtag('event', 'generate_lead', {
        event_category: 'lead',
        event_label: 'contact_form'
      });
      if (configured(ADS_ID) && configured(FORM_CONVERSION_LABEL)) {
        gtag('event', 'conversion', {
          send_to: ADS_ID + '/' + FORM_CONVERSION_LABEL
        });
      }
      return;
    }

    /* Lead forms: submit via fetch, then redirect to the thank-you page.
       On any failure, fall back to a normal POST so no lead is ever lost. */
    document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
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
