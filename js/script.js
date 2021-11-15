const key = '';
var name;

// get weather data
function getWeather( cityName ) {
	fetch(
		"https://api.openweathermap.org/data/2.5/weather?q=" +
		  cityName +
		  "&units=metric" +
		  "&lang=nl" +
		  "&appid=" +
		  key
	  )  
	.then(function(resp) { return resp.json() })
	.then(function(data) {
		name = data.name;
		showWeather(data);
		if (!$("#weatherMap").hasClass("leaflet-container")) {
		  showMap(data);
		} else {
		  updateMap(data);
		}
		getForecast(data);
		setMessage(data);
	})
	.catch(function() {
		console.log('error finding weather data');
	});
}
// get forecast data
function getForecast (data) {
	fetch('https://api.openweathermap.org/data/2.5/onecall?lat='+data.coord.lat+'&lon='+data.coord.lon+'&exclude=current,minutely,hourly,alerts&units=metric&lang=nl&appid=' + key)
	.then(function(resp) {return resp.json() })
	.then(function(data) {
		showForecast(data, name);
		console.log(data);
	})
}
// resolve city from ip address
function ipresolver() {
	fetch('http://ip-api.com/json/')
		.then(function(res) { return res.json();})
		.then(function(data) { getWeather(data.city);})
		.catch(function(err) {
			console.log('Fetch Error :-S', err);
		});
}
// display weather data
function showWeather(weatherdata) {	
	document.getElementById("weatherDetails").innerHTML = `<h1>${
	  weatherdata.name
	}</h1>
	  <img src="http://openweathermap.org/img/wn/${
	  weatherdata.weather[0].icon
	}@2x.png">
	  <p>Temperatuur: ${Math.round(weatherdata.main.temp)} &#8451;</p>
	  <p>${weatherdata.main.humidity}% luchtvochtigheid</p>
	  <p>${weatherdata.weather[0].description}</p>`;
}
// display weather forecast
function showForecast(data) {
	var options = {
	  weekday: "short",
	  month: "short",
	  day: "numeric",
	};
	text = `<h2>${name}</h2><ul>`;
	for (i = 0; i < 8; i++) {
	  date = data.daily[i].dt * 1000;
	  dateobject = new Date(date);
	  text += `<li><span>${dateobject.toLocaleString("nl", options)}
	  </span><div><div><img src="http://openweathermap.org/img/wn/${
	  data.daily[i].weather[0].icon
	}.png"><span>
	  ${Math.round(data.daily[i].temp.day)} &#8451;</span></div><span>${
		data.daily[i].weather[0].description
	  }</span></div></li>`;
	}
	text += `</ul>`;
	document.getElementById("forecast").innerHTML = text;
}
// display rain map

function showMap(data)   {
	let mapType = 'precipitation_new';
	weatherMap = L.map('weatherMap').setView([data.coord.lat,data.coord.lon], 10);
	// L.tileLayer('https://tile.openweathermap.org/map/'+mapType+'/10/50/4.png?appid='+key, {}).addTo(weatherMap);
	var baseMap;
	L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=lNCJcueSDDa6IbEpwAZh',{
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
      })
	  .addTo(weatherMap);
	  L.tileLayer(
		"https://tilecache.rainviewer.com/v2/radar/nowcast_15412d1f79ff/512/{z}/{x}/{y}/8/1_1.png",
		{})
	  
	  .addTo(weatherMap);
}

function setMessage(data)	{
	createRainCanvas();
	$('#canvas').hide();

	//all different settings for different weather codes

	setContainerBackground(data.weather[0].id);

	setWeathermessage(data);
	
}

function updateMap(data)	{
	weatherMap.flyTo([data.coord.lat,data.coord.lon], 10);
}
// create tab functionality
function weatherTabs() {
  $(function () {
    $("#tabs").tabs();
  });
}

// execute on load of window
window.onload = function() {
	weatherTabs();
	weatherData = ipresolver();
	$("#locationFinder").change(function() {
		getWeather($("#locationFinder").val());
	  });
}

