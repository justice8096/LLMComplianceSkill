# AI & LLM Software Development Regulations - United States

**Last Updated:** 2026-10-11 (rev. 2: Super Intelligence executive order added)
**Tags:** #ai-regulation #united-states #state-laws #federal-policy #software-development

---

## Overview

The United States has **no comprehensive federal AI law**. The regulatory landscape is defined by a growing patchwork of state-level laws, federal executive orders, agency guidance, and voluntary frameworks. The Trump administration (since Jan 2025) has pursued an "innovation-first" federal posture, revoking Biden-era safety requirements and actively pushing to preempt state regulations. States have continued to fill the gap: over 1,000 AI-related bills were introduced in 2025, and by July 2026 some 84 AI laws had been enacted in 27 states during the 2026 sessions. On 29 Sep 2026 an executive order directed the executive branch to use the terms "Super Intelligence" and "SI" in place of "Artificial Intelligence" and "AI"; it is a terminology change with no effect on any statute, regulation or state law (see below). Three states (California, New York, Illinois) now regulate frontier model developers directly, and the only comprehensive cross-sector state law (Colorado) was repealed and replaced with a narrower notice regime in May 2026 while federal litigation against it was pending.

---

## Federal Framework

### Executive Order 14179 (Jan 20, 2025)
- "Removing Barriers to American Leadership in AI"
- Revoked Biden's EO 14110 on safe and trustworthy AI
- Eliminated prior safety testing and reporting requirements for federal agencies
- Directed development of the federal AI Action Plan

### AI Action Plan (July 2025)
- "America's AI Action Plan" - roadmap for federal policy
- Over 90 policy actions across three pillars: accelerating innovation, building infrastructure, international diplomacy
- Not directly enforceable law but influences agency priorities and procurement
- Directed a revision of the NIST AI RMF; no draft revision had been published as of October 2026

### Genesis Mission Executive Order (Nov 24, 2025)
- DOE-led national AI platform for scientific research; infrastructure and data policy, not a compliance regime

### Executive Order 14365 (Dec 11, 2025)
- "Ensuring a National Policy Framework for Artificial Intelligence"
- Aims to preempt state AI laws
- **Implementation status as of October 2026:**
  - **AI Litigation Task Force** - announced by DOJ Jan 9, 2026. It has filed no standalone suit; DOJ instead joined xAI's challenge to Colorado's law (Apr 24, 2026)
  - **Commerce Department evaluation** of "onerous" state laws was due Mar 11, 2026; no public list had been released as of September 2026
  - **Federal funding restrictions** - no BEAD funds had been withheld as of July 2026; Commerce guidance slipped
  - **FTC policy statement** - issued Jul 1, 2026 as a *proposed* "Policy Statement Concerning the Suppression of Accuracy in AI Systems", arguing that state laws forcing output changes (naming Colorado) may be preempted by FTC Act section 5; comments closed Jul 31, 2026; not finalized
- **Carved-out areas** (exempt from preemption): child safety, AI infrastructure/data centers, state government AI procurement
- **Legal reality:** Executive orders cannot independently preempt state law; only Congress can do that

### Executive Order "Inaugurating the Era of Super Intelligence" (Sep 29, 2026)
- Directs executive departments and agencies to use **"Super Intelligence" and "SI"** in place of "Artificial Intelligence" and "AI" in official correspondence, public communications, websites, reports, policy documents and other non-statutory documents, "to the maximum extent permitted by law" (Secs. 1, 2(a))
- **Terminology only.** Sec. 3(a) defines SI as the technologies covered by the existing statutory definition of artificial intelligence in 15 U.S.C. 9401(3). Sec. 2(b) exempts previously issued regulations, Presidential actions, contracts, grants and historical documents. Sec. 4(c) creates no enforceable right. No statute, federal regulation, NIST publication, OMB memorandum or state law is changed
- **Deadline:** within 60 days (about **Nov 28, 2026**) the Assistant to the President for Science and Technology must submit proposed legislative language on whether the SI definition should supersede the statutory one, conforming amendments to statutory references, and further executive action (Sec. 3(b))
- A separate **White House Accord on Super Intelligence** was announced the same day: voluntary commitments by major US AI labs to internal controls and layered internal and external review. Signatories were not published; the House Speaker described the commitments as voluntary industry standards
- **Practical effect for developers:** federal procurement language, agency guidance and RFPs will start saying "SI"; statutes (CA SB 53, NY RAISE, IL SB 315, TX TRAIGA, CO SB 26-189), the EU AI Act and your contracts keep saying "AI". Treat the terms as synonyms in federal-facing documents and keep statutory names in compliance evidence
- Federal Register public inspection document 2026-20321

