import { attachShadow } from "./utils.mjs";

const TEMPLATE = document.createElement("template");
TEMPLATE.innerHTML = `
    <style>
    * {
            margin: 0;
            padding: 0;
            // box-sizing: border-box;
        }

        header {
            width: 100%;
            background-color: var(--primary-color);
            display: flex;
            align-items: center;
            justify-contents: space-between;
        }

        .navbar {
            display: flex;
            align-items: center; 
            width: 100%;
            justify-content: space-between; 
            color: var(--accent-color);
            margin-bottom: 20px;
            margin: 10px;
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
            margin-left: auto; /* Push to the right */
        }
        
        .desktop-navbar-links{
            display:hidden;
        }
            

            /* Menu button styles */
        .menu-button {
            display: none;
            font-size: 3rem;
            background: none;
            border: none;
            color: var(--accent-color);
            cursor: pointer;
            margin-left: auto;
        }

        @media (max-width: 768px) {
            .navbar {
                flex-direction: row;
                align-items: center;
            }

            .navbar-links {
                display: none;
                flex-direction: column;
                width: 100%;
                padding-top: 10px;
            }

            .navbar-links.active {
                display: flex; 
            }

            .menu-button {
                display: block;
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
            <div class="navbar-links">
                <a href="index.html" class="navbar-link">HOMEPAGE</a>
                <a href="projects.html" class="navbar-link">PROJECTS</a>
            </div>
        </nav>
        <br>
    </header>
`;

class CustomNavbar extends HTMLElement {
    connectedCallback() {
        const currentPage = window.location.pathname.split("/").pop();
        const shadowRoot = attachShadow(this, TEMPLATE);

        const links = shadowRoot.querySelectorAll(".navbar-link");
        const menuButton = shadowRoot.querySelector(".menu-button");
        const navLinks = shadowRoot.querySelector(".navbar-links");
        const checkbox = shadowRoot.querySelector("input[type='checkbox']");

    links.forEach(link => {
        console.log("Checking Link: ", link.getAttribute("href"));
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active"); 
            console.log("Active link found");
        }
        });

        menuButton.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            console.log("Menu button toggled");
        });

        document.addEventListener("click", (event) => {
            if (!this.contains(event.target)) {
                navLinks.classList.remove("active");
            }
        });

        checkbox.addEventListener("change", (event) => {
            if (event.target.checked) {
                document.body.classList.add("dark-mode");
                console.log("Dark Mode enabled");
            } else {
                document.body.classList.remove("dark-mode");
                console.log("Dark Mode disabled");
            }
        });
    }
}


customElements.define("custom-navbar", CustomNavbar);