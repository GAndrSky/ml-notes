/* index.js - behaviour for index.html only (was inline). */

(function () {
  var menu = document.getElementById("mindmap-menu");
  if (!menu) {
    return;
  }

  var toggles = Array.prototype.slice.call(document.querySelectorAll(".mindmap-menu-toggle"));
  var backdrop = document.querySelector(".mindmap-menu-backdrop");
  var closers = Array.prototype.slice.call(document.querySelectorAll("[data-mindmap-close]"));

  function setMenuOpen(isOpen) {
    document.body.classList.toggle("mindmap-menu-open", isOpen);
    menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    toggles.forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    if (backdrop) {
      backdrop.hidden = !isOpen;
    }
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      setMenuOpen(!document.body.classList.contains("mindmap-menu-open"));
    });
  });

  closers.forEach(function (closer) {
    closer.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  var preview = document.querySelector(".mindmap-preview");
  var graphNodes = Array.prototype.slice.call(document.querySelectorAll(".mindmap-node"));
  var activeNode = null;

  function getSectionForNode(node) {
    var href = node.getAttribute("href") || "";
    if (!href || href.charAt(0) !== "#") {
      return null;
    }
    return document.querySelector(href);
  }

  function getNodeTitle(node, section) {
    if (section) {
      var title = section.querySelector(".section-head h2");
      if (title) {
        return title.textContent.trim();
      }
    }
    return node.textContent.trim();
  }

  function renderPreview(node) {
    if (!preview || !node) {
      return;
    }

    var section = getSectionForNode(node);
    var title = getNodeTitle(node, section);
    var description = section && section.querySelector(".section-head span");
    var cards = section
      ? Array.prototype.slice.call(section.querySelectorAll(".card")).slice(0, 8)
      : [];

    preview.style.transition = "opacity 0.1s ease";
    preview.style.opacity = "0";

    setTimeout(function () {
      preview.querySelector(".mindmap-preview__kicker").textContent = section
        ? "Theme " + (section.dataset.block || "")
        : "Core graph";
      preview.querySelector("h3").textContent = title;
      preview.querySelector("p").textContent = description
        ? description.textContent.trim()
        : "Центральный узел связывает все блоки курса в одну карту.";
      preview.querySelector(".mindmap-preview__count").textContent = section
        ? cards.length + " из " + section.querySelectorAll(".card").length + " тем показано"
        : "11 разделов · 87 тем";

      var list = preview.querySelector(".mindmap-preview__list");
      list.innerHTML = "";
      if (!cards.length) {
        ["Математика", "Классическое ML", "Архитектуры", "LLM"].forEach(function (item) {
          var li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });
      } else {
        cards.forEach(function (card) {
          var badge = card.querySelector(".badge");
          var heading = card.querySelector("h3");
          var li = document.createElement("li");
          li.textContent =
            (badge ? badge.textContent.trim() + " · " : "") +
            (heading ? heading.textContent.trim() : card.textContent.trim());
          list.appendChild(li);
        });
      }

      preview.style.opacity = "1";
    }, 110);
  }

  function setActiveNode(node) {
    if (activeNode) {
      activeNode.classList.remove("is-previewed");
    }
    activeNode = node;

    // Update spoke path highlighting
    var graph = document.querySelector(".mindmap-graph");
    var spokePaths = Array.prototype.slice.call(
      document.querySelectorAll(".mindmap-graph__links path[data-node]")
    );
    spokePaths.forEach(function (p) { p.classList.remove("is-connected"); });

    if (activeNode) {
      activeNode.classList.add("is-previewed");
      renderPreview(activeNode);

      var cls = activeNode.className || "";
      var match = cls.match(/mindmap-node--(\w+)/);
      var nodeType = match ? match[1] : null;
      if (nodeType && nodeType !== "core") {
        var spoke = document.querySelector(
          '.mindmap-graph__links path[data-node="' + nodeType + '"]'
        );
        if (spoke) spoke.classList.add("is-connected");
        if (graph) graph.classList.add("has-preview");
      } else {
        if (graph) graph.classList.remove("has-preview");
      }
    } else {
      if (graph) graph.classList.remove("has-preview");
    }
  }

  graphNodes.forEach(function (node) {
    node.addEventListener("mouseenter", function () {
      setActiveNode(node);
    });
    node.addEventListener("focus", function () {
      setActiveNode(node);
    });
  });

  if (graphNodes.length) {
    setActiveNode(graphNodes[0]);
  }

  // Progress dashboard: show empty-state hint when no progress recorded
  (function () {
    var dash = document.getElementById('my-progress');
    if (!dash) return;
    function checkEmpty() {
      var el = document.querySelector('[data-progress-total]');
      if (!el || el.textContent.trim() === '0%') {
        dash.classList.add('progress-is-empty');
      }
    }
    if (document.readyState === 'complete') {
      setTimeout(checkEmpty, 350);
    } else {
      window.addEventListener('load', function () { setTimeout(checkEmpty, 350); });
    }
  })();

  // Phase 5: stagger node pop-in animation delays (70ms per node)
  graphNodes.forEach(function (node, i) {
    node.style.animationDelay = (i * 70) + 'ms';
  });

  // Phase 5: after SVG draw-on completes, switch paths to pulse mode
  // Longest draw-on: delay 0.70s + duration 0.52s = 1.22s; 1.4s gives buffer
  var linksEl = document.querySelector('.mindmap-graph__links');
  if (linksEl) {
    setTimeout(function () { linksEl.classList.add('draw-done'); }, 1400);
  }

  function enhanceSubgroupMenus() {
    Array.prototype.slice.call(document.querySelectorAll(".topic-context-menu")).forEach(function (menu) {
      menu.remove();
    });

    Array.prototype.slice.call(document.querySelectorAll(".index-subgroup")).forEach(function (subgroup) {
      if (subgroup.querySelector(".subgroup-context-menu")) {
        return;
      }

      var label = subgroup.querySelector(".index-subgroup__label");
      var topics = [];
      var cursor = subgroup.nextElementSibling;

      while (cursor && !cursor.classList.contains("index-subgroup")) {
        if (cursor.classList.contains("card")) {
          topics.push(cursor);
        }
        cursor = cursor.nextElementSibling;
      }

      var menu = document.createElement("div");
      menu.className = "subgroup-context-menu";
      menu.setAttribute("aria-hidden", "true");

      var items = topics.slice(0, 8).map(function (card) {
        var badge = card.querySelector(".badge");
        var heading = card.querySelector("h3");
        return (
          "<li>" +
          "<span>" + (badge ? badge.textContent.trim() : "") + "</span>" +
          (heading ? heading.textContent.trim() : card.textContent.trim()) +
          "</li>"
        );
      }).join("");

      menu.innerHTML =
        "<strong>" + (label ? label.textContent.trim() : "Темы") + "</strong>" +
        "<p>Внутри: " + topics.length + " тем.</p>" +
        '<ul class="subgroup-context-menu__list">' + items + "</ul>";

      subgroup.appendChild(menu);
    });
  }

  function enhanceTopicMenus() {
    Array.prototype.slice.call(document.querySelectorAll(".topic-detail-menu")).forEach(function (menu) {
      menu.remove();
    });

    Array.prototype.slice.call(document.querySelectorAll(".section .card")).forEach(function (card) {
      var badge = card.querySelector(".badge");
      var heading = card.querySelector("h3");
      var description = card.querySelector("p");
      var text = description ? description.textContent.trim() : "";
      var fragments = text
        .replace(/\.$/, "")
        .split(/,|\sи\s|\sand\s|·/)
        .map(function (item) {
          return item.trim();
        })
        .filter(function (item) {
          return item.length > 2;
        })
        .slice(0, 6);

      var menu = document.createElement("div");
      menu.className = "topic-detail-menu";
      menu.setAttribute("aria-hidden", "true");
      menu.innerHTML =
        '<span class="topic-detail-menu__kicker">' +
        (badge ? badge.textContent.trim() : "Topic") +
        "</span>" +
        "<strong>" +
        (heading ? heading.textContent.trim() : "Тема") +
        "</strong>" +
        '<div class="topic-detail-menu__description">' +
        text +
        "</div>" +
        '<div class="topic-detail-menu__chips">' +
        fragments.map(function (item) {
          return "<span>" + item + "</span>";
        }).join("") +
        "</div>";
      card.appendChild(menu);
    });
  }

  window.addEventListener("load", function () {
    window.setTimeout(function () {
      enhanceSubgroupMenus();
      enhanceTopicMenus();
    }, 0);
  });

  function initRobotArm() {
    var stage = document.querySelector(".robot-arm-lab__stage");
    if (!stage) {
      return;
    }

    var base = { x: 170, y: 350 };
    var lengths = [135, 118, 76];
    var parts = [
      stage.querySelector(".robot-arm-lab__segment--one"),
      stage.querySelector(".robot-arm-lab__segment--two"),
      stage.querySelector(".robot-arm-lab__segment--three")
    ];
    var joints = {
      base: stage.querySelector(".robot-arm-lab__joint--base"),
      elbow: stage.querySelector(".robot-arm-lab__joint--elbow"),
      wrist: stage.querySelector(".robot-arm-lab__joint--wrist"),
      hand: stage.querySelector(".robot-arm-lab__joint--hand"),
      target: stage.querySelector(".robot-arm-lab__target"),
      glow: stage.querySelector(".robot-arm-lab__target-glow")
    };

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function pointOnSvg(event) {
      var point = stage.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      return point.matrixTransform(stage.getScreenCTM().inverse());
    }

    function setCircle(circle, point) {
      circle.setAttribute("cx", point.x.toFixed(2));
      circle.setAttribute("cy", point.y.toFixed(2));
    }

    function setLine(line, start, end) {
      line.setAttribute("x1", start.x.toFixed(2));
      line.setAttribute("y1", start.y.toFixed(2));
      line.setAttribute("x2", end.x.toFixed(2));
      line.setAttribute("y2", end.y.toFixed(2));
    }

    function solve(target) {
      var dx = target.x - base.x;
      var dy = target.y - base.y;
      var angleToTarget = Math.atan2(dy, dx);
      var wristTarget = {
        x: target.x - Math.cos(angleToTarget) * lengths[2],
        y: target.y - Math.sin(angleToTarget) * lengths[2]
      };
      var wx = wristTarget.x - base.x;
      var wy = wristTarget.y - base.y;
      var distance = clamp(Math.hypot(wx, wy), 26, lengths[0] + lengths[1] - 2);
      var cosElbow = clamp((distance * distance - lengths[0] * lengths[0] - lengths[1] * lengths[1]) / (2 * lengths[0] * lengths[1]), -1, 1);
      var elbowAngle = Math.acos(cosElbow);
      var shoulderAngle =
        Math.atan2(wy, wx) -
        Math.atan2(lengths[1] * Math.sin(elbowAngle), lengths[0] + lengths[1] * Math.cos(elbowAngle));
      var elbow = {
        x: base.x + Math.cos(shoulderAngle) * lengths[0],
        y: base.y + Math.sin(shoulderAngle) * lengths[0]
      };
      var wrist = {
        x: elbow.x + Math.cos(shoulderAngle + elbowAngle) * lengths[1],
        y: elbow.y + Math.sin(shoulderAngle + elbowAngle) * lengths[1]
      };
      var handAngle = Math.atan2(target.y - wrist.y, target.x - wrist.x);
      var hand = {
        x: wrist.x + Math.cos(handAngle) * lengths[2],
        y: wrist.y + Math.sin(handAngle) * lengths[2]
      };

      setLine(parts[0], base, elbow);
      setLine(parts[1], elbow, wrist);
      setLine(parts[2], wrist, hand);
      setCircle(joints.elbow, elbow);
      setCircle(joints.wrist, wrist);
      setCircle(joints.hand, hand);
      setCircle(joints.target, target);
      setCircle(joints.glow, target);
    }

    stage.addEventListener("pointerdown", function (event) {
      var point = pointOnSvg(event);
      solve({
        x: clamp(point.x, 56, 566),
        y: clamp(point.y, 68, 454)
      });
    });

    solve({ x: 430, y: 210 });
  }

  initRobotArm();
})();

