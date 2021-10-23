mapboxgl.accessToken = 'pk.eyJ1IjoiYW50b256dXoiLCJhIjoiY2t2MmszNnlzMDEybjMwcHA1c3ZhcmQwYyJ9.0YoIoBX5rwFe18ix7TJKHw';
const Center = [39.557099, 52.605997] // Центр Липецка
let count = 4; count = Math.sqrt(count);

class Point {
    constructor(lat0,long0) {
        this.lat  = lat0;
        this.long = long0;
    }
    toString(){
        return `lat=${this.lat}&lon=${this.long}`
    }
    get length(){
        return Math.sqrt( this.lat*this.lat + this.long*this.long)
    }
    static Distance(P1, P2){
        return (new Point(10000*(P2.lat-P1.lat),10000*(P2.long-P1.long))).length
    }
    get mapBoxFormat(){
        return [this.lat,this.long]
    }
}

function StrToPoint(strPoint) {
    let dateRegexp = /lat=(?<lat>[0-9]+\.[0-9]+)&lon=(?<lon>[0-9]+\.[0-9]+)/;
    let groups = strPoint.match(dateRegexp).groups;
    return new Point(+groups.lat, +groups.lon)
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
        let min = 50000;
        let max = 0;
        let response = await fetch("http://localhost:3000/getPoints?date='2021-10-25'");
        console.log(response.status);
        if (response.ok) {
            let json = await response.json();
            console.log(json)

            for( let point in json){
                if (!json.hasOwnProperty(point)) continue;
                let pointPercMM = json[point];
                if (pointPercMM > max) max = pointPercMM;
                if (pointPercMM < min) min = pointPercMM;
            }
            for( let point in json){
                if (!json.hasOwnProperty(point)) continue;
                let R,G,B;
                let pointClass = StrToPoint(point)
                let pointPercMM = json[point];
                let normalizeX = pointPercMM/max;
                if (normalizeX>=0 && normalizeX <0.4){
                   R = 0;
                   G = 255;
                   B = 0;
                }
                if (normalizeX>=0.4 && normalizeX <0.7){
                    R = 255;
                    G = 255;
                    B = 0;
                }
                if (normalizeX>=0.7){
                    R = 255;
                    G = 0;
                    B = 0;
                }

                polyGon(pointClass.mapBoxFormat, name = "polygon-"+point.toString(), rgbToHex(R, G, B))
            }

            console.log(`min=${min},max=${max}`)
        }

    }();

    getCoordinates(function (json) {
        let i = 1;
        for (let garage in json.garages) {
            addRoute(garage, [...json.garages[garage].res], rgbToHex(255, 51, i * 100))
            let ob = json.garages[garage]
            for (let c in ob.copy) {
               // let ob2 = ob.copy[c]
               // let mark = [ob2.coords.lat, ob2.coords.long];
                //new mapboxgl.Marker().setLngLat(mark).addTo(map);
            }
            i++
        }
    })


    map.addSource('places', {
        'type': 'geojson',
        'data': places
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
});

function polyGon(center, name = "polygon", HEX_Color) {
    let [lat, long] = center;
    let dxy = 0.0047
    let dy =0.002
    map.addSource(name, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        [lat - dxy, long + dxy -dy ],
                        [lat - dxy , long-dy],
                        [lat + dxy, long-dy],
                        [lat + dxy, long + dxy-dy ],
                        [lat - dxy, long + dxy-dy ],
                    ]
                ]
            }
        }
    });
    // Заливка полигона
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

    map.addLayer({
        'id': `outline-${name}`,
        'type': 'line',
        'source': `${name}`,
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 1
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
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

