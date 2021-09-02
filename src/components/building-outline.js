import React, {useEffect, useState, Fragment} from 'react';
import mapboxgl from 'mapbox-gl';
import geojson from '../featuresOfKowloonEastGovernmentOffices';
import {debounce as _debounce} from 'lodash';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hpbHNhIiwiYSI6ImNrczhjcjJqYjB4Y3YybmxoZXF4MGxpN2IifQ.MCk1P9kZx-xxYmF1Ne6IlQ';

function initMapbox() {
	return new mapboxgl.Map({
		style: 'mapbox://styles/mapbox/streets-v11',
		center: [114.22980247477426, 22.310013597985446],
		zoom: 18.5,
		pitch: 60,
		container: 'map'
	});
}

function getLabelLayerId(mapboxMap) {
	const layers = mapboxMap.getStyle().layers;
	let labelLayerId;
	for (let i = 0; i < layers.length; i++) {
		if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
			labelLayerId = layers[i].id;
			break;
		}
	}
	return labelLayerId;
}

export default function BuildingOutline() {
	const [map, setMap] = useState(null);
	const [info, setInfo] = useState(null);
	
	useEffect(() => {
		const _map = initMapbox();
		setMap(_map);
		_map.on('load', () => {
			const labelLayerId = getLabelLayerId(_map);
			
			// render buildings a level a layer
			geojson.features.forEach(feature => {
				_map.addLayer({
					id: feature.properties['ref:building'] + '-' + feature.properties.id,
					type: 'fill-extrusion',
					minzoom: 15,
					source: {
						type: 'geojson',
						data: feature
					},
					paint: {
						'fill-extrusion-color': '#918aa5',
						'fill-extrusion-height': [
							'interpolate', ['linear'], ['zoom'],
							15, 0,
							15.05, ['+', ['to-number', ['get', 'BaseLevel']], ['to-number', ['get', 'Height']]]
						],
						'fill-extrusion-base': [
							'interpolate', ['linear'], ['zoom'],
							15, 0,
							15.05, ['to-number', ['get', 'BaseLevel']]
						],
						'fill-extrusion-opacity': .5
					}
				}, labelLayerId);
			});
			
			// add building source
			_map.addSource('3d-building-source', {
				type: 'geojson',
				data: geojson
			});
			
			// render building top
			_map.addLayer({
				id: '3d-building-top-layer',
				type: 'fill-extrusion',
				minzoom: 15,
				source: '3d-building-source',
				paint: {
					'fill-extrusion-color': '#73688e',
					'fill-extrusion-height': [
						'interpolate', ['linear'], ['zoom'],
						15, 0,
						15.05, ['+', ['to-number', ['get', 'BaseLevel']], ['to-number', ['get', 'Height']]]
					],
					'fill-extrusion-base': [
						'interpolate', ['linear'], ['zoom'],
						15, 0,
						15.05, ['+', ['to-number', ['get', 'BaseLevel']], ['to-number', ['get', 'Height']]]
					],
					'fill-extrusion-opacity': 1
				}
			});
			
			// mouse hove level event
			let activeLevel = {layerId: '', opacity: ''};
			_map.on('mousemove', _debounce(setLevelActive, 50));
			
			function setLevelActive(e) {
				const target = _map.queryRenderedFeatures(e.point)[0];
				if (target?.properties?.level === 'yes') {
					if (target.layer.id !== activeLevel.layerId) {
						if (activeLevel.layerId.length) {
							restoreStyle();
						}

						setInfo(target.properties || null);
						activeLevel.layerId = target.layer.id;
						activeLevel.opacity = target.layer.paint['fill-extrusion-opacity'];
						
						_map.setPaintProperty(target.layer.id, 'fill-extrusion-opacity', 1);
					}
				} else if (activeLevel.layerId.length) {
					restoreStyle();
				}
			}
			
			function restoreStyle() {
				_map.setPaintProperty(activeLevel.layerId, 'fill-extrusion-opacity', activeLevel.opacity);
				activeLevel.layerId = '';
				activeLevel.opacity = '';
				setInfo(null);
			}
		});
	}, []);
	
	return (
		<Fragment>
			<div id='map'/>
			<div style={{
				position: 'absolute',
				left: '10px',
				top: '10px',
				width: '200px',
				height: '70px',
				padding: '8px 10px',
				borderRadius: '10px',
				backgroundColor: 'rgba(255, 255, 255, .7)'
			}}>
				<div>Level Name: {info?.name || '--'}</div>
				<div>Height: {info?.Height || '--'}</div>
				<div>Base Height: {info?.BaseLevel || '--'}</div>
			</div>
		</Fragment>
	)
}
