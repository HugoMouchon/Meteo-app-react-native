import axios from "axios";

// Permet de faire appel à l'API Meteo Weather grâca a l'utilisation d'axios
export class MeteoAPI {
    static async fetchWeatherFromCoords(coords) {
        return (
            await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weathercode,temperature_2m_max,sunrise,sunset,windspeed_10m_max&timezone=auto&current_weather=true`)
        ).data;
    }

    // Permet de récupérer le nom de la ville, du village dans laquelle on se trouve grâce à l'API openStreetMap et grâce aux coordonnées transmises
    static async fetchCityFromCoords(coords) {
        const {
            address: { city, village, town },
        } = (
            await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
            )
        ).data;
        return city || village || town;
    }

    // Permet de récupérer le nom de la ville tapé dans la barre de recherche par l'utilisateur
    static async fetchCoordsFromCity(city) {
        try {
            const { latitude: lat, longitude: lng } = (await axios.get(
                `https://geocoding-api.open-meteo.com/v1/search?name=${city}&language=fr&count=1`
            )).data.results[0];

            return { lat, lng };
        } catch (e) {
            throw "Pas de coordonnées trouvées pour la recherche : " + city;
        }
    }
}
