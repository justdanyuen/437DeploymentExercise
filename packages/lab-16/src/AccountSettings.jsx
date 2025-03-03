import { useState } from "react";

export function AccountSettings({ accountName, setAccountName }) {
    const [inputValue, setInputValue] = useState(accountName);

    const handleSave = () => {
        setAccountName(inputValue);
    };

    return (
        <div>
            <h2>Account settings</h2>
            <label>
                Username:
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </label>
            <button onClick={handleSave}>Save</button>
            {/* <p><i>Changes are auto-saved.</i></p> */}
        </div>
    );
}
