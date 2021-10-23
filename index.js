// Центр Липецка
const Center = [39.557099, 52.605997]
const [x,y] = Center;

// Ход шага для случайных точек на КАРТЕ
const deltaX = 0.01;
const deltaY = 0.005;

let count = 4;
count = Math.sqrt(count);
let hashMap = new Map();

const API_TOKEN_OW = "1b99702cd40332f06fe858e5060639b6";

class Point {
    constructor(lat0,long0) {
        this.lat  = lat0;
        this.long = long0;
    }
    toString(){
        return `lat=${this.lat}&lon=${this.long}`
    }
}

mapboxgl.accessToken = 'pk.eyJ1IjoicG9zdG1hbjMzIiwiYSI6ImNrdXNxbGh4OTBxanMyd28yanB3eDM4eDEifQ.WrqvvPXOzXuqQMpfkNutCg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: Center,
    zoom: 11
});

// Погода в точке
let GetPrecipitations = async function( point ) {
    let response = await fetch(`http://localhost:3000/test?${point.toString()}`,{ mode: "no-cors" });

    //получаем погоду и hashMap.set(point.toString(), ПОГОДА);
    // if (response.ok) {
    //     // получаем тело ответа (см. про этот метод ниже)
    //     let json = await response.json();
    //     console.log(json)
    //     for (let weatherInfo of json["minutely"]){
    //         //   console.log(weatherInfo);
    //         //суммируем все минуты?
    //     }
    //     hashMap.set(point.toString(), json)
    // } else {
    //     //alert("Ошибка HTTP: " + response.status);
    // }
}

map.on('load', () => {
    // Создаем маркеры на которых будем брать погоду

    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                            [ 39.539346, 52.583877 ],
                            [ 39.519265, 52.594214 ],
                            [ 39.519442, 52.595074 ],
                            [ 39.52254, 52.597562 ],
                            [ 39.522441, 52.605667 ],
                            [ 39.529446, 52.609055 ],
                            [ 39.548217, 52.618942 ],
                            [ 39.53239, 52.633407 ],
                            [ 39.531986, 52.638369 ],
                            [ 39.54996, 52.648042 ],
                            [ 39.589025, 52.659272 ],
                            [ 39.599016, 52.660523 ],
                            [ 39.637494, 52.659372 ],
                            [ 39.644983, 52.65711 ],
                            [ 39.664135, 52.646717 ],
                            [ 39.688783, 52.645312 ],
                            [ 39.688916, 52.644197 ],
                            [ 39.688011, 52.645244 ],
                            [ 39.689212, 52.647017 ],
                            [ 39.666039, 52.646502 ],
                            [ 39.660884, 52.647909 ],
                            [ 39.653252, 52.652392 ],
                            [ 39.653275, 52.65243 ]
                ]
            }
        }
    });
    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#888',
            'line-width': 8
        }
    });
});

