"""
generate_hyd_data.py
Generates 500+ micro-level crime data points scattered across Hyderabad,
GHMC, Ranga Reddy, ORR corridor, and nearby satellite cities.
Outputs:  data/hyd.csv  and  data/hyd.json
"""

import json, random, math, csv, os

random.seed(42)

# ── Seed zones: (label, center_lat, center_lng, radius_km, base_crime_level)
# crime_level: 0=very low, 1=low, 2=moderate, 3=high, 4=extreme
ZONES = [
    # ── IT Corridor / West Hyd ──────────────────────────────────────────────
    ("Madhapur",          17.4483, 78.3915,  1.2, 2),
    ("Hitech City",       17.4435, 78.3772,  0.8, 1),
    ("Kondapur",          17.4639, 78.3582,  1.0, 1),
    ("Gachibowli",        17.4401, 78.3489,  1.5, 1),
    ("Kokapet",           17.3940, 78.3280,  1.2, 0),
    ("Narsingi",          17.3875, 78.3465,  1.0, 1),
    ("Financial District",17.4300, 78.3415,  0.8, 2),
    ("Manikonda",         17.4040, 78.3896,  1.0, 2),
    ("Raidurg",           17.4222, 78.3813,  0.8, 1),
    ("Kothaguda",         17.4600, 78.3653,  0.8, 1),
    ("Biodiversity Park", 17.4325, 78.3758,  0.7, 0),

    # ── Banjara Hills / Jubilee ─────────────────────────────────────────────
    ("Banjara Hills",     17.4156, 78.4411,  1.5, 1),
    ("Jubilee Hills",     17.4299, 78.4076,  1.2, 1),
    ("Road No 36",        17.4210, 78.4050,  0.5, 2),
    ("GVK One Back Lane", 17.4182, 78.4485,  0.4, 1),
    ("KBR Park",          17.4208, 78.4146,  0.6, 1),
    ("Lotus Pond",        17.4172, 78.4114,  0.5, 2),

    # ── Ameerpet / Punjagutta / SR Nagar ────────────────────────────────────
    ("Punjagutta Flyover",17.4265, 78.4490,  0.6, 3),
    ("Ameerpet",          17.4340, 78.4468,  0.8, 3),
    ("SR Nagar",          17.4418, 78.4442,  0.7, 1),
    ("Erragadda",         17.4510, 78.4350,  0.8, 2),
    ("Borabanda",         17.4480, 78.4020,  0.7, 3),

    # ── Old City / Central ──────────────────────────────────────────────────
    ("Charminar",         17.3616, 78.4747,  1.0, 4),
    ("Lad Bazar",         17.3615, 78.4715,  0.5, 2),
    ("Afzal Gunj Bridge", 17.3750, 78.4760,  0.6, 4),
    ("Nampally",          17.3916, 78.4674,  0.8, 3),
    ("Begum Bazar",       17.3780, 78.4690,  0.6, 3),
    ("MJ Market",         17.3855, 78.4735,  0.5, 2),
    ("Abids",             17.3920, 78.4786,  0.8, 3),
    ("Koti",              17.3902, 78.4789,  0.7, 3),
    ("Mehdipatnam",       17.3940, 78.4360,  1.0, 3),
    ("Attapur",           17.3610, 78.4350,  0.8, 2),
    ("Aramghar",          17.3295, 78.4365,  0.7, 3),

    # ── North / Secunderabad ────────────────────────────────────────────────
    ("Secunderabad",      17.4399, 78.4983,  1.5, 3),
    ("Paradise Circle",   17.4435, 78.4840,  0.6, 3),
    ("Trimulgherry",      17.4815, 78.5065,  0.8, 1),
    ("Begumpet",          17.4476, 78.4681,  0.8, 2),
    ("Rathifile",         17.4365, 78.5015,  0.5, 3),

    # ── East Hyd ────────────────────────────────────────────────────────────
    ("Uppal",             17.3985, 78.5520,  1.5, 3),
    ("Nagole",            17.3820, 78.5600,  1.0, 1),
    ("LB Nagar",          17.3500, 78.5475,  1.5, 3),
    ("Dilsukhnagar",      17.3685, 78.5255,  1.2, 3),
    ("Malakpet",          17.3750, 78.4960,  0.8, 3),
    ("Hayathnagar",       17.3270, 78.5850,  1.2, 2),
    ("Vanasthalipuram",   17.3490, 78.5590,  1.0, 2),
    ("Boduppal",          17.4250, 78.5720,  1.0, 2),
    ("Ghatkesar",         17.4420, 78.6920,  1.0, 1),

    # ── South Hyd / Ranga Reddy ─────────────────────────────────────────────
    ("Shamshabad",        17.2625, 78.3888,  1.5, 0),
    ("Rajendranagar",     17.3020, 78.4340,  1.2, 2),
    ("Bandlaguda",        17.3440, 78.4910,  0.8, 2),
    ("Adibatla",          17.2340, 78.5300,  1.5, 0),
    ("Tukkuguda",         17.2200, 78.5450,  1.0, 1),
    ("Meerpet",           17.3370, 78.5180,  0.8, 2),

    # ── North Hyd / GHMC suburbs ────────────────────────────────────────────
    ("Kompally",          17.5330, 78.4720,  1.5, 1),
    ("Alwal",             17.5020, 78.5130,  1.0, 0),
    ("Jeedimetla",        17.5180, 78.4680,  1.0, 1),
    ("Balanagar",         17.4640, 78.4480,  1.0, 3),
    ("Kukatpally",        17.4875, 78.3953,  1.5, 2),
    ("JNTU",              17.4930, 78.3920,  0.8, 2),
    ("Bachupally",        17.5380, 78.3930,  1.2, 1),
    ("Miyapur",           17.4960, 78.3560,  1.5, 2),
    ("Chandanagar",       17.4840, 78.3330,  1.0, 1),
    ("Patancheru",        17.5250, 78.2610,  1.5, 2),
    ("Isnapur",           17.5450, 78.2300,  1.0, 1),

    # ── ORR Stretch ─────────────────────────────────────────────────────────
    ("ORR Gachibowli Gate",17.4320,78.3440,  0.5, 1),
    ("ORR Nanakramguda",  17.4131, 78.3540,  0.5, 0),
    ("ORR Rajiv Gandhi Int",17.3250,78.4012, 0.5, 1),
    ("ORR Tukkuguda",     17.2630, 78.4990,  0.5, 1),
    ("ORR Patancheru",    17.5100, 78.2950,  0.5, 1),
    ("ORR Kompally",      17.5490, 78.4500,  0.5, 1),
    ("ORR Ghatkesar",     17.4250, 78.6850,  0.5, 0),

    # ── Nearby Satellite Towns ──────────────────────────────────────────────
    ("Siddipet Town",     18.1040, 78.8530,  1.5, 1),
    ("Medchal",           17.6280, 78.4820,  1.0, 1),
    ("Ibrahimpatnam",     17.2580, 78.6400,  1.0, 1),
    ("Shadnagar",         17.0790, 78.2000,  1.2, 2),
    ("Sangareddy",        17.6260, 78.0870,  1.5, 2),
]