(function () {
  if (!window.IntersectionObserver) return;

  var sections = Array.prototype.slice.call(
    document.querySelectorAll('.section[data-block]')
  );
  if (!sections.length) return;

  sections.forEach(function (section) {
    var head = section.querySelector('.section-head');
    if (head) {
      head.classList.add('wl-card');
      head.style.setProperty('--wl-delay', '0ms');
    }
    var cards = Array.prototype.slice.call(section.querySelectorAll('.card'));
    cards.forEach(function (card, i) {
      card.classList.add('wl-card');
      card.style.setProperty('--wl-delay', (Math.min(i, 9) * 50 + 50) + 'ms');
    });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Array.prototype.slice.call(
        entry.target.querySelectorAll('.wl-card')
      ).forEach(function (el) {
        el.classList.add('wl-visible');
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  sections.forEach(function (section) { observer.observe(section); });
})();

/* ── Knowledge graph — Obsidian style ────────────────────────────── */
(function () {
  'use strict';
  var canvas = document.getElementById('force-graph');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;

  var DEFS = [
    { id: 'core',     label: 'ML Notes',    r: 11, color: '#c8deff', href: '#learning-tracks' },
    { id: 'math',     label: 'Математика',  r: 8,  color: '#6ea5ff', href: '#block-1'         },
    { id: 'classic',  label: 'Classic ML',  r: 8,  color: '#66c39b', href: '#block-2'         },
    { id: 'neural',   label: 'Нейросети',   r: 8,  color: '#81a8e0', href: '#block-3'         },
    { id: 'training', label: 'Обучение',    r: 6,  color: '#9aa7ff', href: '#block-4'         },
    { id: 'arch',     label: 'Архитектуры', r: 8,  color: '#5ec7c8', href: '#block-5'         },
    { id: 'llm',      label: 'LLM',         r: 9,  color: '#87b4ff', href: '#block-6'         },
    { id: 'gen',      label: 'Generative',  r: 7,  color: '#82d0b6', href: '#block-7'         },
    { id: 'practice', label: 'Практика',    r: 6,  color: '#a4b4d6', href: '#block-8'         },
    { id: 'mlops',    label: 'MLOps',       r: 6,  color: '#7eb8b8', href: '#block-9'         },
    { id: 'jobprep',  label: 'Interview',   r: 6,  color: '#82d0b6', href: '#job-prep'        },
    { id: 'projects', label: 'Projects',    r: 7,  color: '#8fd17f', href: '#block-10'        },
  ];

  var EDGES = [
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],
    [1,2],[1,3],[2,3],[2,4],[3,4],[3,5],[5,6],[6,7],[6,9],[8,9],[9,11],[10,11],
  ];

  var SIM = DEFS.map(function (def, i) {
    var angle = i === 0 ? 0 : ((i - 1) / (DEFS.length - 1)) * Math.PI * 2 - Math.PI / 2;
    var rad   = i === 0 ? 0 : 0.26 + (Math.random() - 0.5) * 0.06;
    return { def: def, x: 0.5 + Math.cos(angle) * rad, y: 0.5 + Math.sin(angle) * rad, vx: 0, vy: 0 };
  });

  var hovered = null, tick = 0;

  function getConnected(node) {
    var set = [node];
    EDGES.forEach(function (e) {
      if (SIM[e[0]] === node) set.push(SIM[e[1]]);
      if (SIM[e[1]] === node) set.push(SIM[e[0]]);
    });
    return set;
  }

  function step() {
    var REP = 2.5e-4, SPR = 0.006, REST = 0.18, DAMP = 0.87, DRIFT = 4e-5, GRAV = 0.0015;
    var fx = SIM.map(function () { return 0; });
    var fy = SIM.map(function () { return 0; });

    for (var i = 0; i < SIM.length; i++) {
      for (var j = i + 1; j < SIM.length; j++) {
        var dx = SIM[j].x - SIM[i].x, dy = SIM[j].y - SIM[i].y;
        var d  = Math.sqrt(dx * dx + dy * dy) || 1e-4;
        var f  = REP / (d * d);
        fx[i] -= (dx / d) * f; fy[i] -= (dy / d) * f;
        fx[j] += (dx / d) * f; fy[j] += (dy / d) * f;
      }
    }

    EDGES.forEach(function (e) {
      var a = SIM[e[0]], b = SIM[e[1]];
      var dx = b.x - a.x, dy = b.y - a.y;
      var d  = Math.sqrt(dx * dx + dy * dy) || 1e-4;
      var f  = SPR * (d - REST);
      fx[e[0]] += (dx / d) * f; fy[e[0]] += (dy / d) * f;
      fx[e[1]] -= (dx / d) * f; fy[e[1]] -= (dy / d) * f;
    });

    SIM.forEach(function (n, i) {
      fx[i] += (0.5 - n.x) * GRAV;
      fy[i] += (0.5 - n.y) * GRAV;
      fx[i] += Math.sin(tick * 0.006 + i * 1.1) * DRIFT;
      fy[i] += Math.cos(tick * 0.005 + i * 0.9) * DRIFT;
      n.vx = (n.vx + fx[i]) * DAMP;
      n.vy = (n.vy + fy[i]) * DAMP;
      n.x += n.vx; n.y += n.vy;
      var p = 0.1;
      if (n.x < p)     { n.x = p;     n.vx *= -0.3; }
      if (n.x > 1 - p) { n.x = 1 - p; n.vx *= -0.3; }
      if (n.y < p)     { n.y = p;     n.vy *= -0.3; }
      if (n.y > 1 - p) { n.y = 1 - p; n.vy *= -0.3; }
    });
    tick++;
  }

  function paint() {
    ctx.clearRect(0, 0, W, H);

    var conn = hovered ? getConnected(hovered) : null;

    /* Edges — straight lines, Obsidian style */
    EDGES.forEach(function (e) {
      var a = SIM[e[0]], b = SIM[e[1]];
      var ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H;
      var active = conn && conn.indexOf(SIM[e[0]]) >= 0 && conn.indexOf(SIM[e[1]]) >= 0;
      var dimmed = conn && !active;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = active  ? 'rgba(148,185,245,0.6)'
                      : dimmed  ? 'rgba(130,165,220,0.04)'
                      :           'rgba(130,165,220,0.18)';
      ctx.lineWidth = active ? 1.1 : 0.6;
      ctx.stroke();
    });

    /* Nodes — solid glowing dots */
    SIM.forEach(function (n) {
      var x = n.x * W, y = n.y * H;
      var def = n.def;
      var isHov = n === hovered;
      var isDim = conn && conn.indexOf(n) < 0;
      var r = def.r * (isHov ? 1.5 : 1);

      ctx.globalAlpha = isDim ? 0.18 : 1;

      ctx.shadowBlur  = isHov ? 22 : (def.id === 'core' ? 12 : 7);
      ctx.shadowColor = def.color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      /* Label — right/left of node, tiny */
      ctx.font = '9.5px "Segoe UI",system-ui,sans-serif';
      var tw  = ctx.measureText(def.label).width;
      var gap = r + 6;
      var lx, align;
      if (x + gap + tw < W - 8) { lx = x + gap; align = 'left';  }
      else                       { lx = x - gap; align = 'right'; }
      ctx.textAlign    = align;
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = isHov ? '#e8f4ff' : 'rgba(168,186,210,0.72)';
      ctx.fillText(def.label, lx, y);

      ctx.globalAlpha = 1;
    });
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    hovered = null;
    var best = Infinity;
    SIM.forEach(function (n) {
      var dx = n.x * W - mx, dy = n.y * H - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < n.def.r + 16 && d < best) { best = d; hovered = n; }
    });
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  });

  canvas.addEventListener('mouseleave', function () { hovered = null; canvas.style.cursor = 'default'; });

  canvas.addEventListener('click', function () {
    if (!hovered) return;
    var el = document.querySelector(hovered.def.href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  window.addEventListener('resize', function () { resize(); });

  resize();
  for (var s = 0; s < 400; s++) step();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    paint();
    return;
  }

  function loop() { step(); paint(); requestAnimationFrame(loop); }
  loop();
})();
