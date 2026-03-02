import joblib
import pandas as pd

# Charger le modèle
model = joblib.load("modele_ia/models/zone_risque_model.pkl")

# Donnée exemple
zone = pd.DataFrame([{
    "longitude": 14.7000,
    "latitude": -17.4300,
    "NbIncidents": 4,
    "TypeIncident": 1,  
    "heure": 22,
    "zoneIsolee": 1
}])

# Prédire
prediction = model.predict(zone)
niveau = prediction[0]

# Mapping
risque = {0: "Faible", 1: "Moyen", 2: "Élevé"}
recommandation = {
    0: "Zone sûre, recommandée",
    1: "Soyez prudent",
    2: "Zone à éviter"
}

print("Niveau de risque :", risque[niveau])
print("Recommandation :", recommandation[niveau])

def get_recommandation(niveau):
    if niveau == 0:
        return "Zone sûre. Bonne pour les déplacements."
    elif niveau == 1:
        return "Risque moyen. Soyez vigilant."
    else:
        return "Zone dangereuse. À éviter."

print(get_recommandation(niveau))