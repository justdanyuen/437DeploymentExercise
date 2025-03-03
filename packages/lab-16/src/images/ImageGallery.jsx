import "./ImageGallery.css";

export function ImageGallery({ isLoading, fetchedImages }) {
    const imageElements = fetchedImages.map((image) => (
        <div key={image.id} className="ImageGallery-photo-container">
            <a href={"/images/" + image.id}>
                <img src={image.src} alt={image.name} />
            </a>
        </div>
    ));

    return (
        <div>
            <h2>Image Gallery</h2>
            {isLoading && "Loading..."}
            <div className="ImageGallery">
                {imageElements}
            </div>
        </div>
    );
}
