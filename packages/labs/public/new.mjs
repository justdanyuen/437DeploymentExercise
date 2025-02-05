import { attachShadow } from "./utils.mjs";

const TEMPLATE = document.createElement("template");
TEMPLATE.innerHTML = `
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        header {
            width: 100%;
            background-color: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
        }

        .navbar {
            display: flex;
            align-items: center;
            width: 100%;
            justify-content: space-between; 
            color: var(--accent-color);
        }

        .navbar-title {
            font-family: 'Fontdiner Swanky', sans-serif;
            font-size: 36px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .navbar-links {
            display: flex;
            gap: 15px;
        }

        .navbar-link {
            text-decoration: none;
            color: var(--accent-color);
            font-family: 'DM Serif Text', serif;
            font-size: 1rem;
            transition: color 0.3s ease;
        }

        .navbar-link:hover {
            color: var(--hover-color);
        }

        .navbar-link.active {
            font-weight: bold; 
            text-decoration: underline; 
            border-bottom: 3px solid var(--hover-color); 
        }

        .navbar-right {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-right: 10px;
        }

        /* Default hidden state for desktop-navbar-links */
        .desktop-navbar-links {
            display: none;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
            .desktop-navbar-links {
                display: none; /* Initially hidden */
                flex-direction: column;
                width: 100%;
                text-align: center;
            }

            .desktop-navbar-links.active {
                display: flex;
            }

            .menu-button {
                display: block;
                font-size: 2rem;
                background: none;
                border: none;
                color: var(--accent-color);
                cursor: pointer;
            }
        }

        /* Desktop Styles */
        @media (min-width: 769px) {
            .desktop-navbar-links {
                display: hidden;
            }
        }

    </style>

    <header>
        <nav class="navbar">
            <h1 class="navbar-title">Justin Yuen</h1>
            <div class="navbar-right">
                <label>
                    <input type="checkbox" autocomplete="off" />
                    Dark Mode
                </label>
                <button class="menu-button">&#9776;</button>
            </div>
        </nav>

        <div class="desktop-navbar-links">
            <a href="index.html" class="navbar-link">HOMEPAGE</a>
            <a href="projects.html" class="navbar-link">PROJECTS</a>
        </div>
    </header>
`;

class CustomNavbar extends HTMLElement {
    connectedCallback() {
        const currentPage = window.location.pathname.split("/").pop();
        const shadowRoot = attachShadow(this, TEMPLATE);

        const links = shadowRoot.querySelectorAll(".navbar-link");
        const menuButton = shadowRoot.querySelector(".menu-button");
        const desktopNavLinks = shadowRoot.querySelector(".desktop-navbar-links");
        const checkbox = shadowRoot.querySelector("input[type='checkbox']");

        // Highlight active link
        links.forEach(link => {
            if (link.getAttribute("href") === currentPage) {
                link.classList.add("active"); 
            }
        });

        // Toggle navbar visibility on mobile
        menuButton.addEventListener("click", () => {
            desktopNavLinks.classList.toggle("active");
        });

        // Close menu when clicking outside
        document.addEventListener("click", (event) => {
            if (!this.contains(event.target) && !menuButton.contains(event.target)) {
                desktopNavLinks.classList.remove("active");
            }
        });

        // Dark mode toggle
        checkbox.addEventListener("change", (event) => {
            if (event.target.checked) {
                document.body.classList.add("dark-mode");
            } else {
                document.body.classList.remove("dark-mode");
            }
        });
    }
}

customElements.define("custom-navbar", CustomNavbar);
