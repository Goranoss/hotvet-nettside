/* Hotvet legesenter – GDPR-samtykke + GA4 med Google Consent Mode v2 + Meta Pixel
 *
 * Endret 06.10.2026.
 * Før: GA4 og Meta Pixel ble lastet KUN hvis brukeren trykket «Aksepter».
 *      Alle som avviste eller ignorerte banneret ble ikke målt i det hele tatt —
 *      ingen økt, ingen konvertering. Det gjorde kampanjemålingen verdiløs.
 * Nå:  Consent Mode v2. gtag lastes alltid, men med alle samtykketyper satt til
 *      «denied» inntil brukeren sier ja. I denied-tilstand settes INGEN
 *      informasjonskapsler og ingen identifikatorer sendes — Google mottar bare
 *      samtykkefrie signaler og modellerer konverteringene som mangler.
 *      Meta Pixel setter informasjonskapsler uansett, og lastes derfor fortsatt
 *      bare ved aktivt samtykke.
 */
(function () {
  var GA_ID = 'G-PM4ZTZTSR9';
  var META_PIXEL_ID = '905329482341471';
  var STORAGE_KEY = 'hotvet_consent';
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  /* ---- 1. gtag-stub og Consent Mode v2-standard. Må settes før gtag.js lastes. ---- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  // Fjerner annonse-identifikatorer ved manglende samtykke, og sender gclid
  // videre i nettadressen i stedet for i en informasjonskapsel.
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  function grantConsent() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }

  // Tidligere samtykke må oppdateres før første sidevisning sendes.
  if (stored === 'accepted') grantConsent();

  /* ---- 2. GA4 lastes alltid. Samtykkestatus styrer hva som faktisk lagres. ---- */
  (function loadGA() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  })();

  /* ---- 3. Meta Pixel – kun ved samtykke ---- */
  function loadMetaPixel() {
    if (window._hotvetMetaLoaded) return;
    window._hotvetMetaLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  /* ---- 4. Hendelsessporing – bindes alltid.
            Uten samtykke sendes hendelsene som samtykkefrie signaler. ---- */
  function trackEvents() {
    if (window._hotvetEventsBound) return;
    window._hotvetEventsBound = true;

    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.gtag) gtag('event', 'contact_phone_click');
        if (window.fbq) fbq('track', 'Contact');
      });
    });

    document.querySelectorAll('a[href*="helsenorge.no"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.gtag) gtag('event', 'helsenorge_click', { destination: a.href });
        if (window.fbq) fbq('track', 'Lead');
      });
    });
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(trackEvents);
  if (stored === 'accepted') loadMetaPixel();

  /* ---- 5. Samtykkebanner ---- */
  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    var b = document.getElementById('hotvet-consent-banner');
    if (b) b.parentNode.removeChild(b);
    if (value === 'accepted') {
      grantConsent();
      loadMetaPixel();
      trackEvents();
    }
  }

  function showBanner() {
    var css = '#hotvet-consent-banner{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#fff;border-top:3px solid #2c5f4d;box-shadow:0 -4px 16px rgba(0,0,0,.15);padding:18px 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;font-size:14px;color:#333;line-height:1.55;display:flex;flex-wrap:wrap;align-items:center;gap:14px;justify-content:space-between}#hotvet-consent-banner .hcb-text{flex:1 1 320px;max-width:760px}#hotvet-consent-banner h3{margin:0 0 6px;font-size:15px;font-weight:600;color:#2c5f4d}#hotvet-consent-banner a{color:#2c5f4d;text-decoration:underline}#hotvet-consent-banner .hcb-actions{display:flex;gap:10px;flex-wrap:wrap}#hotvet-consent-banner button{cursor:pointer;border:0;border-radius:6px;padding:10px 18px;font-size:14px;font-weight:600;font-family:inherit}#hotvet-consent-accept{background:#2c5f4d;color:#fff}#hotvet-consent-accept:hover{background:#234a3c}#hotvet-consent-decline{background:#eee;color:#333}#hotvet-consent-decline:hover{background:#ddd}@media(max-width:640px){#hotvet-consent-banner{flex-direction:column;align-items:stretch}#hotvet-consent-banner .hcb-actions{justify-content:stretch}#hotvet-consent-banner button{flex:1}}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var div = document.createElement('div');
    div.id = 'hotvet-consent-banner';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', 'Samtykke til informasjonskapsler');
    div.innerHTML = '<div class="hcb-text"><h3>Vi bruker informasjonskapsler</h3>Vi bruker analyseverktøy (Google Analytics og Meta Pixel) for å forstå hvordan nettsiden brukes og forbedre tjenesten. Trykker du «Avvis», lagres ingen informasjonskapsler, og vi mottar kun anonym og samlet statistikk uten opplysninger som kan knyttes til deg. Du kan trekke samtykket tilbake når som helst.</div><div class="hcb-actions"><button id="hotvet-consent-decline" type="button">Avvis</button><button id="hotvet-consent-accept" type="button">Aksepter</button></div>';
    document.body.appendChild(div);

    document.getElementById('hotvet-consent-accept').addEventListener('click', function () { setConsent('accepted'); });
    document.getElementById('hotvet-consent-decline').addEventListener('click', function () { setConsent('declined'); });
  }

  if (stored !== 'accepted' && stored !== 'declined') {
    onReady(showBanner);
  }
})();
