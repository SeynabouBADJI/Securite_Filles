from modele_ia.preprocessing.preprocess import preprocess_data
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# Charger et préparer les données
data = preprocess_data("modele_ia/data/raw/zone_risque.csv")

print(data.columns)  # debug (à enlever ensuite)

# Séparer X et y
X = data.drop("NiveauRisque", axis=1)
y = data["NiveauRisque"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Modèle
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# Évaluation
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Sauvegarde
joblib.dump(model, "modele_ia/models/zone_risque_model.pkl")
print("Modèle sauvegardé")