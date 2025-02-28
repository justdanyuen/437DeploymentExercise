import React, { useState, useEffect } from "react";
import "./index.css";
import { Spinner } from "./Spinner";
import { groceryFetcher } from "./groceryFetcher";

export function GroceryPanel({ onAddTodo }) {
    const buttonClasses = `italic px-2 rounded-sm border border-gray-300
    hover:bg-gray-100 active:bg-gray-200 cursor-pointer`;

    const [groceryData, setGroceryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dropdown, setDropdown] = useState("MDN");

    useEffect(() => {
        let isStale = false; // Prevents outdated fetch responses from overriding newer ones

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
                    setGroceryData([]); // Clear data if fetch fails
                }
            } finally {
                if (!isStale) {
                    setIsLoading(false);
                }
            }
        }

        fetchData(dropdown);

        return () => {
            isStale = true; // Mark request as stale when component re-renders
        };
    }, [dropdown]); // Re-run effect when `dropdown` changes

    function handleAddTodoClicked(item) {
        const todoName = `Buy ${item.name} (${item.price.toFixed(2)})`;
        console.log("Adding to todo list:", todoName);
        onAddTodo(todoName);
    }

    function handleDropdownChange(event) {
        setDropdown(event.target.value); // Only update state, fetching is handled by `useEffect`
    }

    return (
        <div className="grocery-panel">
            <h1 className="text-xl font-bold">Groceries prices today</h1>
            <label className="mb-4 flex gap-4">
                Get prices from:
                <select
                    className="border border-gray-300 p-1 rounded-sm"
                    onChange={handleDropdownChange}
                    value={dropdown}
                >
                    <option value="MDN">MDN</option>
                    <option value="Liquor store">Liquor store</option>
                    <option value="Butcher">Butcher</option>
                    <option value="whoknows">Who knows?</option>
                </select>
                {isLoading && <Spinner />}
                {error && <span className="text-red-500 text-sm">{error}</span>}
            </label>

            {groceryData.length > 0 ? (
                <PriceTable items={groceryData} onAddClicked={handleAddTodoClicked} />
            ) : (
                "No data"
            )}
        </div>
    );
}

function PriceTable({ items, onAddClicked }) {
    return (
        <table className="price-table">
            <thead>
                <tr>
                    <th className="text-left">Name</th>
                    <th className="text-right">Price</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <PriceTableRow
                        key={item.name}
                        item={item}
                        onAddClicked={() => onAddClicked(item)}
                    />
                ))}
            </tbody>
        </table>
    );
}

function PriceTableRow({ item, onAddClicked }) {
    const buttonClasses = `italic px-2 rounded-sm border border-gray-300
        hover:bg-gray-100 active:bg-gray-200 cursor-pointer`;
    return (
        <tr>
            <td>{item.name}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>
                <button className={buttonClasses} onClick={onAddClicked}>
                    Add to todos
                </button>
            </td>
        </tr>
    );
}
