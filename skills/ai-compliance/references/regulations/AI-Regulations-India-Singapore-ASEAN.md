# AI & LLM Software Development Regulations - India, Singapore & ASEAN

**Last Updated:** 2026-10-11
**Tags:** #ai-regulation #india #singapore #asean #vietnam #software-development

---

## India

### Overview
India has **no dedicated AI legislation** as of October 2026, but it now has **binding AI content rules**: the IT (Intermediary Guidelines) Amendment Rules 2026 (in force 20 Feb 2026) require labelling of synthetically generated information and rapid takedown of unlawful AI content. The Digital Personal Data Protection Rules 2025 set a phased compliance timeline running to May 2027. The government's stated position at the India AI Impact Summit (Feb 2026) is that AI will be regulated "only when necessary", with sectoral regulators (SEBI, RBI, CDSCO) in the lead.

### Key Frameworks

#### India AI Governance Guidelines (Nov 2025)
Seven core principles:
1. Safety and reliability
2. Transparency and explainability
3. Fairness and non-discrimination
4. Accountability
5. Privacy and data protection
6. Human oversight
7. Sustainability and social benefit

Six key recommendations include education/skills training, policies supporting innovation, risk mitigation, and establishing an AI governance group. The **AI Governance and Economic Group (AIGEG)** was constituted by MeitY on 16 Apr 2026 as an inter-ministerial body chaired by the IT Minister.

#### India AI Impact Summit (New Delhi, 16-20 Feb 2026)
- New Delhi Declaration endorsed by 92 countries and organisations, including the US and China; voluntary

#### "Responsible AI for All" Strategy (NITI Aayog)
- Promotes ethical AI development with a focus on socio-economic inequality
- Principles: privacy, security, consent-based data use

#### AI Safety Institute
- Recommended under the Guidelines; no establishment order found as of 2026. Treat as proposed.

### Existing Laws Applying to AI

