import { Homepage } from "./Homepage";
import { AccountSettings } from "./AccountSettings";
import { ImageGallery } from "./images/ImageGallery.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router"; // Fix import path
import { useState } from "react";
import { useImageFetching } from "./images/useImageFetching.js"; // Move useImageFetching to App

function App() {
    const [accountName, setAccountName] = useState("John Doe");
    
    // Lifted state: Fetch images once and keep them in App state
    const { isLoading, fetchedImages } = useImageFetching("");

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Homepage userName={accountName} />} />
                    <Route 
                        path="images" 
                        element={<ImageGallery isLoading={isLoading} fetchedImages={fetchedImages} />} 
                    />
                    <Route path="images/:imageID" element={<ImageDetails />} />
                    <Route 
                        path="account" 
                        element={<AccountSettings accountName={accountName} setAccountName={setAccountName} />} 
                    />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
