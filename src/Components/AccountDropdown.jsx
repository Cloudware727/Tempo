import { useState } from "react";

function AccountDropdown({ onLogout }) {

    const [open, setOpen] = useState(false);

    return (
        <div className="account-container">

            <button
                className="account-button"
                onClick={() => setOpen(!open)}
            >
                My Profile
            </button>


            {open && (
                <div className="account-menu">

                    <button
                        className="account-logout"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </div>
            )}

        </div>
    );
}

export default AccountDropdown;