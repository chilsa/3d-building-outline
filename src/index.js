import React from 'react';
import ReactDom from 'react-dom';
import BuildingOutline from './components/building-outline';

ReactDom.render(<BuildingOutline/>, document.getElementById('app'));

/*
map.addLayer({
	id: '3d-building-layer',
	type: 'fill-extrusion',
	minzoom: 15,
	source: '3d-building-source',
	paint: {
		'fill-extrusion-color': '#918aa5',
		'fill-extrusion-height': [
			'interpolate', ['linear'], ['zoom'],
			15, 0,
			15.05, ['to-number', ['get', 'Height']]
		],
		'fill-extrusion-base': [
			'interpolate', ['linear'], ['zoom'],
			15, 0,
			15.05, ['to-number', ['get', 'BaseLevel']]
		],
		'fill-extrusion-opacity': .9
	}
}, labelLayerId);*/
