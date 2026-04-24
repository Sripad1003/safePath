"""
kmeans_hyd.py
Runs K-Means clustering on the generated hyd.csv to:
1. Assign cluster labels (0-5) to each point
2. Map each cluster to a danger_index (0-4) based on cluster centroid stats
3. Output data/hyd_clustered.csv and data/hyd_clustered.json
"""

import json, sys, os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# ── Load ───────────────────────────────────────────────────────────────────
csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hyd.csv')
df = pd.read_csv(csv_path)

print(f"Loaded {len(df)} rows from hyd.csv")

# Feature columns used for clustering
FEATURES = ["murder","rape","gangrape","robbery","theft",
            "assualt murders","sexual harassement","crime/area"]

X = df[FEATURES].fillna(0).values

# ── Scale ──────────────────────────────────────────────────────────────────
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ── K-Means (k=5 maps cleanly to danger 0-4) ──────────────────────────────
N_CLUSTERS = 5
kmeans = KMeans(n_clusters=N_CLUSTERS, init='k-means++', random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(X_scaled)

# ── Map cluster → danger index based on centroid crime/area score ──────────
centroids_orig = scaler.inverse_transform(kmeans.cluster_centers_)
centroid_df = pd.DataFrame(centroids_orig, columns=FEATURES)
# Sort clusters by crime/area ascending → rank as danger 0..4
cluster_order = centroid_df['crime/area'].argsort().values   # ascending sorted cluster ids
danger_map = {int(cluster_order[i]): i for i in range(N_CLUSTERS)}
df['danger_index'] = df['cluster'].map(danger_map)

print("\nCluster => Danger mapping:")
for cid, did in sorted(danger_map.items()):
    mean_cpa = centroid_df.loc[cid, 'crime/area']
    print(f"  cluster {cid} -> danger {did}  (mean crime/area={mean_cpa:.4f})")

# ── Write clustered CSV ────────────────────────────────────────────────────
out_csv = os.path.join(os.path.dirname(__file__), '..', 'data', 'hyd_clustered.csv')
df.to_csv(out_csv, index=False)
print(f"\nWritten: {out_csv}")

# ── Write clustered JSON (update mag with danger_index) ───────────────────
features = []
for _, row in df.iterrows():
    features.append({
        "lati":  round(row["lat"], 6),
        "longi": round(row["long"], 6),
        "type":  "Feature",
        "properties": {
            "danger_index": int(row["danger_index"]),
            "cluster": int(row["cluster"]),
            "name":    row["nm_pol"]
        }
    })

out_json = os.path.join(os.path.dirname(__file__), '..', 'data', 'hyd_clustered.json')
with open(out_json, 'w', encoding='utf-8') as f:
    json.dump(features, f, indent=2)
print(f"Written: {out_json}")
print(f"\nDone. {len(df)} points clustered into {N_CLUSTERS} danger levels.")
