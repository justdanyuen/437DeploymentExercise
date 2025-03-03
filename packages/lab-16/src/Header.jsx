import "./Header.css";
import { Link } from "react-router";

export function Header() {
    return (
        <header>
            <h1>My cool site</h1>
            <div>
                <label>
                    Some switch (dark mode?) <input type="checkbox" />
                </label>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/images">Image Gallery</Link>
                    <Link to="/account">Account</Link>
                </nav>
            </div>
        </header>
    );
}
