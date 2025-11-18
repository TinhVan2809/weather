import { useNavigate } from 'react-router-dom';

function HandleTheme() {
    const navigate = useNavigate(); 
    return (   
        <>
            <div className="back">
                <p onClick={() => navigate('/')}><i class="ri-arrow-left-long-line"></i> Back</p>
            </div>

            <div className="theme-handler">
                <div className="theme-card">
                        <img src="/0203c166-e3de-433a-bb8d-bf8bf6bd89d5_starbound_paths.png"/>
                </div>
                <div className="theme-card">
                        <img src="/pexels-christian-heitz-285904-842711.jpg"/>
                </div>
            </div>

        </>
    )
}

export default HandleTheme;