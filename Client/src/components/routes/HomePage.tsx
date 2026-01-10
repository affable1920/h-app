import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Button from "../common/Button";
import { SendHorizonal as Send } from "lucide-react";

const HomePage = () => {
  const [userQuery, setUserQuery] = useState("");

  const loc = useLocation();
  console.log(loc);

  return (
    <section className="flex flex-col h-1/2 max-h-full py-12 pb-2 gap-4">
      <ul className="flex items-center gap-4 justify-center">
        <li>
          <Link to="dir/doctors">
            <Button size="md" variant="contained" color="primary">
              view doctors
            </Button>
          </Link>
        </li>
        <li>
          <Link to="dir/clinics">
            <Button size="md" variant="contained" color="primary">
              View Clinics
            </Button>
          </Link>
        </li>
      </ul>

      <section
        className="flex flex-col w-full justify-between max-w-2xl mx-auto gap-4 border-2 border-slate-200 
          shadow-md shadow-slate-300/20 rounded-lg p-3"
      >
        <div className="relative font-semibold min-h-12">
          {!userQuery && (
            <p className="opacity-50 pointer-events-none absolute">
              Search for doctors, clinics, conditions ...
            </p>
          )}

          <div
            contentEditable
            className="border-none shadow-none outline-none h-full"
            onInput={(e) => setUserQuery(e.currentTarget.textContent || "")}
          />
        </div>
        <div className="flex justify-end">
          <Button
            size="xs"
            variant="icon"
            onClick={() => setUserQuery(userQuery)}
          >
            <Send />
          </Button>
        </div>
      </section>
    </section>
  );
};

export default HomePage;
