# AI & LLM Software Development Regulations - Japan & South Korea

**Last Updated:** 2026-10-11
**Tags:** #ai-regulation #japan #south-korea #apac #software-development

---

## Japan

### Overview
Japan has adopted a **light-touch, innovation-first approach** to AI governance. The **AI Promotion Act** (passed May 2025, in effect 4 Jun 2025) is a principles-based law that encourages AI development and cooperation but carries no penalties. The Cabinet adopted the first **AI Basic Plan** on 23 Dec 2025 and a revised plan on 14 Jul 2026 built around "responsible agile governance". The one binding change in 2026 is the **APPI amendment** (Act No. 56 of 2026, promulgated 17 Jul 2026), which adds a statistical-creation exception that eases third-party data provision for AI training and gives the Personal Information Protection Commission a new surcharge power.

### AI Promotion Act (May 2025)
- Approved by the Diet; in effect 4 Jun 2025
- Follows an "innovation-first" philosophy, lighter than the EU AI Act
- Principles-based: sets expectations for businesses to cooperate with AI governance principles
- Key principles include transparency, risk mitigation, and international cooperation
- Creates a PM-chaired **AI Strategy Headquarters** and requires an AI Basic Plan
- Empowers the government to investigate, issue warnings and guidance
- **No penalties** - relies on reputational pressure, guidance, and cooperation duties

### AI Basic Plan
- First plan adopted by Cabinet 23 Dec 2025
- Revised plan adopted 14 Jul 2026: "responsible agile governance", a stronger evaluation role for the Japan AI Safety Institute, and rules for government use of AI agents

### AI Guidelines for Business (Version 1.2, 31 Mar 2026)
- Voluntary guidelines published by METI and MIC; v1.0 (2024) was updated to v1.1 and then v1.2
- Cover risk management, transparency, accountability, human oversight and, from v1.2, agentic AI
- Intended for developers and deployers of AI systems
- Not legally binding but influential for enterprise buyers and B2B relationships

### Hiroshima AI Process
- Japan-led G7 initiative for global AI governance, particularly for generative AI
- Established international guiding principles and a voluntary code of conduct for advanced AI developers
- The OECD Hiroshima AI Process Reporting Framework v2.0 launched 28 May 2026

### Existing Laws Applying to AI
- **Act on the Protection of Personal Information (APPI):** Applies to AI processing of personal data. **Amended by Act No. 56 of 2026** (passed 10 Jul, promulgated 17 Jul 2026): a "statistical creation" exception allows third-party provision of personal data, including for AI training, without consent under conditions; new PPC surcharge power (Art. 148-3) where 1,000 or more individuals are affected; guardian consent for under-16s; a specified biometric data category. Criminal penalties take effect 17 Jan 2027; the main reforms commence by Cabinet Order no later than 17 Jul 2028.
- **Copyright Act Art. 30-4:** The Agency for Cultural Affairs updated its "General Understanding on AI and Copyright" in May 2026, affirming the training exemption while flagging style-substituting outputs for scrutiny (single secondary source; unverified)
- **Unfair Competition Prevention Act:** Applies to AI misuse in business
- **Product liability and consumer protection laws** apply to AI products
- Sector-specific regulations in finance, healthcare, and telecommunications

### AI Safety Institute
- Japan AI Safety Institute conducts evaluations and testing of advanced AI models
- Evaluation guide v1.20 (Jul 2026) adds AI-agent evaluation; AI robotics safety guide published Jul 2026
- Digital Agency generative AI guideline v2.0 for central government (Jun 2026)
- International collaboration through the International Network for Advanced AI Measurement, Evaluation and Science

### What This Means for Developers
1. Japan is innovation-friendly - no heavy compliance burden yet, and none is scheduled
2. Voluntary guidelines (v1.2) should be followed to build trust with Japanese enterprise clients
3. APPI applies if you process personal data of Japanese individuals; the 2026 amendment will ease training-data sourcing but adds surcharges for violations
4. Monitor the AI Basic Plan revisions for any shift toward mandatory rules for high-impact AI
5. Japan's AI Safety Institute guides shape pre-deployment expectations for frontier models and agents

---

## South Korea

### Overview
South Korea passed the **AI Basic Act** (Framework Act on AI Development and Trust) in December 2024, the **first comprehensive national AI law in Asia-Pacific** and the second globally after the EU. The law and its Enforcement Decree (Presidential Decree No. 36053, signed 21 Jan 2026) have been **in force since 22 Jan 2026**. MSIT has deferred investigations and administrative fines for at least one year (to around January 2027), except in cases of serious harm. Four amendment bills were introduced between July and September 2026, and a PIPA amendment promulgated 8 Sep 2026 adds a personal-information use exception for AI development.

### AI Basic Act - Key Provisions

#### Risk-Based Classification
The law distinguishes between:
- **High-Impact AI:** Systems in energy, drinking water, healthcare, medical devices, nuclear, biometrics, employment, credit evaluation, transportation, public services and student evaluation, determined by a two-step significance test under MSIT's determination guidelines (29 Jan 2026)
- **High-Performance AI:** Models trained with 10^26 FLOPs or more face safety assurance duties (Art. 32)
- **Generative AI:** Transparency and labeling duties (Art. 31)
- **Other AI Systems:** Lower-risk applications with lighter requirements

