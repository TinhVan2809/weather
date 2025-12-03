// import { useNavigate } from 'react-router-dom';
import { useRef } from 'react'; 

import Navbar from './Navbar';

function Theme() {
    // const navigate = useNavigate(); 
    const fileInputRef = useRef(null);

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
        // Xóa hình nền tùy chỉnh nếu có
        document.body.style.backgroundImage = ''; //eslint-disable-line
        localStorage.removeItem('customBackgroundImage');

        document.body.className = themeClass; //eslint-disable-line
        localStorage.setItem('theme', themeClass);
    };


    const handleUploadClick = () => {
        // Kích hoạt click trên input file ẩn
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;
                localStorage.setItem('customBackgroundImage', base64Image);
                localStorage.setItem('theme', 'custom-bg'); // Đánh dấu là đang dùng theme tùy chỉnh
                document.body.style.backgroundImage = `url(${base64Image})`;
                document.body.className = 'custom-bg'; // Đặt một class để nhận biết
            };
            reader.readAsDataURL(file);
        }
    };
    


    return (   
        <>
        <Navbar />
           

            <div className="theme-handler">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        style={{ display: 'none' }} 
                        accept="image/*" // Chỉ cho phép chọn tệp hình ảnh
                    />
                    <div className="theme-card" onClick={handleUploadClick}>
                        <div className="add-icon">
                            <i className="ri-add-line"></i>
                        </div>
                        <p>Upload Your Background</p>
                    </div>
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

export default Theme;