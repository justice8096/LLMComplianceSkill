"""
Cartographic Taxonomy — Global AI Compliance Evidence Matrix Poster
Second pass: refined spacing, heavier dot marks, visible timeline, polished composition.
"""

from reportlab.lib.pagesizes import A2
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math

FONTS_DIR = r"C:\Users\justi\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\b3952fb2-dfcf-4f03-b07c-2ddf80a6dc7a\9965baf1-800d-43db-81d5-3d567f1ec168\skills\canvas-design\canvas-fonts"

for name, fname in [
    ('Jura-Light', 'Jura-Light.ttf'), ('Jura-Medium', 'Jura-Medium.ttf'),
    ('GeistMono', 'GeistMono-Regular.ttf'), ('GeistMono-Bold', 'GeistMono-Bold.ttf'),
    ('IBMPlexMono', 'IBMPlexMono-Regular.ttf'), ('IBMPlexMono-Bold', 'IBMPlexMono-Bold.ttf'),
    ('InstrumentSans', 'InstrumentSans-Regular.ttf'), ('InstrumentSans-Bold', 'InstrumentSans-Bold.ttf'),
    ('WorkSans', 'WorkSans-Regular.ttf'), ('WorkSans-Bold', 'WorkSans-Bold.ttf'),
    ('DMMono', 'DMMono-Regular.ttf'), ('Italiana', 'Italiana-Regular.ttf'),
    ('PoiretOne', 'PoiretOne-Regular.ttf'),
    ('CrimsonPro', 'CrimsonPro-Regular.ttf'), ('CrimsonPro-Italic', 'CrimsonPro-Italic.ttf'),
]:
    pdfmetrics.registerFont(TTFont(name, f'{FONTS_DIR}/{fname}'))

# --- Palette ---
NAVY = HexColor('#0B1426')
AMBER = HexColor('#D4943A')
AMBER_LIGHT = HexColor('#E8B96A')
AMBER_DIM = HexColor('#8A6225')
AMBER_GLOW = HexColor('#F5D08E')
WARM_WHITE = HexColor('#F0EBE0')
COOL_GREY = HexColor('#6B7B8D')
GREY_LIGHT = HexColor('#9AACBA')
GREY_DIM = HexColor('#3A4A5A')
TEAL = HexColor('#2A7B7B')
TEAL_LIGHT = HexColor('#4DBFBF')
SLATE = HexColor('#1E2D3D')

W, H = A2
MARGIN = 16 * mm

EVIDENCE_CODES = [
    'RC', 'CA', 'RM', 'IA', 'TD', 'TD-D', 'TD-CR',
    'TRANS', 'DISC', 'LABEL', 'HO', 'BIAS',
    'PIA', 'CONS', 'DSR', 'GOV', 'LIT', 'INC',
    'REG', 'SEC', 'SAFE', 'MOD', 'LOG', 'ETH'
]

EVIDENCE_NAMES = {
    'RC': 'Risk Class.', 'CA': 'Conformity', 'RM': 'Risk Mgmt',
    'IA': 'Impact Assess.', 'TD': 'Tech Docs', 'TD-D': 'Training Data',
    'TD-CR': 'Copyright', 'TRANS': 'Transparency', 'DISC': 'Disclosure',
    'LABEL': 'Labeling', 'HO': 'Oversight', 'BIAS': 'Bias Test',
    'PIA': 'Privacy/DPIA', 'CONS': 'Consent', 'DSR': 'Data Rights',
    'GOV': 'Governance', 'LIT': 'AI Literacy', 'INC': 'Incidents',
    'REG': 'Registration', 'SEC': 'Security', 'SAFE': 'Safety Eval',
    'MOD': 'Moderation', 'LOG': 'Log Retain', 'ETH': 'Ethics'
}

