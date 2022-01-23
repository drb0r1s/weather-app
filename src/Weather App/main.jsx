import React, { useState, useEffect, useReducer, useRef, useMemo } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import "./css/main.css";
import { reducer } from "./reducer";
import borisLogo from "./images/drb0r1s-black-logo.png";
import sunriseIcon from "./images/weather-sunrise.svg";
import sunsetIcon from "./images/weather-sunset.svg";
import useResponsiveObj from "use-responsive-obj";

const Main = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [cityInput, setCityInput] = useState("");
    
    const defaultState = {
        currentCity: "",
        reqCity: "",
        coords: { lat: 0, long: 0 },
        errorModal: "",
        loadingModal: ""
    };

    const [state, dispatcher] = useReducer(reducer, defaultState);

    const {
        currentCity, reqCity, coords,
        errorModal, loadingModal
    } = state;

    const cityRef = useRef(null);
    const errorCity = useRef(null);
    const loadingCity = useRef(null);
    const forecastRef = useRef(null);

    const modalLength = useMemo(() => {
        return {
            shortLength: 15,
            fullLength: 32
        }
    }, []);

    const responsiveModal = useMemo(() => {
        return {
            shortLength: [false, 768],
            fullLength: [769, false]
        }
    }, []);

    const { responsive } = useResponsiveObj(modalLength, responsiveModal);
    
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
            
            navigator.geolocation.getCurrentPosition((position) => {
                dispatcher({ type: "USER_LOCATION", payload: {
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                }});
            });
        }, 1500);
    }, []);

    useEffect(() => {
        const fetchLocationData = async () => {
            const url = `https://${process.env.REACT_APP_WEATHER_URL}/forecast?lat=${coords.lat}&lon=${coords.long}&units=metric&&appid=${process.env.REACT_APP_WEATHER_API_KEY}`;
            let isValidResp = false;
            
            await fetch(url).then((resp) => {
                if(resp.ok) {
                    isValidResp = true;
                    return resp.json();
                }

                else {
                    dispatcher({ type: "LOCATION_404", payload: {
                        invLat: coords.lat, invLong: coords.long
                    }});

                    setTimeout(() => {
                        errorCity.current.style.opacity = "1";
                        errorCity.current.style.top = "10px";
                    }, 300);
                }
            })
            .then((result) => {
                if(isValidResp) {
                    dispatcher({ type: "SET_CITY", payload: result });

                    setTimeout(() => {
                        cityRef.current.style.opacity = "1";
                        cityRef.current.style.top = "0";
                    }, 100);
                }
            });
        }
        
        if(coords.lat > 0 && coords.long > 0) fetchLocationData();
    }, [coords]);
    
    useEffect(() => {
        const fetchData = async () => {
            const url = `https://${process.env.REACT_APP_WEATHER_URL}/forecast?q=${reqCity}&units=metric&appid=${process.env.REACT_APP_WEATHER_API_KEY}`;
            let isValidResp = false;
            
            await fetch(url).then((resp) => {
                if(resp.ok) {
                    isValidResp = true;
                    return resp.json();
                }
            })
            .then((result) => {
                setTimeout(() => {
                    loadingCity.current.style.opacity = "0";
                    loadingCity.current.style.top = "60%";

                    setTimeout(() => {
                        if(isValidResp) dispatcher({ type: "SET_CITY", payload: result });
                        
                        else {
                            const checkLength = reqCity.length > responsive ? reqCity.substr(0, responsive) + "..." : reqCity;
                            dispatcher({ type: "CITY_404", payload: checkLength });

                            setTimeout(() => {
                                errorCity.current.style.opacity = "1";
                                errorCity.current.style.top = "10px";
                            }, 300);
                        }

                        setTimeout(() => {
                            if(cityRef.current !== null) {
                                cityRef.current.style.opacity = "1";
                                cityRef.current.style.top = "0";
                            }
                        }, 100);
                    }, 300);
                }, 500);
            });
        }

        if(reqCity) fetchData();
    }, [reqCity, responsive]);

    useEffect(() => {
        if(errorModal) {
            setTimeout(() => {
                errorCity.current.style.opacity = "0";
                errorCity.current.style.top = "20px";

                setTimeout(() => {
                    dispatcher({ type: "DISABLE_ERROR" });
                }, 300);
            }, 3000);
        }
    }, [errorModal]);
    
    function submitForm(event) {
        event.preventDefault();

        if(cityRef.current !== null) {
            cityRef.current.style.opacity = "0";
            cityRef.current.style.top = "10px";
        }

        setTimeout(() => {
            const checkLength = cityInput.length > responsive ? cityInput.substr(0, responsive) + "..." : cityInput;
            dispatcher({ type: "REQ_CITY", payload: checkLength });

            setCityInput("");

            setTimeout(() => {
                loadingCity.current.style.opacity = "1";
                loadingCity.current.style.top = "50%";
            }, 100);
        }, 500);
    }
    
    if(isLoading) {
        return(
            <div className="loading">
                <div className="loader"></div>
            </div>
        );
    }
    
    return(
        <HelmetProvider>
            <Helmet>
                <title>Weather App</title>

                <meta  name="author" content="drb0r1s" />
                <meta  name="description" content="Weather App - React Functional Components" />
                <meta  name="keywords" content="Weather App, React, React Functional Components, JavaScript, SASS, drb0r1s" />
            </Helmet>
            
            <div className="main">
                <section className="weather">
                    <div className="weather-holder">
                        <h1>weather app</h1>

                        <form onSubmit={submitForm}>
                            <input
                                type="text"
                                name="formCity"
                                placeholder={currentCity.city === undefined ? "city" : currentCity.city.name}
                                maxLength="32"
                                required
                                value={cityInput}
                                onChange={(event) => setCityInput(event.target.value)}
                            />

                            <button>search</button>
                        </form>

                        <a href="https://boris.ml" className="signature">
                            <p>by</p>
                            <img src={borisLogo} alt="B O R I S" />
                        </a>
                    </div>

                    {currentCity && <City
                        cityRef={cityRef}
                        {...currentCity}
                        forecastRef={forecastRef}
                    />}

                    {loadingModal && <LoadingCity
                        loadingCity={loadingCity}
                        loadingModal={loadingModal}
                    />}
                </section>

                {errorModal && <div className="error-modal" ref={errorCity}>
                    <strong dangerouslySetInnerHTML={{ __html: errorModal }}></strong>
                    <div className="loading-cancel"></div>
                </div>}
            </div>
        </HelmetProvider>
    );
}

