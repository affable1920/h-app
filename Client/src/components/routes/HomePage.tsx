import { useState } from "react";
import { SendHorizonal as Send } from "lucide-react";

import Input from "../common/Input";
import Button from "../common/Button";

const HomePage = () => {
  const [userQuery, setUserQuery] = useState("");

  return (
    <section className="flex flex-col h-1/2 max-h-full py-12 pb-2 gap-4">
      <form className="flex flex-col gap-4 mb-8">
        <Input>
          <Input.Label>Talk to server</Input.Label>
          <Input.InputElement
            name="message"
            value={userQuery}
            autoComplete="off"
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </Input>
        <Button className="self-center">Send</Button>
      </form>

      <ul className="flex items-center gap-4 justify-center">
        <li>
          <Button variant="link" to="dir/doctors" color="primary">
            view doctors
          </Button>
        </li>
        <li>
          <Button variant="link" to="dir/clinics" color="primary">
            View Clinics
          </Button>
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
          />
        </div>
        <div className="flex justify-end">
          <Button size="xs" variant="icon">
            <Send />
          </Button>
        </div>
      </section>
    </section>
  );
};

export default HomePage;
