import { toHtmlElement } from "./toHtmlElement.mjs";

function createHeader() {
    // Define the header structure as a string
    const headerElement = toHtmlElement(`
        <header>
            <nav class="navbar">
                <h1 class="navbar-title" style="font-family: 'Fontdiner Swanky', sans-serif; font-size: 36px; font-weight: bold; text-transform: uppercase;">
                    Justin Yuen
                </h1>
                <div class="navbar-links">
                    <a href="index.html" class="navbar-link">HOMEPAGE</a>
                    <a href="projects.html" class="navbar-link">PROJECTS</a>
                </div>
            </nav>
            <br>
        </header>
    `);

    document.body.prepend(headerElement);

    highlightActivePage();
}

function highlightActivePage() {
    const currentPage = window.location.pathname.split("/").pop();
    console.log("Current page:", currentPage)

    const links = document.querySelectorAll(".navbar-link");

    links.forEach(link => {
        console.log("Checking Link: ", link.getAttribute("href"));
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active"); 
            console.log("Active link found");
        }
    });
}

window.addEventListener("load", createHeader);
