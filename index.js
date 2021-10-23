mapboxgl.accessToken = 'pk.eyJ1IjoiYW50b256dXoiLCJhIjoiY2t2MmszNnlzMDEybjMwcHA1c3ZhcmQwYyJ9.0YoIoBX5rwFe18ix7TJKHw';
// Центр Липецка
//const Center = [39.06, 43.98]
const Center = [39.557099, 52.605997]
// Ход шага для случайных точек на КАРТЕ
const deltaX = 0.01;
const deltaY = 0.005;

let count = 4;
count = Math.sqrt(count);

class Point {
    constructor(lat0, long0) {
        this.lat = lat0;
        this.long = long0;
    }

    toString() {
        return `lat=${this.lat}&lon=${this.long}`
    }
}

// Погода в точке
let getCoordinates = async function (cb) {
    let response = await fetch("http://localhost:3000/calcPaths?date='2021-10-24'");

    console.log(response.status);
    if (response.ok) {
        //     // получаем тело ответа (см. про этот метод ниже)
        let json = await response.json();
        console.log(json)
        cb(json)
    }
}

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    //style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: Center,
    zoom: 10
});
const places = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'properties': {
                'description': "Garage 1",
                'icon': 'theatre-15'
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [39.53994646, 52.6389125]
            }
        },
        {
            'type': 'Feature',
            'properties': {
                'description': "Garage 2",
                'icon': 'theatre-15'
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [39.52249936, 52.6055795]
            }
        }
    ]
};

map.on('load', async () => {

    // Создаем маркеры на которых будем брать погоду
    await async function f() {
        let response = await fetch("http://localhost:3000/getPoints?date='2021-10-25'");
        console.log(response.status);
        if (response.ok) {
            let json = await response.json();
            console.log(json)
        }
    }();
    getCoordinates(function (json) {
        let i = 1;
        for (let garage in json.garages) {
            addRoute(garage, [...json.garages[garage].res], rgbToHex(255, 51, i * 100))
            let ob = json.garages[garage]
            for (let c in ob.copy) {
                let ob2 = ob.copy[c]
                let mark = [ob2.coords.lat, ob2.coords.long];
                new mapboxgl.Marker().setLngLat(mark).addTo(map);
            }
            i++
        }
    })


    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',

                'coordinates': [
                    [39.557099, 52.605997],
                    [39.557451, 52.606005],
                    [39.557541, 52.605965],
                    [39.557824, 52.605754],
                    [39.558843, 52.605179],
                    [39.559862, 52.604713],
                    [39.559008, 52.604067],
                    [39.561514, 52.602921]

                ]
            }
        }
    });


    map.addSource('places', {
        'type': 'geojson',
        'data': places
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

    map.addLayer({
        'id': 'poi-labels',
        'type': 'symbol',
        'source': 'places',
        'layout': {
            'text-field': ['get', 'description'],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
            'icon-image': ['get', 'icon']
        }
    });
    mark = [39.557099, 52.605997];
    new mapboxgl.Marker().setLngLat(mark).addTo(map);
    mark = [39.558843, 52.605179];
    polyGon([39.558843, 52.605179], name = "polygon", rgbToHex(255, 0, 0))
    new mapboxgl.Marker().setLngLat(mark).addTo(map);
});
//              [
//                         [ 39.421459, 52.590104],
//                         [ 39.604742, 52.512665],
//                         [ 39.682811, 52.595398],
//                         [ 39.601194, 52.656401],
//                         [ 39.421459, 52.590104]
//                     ]
function polyGon(center, name = "polygon", HEX_Color) {
    let [lat, long] = center;
    let dxy = 0.007
    map.addSource(name, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
// These coordinates outline Maine.
                'coordinates': [
                    [
                        [lat - dxy, long + dxy / 1.2],
                        [lat - dxy / 1.1, long],
                        [lat + dxy, long],
                        [lat + dxy, long + dxy / 1.4],
                        [lat - dxy, long + dxy / 1.2],
                    ]
                ]
            }
        }
    });
// Add a new layer to visualize the polygon.
    map.addLayer({
        'id': `${name}`,
        'type': 'fill',
        'source': `${name}`, // reference the data source
        'layout': {},
        'paint': {
            'fill-color': HEX_Color || "#7f7e7e",
            'fill-opacity': 0.5
        }
    });
//Add a black outline around the polygon.
    map.addLayer({
        'id': 'outline',
        'type': 'line',
        'source': `${name}`,
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 3
        }
    });
}

function addRoute(id, data, color = '#888') {
    map.addSource(id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',

                'coordinates': data
            }
        }
    });

    map.addLayer({
        'id': id,
        'type': 'line',
        'source': id,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': `${color}`,
            'line-width': 3
        }
    });

}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

