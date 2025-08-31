import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'


const UserDropdown = () => {
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="dropdown-menu dropdown-menu-end shadow p-2 p-xl-3 rounded-4">
            <div className="bg-body p-3 rounded-3">
                <h4 className="mb-1 title-font text-gradient">
                    {user ? `${user.firstName} ${user.lastName}` : 'Michelle Glover'}
                </h4>
                <p className="small text-muted">
                    {user ? user.email : 'michelle.glover@gmail.com'}
                </p>
                <input type="text" className="form-control form-control-sm" placeholder="Update my status" />
            </div>
            <ul className="list-unstyled mt-3">
                <li><Link as='a' className="dropdown-item rounded-pill" aria-label="my profile" to="/my-profile">My Profile</Link></li>
                <li><Link as='a' className="dropdown-item rounded-pill" aria-label="common settings" to="/common-settings">Common Settings</Link></li>
                <li><Link as='a' className="dropdown-item rounded-pill" aria-label="account settings" to="/accounts-setting">Settings</Link></li>
            </ul>
            <button 
                className="btn py-2 btn-primary w-100 mt-3 rounded-pill" 
                onClick={handleLogout}
                type="button"
            >
                Logout
            </button>
            <div className="mt-3 text-center small">
                <Link className="text-muted me-1" to="/">Privacy policy</Link>•<Link className="text-muted mx-1" to="/">Terms</Link>•<Link className="text-muted ms-1" to="/">Cookies</Link>
            </div>
        </div>
    )
}

export default UserDropdown