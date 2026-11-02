import { useState } from "react";
import {Link} from "react-router-dom";

function AccountDropdown({ user, onLogout }) {

    const [open, setOpen] = useState(false);

    return (
        <div className="account-container">

            <button
                className="account-button"
                onClick={() => setOpen(!open)}
            >
                {user?.email?.charAt(0).toUpperCase()}
            </button>


            {open && (
                <div className="account-menu">

                    <div className="account-email">
                        {user?.email}
                    </div>


                    <button
                        className="account-logout"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                    <Link to="/stats">
                        My Stats
                    </Link>


                </div>
            )}

        </div>
    );
}

export default AccountDropdown;