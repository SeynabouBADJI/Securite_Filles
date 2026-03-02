import joblib
import pandas as pd
from modele_ia.recommendation.recommend import recommander_zones
# Charger le modèle
model = joblib.load("modele_ia/models/zone_risque_model.pkl")

# Charger le dataset des zones (exemple)
zones = pd.read_csv(
    "modele_ia/data/raw/zone_risque.csv",
    sep=";"
)
# Obtenir les recommandations
zones_sures = recommander_zones(model, zones, top=5)

# Affichage
print(zones_sures[["longitude", "latitude", "NbIncidents", "label_risque"]])