# AI & LLM Software Development Regulations - Canada

**Last Updated:** 2026-10-11
**Tags:** #ai-regulation #canada #aida #pipeda #software-development

---

## Overview

Canada was an early mover in AI governance. It launched the world's first national AI strategy in 2017 and proposed the Artificial Intelligence and Data Act (AIDA) as part of Bill C-27 in 2022. AIDA **died on the order paper in January 2025** when Parliament was prorogued. As of October 2026, Canada still has **no enacted federal AI-specific legislation**. The Carney government has confirmed the direction: the renewed national strategy "AI for All" (4 Jun 2026) rules out a standalone AI act and regulates through targeted bills. The main vehicles are **Bill C-36** (new private-sector privacy law, tabled 15 Jun 2026) and **Bill C-34** (Safe Social Media Act, 10 Jun 2026), which covers AI chatbots. Both await second reading.

---

## AIDA - What It Would Have Done (For Context)

The Artificial Intelligence and Data Act was part of Bill C-27 (Digital Charter Implementation Act, 2022):
- **Risk-based approach** targeting "high-impact" AI systems
- Seven categories of high-impact use: biometric identification, critical infrastructure, health/safety services, criminal justice, financial services, employment, and content moderation
- Required impact assessments, transparency, bias mitigation, and documentation
- Created an AI and Data Commissioner role
- Penalties: Up to **CAD 25 million or 5% of global revenue** for non-compliance
- Criminal charges possible for unauthorized use of personal data, deploying harmful AI systems, or fraudulent AI use
- Faced significant criticism: vague definitions, lack of stakeholder engagement, insufficient labor rights focus
- **Status: Dead.** Not re-introduced; Bill C-36 contains no AIDA-style AI chapter

---

## Current Regulatory Landscape

### Federal

