import React from 'react';

function Forecast({ hourlyData, timezone }) {

    if (!hourlyData || hourlyData.length === 0) {
        return <div className="forecast-container">No hourly forecast available.</div>;
    }

    // Get the current hour in the specified timezone, or fallback to local time
    const currentHour = timezone 
        ? parseInt(new Date().toLocaleTimeString('en-GB', { timeZone: timezone, hour: '2-digit', hourCycle: 'h23' }))
        : new Date().getHours();

    return (
        <>
           <div className="forecast-container">
                <div className="forecast-day">
                    <ul>
                        <li className="li">Yesterday</li>
                        <li className="li">Today</li>
                        <li className="li">Tomorrow</li>
                        <li className="li">Next 7 Day's</li>
                    </ul>
                </div>
                <div className="forecast-hourly">
                    {hourlyData.map((hour, index) => {
                        const time = hour.time.split(' ')[1];
                        const hourFromData = parseInt(time.split(':')[0]);
                        const isCurrentHour = hourFromData === currentHour;
                        const cardClassName = `hourly-card ${isCurrentHour ? 'current-hour' : ''}`;

                        return (
                            <div className={cardClassName} key={index}>
                                <div className="card">
                                    <p>{time}</p>
                                    <div className="card-icon">
                                        <img src={hour.condition_icon} alt={hour.condition} />
                                    </div>
                                    <p>{Math.round(hour.temp_c)} <i className="ri-celsius-line"></i></p>
                                </div>
                            </div>
                        );
                    })}
                </div>
           </div>
        </>
    )
}

export default Forecast;
