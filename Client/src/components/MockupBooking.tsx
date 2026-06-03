import { useEffect } from "react";
import { MapPin, PhoneOutgoing, CalendarFoldIcon } from "lucide-react";
import { motion, useAnimate } from "motion/react";

function MockupBooking() {
  const [scope, animate] = useAnimate();

  async function sequence() {}

  useEffect(function () {
    sequence();
  }, []);

  return (
    <article
      id="mockup"
      ref={scope}
      className="md:order-2 rounded-md shadow-md md:items-start overflow-hidden relative 
       shadow-black/40"
    >
      <span id="cursor" className="text-lg absolute mx-2">
        🮰
      </span>

      <div
        className="h-8 bg-accent flex gap-2.5 justify-end items-center px-4 
            [&_span]:cursor-pointer [&_span]:active:scale-75 [&_span]:transition-transform 
            [&_span]:duration-200 bg-layout"
      >
        <span className="size-2.5 bg-green-500 rounded-full shadow-sm" />
        <span className="size-2.5 bg-yellow-500 rounded-full shadow-sm" />
        <span className="size-2.5 bg-red-500 rounded-full shadow-sm" />
      </div>

      <div className="p-4 w-full h-32">
        <div className="bg-layout shadow-sm rounded-lg h-full text-xs p-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-md opacity-80">👩🏻‍⚕️</h2>
              </div>

              <span className="inline-flex flex-col">
                <h1 className="text-sm">Dr. X</h1>
                <p className="font-semibold">Cardiology</p>
              </span>
            </div>

            <div className="text-sm flex items-center bg-green-600 rounded-lg p-1.5 px-4 gap-2">
              <span className="inline-flex w-2 h-2 rounded-full bg-background">
                <span className="inline-flex w-2 h-2 rounded-full bg-background animate-ping" />
              </span>
              <h2 className="text-xs font-extrabold">Available right now</h2>
            </div>
          </div>

          <div className="flex [&_svg]:size-3 capitalize gap-2 self-end">
            <div className="bg-accent font-black py-1.5 flex items-center gap-2 shadow-sm rounded-md p-2 px-2">
              locate
              <MapPin />
            </div>
            <div className="bg-amber-500 font-black flex py-1.5 items-center gap-2 shadow-sm rounded-md p-2 px-2">
              call
              <PhoneOutgoing />
            </div>
            <div
              id="buttonSchedule"
              className="bg-teal-500 font-black flex py-1.5 items-center gap-2 shadow-sm rounded-md p-2 px-2"
            >
              schedule
              <CalendarFoldIcon />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        id="modalInline"
        initial={{ scale: 0, opacity: 0 }}
        className="absolute text-center top-1/2 left-1/2 size-24 shadow-md rounded-md -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative shadow-md rounded-md w-fit mx-auto p-1 px-2 text-xs font-semibold my-4">
          Mon
        </div>

        <motion.button
          initial={{
            y: "25px",
            opacity: 0,
            scale: 0,
          }}
          id="buttonBook"
          className="scale-70 bg-input p-1.5 px-2 rounded-md shadow-sm font-semibold"
        >
          Book
        </motion.button>
      </motion.div>
    </article>
  );
}

export default MockupBooking;