#### Existing Privacy Law - PIPEDA
- Personal Information Protection and Electronic Documents Act remains in force
- Applies to AI systems processing personal data in the private sector
- Requires consent for data collection/use, transparency, and accountability
- **OPC finding on OpenAI (6 May 2026, PIPEDA #2026-002):** joint investigation with Quebec's CAI and the BC and Alberta commissioners found ChatGPT's initial training did not comply; OpenAI committed to limit personal and sensitive data in training and improve transparency

#### Bill C-36 - Protecting Privacy and Consumer Data Act (Proposed, tabled 15 Jun 2026)
- Replaces PIPEDA Part 1; tabled by Minister of AI and Digital Innovation Evan Solomon
- Automated-decision disclosure and challenge rights
- Private right of action
- Administrative monetary penalties up to CAD 10M or 3% of global revenue (serious offences CAD 25M or 5%)
- Creates a Digital Safety and Data Protection Commission that takes over enforcement from the OPC; the tribunal model from the old C-27 was dropped
- Awaiting second reading after Parliament resumed 21 Sep 2026

#### Bill C-34 - Safe Social Media Act (Proposed, introduced 10 Jun 2026)
- Replaces the former online harms bill (C-63); regulates social media platforms **and AI chatbots**
- Under-16 account ban; Digital Safety Commission; penalties up to CAD 20M or 5% of revenue
- Awaiting second reading

#### Bill C-16 - Protecting Victims Act (Royal Assent 18 Jun 2026)
- Criminalizes sexual deepfakes and "nearly nude" synthetic images; sextortion is an aggravating factor
- Enacted; coming-into-force date for the deepfake provisions to be confirmed

#### Bill C-8 - Critical Cyber Systems Protection Act
- Passed the House 26 Mar 2026; in the Senate; Royal Assent not confirmed as of October 2026

#### Bill C-22 - Lawful Access Act, 2026
- Successor to the lawful-access parts of C-2; passed the House 18 Jun 2026; in the Senate

#### Directive on Automated Decision-Making (2019)
- Applies to **federal government** AI use only
- Requires algorithmic impact assessments for automated decisions affecting individuals
- Establishes transparency requirements and human-in-the-loop obligations

#### Voluntary Code of Conduct for Generative AI (2023)
- Interim measure while formal regulation is pending
- Covers accountability, safety, fairness, transparency, human oversight, robustness
- Voluntary; provides common standards for demonstrating responsible generative AI practices

#### Canadian AI Safety Institute (CAISI) - Launched Nov 2024
- Modeled on UK and US AI safety institutes
- Focuses on evaluating risks from frontier AI models
- CAD 50M expansion under AI for All (Jun 2026); a Trusted AI Certification program is proposed

#### AI for All: Canada's National AI Strategy (4 Jun 2026)
- Five-year plan; "what we heard" consultation report published 2 Mar 2026
- Sovereign compute: 850 MW by 2030 rising toward 2.3 GW, a public supercomputer by 2031, CAD 700M more for the Compute Access Fund
- CAD 500M Tech Growth Fund; Sovereign Technology Alliance with Germany (Feb 2026)
- No standalone AI law; regulation through targeted bills

#### Digital Sovereignty Framework (Nov 2025)
- Outlines expectations for control over Canadian data governance
- Signals organizations will need to demonstrate who has legal authority over data and whether regulators can investigate/audit

#### Budget 2025 Investments
- **CAD 925.6 million** over five years for large-scale AI infrastructure
- CAD 2.5 billion earmarked for chips and data centers
- CAD 15,000 per worker for AI upskilling in priority sectors

### Provincial

#### Ontario - Bill 194 (Enhancing Digital Security and Trust Act, 2024)
- In force 29 Jan 2025; imposes AI governance requirements on Ontario's public sector
- Transparency and accountability obligations for automated decision-making; detailed AI regulations under the Act still pending

#### Ontario - Working for Workers Four Act, 2024 - In force 1 Jan 2026
- Employers must **disclose use of AI in hiring** (screening, assessment, selection) in job postings
- Ontario follows NYC Local Law 144's precedent

#### Quebec - Law 25 (Privacy Modernization)
- In force; imposes consent and transparency obligations relevant to AI
- Automated profiling and decision-making provisions; CAI joined the OpenAI investigation

#### Alberta - PIPA Amendments
- Based on Feb 2025 committee report with 12 recommendations
- Expected: children's privacy obligations, penalty-based enforcement, de-identification rules
- No bill introduced as of October 2026

---

## Data Protection and AI

Canada's privacy reform trajectory is key for AI developers:
- **Bill C-36** would introduce algorithmic transparency and challenge rights, a direct right of action and administrative monetary penalties
- The CPPA / PIDPTA tribunal model from the old Bill C-27 has been abandoned in favour of a single Digital Safety and Data Protection Commission
- Open banking framework (Consumer-Driven Banking Act, 2024) will affect AI in financial services

---

## AI in Employment

Canada is increasingly active in regulating AI's role in hiring and workplace management:
- **Ontario disclosure requirement** for AI in hiring (in force 1 Jan 2026)
- Federal and provincial **human rights commissions** are studying AI discrimination, racial profiling, and failure to ensure community participation
- Provincial privacy laws (BC, Alberta, Quebec) regulate automated decision-making about employees
- Existing employment and anti-discrimination law applies to AI-driven decisions

---

## Copyright and AI

- No specific AI copyright provisions enacted
- The Copyright Act is under review; potential implications for AI training data
- No TDM exemption currently exists
- AI-generated content authorship and ownership remain legally unclear

---

## What This Means for Developers

1. **No federal AI compliance law yet** - but PIPEDA and provincial privacy laws apply now, and the OPC has shown it will investigate training data
2. **Bill C-36 is the one to watch** - automated-decision disclosure, challenge rights and a private right of action
3. **Bill C-34 brings AI chatbots** under a digital safety regime with an under-16 ban
4. **Ontario hiring disclosure (in force)** - AI recruitment and HR tools must be disclosed in postings
5. **Voluntary Code of Conduct** for generative AI remains the compliance baseline
6. **Directive on Automated Decision-Making** applies if you build AI for federal government clients
7. **Provincial privacy laws vary** - Quebec, Alberta, BC each have distinct requirements
8. **Sexual deepfakes are now criminal** under Bill C-16; build safeguards into generative tools
9. **Bias and discrimination** - human rights commissions are actively studying AI; proactive fairness testing is wise

---

## Key Dates to Watch

| Date | Development |
|------|------------|
| 1 Jan 2026 | Ontario AI hiring disclosure in force |
| 4 Jun 2026 | AI for All national strategy released |
| 15 Jun 2026 | Bill C-36 tabled |
| Fall 2026 | Second reading of C-36 and C-34 |
| 2026-2027 | Alberta PIPA amendments expected |
| Ongoing | CAISI evaluations and Trusted AI Certification design |

---

## Resources

- [Bill C-36 (LEGISinfo)](https://www.parl.ca/legisinfo/en/bill/45-1/c-36)
- [OPC findings on OpenAI (May 2026)](https://www.priv.gc.ca/en/opc-news/news-and-announcements/2026/nr-c_260506/)
- [AIDA Companion Document](https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act-aida-companion-document)
- [Directive on Automated Decision-Making](https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592)
- [Voluntary Code of Conduct for Generative AI](https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act)
- [DLA Piper on AI for All (Jun 2026)](https://www.dlapiper.com/en-us/insights/publications/2026/06/canada-unveils-national-ai-strategy)
- [Regulations.ai - Canada AI Regulation](https://regulations.ai) - global AI law and regulation database

---

*This document is research, not legal advice.*