### White House National Policy Framework for AI (Mar 20, 2026)
- Non-binding legislative recommendations to Congress: preempt "unduly burdensome" state laws, limit state regulation of model development, limit developer liability for third-party misuse
- Carve-outs for child protection, zoning and state government use

### Federal Statutes and Bills
- **National AI Initiative Act (2020):** Funds AI research across federal agencies
- **AI Training Act (2022):** OMB must provide AI training for federal acquisition workforce
- **TAKE IT DOWN Act (May 2025):** Platforms had to stand up notice-and-removal for non-consensual intimate imagery (including AI-generated) by **May 19, 2026**; FTC launched TakeItDown.ftc.gov and sent compliance letters to 15 platforms. In force.
- **Great American AI Act (discussion draft, Jun 4, 2026):** Bipartisan House draft (Obernolte, Trahan) proposing a three-year preemption of state laws on model *development*, frontier-developer transparency, incident reporting to CAISI and licensed independent verification, with $1M per violation. Not introduced as a numbered bill; stalled.
- **Other 2026 bills in committee:** TRUMP AMERICA AI Act (Blackburn), GUARDRAILS Act (H.R. 8031 / S. 4216), AI Foundation Model Transparency Act (H.R. 8094), AI Data Center Moratorium Act (S. 4214), AI Risk Evaluation Act (S. 2938). DEFIANCE Act passed the Senate Jan 13, 2026.
- **No broad federal AI compliance law has been passed as of October 2026**

### NIST AI Risk Management Framework (RMF)
- Voluntary guidelines published 2023; AI RMF 1.0 remains current; Generative AI Profile (AI 600-1) unchanged
- Four functions: Govern, Map, Measure, Manage
- Center for AI Standards and Innovation (CAISI) running an AI agent standards initiative (Mar 2026); NIST expanded its AI consortium in May 2026
- Not legally binding but influential for demonstrating due diligence

---

## Major State Laws

### Colorado - SB 26-189 (signed May 14, 2026; effective Jan 1, 2027)
- **Repeals and replaces the Colorado AI Act (SB 24-205)**, which never took effect
- Narrower scope: "automated decision-making technology" in seven domains (education, employment, financial services, essential government services, healthcare, housing, insurance)
- **Deployers must:** give pre-use notice, adverse-decision notice with reasons, a 30-day reconsideration window and human review
- **Developers must:** provide documentation to deployers; both keep records for three years
- The duty of reasonable care, impact assessments and risk-management program from SB 24-205 were **dropped**
- Attorney General enforcement only; up to **$20,000 per violation**; 60-day cure period until Jan 1, 2030; AG rulemaking required before enforcement
- **Litigation:** xAI sued Apr 9, 2026 (D. Colo.); DOJ filed a companion complaint Apr 24, 2026; a stipulated order (Apr 27, 2026) pauses AG enforcement until 14 days after a preliminary-injunction ruling, which xAI will seek after final AG rulemaking. The order extends to SB 26-189.

### California - Frontier AI, Transparency and the 2026 Session

| Law | Effective | Key Requirement |
|-----|-----------|----------------|
| **Transparency in Frontier AI Act (SB 53)** | Jan 1, 2026 | Frontier developers (>10^26 FLOPS training) must publish risk frameworks, report safety incidents, implement whistleblower protections; large developers (>$500M revenue) face enhanced obligations; penalties up to $1M/violation |
| **AI Training Data Transparency Act (AB 2013)** | Jan 1, 2026 | Disclose training data sources for generative AI |
| **Companion Chatbot Act (SB 243)** | Jan 1, 2026 | Disclosure, suicide-prevention protocols, minor protections, annual reporting; private right of action |
| **AI Transparency Act (SB 942, as amended by SB 1000 and AB 2713)** | Aug 2, 2026; amendments effective on signing Sep 30, 2026 | GenAI providers must offer latent disclosures and provenance; the 1M-monthly-user threshold was removed and the detection tool replaced with a disclosure verification tool |
| **CCPA ADMT and risk-assessment regulations** | Risk assessments from Jan 1, 2026; ADMT compliance Jan 1, 2027 | Pre-use notice, opt-out and access rights for automated decisionmaking technology; first risk-assessment submissions due Apr 1, 2028; cybersecurity audit certifications phased 2028-2030 |
| **Civil Rights Dept. AI Regulations** | Oct 2025 | Restrict discriminatory use of AI in employment |
| **Common Pricing Algorithm ban** | Jan 1, 2026 | Prohibits AI-driven price-fixing algorithms |

