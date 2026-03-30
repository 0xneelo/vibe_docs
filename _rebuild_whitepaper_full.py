# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(r"C:\Users\Vibe\Desktop\Desktop\0,0,0 vibe_docs")
DOCS = ROOT / "Docs"
MD_OUT = DOCS / "Whitepaper" / "Whitepaper.md"
TEX_OUT = DOCS / "Whitepaper" / "Whitepaper.tex"

TOPICS = [
    "public/01_usdc_token_perps",
    "public/02_perp_classes_zscore",
    "public/03_listing_monopoly",
    "public/04_proof_of_value",
    "public/05_ode_to_the_orderbook",
    "public/06_ode_to_the_orderbook_part2",
    "public/08_token_margined_issues_perculator",
    "public/10_due_diligence_questionnaire",
    "public/12_fix_industry_one_primitive",
    "public/13_vibe_pillars",
    "public/14_gametheory_of_listings",
    "public/17_framework_value_permissionless_perps",
    "public/18_information_trade_convergence",
    "private/16_vibe_full_derivation",
    "private/19_gtm_ideas",
    "todo/09_TODO_vibe_symm_team_edge",
    "todo/15_TODO_vibe_categories",
    "todo/16_TODO_inventory_profit",
]

EXCLUDED_PARTS = {"transcripts", "transcript", "voice_notes", "source_notes", ".git", "__pycache__"}
META_TITLE_PATTERNS = [
    r"paper structure",
    r"table of contents",
    r"topic overview",
    r"paper overview",
    r"specification table of contents",
]
NAV_LINE_PATTERNS = [
    r"^\s*Back to Overview\b.*$",
    r"^\s*←.*Next:.*$",
    r"^\s*\*?Next:\s+.*$",
    r"^\s*\d+\.\s*\[[^\]]+\]\(#.*\)\s*$",
    r"^\s*\|?\s*Back to Overview\s*\|?.*$",
]
ABSTRACT_NAME_RE = re.compile(r"^00[-_]abstract\.md$", re.I)


def is_excluded_path(path: Path) -> bool:
    return any(part.lower() in EXCLUDED_PARTS for part in path.parts)


def read_text(path: Path) -> str:
    for enc in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
        try:
            return path.read_text(encoding=enc).replace("\ufeff", "").replace("\r\n", "\n")
        except UnicodeDecodeError:
            continue
    return path.read_bytes().decode("latin-1").replace("\ufeff", "").replace("\r\n", "\n")


def first_heading(text: str):
    for ln in text.splitlines():
        m = re.match(r"^#\s+(.*)$", ln.strip())
        if m:
            return m.group(1).strip()
    return None


def strip_first_heading(text: str) -> str:
    lines = text.splitlines()
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and re.match(r"^#\s+", lines[i].strip()):
        i += 1
        while i < len(lines) and not lines[i].strip():
            i += 1
    return "\n".join(lines[i:]).strip()


def extract_abstract_section(text: str):
    lines = text.splitlines()
    start = None
    level = None
    for idx, line in enumerate(lines):
        m = re.match(r"^(#{1,6})\s+.*abstract\b.*$", line.strip(), re.I)
        if m:
            start = idx
            level = len(m.group(1))
            break
    if start is None:
        return None, text
    end = len(lines)
    for idx in range(start + 1, len(lines)):
        m = re.match(r"^(#{1,6})\s+", lines[idx].strip())
        if m and len(m.group(1)) <= level:
            end = idx
            break
    body = "\n".join(lines[start + 1:end]).strip()
    rem = "\n".join(lines[:start] + lines[end:]).strip()
    return body, rem


def clean_body(text: str) -> str:
    lines = text.splitlines()
    cleaned = []
    nav_re = re.compile("|".join(f"(?:{p})" for p in NAV_LINE_PATTERNS))
    for ln in lines:
        s = ln.strip()
        if nav_re.match(s):
            continue
        # remove internal TOC anchor list lines
        if re.match(r"^\s*\d+\.\s*\[[^\]]+\]\(#", s):
            continue
        cleaned.append(ln)
    text = "\n".join(cleaned)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def should_skip_section_title(title: str) -> bool:
    t = title.lower().strip()
    return any(re.search(p, t) for p in META_TITLE_PATTERNS)


def normalize_section_title(title: str) -> str:
    title = re.sub(r"^part of\s+", "", title.strip(), flags=re.I)
    return title


