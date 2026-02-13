# Legacy Site Gap Analysis

Comparison between `https://www.bauligconsulting.de/` (Legacy) and Localhost (Current).

## High-Level Summary
The local site is closely aligned with the legacy site's branding (claims, copy, colors), but differs in content structure, service offerings, and navigation targets. The legacy site relies heavily on external subdomains (andreasbaulig.de) for Blog and Careers, while the local site implements them internally.

## Detailed Gaps

### 1. Navigation & Menu
| Feature | Legacy Site | Local Site | Gap |
| :--- | :--- | :--- | :--- |
| **Presse** | Present (`/presse/`) | **Removed** (per recent task) | **Conflict**: Restore if strict "1:1"? |
| **Blog** | External (`andreasbaulig.de/blog`) | Internal (`/blog`) | **Feature**: Local is better, but not 1:1 |
| **Karriere** | External (`karriere.andreasbaulig.de`) | Internal (`/careers`) | **Feature**: Local is better, but not 1:1 |
| **CTA** | "Kostenloses Erstgespräch vereinbaren" | Matches | None |

### 2. Homepage Content
| Section | Legacy Site | Local Site | Gap |
| :--- | :--- | :--- | :--- |
| **Hero** | Headline: "Beratung. Neu gedacht." | Matches | None |
| **Services** | **4 Items**: <br>1. Online-Marketing<br>2. Systemvertrieb<br>3. Skalierung<br>4. **Online-Training & Beratung** | **3 Items**: <br>1. Online-Marketing<br>2. Skalierung<br>3. Systemvertrieb | **Missing Item**: "Online-Training & Beratung" |
| **Blog Preview**| Present ("Die neuesten Fachartikel") | **Missing** | Need to add Blog Section to Homepage |
| **Person** | Arben Veseli highlighted | Team Section (Generic) | Specific person highlight missing on Home |

### 3. Footer
| Feature | Legacy Site | Local Site | Gap |
| :--- | :--- | :--- | :--- |
| **Links** | Includes Presse, External Career/Blog | Internal links | Align links if needed |

## Recommendations for "1:1" Replica
To achieve a visual and functional 1:1 replica, we should:
1.  **Add the 4th Service**: "Online-Training & Beratung".
2.  **Add Blog Section to Homepage**: Display latest posts (from the new internal blog).
3.  **Decide on External vs Internal**:
    *   *Recommendation*: Keep internal Blog/Careers (better SEO/UX) unless "1:1" strictly implies using the old external links.
    *   *Decision Needed*: Restore "Presse" page?

## Next Steps
1.  Implement "Online-Training & Beratung" service card.
2.  Create "Latest Articles" section for Homepage.
3.  (Optional) Revert "Presse" removal if strictly requested.