**Signed in September 2026 (effective Jan 1, 2027 unless noted):**
- SB 947 "No Robo Bosses": no discipline or termination based solely on an automated decision system; human review required
- SB 951: 90-day notice for AI-driven displacement of 25% or more of a workforce
- SB 813: independent AI verification organizations; AB 1405: AI auditor registry (obligations from 2029)
- SB 1119: audits of companion chatbots used by minors, with a private right of action; SB 867: ban on companion chatbots in toys
- AB 1609: customer-service chatbot disclosure; SB 1050: synthetic performers in advertising; SB 1111: digital replicas
- AB 1331 / AB 1883: workplace surveillance and neural data; AB 1979 / SB 503: healthcare AI; SB 574: AI use by lawyers and judges
- SB 1159: an AI system is not a legal "person"; AB 2392: public university generative AI procurement
- AB 1709: under-16 addictive feeds; AB 2246: replaces the Age-Appropriate Design Code
- **Vetoed:** AB 2575 (clinician override), SB 903 (AI in psychotherapy), AB 1542 (sensitive personal information)

### Texas - Texas Responsible Artificial Intelligence Governance Act (TRAIGA, HB 149) - Effective Jan 1, 2026
- Prohibits AI built for manipulation, unlawful discrimination, social scoring or certain biometric uses
- Disclosure duties for government use; regulatory sandbox; AG enforcement with cure period

### Illinois
- **HB 3773 (Public Act 103-0804), in force Jan 1, 2026:** Amends the Human Rights Act to prohibit employer use of AI that discriminates against protected classes; notice required
- **SB 315 AI Safety Measures Act (signed Jul 6, 2026; effective Jan 1, 2027):** Frontier developers must publish safety practices, report incidents, maintain whistleblower channels and (first in the nation) obtain annual independent third-party audits
- **AI Video Interview Act:** Employer notice and candidate consent when AI analyzes video interviews