def bump_headings(text: str) -> str:
    def repl(m):
        lvl = len(m.group(1))
        return "#" * min(6, max(3, lvl + 1)) + " "
    return re.sub(r"^(#{1,6})\s+", repl, text, flags=re.M)


def maybe_wrap_mermaid(path: Path, text: str) -> str:
    s = text.strip()
    if path.stem.lower().startswith("figure") or re.match(r"^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie)\b", s):
        if not s.startswith("```"):
            return "```mermaid\n" + s + "\n```"
    return text


def file_sort_key(path: Path):
    rel = path.parts
    key = []
    for part in rel:
        m = re.match(r"^(\d+)", part)
        n = int(m.group(1)) if m else 999
        key.append((n, part.lower()))
    return tuple(key)


def topic_title(topic_dir: Path, files):
    readme = topic_dir / "README.md"
    if readme.exists():
        h = first_heading(read_text(readme))
        if h:
            return h
    for f in files:
        h = first_heading(read_text(f))
        if h:
            return h
    return topic_dir.name.replace("_", " ")


def topic_files(topic_dir: Path):
    files = [p for p in topic_dir.rglob("*.md") if p.is_file() and not is_excluded_path(p)]
    return sorted(files, key=lambda p: file_sort_key(p.relative_to(topic_dir)))


def section_title_for(path: Path, text: str):
    h = first_heading(text)
    if h:
        return h
    stem = re.sub(r"^[0-9]+[-_ ]*", "", path.stem)
    return stem.replace("_", " ").replace("-", " ").strip() or path.stem


def build_topic(topic_rel: str):
    topic_dir = DOCS / topic_rel
    files = topic_files(topic_dir)
    if not files:
        return None

    ttitle = topic_title(topic_dir, files)
    abs_path = next((f for f in files if ABSTRACT_NAME_RE.match(f.name)), None)
    intro = None
    abs_source_inline = None

    if abs_path:
        intro = clean_body(strip_first_heading(read_text(abs_path)))
    else:
        for f in files:
            body, rem = extract_abstract_section(read_text(f))
            if body:
                intro = clean_body(body)
                abs_source_inline = f
                break

    sections = []
    for f in files:
        if f == abs_path:
            continue
        raw = read_text(f)
        if abs_source_inline and f == abs_source_inline:
            _, raw = extract_abstract_section(raw)
        stitle = normalize_section_title(section_title_for(f, raw))
        if should_skip_section_title(stitle):
            continue
        body = clean_body(strip_first_heading(raw))
        if not body:
            continue
        body = maybe_wrap_mermaid(f, body)
        body = bump_headings(body)
        rel = f.relative_to(DOCS).as_posix()
        sections.append((stitle, rel, body))

    lines = [f"# {ttitle}", "", f"_Source folder: `{topic_rel}`_", ""]
    if intro:
        lines.extend(["## Introduction", "", bump_headings(intro), ""])

    for stitle, rel, body in sections:
        lines.extend([f"## {stitle}", "", f"_Source: `{rel}`_", "", body, ""])

    return "\n".join(lines).strip()

ABSTRACT = (
"Vibe is a permissionless perpetuals architecture built to list and operate markets that traditional order books and legacy perp designs struggle to support, especially in low-cap and early-stage token environments. Instead of relying on rigid listing committees or one-size-fits-all market structure, Vibe combines solver-managed execution, dynamic risk controls, and structured market maturation logic to bootstrap new derivative markets and improve capital efficiency over time.\n\n"
"This whitepaper consolidates Vibe's core thesis and technical framework across market design, counterparty architecture, pricing controls, insurance and defense hierarchies, listing game theory, and value creation for traders, liquidity providers, and token projects. It explains why permissionless market creation fails under many existing models, how Vibe addresses these failure modes, and how the system can evolve from fragile bootstrap conditions toward more robust, scalable market infrastructure.\n\n"
"The document also includes formal and semi-formal derivations for risk, utilization, funding, and incentive alignment, with practical sections intended for due diligence and implementation review. Taken together, the paper presents Vibe as both a market mechanism and an operating framework for building resilient, permissionless derivatives in environments where liquidity, trust, and information quality are uneven."
)

scope_list = "\n".join(f"- `{t}`" for t in TOPICS)

parts = []
for t in TOPICS:
    block = build_topic(t)
    if block:
        parts.append(block)

