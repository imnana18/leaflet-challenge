// Data retrieval
async function dataPull() {
    // define URL of JSON file
    const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

    // promise Pending
    const dataPromise = d3.json(URL);

    // fetch JSON data and console log
    return dataPromise
}

// Create tile layer for background of map
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
    });

function styleData(data) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: '#000000',
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
    };
}
// Define a function to calculate marker size based on magnitude
function calculateMarkerSize(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
    return magnitude * 4;
}

// Define a function to calculate marker color based on depth
function calculateMarkerColor(depth) {
    if (depth < 10) return '#4ea8de';
    else if (depth < 30) return '#1c7c54';
    else if (depth < 50) return '#fcf300';
    else if (depth < 70) return '#ffc600';
    else if (depth < 90) return '#e30613';
    else return '#880d1e';
}

async function init(){

    let earthquakes = await dataPull()

    console.log(earthquakes)
    console.log(earthquakes.features[0])
    const map = L.map('map', {
        center: [40.7, -94.5],
        zoom: 3
    });

    // Add the basemap layer (you can choose a different tile layer)
    basemap.addTo(map);

    // Create a legend
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const depthRanges = [-10, 10, 30, 50, 70, 90];
    const colors = depthRanges.map((depth, index) => ({
        color: calculateMarkerColor(depth),
        label: index === depthRanges.length - 1 ? `${depth}+` : `${depth}-${depthRanges[index + 1]}`,
    }));

    for (const { color, label } of colors) {
        div.innerHTML += `<i style="background-color:${color};"></i>${label}<br>`;
    }

    return div;
    };

    legend.addTo(map);

    // Loop through the earthquake data and create markers
    earthquakes.features.forEach(earthquake => {

    const { geometry, properties } = earthquake;
    const { coordinates } = geometry;
    const [longitude, latitude, depth] = coordinates;
    const { mag, place } = properties;

    const marker = L.circleMarker([latitude, longitude], {
        radius: calculateMarkerSize(mag, map.getZoom()),
        fillColor: calculateMarkerColor(depth),
        color: '#000',
        weight: 0.1,
        opacity: 0.6,
        fillOpacity: 0.4,
    }).addTo(map);

    console.log(map.getZoom())

    // add marker labels
    marker.bindPopup(`<b>${place}</b><br>Magnitude: ${mag}<br>Depth: ${depth} km`);
}); 
}

init()