const LoadingCity = (props) => {
    const {
        loadingCity, loadingModal
    } = props;
    
    return(
        <div className="loading-city" ref={loadingCity}>
            <div className="loading-circle"></div>
            <strong dangerouslySetInnerHTML={{ __html: loadingModal }}></strong>
        </div>
    );
}

const City = (props) => {
    const {
        cityRef, city, list,
        forecastRef
    } = props;
    
    const [getPopulation, setGetPopulation] = useState();
    const [sun, setSun] = useState({
        sunrise: "", sunset: ""
    });
    
    const [activeForecast, setActiveForecast] = useState(list[0]);

    const [activeForecastDate, setActiveForecastDate] = useState({
        date: "", time: ""
    });

    const forecastInfo = useRef(null);

    useEffect(() => {
        const dateAndTime = activeForecast.dt_txt.split(" ");
        const divideDate = dateAndTime[0].split("-");
        
        let newDate = "";

        for(let i = divideDate.length - 1; i >= 0; i--) {
            if(i === 0) newDate += divideDate[i];
            else newDate += divideDate[i] + "/";
        }

        setActiveForecastDate({ date: newDate, time: dateAndTime[1] });
    }, [activeForecast]);

    useEffect(() => setActiveForecast(list[0]), [list]);

    useEffect(() => {
        const getPopulation = () => {
            if(city.population < 1000) setGetPopulation(city.population);
    
            else {
                let isMillion = city.population > 1000000 ? 6 : 3;
                
                let divide = 10;
                for(let i = 0; i < isMillion - 1; i++) divide *= 10;

                let populationNumber = city.population / divide;
                const populationUnit = divide === 1000 ? "k" : "m";
                
                setGetPopulation(populationNumber.toFixed(2) + populationUnit);
            }
        }

        const getSun = () => {
            const sunUnix = [city.sunrise, city.sunset];
            let sunTime = { sunrise: "", sunset: "" };

            for(let i = 0; i < sunUnix.length; i++) {
                const unixTime = sunUnix[i];
                
                const calcDate = new Date(unixTime * 1000);
                const calcHours = calcDate.getHours();
                const calcMinutes = "0" + calcDate.getMinutes();
                const calcSeconds = "0" + calcDate.getSeconds();

                sunTime = {...sunTime, [Object.keys(sunTime)[i]]: `${calcHours}:${calcMinutes.substr(-2)}:${calcSeconds.substr(-2)}`}
            }

            setSun(sunTime);
        }

        getPopulation();
        getSun();
    }, [city]);

    function mouseDown(event) {
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseUp);

        window.addEventListener("touchmove", mouseMove);
        window.addEventListener("touchend", mouseUp);

        const prevX = event.type === "mousedown" ? event.clientX : event.targetTouches[0].clientX;

        const forecastLeft = forecastRef.current.style.left;
        const forecastLeftNumber = forecastLeft.substring(0, forecastLeft.length - 2);

        const forecastWidth = parseInt(getComputedStyle(forecastRef.current).getPropertyValue("width"));
        
        const maxScrollLeft = 300;
        const maxScrollRight = -forecastWidth + 1000;

        function mouseMove(event) {
            const defineX = event.type === "mousemove" ? event.clientX : event.targetTouches[0].clientX;
            const newX = prevX - defineX;
            forecastRef.current.style.left = forecastLeftNumber - newX + "px";
        }

        function mouseUp() {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseup", mouseUp);

            window.removeEventListener("touchmove", mouseMove);
            window.removeEventListener("touchend", mouseUp);

            const min = 500;
            const max = 1000;

            const randomSwipe = Math.floor(Math.random() * (max - min) + min);
            
            if(forecastLeftNumber > maxScrollLeft) {
                forecastRef.current.style.transition = "300ms";
                forecastRef.current.style.left = maxScrollLeft - randomSwipe + "px";

                setTimeout(() => {
                    forecastRef.current.style.transition = "0ms";
                }, 300);
            }
            
            if(forecastLeftNumber < maxScrollRight) {
                forecastRef.current.style.transition = "300ms";
                forecastRef.current.style.left = maxScrollRight + randomSwipe + "px";

                setTimeout(() => {
                    forecastRef.current.style.transition = "0ms";
                }, 300);
            }
        }
    }

    function changeActiveForecast(hour) {
        forecastInfo.current.style.opacity = "0";
        forecastInfo.current.style.top = "-10px";

        setTimeout(() => {
            setActiveForecast(hour);
            
            forecastInfo.current.style.opacity = "1";
            forecastInfo.current.style.top = "0";
        }, 500);
    }
    
    return(
        <div className="city" ref={cityRef}>
            <h2>{city.name} ({city.country})</h2>
            <p>population: {getPopulation}</p>

            <div className="sun">
                <div className="sunrise">
                    <img src={sunriseIcon} alt="SUNRISE" />
                    <p>sunrise: {sun.sunrise}</p>
                </div>
                
                <div className="sunset">
                    <img src={sunsetIcon} alt="SUNSET" />
                    <p>sunset: {sun.sunset}</p>
                </div>
            </div>

            <div className="forecast-holder">
                <div
                    className="forecast"
                    ref={forecastRef}
                    onMouseDown={mouseDown}
                    onTouchStart={mouseDown}
                >
                    {list.map((hour, index) => {
                        return <HourBlock
                            key={index}
                            {...hour}
                            activeForecast={activeForecast}
                            changeActiveForecast={() => changeActiveForecast(hour)}
                        />;
                    })}
                </div>
            </div>

            <div className="forecast-info" ref={forecastInfo}>
                <h3>{activeForecastDate.date}</h3>
                <h4>{activeForecastDate.time}</h4>
                <h5>weather: {Object.values(activeForecast.weather)[0].main}</h5>

                <div className="temp-info">
                    <h4>temperature info</h4>
                    
                    <strong>temperature: <span>{activeForecast.main.temp.toFixed(0) >= 0 ? Math.abs(activeForecast.main.temp.toFixed(0)) : activeForecast.main.temp.toFixed(0)}&deg;C</span></strong>
                    <p>feels like: <span>{activeForecast.main.feels_like.toFixed(0) >= 0 ? Math.abs(activeForecast.main.feels_like.toFixed(0)) : activeForecast.main.feels_like.toFixed(0)}&deg;C</span></p>
                    
                    <div className="temp-min-max">
                        <p>minimal temperature: <span>{activeForecast.main.temp_min.toFixed(0) >= 0 ? Math.abs(activeForecast.main.temp_min.toFixed(0)) : activeForecast.main.temp_min.toFixed(0)}&deg;C</span></p>
                        <p>maximal temperature: <span>{activeForecast.main.temp_max.toFixed(0) >= 0 ? Math.abs(activeForecast.main.temp_max.toFixed(0)) : activeForecast.main.temp_max.toFixed(0)}&deg;C</span></p>
                    </div>
                </div>

                <div className="pressure-info">
                    <h4>pressure info</h4>

                    <p>pressure: <span>{activeForecast.main.pressure}mb</span></p>

                    <div className="atmospheric-pressure">
                        <h5>Atmospheric pressure on the:</h5>

                        <p>ground level: <span>{activeForecast.main.grnd_level}mb</span></p>
                        <p>sea level: <span>{activeForecast.main.sea_level}mb</span></p>
                    </div>
                </div>

                <div className="other-info">
                    <h4>other info</h4>

                    <p>humidity: <span>{activeForecast.main.humidity}%</span></p>
                    <p>visibility: <span>{(activeForecast.visibility / 1000).toFixed(1)}km</span></p>
                </div>
            </div>
        </div>
    );
}