md = f"""---
title: "Vibe Whitepaper"
subtitle: "Consolidated Papers and Working Notes"
date: "March 17, 2026"
documentclass: report
geometry: margin=1in
numbersections: true
header-includes:
  - \\usepackage{{longtable}}
  - \\usepackage{{booktabs}}
  - \\usepackage{{array}}
  - \\usepackage{{hyperref}}
---

\\maketitle

# Abstract

{ABSTRACT}

# Scope

This manuscript consolidates the following topic folders from <https://github.com/0xneelo/vibe_docs/>:

{scope_list}

The public `11_private_law_societies` paper and the matching todo sovereign-intent working folder were excluded to respect that instruction.
""".strip() + "\n\n" + "\n\n".join(parts).strip() + "\n"

MD_OUT.write_text(md, encoding="utf-8")

# ---- MD to TEX ----
lines = md.split("\n")
meta = {}
idx = 0
if lines and lines[0].strip() == "---":
    idx = 1
    while idx < len(lines) and lines[idx].strip() != "---":
        m = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", lines[idx])
        if m:
            meta[m.group(1).strip().lower()] = m.group(2).strip().strip('"')
        idx += 1
    if idx < len(lines) and lines[idx].strip() == "---":
        idx += 1
content_lines = lines[idx:]


def esc(s: str) -> str:
    rep = {
        "\\": r"\textbackslash{}", "{": r"\{", "}": r"\}", "#": r"\#", "$": r"\$", "%": r"\%", "&": r"\&", "_": r"\_", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
    }
    return "".join(rep.get(ch, ch) for ch in s)


def conv_inline(s: str) -> str:
    placeholders = []
    def hold(v):
        token = f"@@P{len(placeholders)}@@"
        placeholders.append(v)
        return token
    def repl_link(m):
        return hold(rf"\href{{{esc(m.group(2))}}}{{{conv_inline(m.group(1))}}}")
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", repl_link, s)
    s = re.sub(r"<((?:https?://)[^>]+)>", lambda m: hold(rf"\url{{{esc(m.group(1))}}}"), s)
    s = re.sub(r"`([^`]+)`", lambda m: hold(rf"\texttt{{{esc(m.group(1))}}}"), s)
    s = re.sub(r"\*\*([^*]+)\*\*", lambda m: hold(rf"\textbf{{{conv_inline(m.group(1))}}}"), s)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", lambda m: hold(rf"\emph{{{conv_inline(m.group(1))}}}"), s)
    s = esc(s)
    for i, v in enumerate(placeholders):
        s = s.replace(esc(f"@@P{i}@@"), v)
    return s

out = [
    r"\documentclass[11pt]{report}",
    r"\usepackage[margin=1in]{geometry}",
    r"\usepackage[T1]{fontenc}",
    r"\usepackage[utf8]{inputenc}",
    r"\usepackage{lmodern}",
    r"\usepackage{hyperref}",
    r"\usepackage{xurl}",
    r"\usepackage{longtable}",
    r"\usepackage{booktabs}",
    r"\usepackage{array}",
    r"\usepackage{verbatim}",
    r"\usepackage{fvextra}",
    r"\usepackage{parskip}",
    r"\setlength{\emergencystretch}{3em}",
    r"\pretolerance=1000",
    r"\tolerance=2000",
    r"\hbadness=2000",
    r"\hfuzz=2pt",
    r"\sloppy",
    r"\urlstyle{same}",
    "",
]
if "title" in meta:
    out.append(rf"\title{{{conv_inline(meta['title'])}}}")
if "subtitle" in meta and meta["subtitle"]:
    out.append(rf"\author{{{conv_inline(meta['subtitle'])}}}")
out.append(rf"\date{{{conv_inline(meta.get('date',''))}}}")
out += ["", r"\begin{document}", r"\maketitle", r"\tableofcontents", r"\newpage", ""]

in_code = False
in_math = False
list_mode = None
quote_mode = False

def end_list(m):
    if m == "itemize": out.append(r"\end{itemize}")
    elif m == "enumerate": out.append(r"\end{enumerate}")