JURISDICTIONS = [
    {
        'name': 'EUROPEAN UNION', 'code': 'EU', 'tier': 'enacted',
        'laws': [
            ('EU AI Act — High-Risk', 'Aug 2026',
             ['RC', 'CA', 'RM', 'IA', 'TD', 'TD-D', 'TRANS', 'DISC', 'LABEL', 'HO', 'BIAS', 'GOV', 'LIT', 'INC', 'REG', 'SAFE']),
            ('EU AI Act — GPAI', 'In force',
             ['TD', 'TD-D', 'TD-CR', 'INC', 'SEC', 'SAFE']),
            ('GDPR', 'In force',
             ['PIA', 'CONS', 'DSR']),
        ]
    },
    {
        'name': 'CHINA', 'code': 'CN', 'tier': 'enacted',
        'laws': [
            ('GenAI Interim Measures', 'In force',
             ['LABEL', 'REG', 'MOD', 'LOG', 'SEC']),
            ('Content Labeling Measures', 'In force',
             ['LABEL', 'LOG']),
            ('Cybersecurity Law (Amended)', 'In force',
             ['RM', 'SEC', 'ETH']),
            ('Algorithm Registration', 'In force',
             ['TD', 'TRANS', 'REG']),
        ]
    },
    {
        'name': 'SOUTH KOREA', 'code': 'KR', 'tier': 'enacted',
        'laws': [
            ('AI Basic Act', 'Jan 2026',
             ['RC', 'RM', 'IA', 'TD', 'TRANS', 'DISC', 'HO', 'BIAS', 'ETH', 'SAFE']),
            ('PIPA', 'In force',
             ['PIA', 'CONS', 'DSR']),
        ]
    },
    {
        'name': 'UNITED KINGDOM', 'code': 'UK', 'tier': 'active-sector',
        'laws': [
            ('DUA Act', 'In force',
             ['IA', 'TD', 'TRANS', 'TD-CR', 'SEC']),
            ('Five Core Principles', 'Voluntary',
             ['RM', 'TRANS', 'HO', 'BIAS', 'GOV', 'SEC']),
            ('UK GDPR', 'In force',
             ['PIA', 'CONS', 'DSR']),
        ]
    },
    {
        'name': 'UNITED STATES', 'code': 'US', 'tier': 'active-sector',
        'laws': [
            ('Colorado AI Act', 'Jun 2026',
             ['RC', 'RM', 'IA', 'TD', 'DISC', 'BIAS']),
            ('CA SB 942 Transparency', 'Aug 2026',
             ['DISC', 'LABEL']),
            ('CA SB 53 Frontier AI', 'In force',
             ['INC']),
            ('NYC Local Law 144', 'In force',
             ['BIAS', 'DISC']),
        ]
    },
    {
        'name': 'CANADA', 'code': 'CA', 'tier': 'active-sector',
        'laws': [
            ('PIPEDA', 'In force',
             ['TRANS', 'PIA', 'CONS', 'DSR']),
            ('Directive on ADM', 'In force',
             ['IA', 'TRANS', 'HO']),
            ('Ontario Workers Act', '2026',
             ['DISC', 'BIAS']),
        ]
    },
    {
        'name': 'BRAZIL', 'code': 'BR', 'tier': 'proposed',
        'laws': [
            ('PL 2338/2023', 'Senate passed',
             ['RC', 'RM', 'IA', 'TD', 'TRANS', 'GOV', 'SAFE']),
            ('LGPD', 'In force',
             ['PIA', 'CONS', 'DSR']),
        ]
    },
    {
        'name': 'INDIA', 'code': 'IN', 'tier': 'active-sector',
        'laws': [
            ('DPDPA 2023', 'Enforcing',
             ['PIA', 'CONS', 'DSR']),
            ('IT Act / Rules', 'In force',
             ['MOD', 'TRANS', 'DISC']),
        ]
    },
    {
        'name': 'JAPAN', 'code': 'JP', 'tier': 'voluntary',
        'laws': [
            ('AI Promotion Act', 'In force',
             ['RM', 'TRANS']),
            ('AI Guidelines for Business', 'Voluntary',
             ['RM', 'TRANS', 'HO', 'GOV']),
            ('APPI', 'In force',
             ['PIA', 'CONS']),
        ]
    },
    {
        'name': 'SINGAPORE', 'code': 'SG', 'tier': 'voluntary',
        'laws': [
            ('AI Governance Framework', 'Voluntary',
             ['TRANS', 'HO', 'BIAS', 'GOV']),
            ('PDPA', 'In force',
             ['PIA', 'CONS', 'DSR']),
            ('MAS FEAT (Finance)', 'Binding',
             ['TRANS', 'BIAS', 'SAFE']),
        ]
    },
    {
        'name': 'AUSTRALIA', 'code': 'AU', 'tier': 'voluntary',
        'laws': [
            ('Privacy Act + ADM', 'Dec 2026',
             ['TRANS', 'PIA', 'CONS', 'DSR']),
            ('No TDM Exemption', 'In force',
             ['TD-CR']),
            ('AI6 Guidance', 'Voluntary',
             ['TRANS', 'HO', 'BIAS', 'GOV']),
        ]
    },
    {
        'name': 'PERU', 'code': 'PE', 'tier': 'enacted',
        'laws': [
            ('Law No. 31814', 'In force',
             ['RC', 'IA', 'TD', 'TRANS', 'REG', 'ETH']),
        ]
    },
    {
        'name': 'NIGERIA', 'code': 'NG', 'tier': 'proposed',
        'laws': [
            ('NDPA 2023', 'In force', ['HO', 'PIA']),
            ('Digital Economy Bill', 'Mar 2026',
             ['RC', 'TD', 'TRANS', 'REG']),
        ]
    },
    {
        'name': 'SOUTH AFRICA', 'code': 'ZA', 'tier': 'active-sector',
        'laws': [
            ('POPIA Sec 71', 'In force',
             ['TRANS', 'HO', 'PIA', 'CONS', 'DSR']),
        ]
    },
    {
        'name': 'MEXICO', 'code': 'MX', 'tier': 'proposed',
        'laws': [
            ('LFPDPPP', 'In force', ['PIA', 'CONS', 'DSR']),
            ('Federal AI Law', 'Expected', ['RC', 'TD', 'TRANS']),
        ]
    },
    {
        'name': 'VIETNAM', 'code': 'VN', 'tier': 'enacted',
        'laws': [
            ('Digital Tech Industry Law', 'Mar 2026',
             ['RC', 'TD', 'TRANS']),
        ]
    },
]