const HourBlock = (props) => {
    const {
        dt_txt, main, activeForecast,
        changeActiveForecast
    } = props;
    
    const [dateTime, setDateTime] = useState({
        date: "", time: ""
    });

    useEffect(() => {
        const dateAndTime = dt_txt.split(" ");
        const divideDate = dateAndTime[0].split("-");
        
        let newDate = "";

        for(let i = divideDate.length - 1; i >= 0; i--) {
            if(i === 0) newDate += divideDate[i];
            else newDate += divideDate[i] + "/";
        }

        setDateTime({ date: newDate, time: dateAndTime[1] });
    }, [dt_txt]);
    
    return(
        <div
            className="hour-block"
            id={activeForecast.dt_txt === dt_txt ? "active-forecast" : ""}
            onClick={changeActiveForecast}
        >
            <div className="time-date">
                <h3>{dateTime.time}</h3>
                <strong>{dateTime.date}</strong>
            </div>

            <div className="temp-basic">
                <p>{main.temp.toFixed(0) >= 0 ? Math.abs(main.temp.toFixed(0)) : main.temp.toFixed(0)}&deg;C</p>
                <span>feels like: {main.feels_like.toFixed(0) >= 0 ? Math.abs(main.feels_like.toFixed(0)) : main.feels_like.toFixed(0)}&deg;C</span>
            </div>
            
            <div className="temp-range">
                <p>min: {main.temp_min.toFixed(0) >= 0 ? Math.abs(main.temp_min.toFixed(0)) : main.temp_min.toFixed(0)}&deg;C</p>
                <p>max: {main.temp_max.toFixed(0) >= 0 ? Math.abs(main.temp_max.toFixed(0)) : main.temp_max.toFixed(0)}&deg;C</p>
            </div>

            <div className="humidity-pressure">
                <p>humidity: {main.humidity}%</p>
                <p>pressure: {main.pressure}mb</p>
            </div>
        </div>
    );
}

export default Main;