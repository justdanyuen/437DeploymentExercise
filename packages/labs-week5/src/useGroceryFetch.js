import { useState, useEffect } from "react";
import { groceryFetcher } from "./groceryFetcher";

export function useGroceryFetch(source) {
    const [groceryData, setGroceryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isStale = false; // Prevents outdated fetch responses

        async function fetchData(source) {
            console.log(`Fetching data from ${source}...`);
            setIsLoading(true);
            setError(null);
            setGroceryData([]); // Clear old data immediately

            try {
                const data = await groceryFetcher.fetch(source);
                if (!isStale) {
                    console.log("Data fetched:", data);
                    setGroceryData(data);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                if (!isStale) {
                    setError("Sorry, something went wrong");
                    setGroceryData([]);
                }
            } finally {
                if (!isStale) {
                    setIsLoading(false);
                }
            }
        }

        fetchData(source);

        return () => {
            isStale = true; // Mark request as stale when component re-renders
        };
    }, [source]);

    return { groceryData, isLoading, error };
}
