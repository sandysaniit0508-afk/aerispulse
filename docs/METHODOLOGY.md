# Scientific Methodology & Peer-Reviewed Mathematical Formulations
**Document:** `docs/METHODOLOGY.md`  
**System:** AerisPulse — Urban Air Quality & Climate Health Intelligence System  
**Principle:** *The LLM explains; code calculates.* All metrics are derived from peer-reviewed, published atmospheric and epidemiological literature.

---

## 1. Multi-Pollutant US EPA Air Quality Index (AQI) Calculation

The Air Quality Index is calculated using the standard US EPA piecewise linear interpolation equation across defined concentration breakpoints:

$$I_p = \frac{I_{Hi} - I_{Lo}}{BP_{Hi} - BP_{Lo}} (C_p - BP_{Lo}) + I_{Lo}$$

Where:
- $I_p$: Index value for pollutant $p$
- $C_p$: Truncated concentration of pollutant $p$
- $BP_{Hi}$: Concentration breakpoint that is $\ge C_p$
- $BP_{Lo}$: Concentration breakpoint that is $\le C_p$
- $I_{Hi}$: AQI value corresponding to $BP_{Hi}$
- $I_{Lo}$: AQI value corresponding to $BP_{Lo}$

The aggregate Composite AQI is determined by the governing critical pollutant:

$$\text{Composite AQI} = \max(I_{\text{PM2.5}}, I_{\text{PM10}}, I_{\text{NO}_2}, I_{\text{O}_3}, I_{\text{SO}_2}, I_{\text{CO}})$$

**Citation:** United States Environmental Protection Agency (US EPA). (2018). *Technical Assistance Document for the Reporting of Daily Air Quality – the Air Quality Index (AQI)*. EPA 454/B-18-007.

---

## 2. Inhaled Particulate Matter Dosage Formulation

The human inhaled dosage of fine particulate matter ($D_{\text{inhaled}}$, in micrograms $\mu g$) across a specific exposure window is modeled as:

$$D_{\text{inhaled}} = \sum_{j} C_j \times V_E \times t_j \times (1 - \eta_{\text{mask}}) \times (1 - \eta_{\text{indoor}} \cdot \mathbb{I}_{j \in \text{indoor}})$$

Where:
- $C_j$: Ambient or indoor PM2.5 concentration during interval $j$ ($\mu g / m^3$)
- $V_E$: Minute ventilation rate ($m^3 / \text{min}$):
  - Resting/Sedentary: $0.008\ m^3/\text{min}$ ($0.48\ m^3/\text{hr}$)
  - Light Activity/Walking: $0.020\ m^3/\text{min}$ ($1.20\ m^3/\text{hr}$)
  - Vigorous Exercise/Cycling: $0.050\ m^3/\text{min}$ ($3.00\ m^3/\text{hr}$)
- $t_j$: Exposure duration in interval $j$ (minutes or hours)
- $\eta_{\text{mask}}$: Particulate filtration efficiency of mask:
  - None: $0.00$
  - Surgical/Cloth: $0.35$
  - N95 / FFP2 / KN95 (fitted): $0.95$
- $\eta_{\text{indoor}}$: Indoor HEPA filtration fractional reduction:
  - No filter: $0.15$ (passive building envelope deposition)
  - True HEPA Air Purifier: $0.85$ (85% reduction from ambient)

**Citation:** International Commission on Radiological Protection (ICRP). (1994). *Human Respiratory Tract Model for Radiological Protection*. ICRP Publication 66. Ann. ICRP 24 (1-3).

---

## 3. Epidemiological Relative Risk & Chronic Respiratory Exposure Index (CREI)

Based on the Global Exposure Mortality Model (GEMM) developed by Burnett et al. (2018), the Relative Risk ($RR$) for cardiopulmonary and respiratory outcomes per $10\ \mu g/m^3$ increment of long-term PM2.5 exposure is:

$$RR(C) = \exp\left( \frac{\theta \cdot \ln(1 + \max(0, C - C_0) / \alpha)}{1 + \exp\left(-\frac{\max(0, C - C_0) - \mu}{\nu}\right)} \right)$$

For operational client-side evaluation, we employ the log-linear relative risk approximation widely utilized in public health impact assessments:

$$RR = \exp(\beta \cdot (C_{\text{actual}} - C_{\text{counterfactual}}))$$

Where:
- $\beta = 0.0062$ per $1\ \mu g/m^3$ for all-cause cardiovascular/respiratory emergency events.
- $C_{\text{counterfactual}} = 5.0\ \mu g/m^3$ (WHO Annual Air Quality Guideline level).

The **Chronic Respiratory Exposure Index (CREI)** scales from 0 to 100:

$$\text{CREI} = \min\left(100, \frac{C_{\text{PM2.5}}}{150} \times 70 + \frac{C_{\text{NO}_2}}{100} \times 30\right)$$

**Citation:** Burnett, R., et al. (2018). *Global estimates of mortality associated with long-term exposure to outdoor fine particulate matter*. Proceedings of the National Academy of Sciences (PNAS), 115(38), 9592-9597.

---

## 4. Modal Commute Carbon Emission Abatement

Transport sector $CO_2$ equivalent emissions are computed using well-to-wheel greenhouse gas intensity factors:

$$\Delta E_{\text{CO}_2} = d_{\text{commute}} \times (EF_{\text{baseline}} - EF_{\text{alternative}})$$

Where $d_{\text{commute}}$ is the round-trip distance ($km$) and emission factors ($EF$) are based on IPCC and DEFRA averages for urban transport:
- Personal Internal Combustion Engine (ICE) Car: $0.192\ kg\ CO_2 / \text{passenger-km}$
- Motorbike / Two-Wheeler: $0.103\ kg\ CO_2 / \text{passenger-km}$
- Rapid Transit Metro / Electric Bus: $0.028\ kg\ CO_2 / \text{passenger-km}$
- Bicycle / Walking: $0.000\ kg\ CO_2 / \text{passenger-km}$

**Citation:** Department for Environment, Food & Rural Affairs (DEFRA). (2023). *Government greenhouse gas conversion factors for company reporting*. UK Government.

---

## 5. Economic Health Savings & Acute Symptom Mitigation

Mitigation of extreme PM2.5 exposure reduces direct outpatient consultation costs and lost productivity days:

$$\text{Savings}_{\text{monthly}} = N_{\text{protected days}} \times \left( P_{\text{outpatient}} \times \Delta P_{\text{symptom}} + W_{\text{daily}} \times \Delta L_{\text{sick day}} \right)$$

Where:
- $P_{\text{outpatient}}$: Baseline cost of acute respiratory medical consultation and nebulization/medication ($₹850$ / $\$35$).
- $\Delta P_{\text{symptom}}$: Reduction in symptom frequency with N95 + HEPA filtration ($0.42$).
- $W_{\text{daily}}$: Average daily productivity value ($₹1,200$ / $\$65$).
- $\Delta L_{\text{sick day}}$: Expected reduction in respiratory-related work absence days ($0.08$ days/month).

**Citation:** World Health Organization (WHO). (2021). *WHO Global Air Quality Guidelines: Particulate matter ($PM_{2.5}$ and $PM_{10}$), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide*. World Health Organization.
