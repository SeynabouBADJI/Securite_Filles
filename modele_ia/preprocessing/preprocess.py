import pandas as pd

def preprocess_data(path):
    data = pd.read_csv(path, sep=";")

    # Encodage du type d’incident
    if "TypeIncident" in data.columns:
        data["TypeIncident"] = data["TypeIncident"].astype("category").cat.codes

    # S’assurer que la cible s’appelle bien NiveauRisque
    if "Niveau risque" in data.columns:
        data = data.rename(columns={"Niveau risque": "NiveauRisque"})

    return data