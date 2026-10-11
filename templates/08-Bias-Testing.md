# Bias Testing Methodology and Results

> **Laws served:** EU AI Act (high-risk); South Korea AI Basic Act; Colorado SB 26-189; NYC Local Law 144; Illinois HB 3773; California Civil Rights AI Employment; Australia AI6 Guidance; Canada Ontario Workers Act; Singapore MAS FEAT; New Zealand Human Rights Act 1993
> **Template version:** 1.0 | **Last updated:** 2026-03-14

---

## Metadata

Fill in the Value column for each field.

| Field | Value |
|-------|-------|
| AI System Name | |
| Organization | |
| Document owner | |
| Session/GitHub ref | |
| Date created | [YYYY-MM-DD] |
| Author | [Human name or LLM model] |
| Independent auditor (if NYC LL 144) | [Name, firm, credentials] |

---

## 1. Testing Scope

Fill in the Details column for each field.

| Field | Details |
|-------|---------|
| System / model under test | |
| Decision domain | [Employment / Credit / Insurance / Healthcare / Education / Housing / General] |
| Test date(s) | |
| Test data description | [Source, size, representativeness] |
| Jurisdictions covered | |

---

## 2. Protected Characteristics Tested

Fill in the Tested? and Test Group Sizes columns for each characteristic.

| Characteristic | Tested? | Jurisdiction Requiring It | Test Group Sizes |
|---------------|:---:|--------------------------|-----------------|
| Race / Ethnicity | [ ] | EU, Colorado, NYC, California, Illinois | |
| Gender / Sex | [ ] | EU, Colorado, NYC, California, Illinois, South Korea | |
| Age | [ ] | EU, Colorado, NYC, Illinois | |
| Disability | [ ] | EU, Colorado, NYC | |
| Religion | [ ] | EU, Colorado, NYC | |
| National origin | [ ] | EU, Colorado, NYC, Illinois | |
| Sexual orientation | [ ] | EU, Colorado | |
| Pregnancy / Family status | [ ] | EU, Colorado, NYC | |
| Veteran status | [ ] | NYC | |
| Socioeconomic status | [ ] | South Korea, Brazil | |
| Language / Linguistic background | [ ] | [Assess per jurisdiction] | |

---

## 3. Bias Metrics Used

Fill in the Applied? column for each metric.

| Metric | Definition | Threshold | Applied? |
|--------|-----------|-----------|:---:|
| **Disparate impact ratio** | Selection rate of protected group / selection rate of majority group | ≥ 0.8 (4/5ths rule) | [ ] |
| **Statistical parity difference** | Difference in positive outcome rates between groups | < 0.1 | [ ] |
| **Equal opportunity difference** | Difference in true positive rates between groups | < 0.1 | [ ] |
| **Predictive parity** | Equal positive predictive value across groups | < 0.1 | [ ] |
| **Calibration** | Equal calibration across groups | | [ ] |
| **Individual fairness** | Similar individuals receive similar outcomes | | [ ] |
| **Counterfactual fairness** | Changing protected attribute doesn't change outcome | | [ ] |

---

## 4. Test Results

### 4.1 Summary Results

Add one row per protected characteristic, with metric, group a (reference), group b, score, pass or fail and notes.

| Protected Characteristic | Metric | Group A (Reference) | Group B | Score | Pass/Fail | Notes |
|------------------------|--------|:---:|:---:|:---:|:---:|-------|
| | | | | | | |
| | | | | | | |
| | | | | | | |

### 4.2 Intersectional Analysis

For each intersection below, fill in metric, score and pass or fail.

| Intersection | Metric | Score | Pass/Fail |
|-------------|--------|:---:|:---:|
| [e.g., Race × Gender] | | | |
| [e.g., Age × Disability] | | | |

### 4.3 Detailed Findings

For each finding below, fill in description, severity and characteristic affected.

| Finding # | Description | Severity | Characteristic Affected |
|-----------|-------------|----------|----------------------|
| 1 | | [Critical / High / Medium / Low] | |
| 2 | | | |

---

## 5. Remediation Plan

Add one row per finding, with remediation action, owner, target date, status and verification method.

| Finding # | Remediation Action | Owner | Target Date | Status | Verification Method |
|-----------|-------------------|-------|-------------|--------|-------------------|
| | | | | [Open / In progress / Complete] | |

---

## 6. NYC Local Law 144 — Independent Audit Section

> **Required for:** Automated Employment Decision Tools used in NYC

| Audit Element | Details |
|--------------|---------|
| Auditor name and firm | |
| Auditor independence statement | [Confirm no conflict of interest] |
| Audit date | |
| Audit scope | [Screening / Selection / Both] |
| Audit methodology | |
| **Public disclosure URL** | [Must be published on employer's website] |

### Audit Summary (for public disclosure)

For each category below, fill in selection rate and impact ratio.

| Category | Selection Rate | Impact Ratio |
|----------|:---:|:---:|
| [Demographic category 1] | | |
| [Demographic category 2] | | |
| [Demographic category 3] | | |

---

## 7. Ongoing Monitoring Plan

For each aspect below, fill in details.

| Aspect | Details |
|--------|---------|
| Monitoring frequency | [Real-time / Weekly / Monthly / Quarterly] |
| Drift detection method | [Statistical tests, threshold alerts] |
| Re-testing triggers | [Model update / Data distribution change / Complaint / Periodic] |
| Responsible team | |
| Escalation process | [What happens when bias is detected in production?] |

---

## 8. Evidence Checklist

- [ ] All applicable protected characteristics tested
- [ ] Appropriate bias metrics selected and applied
- [ ] Test data is representative of production population
- [ ] Results documented with pass/fail per metric
- [ ] Intersectional analysis completed
- [ ] Remediation plan created for any failures
- [ ] Independent audit completed (if NYC LL 144)
- [ ] Audit results published (if NYC LL 144)
- [ ] Ongoing monitoring plan established
- [ ] Next test date scheduled

---

*This template supports compliance evidence gathering. It is not legal advice.*
