import requests

API_KEY = "AIzaSyCXE5oJk_5MP3Uy6fFXsAX8_Vmvbj0Eu9I"

url = "https://places.googleapis.com/v1/places:searchText"

headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": API_KEY,
    "X-Goog-FieldMask": "places.displayName,places.formattedAddress"
}

data = {
    "textQuery": "Hyderabad police station"
}

r = requests.post(url, headers=headers, json=data)
print(r.json())