#### Requirements for High-Impact AI
| Obligation | Detail |
|-----------|--------|
| **Risk assessment** | Comprehensive assessment of impact on fundamental rights (impact assessment guideline, Jan 2026) |
| **Human oversight** | Meaningful human monitoring and intervention capability at all times |
| **Disclosure** | Advance notice that a service uses generative or high-impact AI; label generative outputs; deepfake outputs must be notified and labeled |
| **Documentation** | All AI risks and controls must be assessed, documented, and addressed |
| **Local representative** | Required for foreign providers with revenue of KRW 1 trillion or more, AI revenue of KRW 10 billion or more, or 1 million or more daily Korean users |
| **Bias monitoring** | Ongoing monitoring for discriminatory outcomes |

#### Guidelines issued at commencement
- Safety assurance guideline (Art. 32), high-impact operator obligations guideline (Art. 34), impact assessment guideline (22 Jan 2026)
- Transparency guideline revised 27 Jan 2026; high-impact determination guideline 29 Jan 2026

#### AI Safety Institute
- Mandated by the Act
- Conducts research and testing on AI safety
- Provides technical guidance to regulators and industry

#### AI Ethics
- Encourages establishment of ethics committees within organizations
- MSIT/KISDI second draft AI Ethics Principles published 14 Aug 2026

### Integration with Existing Laws
The AI Basic Act works alongside:
- **Personal Information Protection Act (PIPA):** Requires user consent, limits data collection scope, applies to AI processing personal data. PIPC guidance: AI Privacy Risk Management Model (Dec 2024), Generative AI Personal Information Processing Guidelines (Aug 2025), recommendations to generative AI companies on training-use disclosure, retention and opt-out (4 Mar 2026), revised pseudonymisation guidelines (31 Mar 2026). **PIPA amendment promulgated 8 Sep 2026** adds a use exception for AI development (effective date unverified).
- **Copyright:** MCST guide on fair use for generative-AI training (18 May 2026)
- **Network Act:** Governs digital services including AI-powered platforms; an amendment bill (8 Oct 2026) would add usage alerts and time limits for minors using conversational generative AI
- **Product Liability Act:** Covers damages caused by AI products
- **Credit Information Act:** Applies to AI in financial services

### Enforcement
- Administrative fines up to **KRW 30 million** for failure to notify AI use, failure to appoint a domestic representative, or violating corrective orders
- **Grace period:** MSIT will not run fact-finding investigations or impose fines for at least one year from 22 Jan 2026, except for serious harm
- Pending amendment bills (Jul-Sep 2026): labeling exemptions for editing tools and cultural products; human-rights and anti-discrimination duties; differentiated generative-AI disclosure; conversational-AI disclosure

### What This Means for Developers
1. **The Act is in force** - obligations apply now, with fines deferred until around January 2027
2. High-impact AI in the listed domains faces strict requirements; run the two-step determination test
3. **Foreign companies** over the revenue or user thresholds must appoint a local representative
4. **User disclosure** is mandatory when AI generates content or makes decisions; deepfakes need explicit labels
5. **Risk assessments and documentation** are required, not optional
6. PIPA's personal data requirements layer on top of AI Basic Act obligations; the 2026 amendment eases training-data use
7. South Korea's framework closely mirrors EU AI Act structure, so EU compliance work can be reused

---

## Comparison

| Aspect | Japan | South Korea |
|--------|-------|-------------|
| Comprehensive AI law | AI Promotion Act (principles-based) | AI Basic Act (binding, risk-based) |
| Effective date | 4 Jun 2025 | 22 Jan 2026 (in force) |
| Approach | Innovation-first, soft law | EU-style, risk-based |
| Penalties | None (guidance, warnings) | Fines up to KRW 30M; one-year grace period |
| High-risk classification | Not formalized | Yes - 11 listed domains plus 10^26 FLOPs high-performance tier |
| AI Safety Institute | Yes | Yes (mandated by law) |
| Local representative required | No | Yes (thresholds above) |
| Content labeling | Voluntary | Mandatory for generative and deepfake content |

---

## Resources

- [Japan AI Basic Plan (CAO)](https://www8.cao.go.jp/cstp/ai/)
- [Japan AI Guidelines for Business (METI)](https://www.meti.go.jp/)
- [A&O Shearman on the 2026 APPI amendments](https://www.aoshearman.com/en/insights/ao-shearman-on-data/amendments-to-the-act-on-the-protection-of-personal-information-promulgated)
- [South Korea AI Basic Act](https://www.law.go.kr/)
- [Kim & Chang on the AI Basic Act commencement](https://www.kimchang.com/en/insights/detail.kc?sch_section=4&idx=33805)
- [Cooley: South Korea AI Basic Act overview](https://www.cooley.com/news/insight/2026/2026-01-27-south-koreas-ai-basic-act-overview-and-key-takeaways)
- [US ITA market intelligence: South Korea AI Basic Act](https://www.trade.gov/market-intelligence/south-korea-ai-basic-act)
- [Regulations.ai - Japan and South Korea](https://regulations.ai) - global AI law and regulation database

---

*This document is research, not legal advice.*