TIER_COLORS = {
    'enacted': AMBER, 'active-sector': TEAL,
    'proposed': COOL_GREY, 'voluntary': GREY_DIM,
}
TIER_LABELS = {
    'enacted': 'ENACTED', 'active-sector': 'SECTOR-ACTIVE',
    'proposed': 'PROPOSED', 'voluntary': 'VOLUNTARY',
}


def draw_poster(output_path):
    c = canvas.Canvas(output_path, pagesize=A2)
    c.setTitle("Global AI Compliance Evidence Matrix")

    # === BACKGROUND ===
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Outer frame
    c.setStrokeColor(Color(AMBER.red, AMBER.green, AMBER.blue, 0.12))
    c.setLineWidth(0.4)
    c.rect(MARGIN - 3 * mm, MARGIN - 3 * mm, W - 2 * MARGIN + 6 * mm, H - 2 * MARGIN + 6 * mm, fill=0, stroke=1)
    c.setStrokeColor(Color(1, 1, 1, 0.04))
    c.setLineWidth(0.2)
    c.rect(MARGIN - 1 * mm, MARGIN - 1 * mm, W - 2 * MARGIN + 2 * mm, H - 2 * MARGIN + 2 * mm, fill=0, stroke=1)

    # Fine grid texture
    c.setStrokeColor(Color(1, 1, 1, 0.018))
    c.setLineWidth(0.2)
    step = 3.5 * mm
    for x in range(int(MARGIN), int(W - MARGIN), int(step)):
        c.line(x, MARGIN, x, H - MARGIN)
    for y in range(int(MARGIN), int(H - MARGIN), int(step)):
        c.line(MARGIN, y, W - MARGIN, y)

    # === HEADER ===
    header_y = H - MARGIN - 8 * mm

    c.setFillColor(WARM_WHITE)
    c.setFont('Italiana', 32)
    # Draw title with tighter tracking
    title = "GLOBAL AI COMPLIANCE"
    tx = MARGIN + 1 * mm
    for ch in title:
        c.drawString(tx, header_y, ch)
        tx += c.stringWidth(ch, 'Italiana', 32) - 0.4

    c.setFont('Jura-Light', 12)
    c.setFillColor(AMBER_LIGHT)
    c.drawString(MARGIN + 1 * mm, header_y - 17, "EVIDENCE MATRIX")

    c.setFont('Jura-Light', 7)
    c.setFillColor(AMBER_DIM)
    c.drawString(MARGIN + 48 * mm, header_y - 17, "— Cartographic Taxonomy")

    # Top-right metadata
    c.setFillColor(COOL_GREY)
    c.setFont('GeistMono', 5)
    c.drawRightString(W - MARGIN, header_y + 4, "2026-03-14")
    c.setFont('GeistMono', 4)
    c.drawRightString(W - MARGIN, header_y - 5, "LAWS × EVIDENCE TYPES × JURISDICTIONS")
    c.setFont('DMMono', 3.5)
    c.setFillColor(GREY_DIM)
    c.drawRightString(W - MARGIN, header_y - 13, "16 JURISDICTIONS  ·  24 EVIDENCE CATEGORIES  ·  45+ LAWS")

    # Header rule
    rule_y = header_y - 26
    c.setStrokeColor(AMBER_DIM)
    c.setLineWidth(0.5)
    c.line(MARGIN, rule_y, W - MARGIN, rule_y)

    # === EVIDENCE CODE HEADER BAR ===
    label_area_w = 58 * mm
    dot_area_left = MARGIN + label_area_w
    dot_area_right = W - MARGIN
    dot_col_w = (dot_area_right - dot_area_left) / len(EVIDENCE_CODES)

    legend_y = rule_y - 12

    for i, code in enumerate(EVIDENCE_CODES):
        cx = dot_area_left + i * dot_col_w + dot_col_w / 2

        # Vertical column header background
        c.setFillColor(Color(1, 1, 1, 0.02))
        c.rect(cx - dot_col_w / 2, legend_y - 10, dot_col_w, 22, fill=1, stroke=0)

        c.setFont('GeistMono-Bold', 4.5)
        c.setFillColor(AMBER)
        c.drawCentredString(cx, legend_y + 3, code)

        c.setFont('GeistMono', 3)
        c.setFillColor(GREY_LIGHT)
        c.drawCentredString(cx, legend_y - 5, EVIDENCE_NAMES.get(code, code))

    # Thin line under legend
    c.setStrokeColor(Color(1, 1, 1, 0.06))
    c.setLineWidth(0.25)
    c.line(MARGIN, legend_y - 10, W - MARGIN, legend_y - 10)

    # === TIER LEGEND ===
    tier_y = legend_y - 18
    c.setFont('GeistMono', 3.5)
    c.setFillColor(GREY_DIM)
    c.drawString(MARGIN + 2 * mm, tier_y, "STATUS")
    tx = MARGIN + 16 * mm
    for tier_key in ['enacted', 'active-sector', 'proposed', 'voluntary']:
        color = TIER_COLORS[tier_key]
        c.setFillColor(color)
        c.circle(tx, tier_y + 1.2, 2.2, fill=1, stroke=0)
        c.setFont('GeistMono', 3.5)
        c.setFillColor(GREY_LIGHT)
        c.drawString(tx + 4.5, tier_y, TIER_LABELS[tier_key])
        tx += 25 * mm

    # === MAIN GRID ===
    grid_top = tier_y - 6
    grid_bottom = MARGIN + 68 * mm  # reserve space for summary + timeline + footer
    n_j = len(JURISDICTIONS)
    row_h = (grid_top - grid_bottom) / n_j

    for j_idx, jur in enumerate(JURISDICTIONS):
        y_top = grid_top - j_idx * row_h
        y_bot = y_top - row_h
        y_center = y_top - row_h / 2
        tier_color = TIER_COLORS[jur['tier']]

        # Alternating row bg
        if j_idx % 2 == 0:
            c.setFillColor(Color(1, 1, 1, 0.012))
            c.rect(MARGIN, y_bot, W - 2 * MARGIN, row_h, fill=1, stroke=0)

        # Row separator
        c.setStrokeColor(Color(1, 1, 1, 0.035))
        c.setLineWidth(0.15)
        c.line(MARGIN, y_bot, W - MARGIN, y_bot)

        # Tier accent bar
        c.setFillColor(tier_color)
        c.rect(MARGIN, y_bot + 0.8, 1.8, row_h - 1.6, fill=1, stroke=0)

        # Country code
        c.setFont('GeistMono-Bold', 11)
        c.setFillColor(Color(tier_color.red, tier_color.green, tier_color.blue, 0.9))
        c.drawString(MARGIN + 4 * mm, y_center + 2, jur['code'])

        # Country name
        c.setFont('InstrumentSans', 5.2)
        c.setFillColor(WARM_WHITE)
        c.drawString(MARGIN + 4 * mm, y_center - 6, jur['name'])

        # Laws (tiny)
        law_y_start = y_center - 12
        for l_idx, (law_name, law_status, _) in enumerate(jur['laws']):
            if law_y_start - l_idx * 4.5 < y_bot + 1:
                break
            display = law_name[:30] + ('…' if len(law_name) > 30 else '')
            c.setFont('GeistMono', 2.8)
            c.setFillColor(Color(1, 1, 1, 0.3))
            c.drawString(MARGIN + 5 * mm, law_y_start - l_idx * 4.5, display)
            c.setFillColor(AMBER_DIM)
            c.drawString(MARGIN + 5 * mm + 42 * mm, law_y_start - l_idx * 4.5, law_status)

        # === DOT MARKS ===
        all_codes = set()
        law_code_map = {}
        for _, _, codes in jur['laws']:
            for code in codes:
                all_codes.add(code)
                if code not in law_code_map:
                    law_code_map[code] = 0
                law_code_map[code] += 1

        for e_idx, ecode in enumerate(EVIDENCE_CODES):
            cx = dot_area_left + e_idx * dot_col_w + dot_col_w / 2
            cy = y_center

            if ecode in all_codes:
                count = law_code_map[ecode]
                # Outer glow
                r_outer = 3.0 + count * 0.7
                if r_outer > 5.5:
                    r_outer = 5.5
                c.setFillColor(Color(tier_color.red, tier_color.green, tier_color.blue, 0.2))
                c.circle(cx, cy, r_outer + 1.5, fill=1, stroke=0)

                # Main dot
                c.setFillColor(Color(tier_color.red, tier_color.green, tier_color.blue, 0.75))
                c.circle(cx, cy, r_outer, fill=1, stroke=0)

                # Bright center
                bright = AMBER_GLOW if tier_color == AMBER else TEAL_LIGHT if tier_color == TEAL else GREY_LIGHT
                c.setFillColor(bright)
                c.circle(cx, cy, max(1.2, r_outer - 1.8), fill=1, stroke=0)

                # Count number
                if count > 1:
                    c.setFont('GeistMono-Bold', 3.2)
                    c.setFillColor(NAVY)
                    c.drawCentredString(cx, cy - 1.1, str(count))
            else:
                # Ghost dot — visible enough to show the full grid
                c.setFillColor(Color(1, 1, 1, 0.045))
                c.circle(cx, cy, 1.5, fill=1, stroke=0)

    # Faint column lines through grid
    c.setStrokeColor(Color(1, 1, 1, 0.015))
    c.setLineWidth(0.15)
    for e_idx in range(len(EVIDENCE_CODES)):
        cx = dot_area_left + e_idx * dot_col_w + dot_col_w / 2
        c.line(cx, grid_top, cx, grid_bottom)

    # === FREQUENCY BAR CHART ===
    freq_top = grid_bottom - 5 * mm

    c.setStrokeColor(Color(1, 1, 1, 0.06))
    c.setLineWidth(0.3)
    c.line(MARGIN, freq_top + 2, W - MARGIN, freq_top + 2)

    c.setFont('GeistMono', 3.5)
    c.setFillColor(COOL_GREY)
    c.drawString(MARGIN + 2 * mm, freq_top - 4, "FREQUENCY")
    c.setFont('GeistMono', 2.8)
    c.setFillColor(GREY_DIM)
    c.drawString(MARGIN + 2 * mm, freq_top - 9, "jurisdictions requiring")

    freq = {}
    for ecode in EVIDENCE_CODES:
        count = 0
        for jur in JURISDICTIONS:
            for _, _, codes in jur['laws']:
                if ecode in codes:
                    count += 1
                    break
        freq[ecode] = count

    max_freq = max(freq.values()) if freq else 1
    bar_max_h = 20 * mm
    bar_bottom = freq_top - 8 * mm - bar_max_h

    for e_idx, ecode in enumerate(EVIDENCE_CODES):
        cx = dot_area_left + e_idx * dot_col_w + dot_col_w / 2
        f = freq[ecode]
        bar_h = (f / max_freq) * bar_max_h
        intensity = 0.25 + 0.6 * (f / max_freq)

        # Bar with gradient feel
        bar_w = dot_col_w * 0.45
        # Shadow
        c.setFillColor(Color(AMBER.red * 0.5, AMBER.green * 0.5, AMBER.blue * 0.3, intensity * 0.4))
        c.rect(cx - bar_w / 2 + 0.5, bar_bottom - 0.5, bar_w, bar_h, fill=1, stroke=0)
        # Main bar
        c.setFillColor(Color(AMBER.red, AMBER.green, AMBER.blue, intensity))
        c.rect(cx - bar_w / 2, bar_bottom, bar_w, bar_h, fill=1, stroke=0)
        # Top highlight
        if bar_h > 2:
            c.setFillColor(Color(AMBER_GLOW.red, AMBER_GLOW.green, AMBER_GLOW.blue, intensity * 0.5))
            c.rect(cx - bar_w / 2, bar_bottom + bar_h - 1, bar_w, 1, fill=1, stroke=0)

        # Frequency number
        c.setFont('GeistMono-Bold', 3.8)
        c.setFillColor(WARM_WHITE)
        c.drawCentredString(cx, bar_bottom - 6, str(f))

        # Code
        c.setFont('GeistMono', 3)
        c.setFillColor(GREY_LIGHT)
        c.drawCentredString(cx, bar_bottom - 12, ecode)

    # === TIMELINE ===
    timeline_top = bar_bottom - 20 * mm

    c.setStrokeColor(Color(1, 1, 1, 0.06))
    c.setLineWidth(0.3)
    c.line(MARGIN, timeline_top + 4, W - MARGIN, timeline_top + 4)

    c.setFont('GeistMono', 3.5)
    c.setFillColor(COOL_GREY)
    c.drawString(MARGIN + 2 * mm, timeline_top - 2, "COMPLIANCE TIMELINE")

    deadlines = [
        ('IN FORCE', 'CN GenAI · EU Prohibited', 'EU GPAI · KR AI Act · CA SB 53'),
        ('JUN 2026', 'Colorado AI Act', ''),
        ('AUG 2026', 'EU AI Act Full', 'CA SB 942 Transparency'),
        ('DEC 2026', 'AU Privacy Act ADM', ''),
        ('AUG 2027', 'EU High-Risk Products', ''),
    ]

    tl_left = MARGIN + 22 * mm
    tl_right = W - MARGIN - 8 * mm
    tl_span = tl_right - tl_left
    tl_y = timeline_top - 10

    # Timeline line
    c.setStrokeColor(AMBER_DIM)
    c.setLineWidth(0.6)
    c.line(tl_left - 3 * mm, tl_y, tl_right + 3 * mm, tl_y)

    for d_idx, (date, line1, line2) in enumerate(deadlines):
        dx = tl_left + (d_idx / (len(deadlines) - 1)) * tl_span

        # Outer glow
        c.setFillColor(Color(AMBER.red, AMBER.green, AMBER.blue, 0.15))
        c.circle(dx, tl_y, 5, fill=1, stroke=0)
        # Point
        c.setFillColor(AMBER)
        c.circle(dx, tl_y, 3, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.circle(dx, tl_y, 1.2, fill=1, stroke=0)

        # Date
        c.setFont('GeistMono-Bold', 4.5)
        c.setFillColor(AMBER_LIGHT)
        c.drawCentredString(dx, tl_y - 9, date)

        # Description lines
        c.setFont('GeistMono', 3.2)
        c.setFillColor(GREY_LIGHT)
        c.drawCentredString(dx, tl_y - 16, line1)
        if line2:
            c.drawCentredString(dx, tl_y - 21, line2)

    # === FOOTER ===
    footer_y = MARGIN + 3 * mm

    c.setStrokeColor(Color(1, 1, 1, 0.04))
    c.setLineWidth(0.2)
    c.line(MARGIN, footer_y + 6, W - MARGIN, footer_y + 6)

    c.setFont('CrimsonPro-Italic', 4.5)
    c.setFillColor(Color(1, 1, 1, 0.22))
    c.drawString(MARGIN + 2 * mm, footer_y,
                 "Compliance research — not legal advice. Consult qualified counsel for jurisdiction-specific decisions.")

    c.setFont('GeistMono', 3.5)
    c.setFillColor(GREY_DIM)
    c.drawRightString(W - MARGIN, footer_y, "LLMComplianceSkill · REV.A")

    c.setFont('DMMono', 2.8)
    c.setFillColor(Color(1, 1, 1, 0.07))
    c.drawRightString(W - MARGIN, footer_y - 6, "CAT-TAX-001")

    c.save()
    print(f"Poster saved: {output_path}")


if __name__ == '__main__':
    out = r"D:\LLMComplianceSkill\AI-Compliance-Evidence-Matrix-Poster.pdf"
    draw_poster(out)
