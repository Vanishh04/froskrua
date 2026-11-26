(function () {
  var NAV_MQ = window.matchMedia("(min-width: 960px)");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function textToHtml(value) {
    return esc(value).replace(/\n/g, "<br>");
  }

  function paragraphs(value, className) {
    return String(value == null ? "" : value)
      .split(/\n\s*\n/)
      .map(function (part) { return part.trim(); })
      .filter(Boolean)
      .map(function (part) {
        return '<p class="' + className + '">' + textToHtml(part) + "</p>";
      })
      .join("");
  }

  function filled(value) {
    return String(value == null ? "" : value).trim().length > 0;
  }

  function iconTelegram() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 4.3 2.8 11.1c-.9.3-.9.9-.2 1.1l4.7 1.5 1.8 5.6c.2.7.6.8 1.1.3l2.6-2.1 4.9 3.6c.6.4 1.2.2 1.4-.6l3.2-14.8c.3-1.1-.4-1.6-1.7-1.4Zm-12 9.3 8.7-5.3c.4-.3.8 0 .5.3l-7.4 6.7-.3 3.3-1.5-5Z"/></svg>';
  }

  function iconCheck() {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5 8 14.5 16 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function external(url, className, label, aria) {
    var attrs = aria ? ' aria-label="' + esc(aria) + '"' : "";
    return (
      '<a class="' + className + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"' + attrs + ">" +
      label +
      "</a>"
    );
  }

  function telegram(className, label) {
    return external(SITE.links.telegram, className, esc(label));
  }

  function instagram(className, label) {
    return external(SITE.links.instagram, className, esc(label));
  }

  function accentTitle(title, accent) {
    var safe = esc(title);
    if (!filled(accent)) return safe;
    var token = esc(accent);
    var index = safe.toLowerCase().indexOf(token.toLowerCase());
    if (index === -1) return safe;
    return (
      safe.slice(0, index) +
      "<em>" + safe.slice(index, index + token.length) + "</em>" +
      safe.slice(index + token.length)
    );
  }

  function priceLabel(service) {
    if (!filled(service.price)) return SITE.ui.priceMissing;
    return (String(service.price).trim() + " " + (service.currency || "")).trim();
  }

  function priceLine(service) {
    var amount = priceLabel(service);
    if (!filled(service.priceUnit)) return amount;
    return amount + " / " + String(service.priceUnit).trim();
  }

  function renderHeader() {
    var links = SITE.nav.links
      .map(function (link) {
        return '<a class="nav-link" href="' + esc(link.href) + '">' + esc(link.label) + "</a>";
      })
      .join("");

    document.getElementById("header").innerHTML =
      '<div class="header-inner wrap">' +
      '<a class="logo" href="#hero">' + esc(SITE.brand.name) + "</a>" +
      telegram("btn btn-pink btn-sm header-cta", SITE.nav.cta) +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="' + esc(SITE.ui.menuOpen) + '">' +
      "<span></span><span></span><span></span>" +
      "</button>" +
      '<nav class="nav-menu" id="nav-menu">' +
      links +
      telegram("btn btn-pink nav-cta", SITE.nav.cta) +
      "</nav>" +
      "</div>";
  }

  function renderHeroMedia() {
    if (filled(SITE.images.video)) {
      var motion = reducedMotion ? " controls" : " autoplay muted loop";
      return (
        '<video class="poster-media" playsinline' + motion +
        (filled(SITE.images.hero) ? ' poster="' + esc(SITE.images.hero) + '"' : "") +
        '><source src="' + esc(SITE.images.video) + '" type="video/mp4"></video>'
      );
    }

    if (filled(SITE.images.hero)) {
      return (
        '<img class="poster-media" src="' + esc(SITE.images.hero) + '" alt="' + esc(SITE.images.heroAlt) + '" fetchpriority="high" decoding="async">'
      );
    }

    return (
      '<p class="poster-kicker">' + esc(SITE.brand.format) + "</p>" +
      '<span class="poster-slash" aria-hidden="true"></span>' +
      '<span class="poster-ring" aria-hidden="true"></span>' +
      '<p class="poster-age">' + esc(SITE.brand.ageRange) + "<small>років</small></p>" +
      '<p class="poster-foot"><span>' + esc(SITE.brand.name) + "</span><span>" + esc(SITE.brand.posterLabel) + "</span></p>"
    );
  }

  function renderHero() {
    var posterLabel = filled(SITE.images.hero) || filled(SITE.images.video) ? "" : ' role="img" aria-label="' + esc(SITE.images.heroAlt) + '"';
    document.getElementById("hero").innerHTML =
      '<div class="wrap hero-grid">' +
      "<div>" +
      '<h1 id="hero-title">' + accentTitle(SITE.hero.title, SITE.hero.titleAccent).replace(/\n/g, "<br>") + "</h1>" +
      paragraphs(SITE.hero.lead, "hero-lead") +
      '<div class="hero-actions">' +
      telegram("btn btn-pink", SITE.hero.primaryCta) +
      '<a class="btn btn-ghost" href="' + esc(SITE.hero.secondaryHref) + '">' + esc(SITE.hero.secondaryCta) + "</a>" +
      "</div>" +
      "</div>" +
      '<div class="hero-visual"><span class="poster-tab" aria-hidden="true"></span><div class="poster"' + posterLabel + ">" + renderHeroMedia() + "</div></div>" +
      "</div>";
  }

  function trustMarkup() {
    if (!SITE.trust || SITE.trust.hidden) return "";

    var cards = SITE.trust.items
      .map(function (item, index) {
        return (
          '<article class="trust-card reveal" style="transition-delay:' + index * 50 + 'ms">' +
          "<span>" + esc(item.label) + "</span><strong>" + esc(item.value) + "</strong></article>"
        );
      })
      .join("");

    return (
      '<div class="trust-block reveal">' +
      '<p class="trust-title">' + esc(SITE.trust.title) + "</p>" +
      '<div class="trust-panel"><div class="trust-grid">' + cards + "</div></div></div>"
    );
  }

  function renderApproach() {
    var cards = SITE.approach.items
      .map(function (item, index) {
        return (
          '<article class="benefit reveal" style="transition-delay:' + index * 60 + 'ms">' +
          '<span class="benefit-index">0' + (index + 1) + "</span>" +
          "<h3>" + esc(item.title) + "</h3><p>" + textToHtml(item.text) + "</p></article>"
        );
      })
      .join("");

    var title = textToHtml(SITE.approach.title).replace(
      "задоволення",
      '<span class="title-mark">задоволення</span>'
    );

    document.getElementById("approach").innerHTML =
      '<div class="wrap">' +
      '<div class="section-head reveal">' +
      '<h2 class="h2" id="approach-title">' + title + "</h2>" +
      '<p class="lede">' + textToHtml(SITE.approach.text) + "</p></div>" +
      '<div class="benefit-grid">' + cards + "</div></div>";
  }

  function sessionMarkup(data) {
    if (!data.parts || !data.parts.length) return "";

    var cards = data.parts
      .map(function (part, index) {
        return (
          '<article class="step session-card reveal" style="transition-delay:' + index * 50 + 'ms">' +
          '<span class="step-n">' + esc(part.n) + "</span>" +
          "<h3>" + esc(part.title) + "</h3><p>" + textToHtml(part.text) + "</p></article>"
        );
      })
      .join("");

    return (
      '<div class="session-block reveal">' +
      '<div class="session-grid">' + cards + "</div></div>"
    );
  }

  function goalSliderMarkup(slides) {
    if (!slides || !slides.length) return "";

    var frames = slides
      .map(function (src, index) {
        return (
          '<div class="goal-slide"><img src="' + esc(src) + '" alt="Тренування FROSKRUA, фото ' + (index + 1) + '"' +
          (index === 0 ? "" : ' loading="lazy"') + "></div>"
        );
      })
      .join("");

    var dots = slides
      .map(function (_, index) {
        return (
          '<button class="goal-dot' + (index === 0 ? " is-active" : "") + '" type="button" aria-label="Фото ' + (index + 1) + '"' +
          (index === 0 ? ' aria-current="true"' : "") + "></button>"
        );
      })
      .join("");

    var arrow =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5 9 12l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    return (
      '<div class="goal-slider" data-goal-slider tabindex="0" aria-roledescription="карусель" aria-label="Фото тренувань">' +
      '<div class="goal-frame">' +
      '<button class="goal-arrow goal-arrow-prev" type="button" aria-label="Попереднє фото">' + arrow + "</button>" +
      '<div class="goal-stage">' +
      '<div class="goal-rail">' + frames + "</div>" +
      '<div class="goal-dots">' + dots + "</div></div>" +
      '<button class="goal-arrow goal-arrow-next" type="button" aria-label="Наступне фото">' + arrow + "</button>" +
      "</div></div>"
    );
  }

  function renderCopySection(id, data) {
    var title = textToHtml(data.title);
    if (id === "training-goal") {
      title = title.replace("Кожне", '<span class="title-mark">Кожне</span>');
    }
    var head =
      '<div class="section-head reveal">' +
      '<h2 class="h2" id="' + id + '-title">' + title + "</h2>" +
      '<p class="lede">' + textToHtml(data.text) + "</p></div>";

    var body = head;
    if (id === "training-goal") {
      body = '<div class="goal-layout">' + head + goalSliderMarkup(data.slides) + "</div>" + sessionMarkup(data);
    }

    document.getElementById(id).innerHTML = '<div class="wrap">' + body + "</div>";
  }

  function renderProcess() {
    var steps = SITE.process.steps
      .map(function (step, index) {
        return (
          '<article class="step reveal" style="transition-delay:' + index * 60 + 'ms">' +
          '<span class="step-n">' + esc(step.n) + "</span>" +
          "<h3>" + esc(step.title) + "</h3><p>" + textToHtml(step.text) + "</p></article>"
        );
      })
      .join("");

    var head =
      '<div class="section-head reveal">' +
      '<h2 class="h2" id="process-title">' + esc(SITE.process.title) + "</h2>" +
      '<p class="lede">' + textToHtml(SITE.process.text) + "</p></div>";

    document.getElementById("process").innerHTML =
      '<div class="wrap">' +
      '<div class="goal-layout">' + head + goalSliderMarkup(SITE.process.slides) + "</div>" +
      '<div class="process-grid">' + steps + "</div></div>";
  }

  function renderPricing() {
    var visible = SITE.services.filter(function (service) {
      return !service.hidden;
    });

    var cards = visible
      .map(function (service) {
        var includes = (service.includes || [])
          .map(function (item) {
            return "<li>" + iconCheck() + "<span>" + esc(item) + "</span></li>";
          })
          .join("");

        var hasPrice = Object.prototype.hasOwnProperty.call(service, "price") || filled(service.priceUnit);
        var priceHtml = "";
        if (hasPrice) {
          var line = priceLine(service);
          var word = line.length > 12 ? " is-word" : "";
          priceHtml =
            '<p class="price-caption">' + esc(SITE.ui.costLabel) + "</p>" +
            '<p class="price-value' + word + '">' + esc(line) + "</p>" +
            (filled(service.priceNote) ? '<p class="price-note">' + esc(service.priceNote) + "</p>" : "");
        }

        var durationHtml = "";
        if (Object.prototype.hasOwnProperty.call(service, "duration")) {
          var duration = filled(service.duration) ? service.duration : SITE.ui.priceMissing;
          durationHtml =
            '<p class="price-duration">' + esc(SITE.ui.durationLabel) + ": " + esc(duration) + "</p>";
        }

        var schedule = Array.isArray(service.schedule) ? service.schedule : [];
        var scheduleHtml = "";
        if (schedule.length) {
          var rows = schedule
            .map(function (row) {
              return "<li><span>" + esc(row.day) + "</span><span>" + esc(row.time) + "</span></li>";
            })
            .join("");
          scheduleHtml =
            '<div class="price-schedule">' +
            '<p class="price-schedule-label">' + esc(service.scheduleTitle || SITE.ui.scheduleLabel) + "</p>" +
            "<ul>" + rows + "</ul></div>";
        }

        var descHtml = filled(service.description)
          ? '<p class="price-desc">' + textToHtml(service.description) + "</p>"
          : "";
        var tone = service.tone === "blue" ? " is-blue" : "";
        var selected = service.featured ? " is-selected" : "";

        return (
          '<article class="price-card' + (service.featured ? " is-featured" : "") + tone + selected + '">' +
          (filled(service.badge) ? '<p class="price-badge">' + esc(service.badge) + "</p>" : "") +
          "<h3>" + esc(service.name) + "</h3>" +
          descHtml +
          priceHtml +
          durationHtml +
          scheduleHtml +
          '<ul class="price-list">' + includes + "</ul>" +
          telegram("btn btn-pink", service.cta || SITE.pricing.noteCta) +
          "</article>"
        );
      })
      .join("");

    var layout = visible.length > 1 ? "is-many" : "is-single";

    document.getElementById("pricing").innerHTML =
      '<div class="wrap">' +
      '<div class="section-head reveal">' +
      '<h2 class="h2" id="pricing-title">' + esc(SITE.pricing.title) + "</h2>" +
      '<p class="lede">' + textToHtml(SITE.pricing.text) + "</p></div>" +
      '<div class="price-layout ' + layout + '">' +
      '<div class="price-grid">' + cards + "</div></div></div>";
  }

  function initPricingSelect() {
    var grid = document.querySelector("#pricing .price-grid");
    if (!grid) return;
    grid.addEventListener("click", function (event) {
      var card = event.target.closest(".price-card");
      if (!card || !grid.contains(card)) return;
      var cards = grid.querySelectorAll(".price-card");
      Array.prototype.forEach.call(cards, function (item) {
        item.classList.toggle("is-selected", item === card);
      });
    });
  }

  function shotButton(src, alt) {
    return (
      '<button class="shot" type="button" data-full="' + esc(src) + '" data-alt="' + esc(alt) + '">' +
      '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">' +
      "</button>"
    );
  }

  function renderAbout() {
    var paragraphs = (SITE.about.paragraphs || [])
      .filter(filled)
      .map(function (paragraph) {
        return "<p>" + textToHtml(paragraph) + "</p>";
      })
      .join("");

    var facts = (SITE.about.facts || [])
      .filter(function (fact) {
        return filled(fact.value);
      })
      .map(function (fact) {
        return '<article class="fact"><span>' + esc(fact.label) + "</span><strong>" + esc(fact.value) + "</strong></article>";
      })
      .join("");

    var extras = [
      ["Досвід", SITE.about.experience],
      ["Кваліфікація", SITE.about.qualifications],
    ]
      .filter(function (pair) {
        return typeof pair[1] === "string" && filled(pair[1]);
      })
      .map(function (pair) {
        return '<article class="extra-item"><span>' + esc(pair[0]) + "</span><strong>" + textToHtml(pair[1]) + "</strong></article>";
      })
      .join("");

    var achievementItems = (Array.isArray(SITE.about.achievements) ? SITE.about.achievements : [])
      .filter(filled)
      .map(function (item) {
        return "<li>" + esc(item) + "</li>";
      })
      .join("");

    var achievementsBlock = achievementItems
      ? '<h3 class="about-subhead">' + esc(SITE.about.achievementsTitle) + "</h3>" +
        '<ul class="about-achievements">' + achievementItems + "</ul>"
      : "";

    var profile = SITE.about.profile && filled(SITE.about.profile.href)
      ? '<a class="btn btn-pink portrait-btn" href="' + esc(SITE.about.profile.href) + '" target="_blank" rel="noopener">' +
        esc(SITE.about.profile.label) +
        "</a>"
      : "";

    var quote = filled(SITE.about.philosophy)
      ? '<blockquote class="quote">' + textToHtml(SITE.about.philosophy) + "</blockquote>"
      : "";

    var photo = filled(SITE.images.about)
      ? '<img src="' + esc(SITE.images.about) + '" alt="' + esc(SITE.images.aboutAlt) + '" loading="lazy" decoding="async">'
      : "";

    var gallery = (SITE.images.gallery || [])
      .filter(function (item) {
        return item && filled(item.src);
      })
      .map(function (item) {
        return "<li>" + shotButton(item.src, item.alt || SITE.images.aboutAlt) + "</li>";
      })
      .join("");

    var portraitName = filled(SITE.about.name) ? SITE.about.name : SITE.brand.coach;
    var portraitLines = (SITE.about.lines || [])
      .filter(filled)
      .map(function (line) {
        return "<p>" + esc(line) + "</p>";
      })
      .join("");

    document.getElementById("about").innerHTML =
      '<div class="wrap about-grid">' +
      '<div class="portrait' + (photo ? " has-photo" : "") + '">' +
      photo +
      '<div class="portrait-copy">' +
      '<span class="logo portrait-kicker">' + esc(SITE.brand.name) + "</span>" +
      '<p class="portrait-name">' + textToHtml(portraitName) + "</p>" +
      (portraitLines ? '<div class="portrait-lines">' + portraitLines + "</div>" : "") +
      profile +
      "</div></div>" +
      "<div>" +
      '<h2 class="h2" id="about-title">' + esc(SITE.about.title) + "</h2>" +
      '<div class="prose lede">' + paragraphs + "</div>" +
      quote +
      achievementsBlock +
      (facts ? '<div class="facts">' + facts + "</div>" : "") +
      (extras ? '<div class="extra">' + extras + "</div>" : "") +
      (gallery ? '<ul class="gallery">' + gallery + "</ul>" : "") +
      "</div></div>";
  }

  function renderTestimonials() {
    var items = SITE.testimonials.items || [];
    var body;

    if (!items.length) {
      var lead = filled(SITE.testimonials.lead)
        ? "<p>" + textToHtml(SITE.testimonials.lead) + "</p>"
        : "";
      var reviewsInstagram = filled(SITE.testimonials.instagramHref)
        ? SITE.testimonials.instagramHref
        : SITE.links.instagram;
      var instagramCta = filled(SITE.testimonials.instagramCta)
        ? external(reviewsInstagram, "btn btn-ghost", esc(SITE.testimonials.instagramCta))
        : "";
      body =
        '<article class="reviews-empty reveal">' +
        lead +
        instagramCta +
        "</article>";
    } else {
      var cards = items
        .map(function (item) {
          var avatar = filled(item.photo)
            ? '<img class="review-photo" src="' + esc(item.photo) + '" alt="" loading="lazy" decoding="async">'
            : '<span class="review-fallback" aria-hidden="true">' + esc((item.name || "•").slice(0, 1)) + "</span>";
          var image = filled(item.image) ? shotButton(item.image, item.imageAlt || item.name || SITE.ui.lightboxAlt) : "";
          return (
            '<article class="review reveal">' +
            (filled(item.name) ? '<div class="review-top">' + avatar + "<div><h3>" + esc(item.name) + "</h3>" +
              (filled(item.result) ? '<p class="review-result">' + esc(item.result) + "</p>" : "") +
              "</div></div>" : "") +
            (filled(item.text) ? '<p class="review-text">' + textToHtml(item.text) + "</p>" : "") +
            image +
            "</article>"
          );
        })
        .join("");
      body = '<div class="review-grid">' + cards + "</div>";
    }

    document.getElementById("testimonials").innerHTML =
      '<div class="wrap">' +
      '<div class="section-head reveal">' +
      '<h2 class="h2" id="testimonials-title">' + esc(SITE.testimonials.title) + "</h2></div>" +
      body +
      '<div class="mid-cta reveal">' +
      "<div><h3>" + esc(SITE.testimonials.ctaTitle) + "</h3>" +
      "<p>" + textToHtml(SITE.testimonials.ctaText) + "</p></div>" +
      telegram("btn btn-pink", SITE.testimonials.ctaButton) +
      "</div></div>";
  }

  function renderFaq() {
    var items = SITE.faq.items
      .map(function (item, index) {
        var panelId = "faq-panel-" + index;
        var buttonId = "faq-button-" + index;
        return (
          '<article class="faq-item">' +
          '<h3><button class="faq-q" id="' + buttonId + '" type="button" aria-expanded="false" aria-controls="' + panelId + '">' +
          "<span>" + esc(item.q) + '</span><span class="faq-icon" aria-hidden="true"></span></button></h3>' +
          '<div class="faq-a" id="' + panelId + '" role="region" aria-labelledby="' + buttonId + '">' +
          '<div class="faq-a-inner">' + textToHtml(item.a) + "</div></div></article>"
        );
      })
      .join("");

    document.getElementById("faq").innerHTML =
      '<div class="wrap">' +
      '<div class="section-head">' +
      '<h2 class="h2" id="faq-title">' + esc(SITE.faq.title) + "</h2></div>" +
      '<div class="faq-list">' + items + "</div></div>";
  }

  function renderFinal() {
    var extras = "";
    if (filled(SITE.links.phone)) {
      extras += '<a class="btn btn-ghost" href="tel:' + esc(SITE.links.phone.replace(/\s/g, "")) + '">' + esc(SITE.links.phone) + "</a>";
    }
    if (filled(SITE.links.email)) {
      extras += '<a class="btn btn-ghost" href="mailto:' + esc(SITE.links.email) + '">' + esc(SITE.links.email) + "</a>";
    }

    var label = filled(SITE.finalCta.label)
      ? '<p class="final-label">' + esc(SITE.finalCta.label) + "</p>"
      : "";

    document.getElementById("final").innerHTML =
      '<div class="wrap">' +
      label +
      '<h2 class="h2" id="final-title">' + esc(SITE.finalCta.title) + "</h2>" +
      '<p class="lede">' + textToHtml(SITE.finalCta.text) + "</p>" +
      '<div class="final-actions">' +
      telegram("btn btn-pink", SITE.finalCta.button) +
      instagram("btn btn-ghost", SITE.finalCta.instagramLabel) +
      extras +
      "</div></div>";
  }

  function renderFooter() {
    var links = SITE.footer.links
      .map(function (link) {
        return '<a href="' + esc(link.href) + '">' + esc(link.label) + "</a>";
      })
      .join("");

    var contacts =
      external(SITE.links.telegram, "", "Telegram", SITE.ui.telegramAria) +
      external(SITE.links.instagram, "", "Instagram", "Instagram FROSKRUA");

    if (filled(SITE.links.phone)) contacts += '<a href="tel:' + esc(SITE.links.phone.replace(/\s/g, "")) + '">' + esc(SITE.links.phone) + "</a>";
    if (filled(SITE.links.email)) contacts += '<a href="mailto:' + esc(SITE.links.email) + '">' + esc(SITE.links.email) + "</a>";

    var year = new Date().getFullYear();

    document.getElementById("footer").innerHTML =
      '<div class="wrap footer-grid">' +
      "<div><a class=\"logo\" href=\"#hero\">" + esc(SITE.brand.name) + "</a>" +
      '<p class="footer-note">' + esc(SITE.footer.note) + "</p></div>" +
      '<nav class="footer-links" aria-label="Навігація у підвалі">' + links + "</nav>" +
      '<div class="footer-contacts">' + contacts + "</div></div>" +
      '<div class="wrap footer-bottom">© ' + year + " " + esc(SITE.brand.name) + "</div>";
  }

  function renderFloat() {
    document.getElementById("float-root").innerHTML = external(
      SITE.links.telegram,
      "float-cta",
      iconTelegram(),
      SITE.ui.telegramAria
    );
  }

  function syncSeo() {
    if (filled(SITE.seo.title)) document.title = SITE.seo.title;
    var description = document.querySelector('meta[name="description"]');
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (description && filled(SITE.seo.description)) description.setAttribute("content", SITE.seo.description);
    if (ogTitle && filled(SITE.seo.title)) ogTitle.setAttribute("content", SITE.seo.title);
    if (ogDescription && filled(SITE.seo.description)) ogDescription.setAttribute("content", SITE.seo.description);
  }

  function setFaqItem(item, open) {
    item.classList.toggle("is-open", open);
    var button = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) panel.removeAttribute("inert");
    else panel.setAttribute("inert", "");
  }

  function initFaq() {
    var list = document.querySelector(".faq-list");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".faq-item"));
    items.forEach(function (item, index) {
      setFaqItem(item, index === 0);
    });
    list.addEventListener("click", function (event) {
      var button = event.target.closest(".faq-q");
      if (!button) return;
      var item = button.closest(".faq-item");
      var willOpen = !item.classList.contains("is-open");
      items.forEach(function (other) {
        setFaqItem(other, false);
      });
      if (willOpen) setFaqItem(item, true);
    });
  }

  function syncMenu() {
    var menu = document.getElementById("nav-menu");
    var toggle = document.querySelector(".nav-toggle");
    if (!menu || !toggle) return;
    var open = menu.classList.contains("is-open");
    var desktop = NAV_MQ.matches;
    document.body.classList.toggle("nav-open", open && !desktop);
    toggle.setAttribute("aria-expanded", open && !desktop ? "true" : "false");
    toggle.setAttribute("aria-label", open ? SITE.ui.menuClose : SITE.ui.menuOpen);
    if (desktop || open) menu.removeAttribute("inert");
    else menu.setAttribute("inert", "");
  }

  function closeMenu() {
    var menu = document.getElementById("nav-menu");
    if (!menu) return;
    menu.classList.remove("is-open");
    syncMenu();
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      syncMenu();
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
    if (NAV_MQ.addEventListener) NAV_MQ.addEventListener("change", closeMenu);
    else NAV_MQ.addListener(closeMenu);
    syncMenu();
  }

  function initHeader() {
    var header = document.getElementById("header");

    var syncHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      if (document.body.classList.contains("nav-open")) {
        header.style.backgroundColor = "#ffffff";
        return;
      }
      var probeY = Math.min(header.getBoundingClientRect().bottom + 2, window.innerHeight - 1);
      var probeX = Math.min(window.innerWidth / 2, window.innerWidth - 8);
      var el = document.elementFromPoint(probeX, probeY);
      var section = el && el.closest ? el.closest("section") : null;
      var bg = section ? getComputedStyle(section).backgroundColor : "";
      if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
        header.style.backgroundColor = "#ffffff";
      } else {
        header.style.backgroundColor = bg;
      }
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);
  }

  function initScrollSpy() {
    if (!("IntersectionObserver" in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-menu a.nav-link"));
    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initReveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (reducedMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );
    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function initLightbox() {
    var box = document.getElementById("lightbox");
    var image = document.getElementById("lightbox-img");
    var lastFocus = null;

    function close() {
      box.hidden = true;
      image.removeAttribute("src");
      document.body.classList.remove("lightbox-open");
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-full]");
      if (!trigger) return;
      lastFocus = trigger;
      image.src = trigger.getAttribute("data-full");
      image.alt = trigger.getAttribute("data-alt") || SITE.ui.lightboxAlt;
      box.hidden = false;
      document.body.classList.add("lightbox-open");
      box.querySelector(".lightbox-close").focus();
    });

    box.addEventListener("click", function (event) {
      if (event.target === box || event.target.closest(".lightbox-close")) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !box.hidden) close();
    });
  }

  function initGoalSlider() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-goal-slider]"), setupGoalSlider);
  }

  function setupGoalSlider(root) {
    if (!root) return;
    var rail = root.querySelector(".goal-rail");
    var originals = Array.prototype.slice.call(rail.querySelectorAll(".goal-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".goal-dot"));
    if (originals.length < 2) return;

    var count = originals.length;
    var head = originals[count - 1].cloneNode(true);
    head.alt = "";
    head.setAttribute("aria-hidden", "true");
    var tail = originals[0].cloneNode(true);
    tail.alt = "";
    tail.setAttribute("aria-hidden", "true");
    rail.insertBefore(head, rail.firstChild);
    rail.appendChild(tail);
    rail.style.scrollBehavior = "auto";

    var timer = null;
    var delay = 3800;

    function stepSize() {
      var slides = rail.querySelectorAll(".goal-slide");
      if (slides.length < 2) return 0;
      var a = slides[0].getBoundingClientRect();
      var b = slides[1].getBoundingClientRect();
      return b.left - a.left;
    }

    function setDot(index) {
      var active = ((index % count) + count) % count;
      dots.forEach(function (dot, i) {
        var on = i === active;
        dot.classList.toggle("is-active", on);
        if (on) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function position() {
      var size = stepSize();
      if (!size) return 1;
      return Math.round(rail.scrollLeft / size);
    }

    function logicalOf(slot) {
      if (slot <= 0) return count - 1;
      if (slot >= count + 1) return 0;
      return slot - 1;
    }

    var motionToken = 0;
    var moving = false;

    function place(slot) {
      var size = stepSize();
      if (!size) return;
      motionToken += 1;
      moving = false;
      rail.style.scrollBehavior = "auto";
      rail.style.scrollSnapType = "none";
      rail.scrollLeft = slot * size;
      rail.style.scrollSnapType = "";
    }

    function rebase() {
      if (moving) return;
      var slot = position();
      if (slot >= count + 1) place(1);
      else if (slot <= 0) place(count);
      setDot(logicalOf(position()));
    }

    function animateTo(left) {
      var token = ++motionToken;
      var startLeft = rail.scrollLeft;
      var delta = left - startLeft;
      rail.style.scrollBehavior = "auto";
      if (Math.abs(delta) < 0.5 || reducedMotion) {
        moving = false;
        rail.style.scrollSnapType = "none";
        rail.scrollLeft = left;
        rail.style.scrollSnapType = "";
        rebase();
        return;
      }
      var duration = 150;
      var t0 = performance.now();
      moving = true;
      rail.style.scrollSnapType = "none";
      function frame(now) {
        if (token !== motionToken) return;
        var t = Math.min(1, (now - t0) / duration);
        var eased = t * (2 - t);
        rail.scrollLeft = startLeft + delta * eased;
        if (t < 1) requestAnimationFrame(frame);
        else {
          rail.scrollLeft = left;
          rail.style.scrollSnapType = "";
          moving = false;
          rebase();
        }
      }
      requestAnimationFrame(frame);
    }

    function nudge(direction) {
      var size = stepSize();
      if (!size) return;
      var slot = position();
      if (slot >= count + 1) slot = 1;
      if (slot <= 0) slot = count;
      var dest = slot + direction;
      if (dest < 0) dest = 0;
      if (dest > count + 1) dest = count + 1;
      setDot(logicalOf(dest));
      if (reducedMotion) {
        if (dest <= 0) dest = count;
        if (dest >= count + 1) dest = 1;
        place(dest);
        setDot(logicalOf(dest));
        return;
      }
      animateTo(dest * size);
    }

    function go(index, smooth) {
      var size = stepSize();
      if (!size) return;
      var logical = ((index % count) + count) % count;
      setDot(logical);
      if (!smooth || reducedMotion) place(logical + 1);
      else animateTo((logical + 1) * size);
    }

    function hugArrows() {
      var frame = root.querySelector(".goal-frame");
      var stage = root.querySelector(".goal-rail");
      var prev = root.querySelector(".goal-arrow-prev");
      var next = root.querySelector(".goal-arrow-next");
      if (!frame || !stage || !prev || !next || !stage.offsetWidth) return;
      var fr = frame.getBoundingClientRect();
      var ir = stage.getBoundingClientRect();
      var gap = 12;
      frame.style.position = "relative";
      prev.style.position = "absolute";
      next.style.position = "absolute";
      prev.style.margin = "0";
      next.style.margin = "0";
      prev.style.top = (ir.top + ir.height / 2 - fr.top) + "px";
      next.style.top = prev.style.top;
      prev.style.transform = "translateY(-50%)";
      next.style.transform = "translateY(-50%)";
      var prevLeft = ir.left - fr.left - prev.offsetWidth - gap;
      var nextLeft = ir.right - fr.left + gap;
      if (prevLeft < 0) prevLeft = 0;
      if (nextLeft > fr.width - next.offsetWidth) nextLeft = fr.width - next.offsetWidth;
      prev.style.left = prevLeft + "px";
      prev.style.right = "auto";
      next.style.left = nextLeft + "px";
      next.style.right = "auto";
    }

    function settle() {
      rebase();
    }

    function start() {
      stop();
      if (reducedMotion) return;
      timer = window.setInterval(function () {
        nudge(1);
      }, delay);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        go(index, true);
        start();
      });
    });

    var prev = root.querySelector(".goal-arrow-prev");
    var next = root.querySelector(".goal-arrow-next");
    prev.addEventListener("click", function () {
      nudge(-1);
      start();
    });
    next.addEventListener("click", function () {
      nudge(1);
      start();
    });

    rail.addEventListener("scroll", function () {
      window.clearTimeout(rail._settle);
      rail._settle = window.setTimeout(settle, 140);
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    root.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      nudge(event.key === "ArrowRight" ? 1 : -1);
      start();
    });
    window.addEventListener("resize", function () {
      place(logicalOf(position()) + 1);
      hugArrows();
    });
    originals.forEach(function (slide) {
      var image = slide.querySelector("img");
      if (image && !image.complete) image.addEventListener("load", hugArrows);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    setDot(0);
    place(1);
    requestAnimationFrame(function () {
      if (position() <= 0) place(1);
    });
    hugArrows();
    start();
  }

  function render() {
    if (!window.SITE) throw new Error("SITE is missing");
    syncSeo();
    renderHeader();
    renderHero();
    renderApproach();
    renderCopySection("training-goal", SITE.trainingGoal);
    renderProcess();
    renderPricing();
    initPricingSelect();
    renderAbout();
    renderTestimonials();
    renderFaq();
    renderFinal();
    renderFooter();
    renderFloat();
    initNav();
    initHeader();
    initGoalSlider();
    initFaq();
    initScrollSpy();
    initReveal();
    initLightbox();
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      render();
    } catch (error) {
      console.error(error);
      var note = document.createElement("p");
      note.className = "noscript";
      note.textContent = "Не вдалося зібрати сторінку. Перевірте js/content.js.";
      document.body.prepend(note);
    }
  });
})();
