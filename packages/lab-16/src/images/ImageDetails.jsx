import { useImageFetching } from "./useImageFetching.js";
import { useParams } from "react-router";

export function ImageDetails() {
    const { imageID } = useParams();
    const { isLoading, fetchedImages } = useImageFetching(imageID, 500);
    if (isLoading) {
        return <div>Loading...</div>;
    }
    const imageData = fetchedImages?.[0];
    if (!imageData) {
        return <div><h2>Image not found</h2></div>;
    }

    return (
        <div>
            <h2>{imageData.name}</h2>
            <img className="ImageDetails-img" src={imageData.src} alt={imageData.name} />
        </div>
    );
}
