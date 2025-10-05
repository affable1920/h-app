import { useState } from "react";
import { MdSend } from "react-icons/md";
import generateDoctors from "../../scripts/dataGenerator";

const HomePage = () => {
  const [userQuery, setUserQuery] = useState("");

  const blob = new Blob([JSON.stringify(generateDoctors())], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  return (
    <section className="flex flex-col h-1/2 max-h-full py-12 pb-2">
      <div className="grow flex flex-wrap gap-4" />

      <a
        href={url}
        download="doctors.json"
        className="text-center w-full mb-4 bg-slate-100 p-2 
      rounded-md text-cyan-800"
      >
        Download doctors list!
      </a>

      <section
        className="flex flex-col w-full justify-between max-w-2xl mx-auto gap-4 border-2 border-slate-200 
          shadow-md shadow-slate-300/20 rounded-lg p-3"
      >
        <div className="relative font-semibold min-h-12">
          {!userQuery && (
            <p className="opacity-50 pointer-events-none absolute">
              Search by Dr name, condition ...
            </p>
          )}

          <div
            contentEditable
            className="border-none shadow-none outline-none h-full"
            onInput={(e) => setUserQuery(e.currentTarget.textContent || "")}
          />
        </div>
        <div className="flex justify-end">
          <button onClick={() => setUserQuery(userQuery)}>
            <MdSend />
          </button>
        </div>
      </section>
    </section>
  );
};

export default HomePage;
