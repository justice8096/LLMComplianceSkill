# Jurisdiction Selector

> **Purpose:** Input your target countries → output the required evidence list with deadlines
> **Template version:** 1.0 | **Last updated:** 2026-03-14

---

## Metadata

| Field | Value |
|-------|-------|
| Project Name | |
| Organization | |
| Document owner | |
| Session/GitHub ref | |
| Date created | [YYYY-MM-DD] |
| Author | [Human name or LLM model] |

---

## 1. Select Your Jurisdictions

Check all jurisdictions where your AI system will operate:

| Jurisdiction | Operating? | Regulatory Status | Key Deadline |
|-------------|:---:|-----------------|-------------|
| [ ] **European Union** | | Enacted — Art. 50 transparency live; high-risk from 2 Dec 2027 (Digital Omnibus) | **2 Dec 2026 (marking) / 2 Dec 2027 (high-risk)** |
| [ ] **China** | | Enacted — actively enforced | **Now** |
| [ ] **South Korea** | | Enacted — AI Basic Act in force | **Now (fines from about Jan 2027)** |
| [ ] **United Kingdom** | | Sector-active — DUA Act in force; no AI Bill | **Now** |
| [ ] **United States — Colorado** | | Enacted — SB 26-189 (replaces SB 24-205; enforcement paused) | **1 Jan 2027** |
| [ ] **United States — California** | | Multiple laws (SB 53, SB 243, SB 942 live; CCPA ADMT, SB 947 next) | **Now; 1 Jan 2027** |
| [ ] **United States — New York** | | Enacted — RAISE Act (frontier models) + NYC LL 144 | **1 Jan 2027 / Now** |
| [ ] **United States — Connecticut** | | Enacted — Public Act 26-15 (phased) | **1 Oct 2026 to 1 Jan 2028** |
| [ ] **United States — Washington** | | Enacted — HB 2225 companion chatbots | **1 Jan 2027** |
| [ ] **United States — New York City** | | Enacted — LL 144 | **Now** |
| [ ] **United States — Illinois** | | Enacted — HB 3773 (now); SB 315 frontier audits | **Now / 1 Jan 2027** |
| [ ] **United States — Texas** | | Enacted — TRAIGA | **Now** |
| [ ] **United States — Utah** | | Enacted | **Now** |
| [ ] **Canada** | | Sector-active + provincial; Bills C-36 and C-34 tabled | **Now (Ontario hiring disclosure)** |
| [ ] **Brazil** | | Sector-active — ECA Digital, CFM, CVM; PL 2338 stalled | **Nov 2026 (ECA Digital sanctions)** |
| [ ] **India** | | Sector-active — IT Amendment Rules 2026 (labelling), DPDP Rules | **Now / 13 May 2027** |
| [ ] **Japan** | | Voluntary + soft law | **Now (voluntary)** |
| [ ] **Singapore** | | Voluntary + finance binding | **Now (MAS finance)** |
| [ ] **Australia** | | Sector-active — ADM transparency; AI standards bill 2027 | **10 Dec 2026** |
| [ ] **New Zealand** | | Voluntary | **Now (voluntary)** |
| [ ] **Peru** | | Enacted — regulation phase 1 live | **Now (since 10 Sep 2026)** |
| [ ] **Mexico** | | Sector-active — performer AI consent (May 2026); general law stalled | **Now** |
| [ ] **Vietnam** | | Enacted — Law on AI 134/2025 | **Now (since 1 Mar 2026)** |
| [ ] **Colombia** | | Proposed — advanced | **Upon passage** |
| [ ] **Chile** | | Proposed — advanced | **Upon passage** |
| [ ] **Argentina** | | Data protection in force | **Now** |
| [ ] **Nigeria** | | Proposed — Digital Economy Bill at third reading; NDPA in force | **Upon passage** |
| [ ] **Kenya** | | Proposed — AI Bill No. 4 of 2026 | **Upon passage** |
| [ ] **South Africa** | | Sector-active — POPIA | **Now** |
| [ ] **Kenya** | | Data protection in force | **Now** |
| [ ] **Ethiopia** | | Data protection in force | **Now** |
| [ ] **Vietnam** | | Enacted | **Mar 2026** |

---

## 2. Required Evidence by Selected Jurisdiction

### Instructions: For each checked jurisdiction above, the following table shows which templates must be completed.

| Template | EU | CN | KR | UK | US-CO | US-CA | US-NYC | CA | BR | IN | JP | SG | AU | NZ | PE | NG | ZA | MX | VN |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 01 System Transparency | ● | ● | ● | ● | ● | — | — | — | ● | — | — | — | — | — | ● | ● | — | ● | ● |
| 02 User Disclosure | ● | ● | ● | — | ● | ● | ● | ● | — | ● | — | — | — | ● | — | — | — | — | — |
| 03 Content Labeling | ● | ● | ● | — | — | ● | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 04 Decision Logic | ● | — | ● | ● | ● | — | ● | ● | — | — | — | — | ● | — | — | — | ● | — | — |
| 05 Training Data | ● | ● | — | ● | — | ● | — | — | — | — | — | — | ● | — | — | — | — | — | — |
| 06 Impact/Risk | ● | — | ● | — | ● | — | — | ● | ● | — | — | — | — | — | ● | ● | — | — | — |
| 07 PIA/DPIA | ● | — | ● | ● | — | — | — | ● | ● | ● | ● | ● | ● | ● | — | ● | ● | ● | — |
| 08 Bias Testing | ● | — | ● | ● | ● | ● | ● | ● | — | — | — | ● | ● | ● | — | — | — | — | — |
| 09 Human Oversight | ● | — | ● | ● | — | — | — | ● | — | — | ● | ● | ● | — | — | ● | ● | — | — |
| 10 Consent Records | ● | — | ● | ● | — | — | — | ● | ● | ● | ● | ● | ● | ● | — | — | ● | ● | — |
| 11 Data Subject Rights | ● | — | ● | ● | — | — | — | ● | ● | ● | — | ● | ● | ● | — | — | ● | ● | — |
| 12 Governance | ● | — | — | ● | — | — | — | ● | ● | — | ● | ● | ● | ● | — | — | — | — | — |
| 13 Incident Mgmt | ● | ● | ● | ● | — | ● | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 14 Registration | ● | ● | ● | — | — | — | — | — | — | — | — | — | — | — | ● | ● | — | — | — |
| 15 Security | ● | ● | ● | ● | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 16 Content Moderation | — | ● | — | — | — | — | — | — | — | ● | — | — | — | — | — | — | — | — | — |
| 17 Risk Classification | ● | — | ● | — | ● | — | — | — | ● | — | — | — | — | — | ● | ● | — | ● | ● |
| 18 AI Literacy | ● | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 19 Conformity Assessment | ● | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 20 Sector-Specific | ● | — | ● | ● | — | — | ● | ● | ● | ● | ● | ● | ● | — | — | — | ● | — | — |

● = Required or strongly recommended · — = Not specifically required

---

## 3. Your Required Template List

Based on your selections, complete the following templates:

| Priority | Template | Deadline | Status |
|----------|---------|---------|:---:|
| | | | [ ] |
| | | | [ ] |
| | | | [ ] |

---

## 4. Critical Deadlines for Your Jurisdictions

| Date | Jurisdiction | Event | Impact on Your Project |
|------|-------------|-------|----------------------|
| | | | |

---

*This template supports compliance evidence gathering. It is not legal advice.*
