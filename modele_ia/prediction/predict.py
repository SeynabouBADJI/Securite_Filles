import joblib
import pandas as pd

model = joblib.load("modele_ia/models/zone_risque_model.pkl")
zone = pd.DataFrame([{
    "longitude": -17.45,
    "latitude": 14.69,
    "NbIncidents": 10,
    "TypeIncident": 1,
    "heure": 23,
    "zoneIsolee": 1
}])
prediction = model.predict(zone)

risque = {0: "Faible", 1: "Moyen", 2: "Élevé"}
print("Niveau de risque :", risque[prediction[0]])

