import React from 'react';
import { useState, useEffect } from 'react';
import { Alert, Button, Image, PermissionsAndroid, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
// import leftAngleBracket from './logo.png' 

const Quotes = () => {

	const dateFromAPI = new Date(2023, 1, 21);
	const quotesFromAPI = 
		[{
			messageId:"ID1",
			score:1,
			body: "blah1",
			date: dateFromAPI
		}, {
			messageId:"ID2",
			score: 2,
			body: "blah2",
			date: dateFromAPI
		}, {
			messageId:"ID3",
			score: 3,
			body: "blah3",
			date: dateFromAPI
		},{
			messageId:"ID4",
			score: 4,
			body: "blah4",
			date: dateFromAPI
		}, {
			messageId:"ID5",
			score: 5,
			body: "blah5",
			date: dateFromAPI
		},{
			messageId:"ID6",
			score: 6,
			body: "blah6",
			date: dateFromAPI
		}, {
			messageId:"ID7",
			score: 7,
			body: "blah7",
			date: dateFromAPI
		},{
			messageId:"ID8",
			score: 8,
			body: "blah8",
			date: dateFromAPI
		}, {
			messageId:"ID9",
			score: 9,
			body: "blah9",
			date: dateFromAPI
		},{
			messageId:"ID10",
			score: 10,
			body: "blah10",
			date: dateFromAPI
		}]
	

	const [position, setPosition] = useState<Geolocation.GeoPosition | null>(null);
	const [quotes, setQuotes] = useState<any | null>(null);
	const [quoteIndex, setQuoteIndex] = useState<number>(0);
	const [textInput, setTextInput] = useState('');
	const [alert, setAlert] = useState(false);
	const [empty, setEmpty] = useState(false);
	const [userId, setUserId] = useState('1234')

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
					  fetchQuotes();
					},
					(error) => {
					  console.log(error.code, error.message);
					},
					{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
				);
			  }
		  })
	}, []);

	useEffect(() => {
		fetchQuotes()
	}, [position])

	const fetchQuotes = async () => {

		fetch(`https://soapstone.herokuapp.com?latitude=${position?.coords.latitude}&longitude=${position?.coords.longitude}&userid=${userId}`, {
			method: "GET",
			headers: { 'Content-Type': 'application/json'},   
		})
		.then(res => res.json())
		.then(result => {
			let resultArray:any = [];
			result.forEach((item: any) => {
				console.log(item)
				resultArray.push(QuoteObj(item.messageId, item.score, item.body, item.date));
				console.log(item.body);
			});
			setQuotes(resultArray)
		});

	  }

	const sendQuote = async () => {
		if(textInput=='')
			setEmpty(true)
		else {
			await fetch(`https://soapstone.herokuapp.com?`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
					   'latitude': `${position?.coords.latitude}`,
					   'longitude': `${position?.coords.longitude}`,
					   'userid': `${userId}`,
					   'body': `${textInput}`
					 }),
			   })
			.then(res => res.json())
			.then(result => {
				if(result.success)
					setTextInput('');
				else {
					setAlert(true);
				}
			})
		}
		
	}


	return (
		<>
			<View style={styles.card}>
				<View style={styles.cardContent}>
					{quotes &&<Text>
						{quotes[quoteIndex]?.body}
					</Text>}
				</View>
			</View>
			<View style={{ flexDirection:"row", justifyContent: 'space-around', padding: 15}}>
				{quoteIndex !== 0 && <Button onPress={() => {setQuoteIndex(quoteIndex-1);}} title="Back"/>}
				{quoteIndex !== quotes?.length -1 &&<Button onPress={() => {setQuoteIndex(quoteIndex+1);}} title="Next"/>}
			</View>
			<TextInput style={styles.input} onChangeText={textInput => {setTextInput(textInput); setEmpty(false); setAlert(false)}} placeholder="Share your thoughts" value={textInput} multiline
        numberOfLines={8}/>
		{alert && <Text style={{color:'red'}}>Could not submit message!</Text>}
		{empty && <Text style={{color:'red'}}>Please type a message!</Text>}
			<View style={{padding: 15}}>
				<Button onPress={() => sendQuote()} title="Submit"/>
			</View>

		</>	
	);
};

const QuoteObj = (messageId: string, score: number, body: string, date: Date) => { return { messageId : messageId, score : score, body : body, date : date }}

const styles = StyleSheet.create({
	input: {
		height: '30%',
		margin: 12,
		borderWidth: 1,
		padding: 10,
		borderColor: 'lightgray',
		
	  },
	card: {
		boarderRadius: 6,
		elevation: 3,
		backgroundColor: '#fff',
		shadowOffset: {width: 1, height: 1},
		shadowColor: '#333',
		shadowOpacity: 0.3,
		shadowRadius: 2,
		marginHorizontal: 4,
		marginVertical: 6,
		height: "45%",
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 20
	},
	cardContent: {
		marginHorizontal: 18,
		marginVertical: 40,
		justifyContent: 'center',
		alignItems: 'center'
	}
})

export default Quotes;