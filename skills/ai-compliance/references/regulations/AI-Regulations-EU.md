# AI & LLM Software Development Regulations - European Union

**Last Updated:** 2026-10-11
**Tags:** #ai-regulation #eu #eu-ai-act #compliance #software-development

---

## Overview

The EU AI Act (Regulation 2024/1689) is the world's first comprehensive AI-specific law. It entered into force on 1 August 2024 and is being phased in through August 2028. It applies to any organization that develops, deploys, or distributes AI systems in the EU market, regardless of where the organization is based.

The **Digital Omnibus on AI** (Regulation (EU) 2026/1744, in force 27 July 2026) amended the Act before most of its obligations applied. It postponed the high-risk rules by 16 to 24 months, added one new prohibition, softened the AI literacy duty, and gave the AI Office direct enforcement powers. The transparency duties in Article 50 and the penalty regime applied on schedule on 2 August 2026.

---

## Key Legislation

### EU AI Act - Phased Implementation Timeline (as amended by the Digital Omnibus)

| Date | What Applies |
|------|-------------|
| **2 Feb 2025** | Prohibited AI practices banned; AI literacy obligations begin for all providers and deployers |
| **2 Aug 2025** | Governance infrastructure operational; obligations for general-purpose AI (GPAI) model providers begin |
| **2 Aug 2026** | Article 50 transparency duties (chatbot disclosure, deepfake and synthetic content labelling, emotion recognition notices); Article 99 penalty regime; Commission and AI Office enforcement powers over GPAI providers (Arts. 91-101) |
| **2 Dec 2026** | End of the grace period for Article 50(2) machine-readable marking on systems placed on the market before 2 Aug 2026; new prohibition on intimate-imagery and CSAM generators fully applies |
| **2 Aug 2027** | GPAI models placed on the market before 2 Aug 2025 must comply; Member State regulatory sandboxes must be operational |
| **2 Dec 2027** | Stand-alone high-risk AI systems (Annex III): conformity assessment, risk management, documentation, registration, human oversight |
| **2 Aug 2028** | High-risk AI systems embedded in regulated products (Annex I: medical devices, vehicles, aviation and similar) |

> **Note:** The Omnibus set fixed dates. The Commission's earlier idea of tying the high-risk start to the availability of harmonised standards was dropped during trilogue. Machinery Regulation products were largely carved out of the Annex I list.

### Digital Omnibus on AI - Regulation (EU) 2026/1744 (Enacted)
- Political agreement 6 May 2026; signed 8 Jul 2026; published in the Official Journal 24 Jul 2026; in force 27 Jul 2026
- Postpones Annex III high-risk obligations to 2 Dec 2027 and Annex I to 2 Aug 2028
- Adds a new Article 5 prohibition on AI systems built to generate non-consensual intimate imagery or child sexual abuse material (transition to 2 Dec 2026)
- Softens Article 4 AI literacy from "ensure" to "take measures to support"
- Gives the AI Office exclusive competence over AI systems built on a provider's own GPAI model and over systems integrated in very large online platforms and search engines, with inspection and fining powers

### EU Cloud and AI Development Act (Proposed)
- Commission proposal COM(2026) 502 adopted 3 Jun 2026; in first reading in Parliament and Council
- Aims to triple EU data-centre capacity and create an EU-wide cloud and AI sovereignty assessment framework
- Complements the AI Act with cloud capacity and data sovereignty provisions

### Data Act (In force)
- Applicable since 12 Sep 2025; the ban on cloud switching charges takes full effect 12 Jan 2027
- The data strand of the Digital Omnibus proposes amendments (trade-secret refusals, transitional switching exemptions, folding in the Data Governance Act); Council compromise text July 2026, not yet adopted

---

## Risk-Based Classification System

The AI Act categorizes AI systems into four tiers:

### 1. Unacceptable Risk (Prohibited)
- Social scoring by governments
- Real-time remote biometric identification in public spaces (with exceptions)
- AI systems that manipulate behavior through deception
- Predictive policing based solely on profiling
- Emotion recognition in workplace/education settings
- Untargeted scraping of facial images for databases
- AI systems designed to generate non-consensual intimate imagery or child sexual abuse material (added by the Omnibus, 2026)