function createRainCanvas()	{
	var canvas = $('#canvas')[0];
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	if(canvas.getContext) {
	var ctx = canvas.getContext('2d');
	var w = canvas.width;
	var h = canvas.height;
	ctx.strokeStyle = 'rgba(174,194,224,0.5)';
	ctx.lineWidth = 1;
	ctx.lineCap = 'round';
	
	
	var init = [];
	var maxParts = 1000;
	for(var a = 0; a < maxParts; a++) {
		init.push({
		x: Math.random() * w,
		y: Math.random() * h,
		l: Math.random() * 1,
		xs: -4 + Math.random() * 4 + 2,
		ys: Math.random() * 10 + 10
		})
	}
	
	var particles = [];
	for(var b = 0; b < maxParts; b++) {
		particles[b] = init[b];
	}
	
	function draw() {
		ctx.clearRect(0, 0, w, h);
		for(var c = 0; c < particles.length; c++) {
		var p = particles[c];
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
		ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
		ctx.stroke();
		}
		move();
	}
	
	function move() {
		for(var b = 0; b < particles.length; b++) {
		var p = particles[b];
		p.x += p.xs;
		p.y += p.ys;
		if(p.x > w || p.y > h) {
			p.x = Math.random() * w;
			p.y = -20;
		}
		}
	}
	
	setInterval(draw, 30);
	
	}
}

function setContainerBackground(weatherCode)	{
	weatherCode = 800;
	console.log(weatherCode);
	if (Array.from({length:99}, (x,i) => i + 200).includes(weatherCode))	{
		console.log('thunder switch');
		$("#container").css({
			'background': 'linear-gradient(to bottom, gray 0%, yellow 50%, grey 100%)',
		});
		$('#canvas').css({
			'opacity': '1.0',
		});
		$('#canvas').show();
		return;
	}

	if (Array.from({length:99}, (x,i) => i + 300).includes(weatherCode))	{
		console.log('drizzle switch');
		$("#container").css({
			'background': '#aec4cf',
			// "background": "linear-gradient(to bottom, #AAA 100vw, #555 100%)"
		});
		$('#canvas').css({
			'opacity': '0.3',
		});
		$('#canvas').show();
		return;
	}

	if (Array.from({length:99}, (x,i) => i + 500).includes(weatherCode))	{
		console.log('rain switch');
		$("#container").css({
			'background': 'linear-gradient(to bottom, #AAA 100vw, #555 100%',
		});
		$('#canvas').css({
			'opacity': '0.7',
		});
		$('#canvas').show();
		return;
	}
	
	if (Array.from({length:99}, (x,i) => i + 600).includes(weatherCode))	{
		console.log('snow switch');
		$("#container").css({
			'background': '#EEE',
		});
		return;
	}
	
	if (Array.from({length:99}, (x,i) => i + 700).includes(weatherCode))	{
		console.log('atmosphere switch');
		//means fog
		$("#container").css({
			'background': '#333',
		});
		return;
	}

	if (weatherCode === 800)	{
		console.log('clear switch');
		$("#container").css({
			// 'background': 'radial-gradient(farthest-corner, #faffa3 0%, #f6f7da 40vw, rgba(0,0,0,1)),linear-gradient(#a1c5ff 15%, #a4bade 100%)',
		
			'background': 'radial-gradient(linear-gradient(to bottom, #a1c5ff 15%, #a4bade 100%)',
		});
		return;
	}
	
	if (Array.from({length:98}, (x,i) => i + 801).includes(weatherCode))	{
		console.log('clouds switch');
		$("#container").css({
			'background': '#999',
		});
		return;
	}

	console.log('default switch');
	$("#container").css({
		'background': 'darkslateblue',
	})
	document.getElementById("weatherMessage").innerHTML = "Error, API niet gevonden";
	return;
}

function setWeathermessage(data)	{
	let temperature = data.main.temp;

	let weatherMessage = document.getElementById("weatherMessage").innerHTML;
	
	//array with good weather conditions, values are the temperatures to be used in final calc. (if weather code is present)
	const goodConditions	= {
		800: '8',
		801: '5',
		802: '3',
	};

	//if bad weather conditions
	if (Array.from({length:699}, (x,i) => i + 0).includes(data.weather[0].id))	{
		document.getElementById("weatherMessage").innerHTML = 'Het is niet goed weer<br>Neem een paraplu mee';
		return;
	} else 	{
	//if not bad weather conditions
		if (goodConditions.hasOwnProperty(data.weather[0].id))	{
			console.log(temperature);
			temperature = temperature + goodConditions[data.weather[0].id];
		}
		console.log(temperature);
		if(temperature<15){
			document.getElementById("weatherMessage").innerHTML = "Het is vandaag koud";
		} else {
			document.getElementById("weatherMessage").innerHTML = "Het is vandaag warm";
		}
		return;
	}
}