def rand_offset(radius_km):
    """Return a random (dlat, dlng) within radius_km."""
    r = radius_km / 111.0          # approx degrees per km
    angle = random.uniform(0, 2 * math.pi)
    dist  = random.uniform(0, r)
    return dist * math.sin(angle), dist * math.cos(angle)

def clamp(val, lo, hi):
    return max(lo, min(hi, val))

CRIME_LABELS = {
    0: ["isolated alley","service road junction","back lane","dead end"],
    1: ["metro station exit","bus stop corner","market road","flyover approach"],
    2: ["night market road","auto stand","garbage dump","public toilet area","parking lot"],
    3: ["flyover underpass","railway station outside","bus terminus","slum entrance","narrow gully"],
    4: ["bridge underpass","fish market alley","red light area","old city backroad","freight yard lane"],
}

def make_point(zone_label, base_lat, base_lng, radius_km, base_level):
    dlat, dlng = rand_offset(radius_km)
    lat = round(base_lat + dlat, 6)
    lng = round(base_lng + dlng, 6)

    # Randomise danger around base ±1 but clamp 0-4
    danger = clamp(base_level + random.randint(-1, 1), 0, 4)

    suffix = random.choice(CRIME_LABELS[danger])
    name   = f"{zone_label} - {suffix}"

    # Fabricate crime stats consistent with danger level
    scale = (danger + 1)
    murder    = random.randint(0, scale)
    rape      = random.randint(0, scale * 2)
    gangrape  = random.randint(0, max(1, scale - 2))
    robbery   = random.randint(scale, scale * 15)
    theft     = random.randint(scale * 10, scale * 80)
    assault   = random.randint(scale, scale * 8)
    sexhar    = random.randint(scale, scale * 10)
    tot_area  = random.randint(5000, 30000)
    tot_crime = murder + rape + gangrape + robbery + theft + assault + sexhar
    cpa       = round(tot_crime / tot_area * 1000, 2)  # crimes per 1000 m²
    area_ha   = round(tot_area / 10000, 2)

    return {
        "name": name, "murder": murder, "rape": rape, "gangrape": gangrape,
        "robbery": robbery, "theft": theft, "assault": assault, "sexhar": sexhar,
        "tot_area": tot_area, "tot_crime": tot_crime,
        "lng": lng, "lat": lat, "cpa": cpa, "area": area_ha,
        "danger": danger
    }

# Generate points - distribute across zones evenly to hit 500+
points_per_zone = max(1, math.ceil(500 / len(ZONES)))
all_points = []
for zone in ZONES:
    for _ in range(points_per_zone):
        all_points.append(make_point(*zone))

# Shuffle for realism
random.shuffle(all_points)
print(f"Total points generated: {len(all_points)}")

# ── Write CSV ──────────────────────────────────────────────────────────────
csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hyd.csv')
with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["nm_pol","murder","rape","gangrape","robbery","theft",
                     "assualt murders","sexual harassement","totarea","totalcrime",
                     "long","lat","crime/area","area"])
    for p in all_points:
        writer.writerow([p["name"], p["murder"], p["rape"], p["gangrape"],
                         p["robbery"], p["theft"], p["assault"], p["sexhar"],
                         p["tot_area"], p["tot_crime"],
                         p["lng"], p["lat"], p["cpa"], p["area"]])

print(f"Written: {csv_path}")

# ── Write JSON ─────────────────────────────────────────────────────────────
json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hyd.json')
features = [
    {
        "lati": p["lng"],     # NOTE: project uses lati=lng, longi=lat (legacy swap)
        "longi": p["lat"],
        "type": "Feature",
        "properties": {"mag": p["danger"]}
    }
    for p in all_points
]
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(features, f, indent=2)

print(f"Written: {json_path}")
print("Done.")
