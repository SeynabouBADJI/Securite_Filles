from fastapi import FastAPI
import joblib
import pandas as pd
from modele_ia.recommendation.recommend import recommander_zones

app = FastAPI()

# Charger le modèle une seule fois
model = joblib.load("modele_ia/models/zone_risque_model.pkl")


@app.post("/predict")
def predict(data: dict):
    """
    Prédit le niveau de risque pour une zone.
    data : dict avec les features
    """

    df = pd.DataFrame([data])

    # encoder TypeIncident
    if "TypeIncident" in df.columns:
        df["TypeIncident"] = df["TypeIncident"].astype("category").cat.codes

    prediction = model.predict(df)[0]

    return {"risque": int(prediction)}


@app.post("/recommend")
def recommend(data: list):
    """
    Recommande les zones les plus sûres.
    data : liste de zones (dictionnaires)
    """

    df = pd.DataFrame(data)

    zones = recommander_zones(model, df, top=5)

    return zones.to_dict(orient="records")
