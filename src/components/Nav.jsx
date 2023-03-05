import './Nav.css';
import { useAuth0 } from "@auth0/auth0-react";
import { Routes, Route, Outlet, Link } from "react-router-dom";

function App() {
    const { user, isAuthenticated, isLoading, logout } = useAuth0();

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    return (
        <div className="nav">
            <div className="left">
                <p>CC</p>
            </div>
            {isAuthenticated ? <div className="right">
                <p style={{
                    cursor: "pointer"
                }} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout.</p>
                <Link style={{ color: "white", textDecoration: "none" }} to="content">Your Content.</Link>
            </div> : null}
        </div>
    );
}

export default App;
