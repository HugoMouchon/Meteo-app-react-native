import { Alert, View } from "react-native";
import { s } from "./Home.style";
import { useEffect, useState } from "react";
import * as NavigationBar from 'expo-navigation-bar';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync } from "expo-location";
import { MeteoAPI } from "../../api/meteo";
import { MeteoBasic } from "../../components/MeteoBasic/MeteoBasic";
import { getWeatherInterpretation } from "../../services/meteo-service";
import { MeteoAdvanced } from "../../components/MeteoAdvanced/MeteoAdvanced";
import { useNavigation } from "@react-navigation/native";
import { SearchBar } from "../../components/SearchBar/SearchBar";

export function Home() {

    // Etat qui permet de stocker les coordonnées du téléphone
    const [coords, setCoords] = useState();
    // Etat qui permet de stocker les doonnées de l'API via les coordonnées de l'utilisateur
    const [weather, setWeather] = useState();
    // Etat qui permet de stocker la donnée de l'API (nom de la ville) via les coordonnées de l'utilisateur
    const [city, setCity] = useState();

    const nav = useNavigation();
    // Constante qui permet de stocker et de vérifier si "current_weather" existe dans le state.
    const currentWeather = weather?.current_weather

    // Permet de changer la couleur de la NavigationBar d'Android
    useEffect(() => {
        NavigationBar.setBackgroundColorAsync("#000040");
    }, []);

    // Permet de récuperer les positions GPS une seule fois lors du chargemment de l'application
    useEffect(() => {
        getUserCoords();
    }, []);

    // Permet de faire appel à la fonction fetchWeather et fetchCity chaque fois que les coordonnées changent.
    useEffect(() => {
        if (coords) {
            fetchWeather(coords)
            fetchCity(coords)
        }
    }, [coords]);

    // Fonction qui permet de demander à l'utilisateur de partager ou non sa position GPS.
    // Si OUI ====> on récupère ses positions est on les sauvegardes via le setCoords prévu à cet effet.
    // Si NON ====> on affiche des fausses coordonnées, par exemple ici, ceux de Paris.
    async function getUserCoords() {
        let { status } = await requestForegroundPermissionsAsync();
        if (status == "granted") {
            const location = await getCurrentPositionAsync();
            setCoords({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            })
        } else {
            setCoords({ lat: "48.85", lng: "2.35" });
        }
    }

    // Fonction asynchrone (promesse, attente) qui permet de récuperer les données de l'API selon les coordonnées du téléphone
    // Il stock en suite les données attendu dans le state "weather".
    async function fetchWeather(coordinates) {
        const weatherResponse = await MeteoAPI.fetchWeatherFromCoords(coordinates);
        setWeather(weatherResponse);
    }

    // Fonction asynchrone (promesse, attente) qui permet de récuperer les données de l'API selon les coordonnées du téléphone
    // Il stock en suite le npm de la ville dans le state "city".
    async function fetchCity(coordinates) {
        const cityResponses = await MeteoAPI.fetchCityFromCoords(coordinates);
        setCity(cityResponses);
    }

    async function fetchCoordsByCity(city) {
        try {
            const coords = await MeteoAPI.fetchCoordsFromCity(city);
            setCoords(coords);
        } catch (e) {
            Alert.alert("Oups !", e);
        }
    }

    function goToForecastPage() {
        nav.navigate("Forecast", { city, ...weather.daily })
    }

    return currentWeather ? (
        <>
            <View style={s.meteo_basic}>
                {/* Composant qui affiche
                    - La température actuelle arrondi au nombre entier
                    - Le nom de la ville 
                    - le label et le graphique correspondant au temps actuel (la fonction 'getWeatherInterpretation' étant dans "meteo-service.js")
                */}
                <MeteoBasic
                    temperature={Math.round(currentWeather?.temperature)}
                    city={city}
                    interpretation={getWeatherInterpretation(currentWeather.weathercode)}
                    onPress={goToForecastPage}
                />
            </View>
            <View style={s.searchbar_container}>
                <SearchBar onSubmit={fetchCoordsByCity} />
            </View>
            <View style={s.meteo_advanced}>
                <MeteoAdvanced wind={currentWeather.windspeed} dusk={weather.daily.sunrise[0].split("T")[1]} down={weather.daily.sunset[0].split("T")[1]} />
            </View>
        </>
    ) : null
}