for raw in content_lines:
    line = raw.rstrip("\n")
    s = line.strip()
    if s.startswith("```"):
        if in_code:
            out.append(r"\end{Verbatim}")
            out.append("")
            in_code = False
        else:
            if list_mode: end_list(list_mode); list_mode = None
            if quote_mode: out.append(r"\end{quote}"); quote_mode = False
            lang = s[3:].strip()
            if lang: out.append(rf"\textit{{Code block ({esc(lang)})}}")
            out.append(r"\begin{Verbatim}[breaklines=true,breakanywhere=true,fontsize=\small]")
            in_code = True
        continue
    if in_code:
        out.append(line)
        continue
    if s.startswith("$$"):
        if list_mode: end_list(list_mode); list_mode = None
        if quote_mode: out.append(r"\end{quote}"); quote_mode = False
        out.append(line)
        in_math = not in_math
        continue
    if in_math:
        out.append(line)
        continue
    if s in (r"\maketitle", r"\tableofcontents", r"\newpage"):
        continue
    if s == "---":
        if list_mode: end_list(list_mode); list_mode = None
        if quote_mode: out.append(r"\end{quote}"); quote_mode = False
        out.append(r"\medskip\hrule\medskip")
        continue
    hm = re.match(r"^(#{1,6})\s+(.*)$", s)
    if hm:
        if list_mode: end_list(list_mode); list_mode = None
        if quote_mode: out.append(r"\end{quote}"); quote_mode = False
        lvl = len(hm.group(1)); title = conv_inline(hm.group(2).strip())
        if lvl == 1: out.append(rf"\chapter{{{title}}}")
        elif lvl == 2: out.append(rf"\section{{{title}}}")
        elif lvl == 3: out.append(rf"\subsection{{{title}}}")
        elif lvl == 4: out.append(rf"\subsubsection{{{title}}}")
        else: out.append(rf"\paragraph{{{title}}}")
        continue
    if s.startswith(">"):
        if list_mode: end_list(list_mode); list_mode = None
        if not quote_mode: out.append(r"\begin{quote}"); quote_mode = True
        out.append(conv_inline(s.lstrip(">").strip()))
        continue
    else:
        if quote_mode: out.append(r"\end{quote}"); quote_mode = False
    um = re.match(r"^\s*[-*]\s+(.*)$", line)
    if um:
        if list_mode != "itemize":
            if list_mode: end_list(list_mode)
            out.append(r"\begin{itemize}")
            list_mode = "itemize"
        out.append(rf"\item {conv_inline(um.group(1).strip())}")
        continue
    om = re.match(r"^\s*\d+[\.)]\s+(.*)$", line)
    if om:
        if list_mode != "enumerate":
            if list_mode: end_list(list_mode)
            out.append(r"\begin{enumerate}")
            list_mode = "enumerate"
        out.append(rf"\item {conv_inline(om.group(1).strip())}")
        continue
    if s == "":
        if list_mode: end_list(list_mode); list_mode = None
        out.append("")
        continue
    if list_mode: end_list(list_mode); list_mode = None
    out.append(conv_inline(line))

if in_code: out.append(r"\end{Verbatim}")
if quote_mode: out.append(r"\end{quote}")
if list_mode: end_list(list_mode)

out.append("")
out.append(r"\end{document}")
tex = "\n".join(out)
tex = re.sub(r"^\\_Source folder: (.*?)\\_$", r"\\emph{Source folder: \1}", tex, flags=re.M)
tex = re.sub(r"^\\_Source: (.*?)\\_$", r"\\emph{Source: \1}", tex, flags=re.M)

# ascii-safe final sanitize for pdflatex
map_chars = {
    "≈":" approx ","≥":">=","≤":"<=","↔":"<->","←":"<-","→":"->","✅":"[OK]","❌":"[X]","✓":"[OK]","✗":"[X]","×":"x","▼":"v","▲":"^","•":"-","–":"-","—":"--","−":"-","…":"...","“":'"',"”":'"',"‘":"'","’":"'","‑":"-","‒":"-"," ":" ","⇒":"=>",
    "λ":"lambda","β":"beta","σ":"sigma","α":"alpha","Π":"Pi","π":"pi","τ":"tau","γ":"gamma","η":"eta","μ":"mu","Δ":"Delta","δ":"delta","ϕ":"phi","Φ":"Phi",
    "┌":"+","┐":"+","└":"+","┘":"+","├":"+","┤":"+","┬":"+","┴":"+","┼":"+","─":"-","│":"|",
}
for k,v in map_chars.items():
    tex = tex.replace(k,v)
tex = re.sub(r"[^\x00-\x7F]", "", tex)
tex = re.sub(r"\n{3,}", "\n\n", tex)

TEX_OUT.write_text(tex + "\n", encoding="utf-8")

print(f"Rebuilt whitepaper with topics: {len(parts)}")
