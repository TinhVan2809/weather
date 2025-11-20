import { useNavigate } from 'react-router-dom';

function HandleTheme() {
    const navigate = useNavigate(); 

    const themes = [
        { name: 'Dark', className: 'dark', image: '/ryan-lum-1ak3Z7ZmtQA-unsplash.jpg'  },
        { name: 'Green', className: 'green', image: '/pexels-sohi-807598.jpg'},
        { name: 'Yellow', className: 'yellow', image: '/pexels-christian-heitz-285904-842711.jpg' },
        { name: 'Blue', className: 'blue', image: '/pexels-mdx014-973231.jpg' },
        { name: 'Orange', className: 'orange', image: '/pexels-rpnickson-2559941.jpg' },
        { name: 'Sunset', className: 'sunset', image: '/pexels-chris-f-38966-3832475.jpg'},

        //Có thể đổi lại tên theme cho phù hợp
        { name: 'Theme1', className: 'theme1', image: '/v2.jpg'}, 
        { name: 'Theme2', className: 'theme2', image: '/pexels-iriser-1379640.jpg'}
        

    ];

    const changeTheme = (themeClass) => {
        document.body.className = themeClass; //eslint-disable-line
        localStorage.setItem('theme', themeClass);
    };

    


    return (   
        <>
            <div className="back">
                <p onClick={() => navigate('/')}><i className="ri-arrow-left-long-line"></i> Back</p>
            </div>

            <div className="theme-handler">
                {themes.map(theme => (
                    <div key={theme.name} className="theme-card" onClick={() => changeTheme(theme.className)}>
                        <img className='backgroundImage' src={theme.image} alt={theme.name} />
                        <p>{theme.name}</p>
                    </div>
                ))}
            </div>
        </>
    )
}

export default HandleTheme;