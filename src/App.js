import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from 'date-fns';

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [animate, setAnimate] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [formattedTime, setFormattedTime] = useState(null);
  const [backgroundClass, setBackgroundClass] = useState("background-Default"); // Default background
  const [isLoading, setIsLoading] = useState(false);



  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=ca49a4bbd137100d10c9dc44fb8670f3`;

  const searchLocation = (event) => {
    if (event.key === "Enter" && location.trim() !== "") {
      setData({});
      setAnimate(false);
      axios.get(url)
        .then((response) => {
          console.log("API Response:", response.data);
          setData(response.data);
          triggerAnimation();
        })
        .catch(error => {
          console.error("Error fetching weather data:", error);
        });
      setLocation("");
    }
  };

  const triggerAnimation = () => {
    setTimeout(() => {
      setAnimationKey(prevKey => prevKey + 1);
      setAnimate(true);
    }, 50);
  };

  //Fix the damn time function

  useEffect(() => {
    if (data.dt && data.timezone !== undefined) {
      const utcDate = new Date((data.dt - 7200) * 1000); // Convert epoch time to a Date object in milliseconds
      const localDate = new Date(utcDate.getTime() + data.timezone * 1000); // Adjust for timezone in milliseconds
      const formatted = format(localDate, 'MMM d, yyyy h:mm a'); // Format the local time
      setFormattedTime(formatted);

      if (data.weather) {
        if (data.weather.length > 0) {
          const mainWeather = data.weather[0].main;
          switch (mainWeather) {
            case 'Clear':
              setBackgroundClass('background-Clear');
              break;
            case 'Clouds':
              setBackgroundClass('background-Clouds');
              break;
            case 'Rain':
              setBackgroundClass('background-Rain');
              break;
            default:
              setBackgroundClass('background-Default'); // Default for unknown conditions
              break;
          }
        } else {
          // Handle the case where weather array is present but empty
          setBackgroundClass('background-Default');
        }
      } else {
        // Handle the case where weather data is not yet fetched or unavailable
        setBackgroundClass('background-Default');
      }
      // Logging the debug information
      console.log("UTC Date:", utcDate);
      console.log("Local Date (Adjusted for Timezone):", localDate);
      console.log("Formatted Local Date:", formatted);
      console.log("Timezone Offset (in seconds):", data.timezone);
    }
  }, [data]);

  return (
    <div className={`app ${backgroundClass}`}>
      <div className="search">
        <input

          value={location}
          onChange={event => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder="Enter city name"
          type="text" />

      </div>
      <div className={`container ${animate ? "fade-in" : ""}`} key={animationKey}>
        {data.name && (
          <div className="top">
            <div className="location">
              <p>{data.name}</p>
            </div>
            <div className="temp">
              <h1>
                {data.main.temp.toFixed()}°C
              </h1>
            </div>
            <div className="description">
              {data.weather && <p>{data.weather[0].main}</p>}
            </div>
            <div className="time">
              {formattedTime && <div className="time"> Last Update (local time):<p>{formattedTime}</p></div>}
            </div>
          </div>
        )}
        {data.name && (
          <div className="bottom">
            <div className="feels">
              {data.main && <p className="bold">{data.main.feels_like.toFixed()}°C</p>}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main && <p className="bold">{data.main.humidity}%</p>}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.main && <p className="bold">{data.wind.speed.toFixed()} km/h</p>}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