### 2. High-Risk AI Systems (obligations from 2 Dec 2027 / 2 Aug 2028)
Systems used in critical areas requiring conformity assessments, technical documentation, risk management, human oversight, and EU database registration:
- Biometric identification and categorization
- Critical infrastructure management
- Education and vocational training (e.g., grading, admissions)
- Employment and worker management (recruitment, evaluation)
- Access to essential services (credit scoring, insurance)
- Law enforcement and border control
- Administration of justice

Draft Commission guidelines on high-risk classification (Art. 6) were published 19 May 2026 for consultation; the final version had not been adopted as of October 2026.

### 3. Limited Risk (Transparency Obligations - in force since 2 Aug 2026)
- Chatbots must disclose they are AI
- AI-generated content must be labeled (deepfakes, synthetic text for public interest)
- Emotion recognition / biometric categorization systems must inform users
- Final Commission guidelines on Article 50 adopted 20 Jul 2026; a voluntary Code of Practice on marking and labelling AI-generated content was published 10 Jun 2026 and found adequate by the Commission on 8 Jul 2026

### 4. Minimal / No Risk
- No specific obligations (e.g., spam filters, AI in video games)

---

## General-Purpose AI (GPAI) Model Rules

Effective since August 2025, providers of GPAI models must:

- Maintain and provide technical documentation
- Publish a public summary of training data content (using Commission template)
- Comply with EU copyright law
- Cooperate with downstream providers

**GPAI models with systemic risk** (e.g., models trained with >10^25 FLOPS) have additional obligations:
- Model evaluation and adversarial testing
- Incident tracking and reporting
- Cybersecurity protections
- Energy consumption reporting

A **Code of Practice** for GPAI models (July 2025) provides a compliance pathway. Since 2 Aug 2026 the AI Office can enforce GPAI obligations directly. On 1 Sep 2026 it sent its first Article 91 requests for information to more than 30 GPAI providers covering safety, copyright and transparency. No fines had been issued under the AI Act as of October 2026. Updated GPAI guidelines set an indicative threshold of 10^23 FLOPs for a model to count as general-purpose.

---

## Harmonised Standards

CEN/CENELEC JTC 21 is drafting the harmonised standards that give a presumption of conformity for high-risk systems under standardisation request M/613 (expires 28 Feb 2027). As of mid-2026 the quality management standard (EN 18286) was at formal vote and the risk management, logging and cybersecurity standards were at enquiry stage. None had been cited in the Official Journal as of October 2026, so no presumption of conformity is yet available.

---

## Open Source Exemptions

The AI Act provides limited exemptions for open-source AI:
- AI systems released under free/open-source licenses are generally exempt **unless** they fall under prohibited, high-risk, or transparency-risk categories
- Open-source GPAI models are exempt from documentation/summary requirements **unless** they pose systemic risk (>10^25 FLOPS threshold)
- The exemption does **not** apply to providers of GPAI models that make them available with a commercial license or monetize them

---

## Compliance Requirements for Software Developers

### If You Build AI Systems (Provider):
1. **Classify your system's risk level** per Annex III
2. **Conduct conformity assessments** for high-risk systems
3. **Implement risk management systems** - ongoing, iterative process
4. **Maintain technical documentation** - data governance, training data, testing
5. **Ensure human oversight** - design for meaningful human control
6. **Register high-risk systems** in EU database before deployment
7. **Affix CE marking** upon compliance
8. **Report serious incidents** to market surveillance authorities

### If You Deploy AI Systems (Deployer):
1. **Use systems according to provider instructions**
2. **Ensure human oversight** by competent individuals
3. **Monitor system performance** and report issues
4. **Conduct fundamental rights impact assessments** for high-risk public-sector uses
5. **Inform individuals** when subject to high-risk AI decisions

### AI Literacy (All Operators - Effective Feb 2025, softened Jul 2026):
- Take measures to support sufficient AI literacy among staff involved in AI operations
- Consider technical knowledge, experience, education, and training context

---

## Executive Instruments to Watch

