
import React from 'react';
import { useState, useEffect } from 'react';
import { PermissionsAndroid, Text} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const Quotes = () => {

	const [position, setPosition] = useState<Geolocation.GeoPosition | null>(null);

	useEffect(() => {    
		PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			{
			  title: 'Geolocation Permission',
			  message: 'Can we access your location?',
			  buttonNeutral: 'Ask Me Later',
			  buttonNegative: 'Cancel',
			  buttonPositive: 'OK',
			},
		  ).then((granted) => {
			if (granted) {
				Geolocation.getCurrentPosition(
					(pos) => {
					  console.log(pos);
					  setPosition(pos);
					},
					(error) => {
					  console.log(error.code, error.message);
					},
					{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
				);
			  }
		  })
	}, []);

	return (
		<>
			<Text>{position?.coords.latitude} </Text>
			<Text>{position?.coords.longitude} </Text>
		</>
	);
};


export default Quotes;