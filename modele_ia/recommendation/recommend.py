import pandas as pd
import joblib

def recommander_zones(model, data, top=5):
    data = data.copy()

    # enlever cible
    if "NiveauRisque" in data.columns:
        data = data.drop(columns=["NiveauRisque"])

    # encoder TypeIncident
    if "TypeIncident" in data.columns:
        data["TypeIncident"] = data["TypeIncident"].astype("category").cat.codes

    # prédire
    data["risque"] = model.predict(data)

    data["label_risque"] = data["risque"].map({
        0: "Faible",
        1: "Moyen",
        2: "Élevé"
    })

    zones_sures = data[data["risque"] == 0]

    if "NbIncidents" in data.columns:
        zones_sures = zones_sures.sort_values("NbIncidents")

    return zones_sures.head(top)

def get_recommandation_message(niveau):
    if niveau == 0:
        return "Zone sûre, recommandée"
    elif niveau == 1:
        return "Soyez prudent"
    else:
        return "Zone à éviter"
    