| Instrument class | Issuer | Where published | Current mandate ends |
|------------------|--------|-----------------|----------------------|
| Delegated and implementing acts under the AI Act (Annex III updates, GPAI thresholds, templates) | European Commission (President Ursula von der Leyen, College 2024-2029) | Official Journal (EUR-Lex) | Oct 31, 2029 |
| Guidelines, Codes of Practice, AI Office decisions, requests for information | Commission / AI Office | digital-strategy.ec.europa.eu | Oct 31, 2029 |
| Harmonised standards citations | Commission (on CEN/CENELEC delivery) | Official Journal C series | Standardisation request M/613 expires Feb 28, 2027 |
| Member State implementing laws and authority designations | National governments | National gazettes; Commission market-surveillance page | Varies by Member State |

Executive instruments (orders, decrees, cabinet decisions, ministry measures, guidelines) do not expire when the issuing leader leaves office; they stay in force until revoked or superseded. The mandate-end date is the point at which revocation risk rises and is the date to re-verify every instrument listed above.

---

## National Authorities

Member States had to designate market surveillance authorities by 2 Aug 2025. As of August 2026 the following had enacted implementing laws or designations: Cyprus, Denmark (partial), Finland, Germany (KI-MIG, in force 29 Jul 2026, Bundesnetzagentur), Hungary, Ireland (Regulation of AI Act 2026, signed 21 Jul 2026), Italy (Law 132/2025, ACN), Lithuania, Malta, Poland (in force 11 Aug 2026, penalties from 28 Oct 2026) and Sweden. Spain's draft organic law was approved by the government on 26 May 2026; the Netherlands, Luxembourg, Slovenia and France were still pending.

---

## Penalties

| Violation | Maximum Fine |
|-----------|-------------|
| Prohibited AI practices | EUR 35M or 7% of global annual turnover |
| High-risk system non-compliance | EUR 15M or 3% of global annual turnover |
| Incorrect information to authorities | EUR 7.5M or 1% of global annual turnover |

Individual Member States may impose additional penalties (e.g., Italy's Law No. 132/2025 adds disqualification measures). The penalty regime has applied since 2 Aug 2026.

---

## Key Dates for Developers to Watch

- **2 Dec 2026:** Machine-readable marking grace period ends; new Article 5 prohibition fully applies
- **12 Jan 2027:** Data Act switching-charge ban fully effective
- **28 Feb 2027:** Harmonised standards request M/613 expires; standards expected in the Official Journal before then
- **2 Aug 2027:** Legacy GPAI models must comply; sandboxes operational
- **2 Dec 2027:** Annex III high-risk obligations apply
- **2 Aug 2028:** Annex I embedded high-risk obligations apply
- **Throughout 2026-2027:** Remaining Member States designating national regulators; Cloud and AI Development Act negotiations

---

## Resources

- [EU AI Act Official Text](https://artificialintelligenceact.eu/)
- [European Commission AI Page](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- [GPAI Code of Practice](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai)
- [Code of Practice on marking and labelling AI-generated content](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-code-practice-marking-and-labelling-ai-generated-content)
- [Draft guidelines on high-risk classification](https://digital-strategy.ec.europa.eu/en/library/draft-commission-guidelines-classification-high-risk-ai-systems)
- [Cloud and AI Development Act proposal](https://digital-strategy.ec.europa.eu/en/library/proposal-cloud-and-ai-development-act-cada)
- [Market surveillance authorities under the AI Act](https://digital-strategy.ec.europa.eu/en/policies/market-surveillance-authorities-under-ai-act)
- [NIST AI RMF](https://www.nist.gov/artificial-intelligence) (complementary US framework)
- [ISO/IEC 42001](https://www.iso.org/standard/81230.html) - AI Management System standard
- [Regulations.ai - EU AI Act](https://regulations.ai) - global AI law and regulation database

---

## Key Takeaway for Developers

If you are building LLM-powered applications, chatbots, or AI-integrated software for EU users:
- You **must** disclose AI interaction to users (transparency) - in force now
- You **must** label AI-generated content, with machine-readable marking by 2 Dec 2026
- You **must** have a risk classification for your system
- High-risk deployments require full conformity assessment and documentation from 2 Dec 2027 (Annex III) or 2 Aug 2028 (Annex I)
- GPAI model providers must document training data and comply with copyright; the AI Office is now actively requesting information
- The high-risk delay is a reprieve, not a cancellation; harmonised standards are expected before Feb 2027

---

*This document is research, not legal advice.*
