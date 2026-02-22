
import pandas as pd
from sklearn.preprocessing import LabelEncoder

def preprocess_data(path):
    data = pd.read_csv(path, sep=";")

    # Encoder le type d'incident
    encoder = LabelEncoder()
    data["TypeIncident"] = encoder.fit_transform(data["TypeIncident"])

    # Encoder le niveau de risque
    data["Niveau risque"] = encoder.fit_transform(data["Niveau risque"])

    return data