### New York
- **NYC Local Law 144:** Bias audits and disclosure for automated employment decision tools (in effect)
- **RAISE Act (signed Dec 19, 2025; chapter amendment Mar 27, 2026; effective Jan 1, 2027):** Frontier models (>10^26 FLOPS) from large developers (>$500M revenue) must publish safety frameworks and transparency reports, report incidents within 72 hours and file quarterly internal-risk summaries; DFS oversight office; AG penalties $1M first / $3M subsequent
- **Awaiting the Governor (deadline Dec 31, 2026):** S 9051 (kids' chatbots, private right of action), A 6578 (training data transparency), S 6954 (provenance), A 9349 (surveillance pricing ban), A 11560 (data-center moratorium)

### Connecticut - SB 5 / Public Act 26-15 (signed Jun 2, 2026)
- Phased: Oct 1, 2026 (automated employment decision tool framework, frontier-developer anti-retaliation, provenance for services with >1M users); Jan 1, 2027 (AI companion rules); Oct 1, 2027 (employer AEDT notices); Jan 1, 2028 (youth platform rules)
- Use of an AEDT is no defense to a discrimination claim

### Washington - HB 2225 (signed Mar 24, 2026; effective Jan 1, 2027)
- Companion chatbots: disclosure every three hours (hourly for minors), self-harm protocols, private right of action through the Consumer Protection Act

### Utah
- Requires disclosure when consumers interact with generative AI (AI Policy Act, 2024, amended 2025)
- 2026 chatbot-safety and deepfake bills (HB 438, HB 276, SB 256) were considered; HB 286 (chatbot safety plans) stalled after White House objection in Feb 2026; final enactment status of the others is unverified

### Other 2026 Enactments (verify bill numbers before relying on them)
- Maryland and Colorado: algorithmic / surveillance pricing bans
- Vermont: neural data protections
- Nebraska LB 771: dynamic pricing disclosure
- Oklahoma SB 1521: companion chatbots
- New Jersey A 3497 (FAIR Act, Jul 20, 2026): algorithmic rent setting
- Virginia: no comprehensive AI law (HB 2094 vetoed in 2025; nothing comparable passed in 2026)

---

## Federal-State Tension

- State laws remain enforceable until Congress passes preemptive federal legislation or courts strike them down
- The Commerce "onerous laws" list has not appeared; the FTC preemption theory is still a proposal
- The xAI / DOJ challenge to Colorado is the test case; a preliminary-injunction ruling will follow AG rulemaking
- **Prudent approach:** Continue complying with state laws until there is clarity
- The 19 or more state privacy laws with automated decision-making provisions add additional complexity

---

## Copyright Litigation Affecting AI Developers

- **Bartz v. Anthropic:** $1.5B class settlement received final approval Jul 20, 2026 (N.D. Cal.); the 2025 ruling found training on lawfully acquired books to be fair use but pirated copies not
- **Thomson Reuters v. Ross:** Third Circuit affirmed (early Oct 2026) that training a *non-generative* legal research tool on Westlaw headnotes was not fair use, expressly distinguishing generative AI
- New suits continue (Gannett/USA Today v. OpenAI, Oct 2026); Concord v. Anthropic summary judgment hearing Oct 21, 2026

---

## Sector-Specific Federal Regulation

Federal agencies continue applying existing authority to AI:
- **FTC:** Consumer protection, unfair/deceptive AI practices; TAKE IT DOWN Act enforcement
- **EEOC:** Employment discrimination via AI hiring tools
- **FDA:** AI in medical devices and healthcare
- **SEC/CFPB:** AI in financial services, lending, credit scoring
- **HUD:** AI in housing decisions
- **DOE/DOD:** AI in energy and defense applications

---

## What This Means for Developers

1. **No single federal compliance standard** - prepare for multi-state compliance
2. **Frontier model developers** now face overlapping regimes in California (SB 53, in force), New York (RAISE, Jan 2027) and Illinois (SB 315, Jan 2027, with mandatory third-party audits)
3. **Colorado is narrower and paused** - the Jan 1, 2027 notice regime replaces the duty-of-care model; watch the xAI litigation
4. **Companion and customer-service chatbots** are the fastest-growing target: California, Washington, Connecticut and Oklahoma all impose disclosure and minor-safety duties
5. **Employment AI is heavily targeted** - bias audits, disclosure, consent and human-review requirements are spreading (CA SB 947, CT, IL, NYC)
6. **Monitor the federal preemption battle** - but do not rely on it to eliminate state obligations
7. **NIST AI RMF** is a strong voluntary framework for demonstrating responsible practices
8. **Document everything** - risk assessments, training data, and decision processes; CCPA ADMT rules bite Jan 1, 2027
9. **AI-generated content labeling** requirements are proliferating - build provenance and disclosure into your pipeline

---

## Key Compliance Deadlines

| Date | Law/Action |
|------|-----------|
| Jan 1, 2026 | CA SB 53, CA AB 2013, CA SB 243, TX TRAIGA, IL HB 3773 (in force) |
| May 19, 2026 | TAKE IT DOWN Act platform compliance (in force) |
| Aug 2, 2026 | CA SB 942 AI Transparency Act (in force; amended Sep 30, 2026) |
| Sep 29, 2026 | Executive order: "Super Intelligence" / "SI" terminology for the executive branch (in force; no legal change) |
| Oct 1, 2026 | CT Public Act 26-15 phase 1 |
| ~Nov 28, 2026 | APST proposed legislative language on an SI definition due to the President |
| Jan 1, 2027 | CO SB 26-189; NY RAISE Act; IL SB 315; WA HB 2225; CT phase 2; CA CCPA ADMT rules; most California Sep 2026 signings |
| Oct 1, 2027 | CT employer AEDT notices |
| Apr 1, 2028 | First CCPA risk-assessment submissions |

---

## Resources

- [NIST AI RMF](https://www.nist.gov/artificial-intelligence)
- [NCSL AI Legislation Database](https://www.ncsl.org/technology-and-communication/artificial-intelligence-2026-legislation)
- [Colorado General Assembly](https://leg.colorado.gov/)
- [Executive Order: Inaugurating the Era of Super Intelligence (Sep 29, 2026)](https://www.whitehouse.gov/presidential-actions/2026/09/inaugurating-the-era-of-super-intelligence/)
- [IAPP analysis of the SI order](https://iapp.org/news/a/ai-by-any-other-name-white-house-directs-federal-agencies-to-enter-the-era-of-super-intelligence)
- [FTC proposed policy statement on AI accuracy (Jul 2026)](https://www.ftc.gov/legal-library/browse/federal-trade-commissions-proposed-policy-statement-concerning-suppression-accuracy-artificial)
- [FTC TAKE IT DOWN Act enforcement](https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act)
- [Governor Newsom, Sep 30, 2026 AI signings](https://www.gov.ca.gov/2026/09/30/californias-nation-leading-ai-framework-just-got-stronger-governor-newsom-signs-more-first-in-the-nation-worker-protections-and-more/)
- [Illinois SB 315 announcement](https://gov-pritzker-newsroom.prezly.com/gov-pritzker-signs-nation-leading-artificial-intelligence-safety-law)
- [Transparency Coalition state tracker](https://www.transparencycoalition.ai/news)
- [Regulations.ai - US AI Legislation](https://regulations.ai) - global AI law and regulation database

---

*This document is research, not legal advice.*
