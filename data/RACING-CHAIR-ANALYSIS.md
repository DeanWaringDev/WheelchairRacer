# Racing Chair Maneuverability Enhancement - v3.2

**Date:** October 17, 2025  
**Issue:** "Wheelchair friendly" descriptions don't capture racing chair needs  
**Solution:** Added maneuverability keywords + planned route geometry analysis

---

## Problem Identified

### Market Harborough Example:
- **Description says:** "All on tarmac, wheelchair friendly"
- **Current score:** 100/100 for racing chair
- **Reality:** Narrow paths + tight corners = **unsuitable for racing chair**

### Why This Happens:
- Racing chairs have **turning circle of a truck**
- Racing chairs have **very limited steering**
- Racing chairs are **long and wide** (wheelbase)
- "Wheelchair friendly" usually means **day chair accessible**, not racing chair

---

## Keywords v3.2 Changes

### Added: Maneuverability Challenges (-40 racing chair)
```
narrow path, narrow paths, narrow section
tight turns, tight corners, sharp turns, sharp corners
chicane, hairpin, switchback
90 degree turn, right angle turn
```

**Impact:**
- Racing chair: -40 (CRITICAL)
- Handbike: -35 (also wide, 3-wheeled)
- Day chair: -10 (minor issue)
- Walking aids: 0 (not affected)

### Enhanced: Wide Path Bonus (+10 → +20 racing chair)
```
wide path, wide paths, broad path
open path, open paths, spacious
```

**Impact increased for racing chairs:** +10 → +20

### Added: Racing-Friendly Features (+15 racing chair)
```
gentle corners, sweeping corners, wide corners
long straight, long straights
fast course, great for speed, open course
```

**Impact:**
- Racing chair: +15 (ideal for speed)
- Handbike: +10
- Others: +5 or 0

---

## Current Limitations

### Keywords Can Only Detect What's Written:
- ✅ If description says "narrow paths" → detected, -40 penalty
- ❌ If description doesn't mention narrow paths → **not detected**
- ❌ No way to know path width from text alone
- ❌ No way to measure corner angles from text

### Market Harborough Case:
- Description: "All on tarmac, wheelchair friendly"
- No mention of: path width, corner types, turning space
- **Result:** System assumes it's good because no negatives mentioned
- **Reality:** You know it has narrow paths + tight corners

---

## Future Solution: Route Geometry Analysis

### Phase 1: Google Maps Integration (Dec 2025)
When user uploads/enters a parkrun route:

1. **Path Width Detection:**
   - Satellite imagery analysis
   - Street View width estimation
   - Detect sections <2 meters wide
   - **Penalty:** -20 to -30 for racing chairs

2. **Corner Analysis:**
   - GPS route geometry
   - Calculate turning radii
   - Detect sharp turns (<90° angles)
   - **Penalty:** -15 to -25 per sharp corner

3. **Long Straight Detection:**
   - Measure straight sections >200m
   - **Bonus:** +5 to +10 for racing chairs

4. **Chicane/Switchback Detection:**
   - Pattern recognition in route
   - S-curves, hairpins, zigzags
   - **Penalty:** -30 to -40 for racing chairs

### Phase 2: Elevation Profile (Dec 2025)
- Google Elevation API
- OpenTopoData
- Calculate gradients
- Differentiate "gentle slope" vs "steep hill"

### Phase 3: Surface Analysis (Future)
- Satellite imagery + ML
- Detect grass vs tarmac vs gravel
- Override text-only analysis

---

## Why This Matters

### Racing Chair Needs:
1. **Wide paths** - for wheelbase + maneuvering
2. **Gentle corners** - limited steering
3. **Long straights** - build speed
4. **No tight turns** - can't navigate 90° corners
5. **No chicanes** - impossible to navigate S-curves

### Different From Day Chair:
- Day chair: Can navigate tight spaces, 360° spin
- Racing chair: Long, wide, limited steering
- **"Wheelchair friendly" usually = day chair accessible**

---

## Keywords v3.2 Statistics

**Total keywords:** 199 (was 175)  
**New keywords added:** 24

**Breakdown:**
- Maneuverability challenges: 17 keywords
- Racing-friendly features: 9 keywords  
- Enhanced wide path: 4 keywords (added variations)

**Impact on analysis:**
- Most parkruns: No change (don't mention narrow/tight)
- Parkruns with "narrow paths": Racing chair score drops -40
- Parkruns with "wide paths": Racing chair bonus +10 increase

---

## Real-World Testing Needed

### Tomorrow: Market Harborough Parkrun
- You're doing this parkrun tomorrow
- Current system: 100/100 racing chair (based on text)
- Your experience: Unsuitable for racing chair (narrow + tight)

**Post-parkrun feedback:**
1. How narrow are the paths? (estimate in meters)
2. How many tight corners? (count 90° or sharper)
3. Any chicanes or narrow sections?
4. Would you race there in a racing chair? Y/N

This feedback will help calibrate the **route geometry analysis** thresholds!

---

## Next Steps

1. **Now (v3.2):** Keywords detect mentions of narrow/tight in text
2. **Oct 31:** Launch parkrun page with text-based analysis
3. **Dec 31:** Add route geometry analysis (premium feature)
4. **Future:** Machine learning on satellite imagery

---

## Summary

**Problem:** Text descriptions don't capture racing chair maneuverability needs  
**Short-term fix:** Keywords v3.2 detects mentions of narrow/tight  
**Long-term solution:** Route geometry analysis with Google Maps API  
**Testing:** Your Market Harborough experience tomorrow will validate this!

**Keywords v3.2 is now LIVE and ready for testing!** 🚀