#### Digital Personal Data Protection Act 2023 and DPDP Rules 2025
- Rules notified 13 Nov 2025 (G.S.R. 846(E)); Data Protection Board provisions effective immediately
- Consent-manager registration from around 13 Nov 2026; core obligations (notice, consent, breach reporting, children's data, data principal rights) from around **13 May 2027**
- A January 2026 MeitY proposal to shorten the 18-month window to 12 months was not notified as of September 2026
- Data Protection Board chair and members not yet appointed (applications invited 6 May 2026)
- Significant Data Fiduciaries must verify that their algorithmic software does not pose a risk to data principals
- Consent, purpose limitation, data principal rights and localisation provisions for certain categories

#### IT (Intermediary Guidelines) Amendment Rules 2026 (notified 10 Feb 2026, in force 20 Feb 2026)
- Mandatory "clear and prominent" labelling of synthetically generated information; the fixed 10% watermark from the draft was dropped
- User self-declaration plus technical verification by significant social media intermediaries; permanent metadata where feasible
- Takedown of unlawful content within 3 hours of an order (2 hours for non-consensual intimate or morphed imagery)
- 36-hour acknowledgement and 7-day resolution windows for grievances

#### Information Technology Act 2000 (and amendments)
- Governs cybersecurity, electronic commerce, and intermediary liability
- Section 79 intermediary safe harbor applies to AI-powered platforms with conditions
- CERT-In advisory CIAD-2026-0020 (Apr 2026) on frontier AI cyber risks

#### Consumer Protection Act 2019
- Prohibits unfair trade practices; applies to AI-driven commerce

#### Sector-Specific Regulation
- **Financial services:** RBI and SEBI oversight extends to AI in banking, insurance, and trading
- **Healthcare:** AI medical devices subject to CDSCO regulation
- **Courts:** Supreme Court draft AI regulations for courts published 3 Jun 2026; Gujarat High Court AI policy 4 Apr 2026
- **Digital India Act:** still a 2023 draft with no 2026 movement

### What This Means for Developers
1. **Label synthetic content now** - the IT Amendment Rules 2026 are in force
2. **DPDP compliance runs to May 2027** - build consent, notice and breach reporting; consent managers come first (Nov 2026)
3. **No AI-specific compliance regime** - but existing laws apply broadly
4. **AI governance guidelines are voluntary** but AIGEG now coordinates policy
5. **Data localization** requirements may affect where AI training data and models can be stored/processed

---

## Singapore

### Overview
Singapore is the **governance and standards leader** in Asia-Pacific. It has chosen **not** to pursue comprehensive AI legislation, instead developing voluntary frameworks, testing toolkits, and sector-specific guidance. In 2026 it added a Model AI Governance Framework for **Agentic AI** (Jan 2026, updated 20 May 2026), proposed PDPC guidelines on personal data in generative AI (Jun 2026), and brought the **Online Safety (Relief and Accountability) Act** into operation (29 Jun 2026).

### Key Frameworks

#### Model AI Governance Framework (2019, updated 2020)
- Voluntary guidelines for private sector AI deployment
- Covers transparency, accountability, fairness, and human oversight

#### Model AI Governance Framework for Generative AI (2024)
- Addresses foundation model risks, content provenance, and responsible deployment

#### Model AI Governance Framework for Agentic AI (Jan 2026, updated 20 May 2026)
- Safety and reliability components, multi-agent risk, platform versus application-developer roles, automation-bias monitoring, case studies
- IMDA Starter Kit for Testing LLM-Based Applications (Jan 2026)

#### AI Verify (Testing Framework)
- Voluntary certification and testing methodology; open-source AI Verify Foundation
- Global AI Assurance Sandbox (2025) for real-world testing; no further 2026 update found

#### National AI Strategy 2.0 (2023)
- Ambition for a trusted and responsible AI ecosystem; a National AI Council was announced in Budget 2026

### Sector-Specific Regulation

#### Monetary Authority of Singapore (MAS)
- **Veritas Toolkit** and **FEAT Principles** for AI in financial services
- Draft Guidelines on AI Risk Management for financial institutions (consultation Nov 2025 to Jan 2026); still draft as of mid-2026

#### Personal Data Protection Commission (PDPC)
- Enforces the Personal Data Protection Act (PDPA), which applies to AI processing personal data
- **Proposed Guidelines on Use of Personal Data in Generative AI** issued 2 Jun 2026 (consultation closed 1 Jul 2026): publicly-available exception for scraping, AI-specific notices, opt-out; not yet final

#### Online Safety (Relief and Accountability) Act 2025
- Passed 5 Nov 2025; Online Safety Commission operational **29 Jun 2026**
- Statutory torts for intimate image abuse, child abuse imagery, doxxing, harassment and stalking
- "Inauthentic material abuse" (generative AI and deepfakes) and impersonation torts deferred with no date yet

#### Other binding rules touching AI
- Elections (Integrity of Online Advertising) Act deepfake ban (in force 22 Jan 2025)
- Criminal Law (Miscellaneous Amendments) Act 2025 covers synthetic child abuse material
- MinLaw guide for generative AI in the legal sector (6 Mar 2026)

### ASEAN Guide on AI Governance and Ethics
- Expanded Guide (Jan 2025) covers generative AI
- Seven principles: transparency, fairness, security, reliability, human-centricity, privacy, accountability
- Non-binding but influential for regional alignment

### What This Means for Developers
1. **No omnibus AI law** - but PDPA applies, and statutory online-safety torts are live
2. **AI Verify and the agentic framework** provide a credible governance path for agent-based products
3. **Financial services AI** is subject to MAS requirements (Veritas, FEAT; draft AI risk guidelines)
4. **Election deepfakes and synthetic CSAM** are criminal offences
5. **ASEAN-wide standards are emerging** - Singapore-aligned governance will ease regional expansion

---

## ASEAN Region Highlights

### Vietnam - First Southeast Asian AI Law
- **Law on Artificial Intelligence No. 134/2025/QH15** passed 10 Dec 2025, **in force 1 Mar 2026** (separate from the Digital Technology Industry Law 71/2025/QH15)
- Three risk tiers; pre-deployment classification notice to the Ministry of Science and Technology portal; conformity assessment for high-risk systems
- Machine-readable tagging of AI audio and visual output; labelling of content simulating real people or events
- Administrative, civil and criminal liability; implementing decrees (portal, labelling format, penalties) were still pending as of March 2026 and later status is unverified

### Thailand
- Revised **Draft AI Act** (ETDA) released 2 Jul 2026; consultation closed 14 Aug 2026
- Risk-based with prohibited uses, high-risk duties, generative AI and deepfake transparency, extraterritorial reach, local representative, strict and joint liability (opposed by industry)
- No Cabinet approval as of late September 2026

### Indonesia
- Draft Presidential Regulation on a National AI Roadmap and ethics cleared inter-ministerial review and was awaiting the President's signature as of 29 Jul 2026; an AI law is to follow
- Builds on the PDP Law and cybersecurity frameworks

### Philippines
- House ICT committee consolidated 26 bills into a draft "AI Development and Regulation Act" substitute (13 Jul 2026); not passed
- Multiple deepfake bills under consideration

### Malaysia
- **AI Governance Bill** consultation paper from the National AI Office (10 Jul 2026, comments to 31 Jul 2026): central AI authority, three-tier risk, incident reporting, sandbox; tabling date not announced
- 13th Malaysia Plan (2026-2031) includes AI priorities; ASEAN AI Safety Network secretariat to be in Kuala Lumpur

### ASEAN
- 6th Digital Ministers' Meeting (Hanoi, 15-16 Jan 2026) adopted the Hanoi Digital Declaration; ASEAN Digital Masterplan 2026-2030 in preparation

---

## Executive Instruments to Watch

| Jurisdiction | Instrument class | Issuer | Where published | Current mandate ends |
|--------------|------------------|--------|-----------------|----------------------|
| India | Rules notified under the IT Act and DPDP Act, MeitY advisories, AIGEG decisions | Prime Minister Narendra Modi; MeitY (Minister Ashwini Vaishnaw) | Gazette of India (egazette.gov.in), meity.gov.in | Lok Sabha term to Jun 2029 |
| Singapore | IMDA frameworks, PDPC guidelines, MAS guidelines, Online Safety Commission codes | Prime Minister Lawrence Wong; IMDA, PDPC, MAS | imda.gov.sg, pdpc.gov.sg, mas.gov.sg | Parliament elected May 2025; election due by about Nov 2030 |
| Vietnam | Government decrees implementing the Law on AI (portal, labelling, penalties) | Prime Minister Le Minh Hung (elected Apr 7, 2026); General Secretary To Lam | vanban.chinhphu.vn | 14th Party term to 2031 |
| Thailand | ETDA drafts, Cabinet approvals | Cabinet, ETDA | ratchakitcha.soc.go.th | Government term |
| Malaysia | NAIO consultation papers, Cabinet decisions | National AI Office | ai.gov.my | Parliament term to 2027 |
| Indonesia | Presidential Regulations (AI roadmap) | President Prabowo Subianto | jdih.setneg.go.id | Oct 2029 |
| Philippines | House and Senate bills; DICT circulars | DICT | dict.gov.ph | Jun 2028 |

Executive instruments (orders, decrees, cabinet decisions, ministry measures, guidelines) do not expire when the issuing leader leaves office; they stay in force until revoked or superseded. The mandate-end date is the point at which revocation risk rises and is the date to re-verify every instrument listed above.

---

## Regional Comparison

| Country | AI Law Status | Approach | Key Framework |
|---------|-------------|----------|--------------|
| **India** | No AI law; binding SGI labelling rules (Feb 2026); DPDP phased to 2027 | Sectoral + existing laws | AI Governance Guidelines, IT Amendment Rules 2026 |
| **Singapore** | No AI law; online-safety torts live | Voluntary frameworks + sector rules | AI Verify, Model AI Governance (incl. Agentic) |
| **Vietnam** | AI law in force (1 Mar 2026) | Risk-based | Law on AI 134/2025/QH15 |
| **South Korea** | AI Basic Act in force (22 Jan 2026) | EU-style risk-based | AI Basic Act |
| **Japan** | AI Promotion Act (Jun 2025) | Innovation-first, principles | AI Guidelines for Business v1.2 |
| **Thailand** | Revised draft (Jul 2026) | Risk-based | ETDA Draft AI Act |
| **Indonesia** | Presidential regulation pending signature | Soft-law, sector-specific | National AI Roadmap |
| **Malaysia** | AI Governance Bill in consultation | Risk-based | NAIO consultation paper |
| **Philippines** | Consolidated House bill in drafting | Comprehensive framework planned | AI Development and Regulation Act (draft) |

---

## Resources

- [Freshfields on India's IT Amendment Rules 2026](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/india-targets-deepfakes-and-ai-generated-content-key-changes-under-meitys-2026-102mjwn)
- [FPF on the India AI Impact Summit](https://fpf.org/blog/taking-stock-the-impact-of-the-india-ai-impact-summit-2026/)
- [Singapore AI Verify](https://aiverifyfoundation.sg/)
- [Singapore Model AI Governance Framework](https://www.pdpc.gov.sg/)
- [MDDI: Online Safety Commission start](https://www.mddi.gov.sg/newsroom/online-safety-commission-and-online-safety--relief-and-accountability--act-2025-to-start-on-29-june-2026/)
- [MAS Veritas Toolkit](https://www.mas.gov.sg/)
- [ASEAN Guide on AI Governance and Ethics](https://asean.org/)
- [Allen & Gledhill on Vietnam's AI Law](https://www.allenandgledhill.com/vn/publication/articles/32667/s-new-law-on-artificial-intelligence-risk-based-regulatory-framework-in-force-1-march-2026)
- [Baker McKenzie on Malaysia's AI Governance Bill](https://www.bakermckenzie.com/en/insight/publications/2026/07/malaysia-public-consultation-on-the-ai-governance-bill)
- [India DPDPA 2023](https://www.meity.gov.in/)

---

*This document is research, not legal advice.*
