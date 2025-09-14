import React from 'react'
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom'

// Import Original Components
import Signin from '../Tuning/Pages/Authentication/Signin';
import Signup from '../Tuning/Pages/Authentication/Signup';
import PasswordReset from '../Tuning/Pages/Authentication/PasswordReset';
import TwoStep from '../Tuning/Pages/Authentication/TwoStep';
import Lockscreen from '../Tuning/Pages/Authentication/Lockscreen';
import Maintenance from '../Tuning/Pages/Authentication/Maintenance';
import NoPageFound from '../Tuning/Pages/Authentication/NoPageFound';

// Import Enhanced Components
import EnhancedSignin from '../components/auth/EnhancedSignin';
import EnhancedSignup from '../components/auth/EnhancedSignup';

const AuthLayout = () => {

    const location = useLocation();
    const pathname = location.pathname;

    const authTitleMapping = {
        "/signin": "Signin",
        // "/signup": "Signup", // 🔒 DISABLED: Admin signup disabled for security
        "/password-reset": "PasswordReset",
        "/two-step": "TwoStep",
        "/lockscreen": "Lockscreen",
        "/maintenance": "Maintenance",
        "/404": "NoPage",
    };
    const authTitle = authTitleMapping[pathname] || "";

    const authComponents = {
        Signin: <EnhancedSignin />,
        // Signup: <EnhancedSignup />, // 🔒 DISABLED: Admin signup disabled for security
        PasswordReset: <PasswordReset />,
        TwoStep: <TwoStep />,
        Lockscreen: <Lockscreen />,
        Maintenance: <Maintenance />,
        NoPage: <NoPageFound />,
    };

    return (
        <div data-ha="theme-PurpleHeart" className="svgstroke-a auth bg-gradient">
            <main className="container-fluid px-0">

                {/* <!-- start: project logo --> */}
                <div className="px-xl-5 px-4 auth-header d-flex justify-content-center" data-bs-theme="none">
                    <div className="d-flex flex-column align-items-center text-center">
                        <Link to="/index" className="brand-icon text-decoration-none d-flex align-items-center" title="Malai Admin Template">
                            <img
                                src="/MALAI_LOGO.png"
                                alt="Malai Logo"
                                className="brand-logo"
                                style={{ height: '250px', width: 'auto' }}
                            />
                        </Link>
                        <div className="d-flex align-items-center mt-2">
                            <span className="fw-bold fs-4 text-gradient">Malai Wellness Khaoyai</span>
                        </div>
                    </div>
                </div>

                {/* <!-- start: page body area --> */}
                {authComponents[authTitle]}

                {/* <!-- start: page footer --> */}
                <footer className="px-xl-5 px-4">
                    <p className="mb-0 text-muted">© 2024 <Link to="/" target="_blank" title="malai">Malai</Link>, All Rights Reserved.</p>
                </footer>

            </main>
        </div>
    )
}

export default AuthLayout