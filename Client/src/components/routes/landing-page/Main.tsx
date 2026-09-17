import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import HD from "@/assets/mockup-1.webp";
import MockupBooking from "./MockupBooking";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import { Marquee } from "@/components/ui/Marquee";

const features = [
  {
    header: "Patient - Booking",
    "sub-heading": "No More Let Me Check and Call You Back.",
    text: (
      <>
        See{" "}
        <em>
          <strong>real availability</strong>
        </em>
        , pick a slot that works for you, and get confirmed instantly. Booking a
        doctor should feel like booking anything else.
      </>
    ),
    mockup: MockupBooking,
  },
  {
    header: "Video Consultations",
    "sub-heading": "Face to Face Still Means Something.",
    text: (
      <>
        <em>
          <strong>HD video consultations</strong>{" "}
        </em>
        with your doctor, from wherever you are. Same conversation, none of the
        commute.
      </>
    ),
    mockup() {
      return (
        <article className="md:order-2 rounded-md overflow-hidden shadow-sm md:items-start relative">
          <div className="w-full max-h-48">
            <img src={HD} alt="HD Video Call" />
          </div>
        </article>
      );
    },
  },
  {
    header: "Expand your Reach",
    "sub-heading": "Your Reputation Travels Further Than You Do.",
    text: (
      <>
        Patients find you by{" "}
        <em>
          <strong>specialty</strong>
        </em>
        ,{" "}
        <em>
          <strong>rating</strong>
        </em>
        , and{" "}
        <em>
          <strong>availability</strong>
        </em>
        . Your profile works for you even when you're not online.
      </>
    ),
  },
  {
    header: "Post Consultation",
    "sub-heading": "The Appointment Ends. The Care Doesn't.",
    text: (
      <>
        Every consultation closes with a{" "}
        <em>
          <strong>summary</strong>
        </em>
        ,{" "}
        <em>
          <strong>advice</strong>
        </em>
        , and{" "}
        <em>
          <strong>next steps</strong>
        </em>
        .<br></br>So nothing important gets forgotten.
      </>
    ),
  },
  {
    header: "Clinic Admin",
    "sub-heading": "Running a Clinic Is Hard Enough Already.",
    text: (
      <>
        Manage doctors, appointments, and schedules from a single{" "}
        <em>
          <strong>dashboard</strong>
        </em>
        . Less chaos, more control.
      </>
    ),
  },
  {
    header: "The AI Assistant",
    "sub-heading": "Not Sure Where to Start? Start Here.",
    text: (
      <>
        Describe what you're feeling. Our{" "}
        <em>
          <strong className="capitalize">assistant</strong>
        </em>{" "}
        finds the right specialist, checks availability, and gets you booked —
        before you've even thought about it.
      </>
    ),
  },
];

export function LandingPageMain() {
  return (
    <section className="space-y-24 md:space-y-32 px-8 py-6 pt-12">
      {/* Hero */}
      <section className="pt-24">
        <section
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 
          gap-14 items-stretch"
        >
          {/* Mockup */}
          <motion.article
            initial={{
              filter: "blur(3px)",
            }}
            viewport={{ once: true }}
            whileInView={{
              filter: "blur(0)",
              transition: { delay: 0.4, ease: "easeOut" },
            }}
            className="order-2 rounded-md overflow-hidden shadow-md shadow-black/40 md:items-start 
              bg-layout flex-1"
          >
            <div
              className="h-8 bg-accent flex gap-2.5 justify-end items-center px-4 
            [&_span]:cursor-pointer [&_span]:active:scale-75 [&_span]:transition-transform"
            >
              <span className="size-2.5 bg-green-500 rounded-full shadow-sm" />
              <span className="size-2.5 bg-yellow-500 rounded-full shadow-sm" />
              <span className="size-2.5 bg-red-500 rounded-full shadow-sm" />
            </div>

            <div className="p-4 w-full h-32 bg-background">
              <div
                className="bg-layout-raised shadow-sm shadow-background rounded-lg h-full text-xs p-3 flex flex-col 
                justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div>
                      <h2 className="text-md opacity-80">👩🏻‍⚕️</h2>
                    </div>

                    <span className="inline-flex flex-col">
                      <h1 className="text-sm">Dr. X</h1>
                      <p className="font-semibold text-text-normal">
                        Cardiology
                      </p>
                    </span>
                  </div>

                  <div className="text-sm flex items-center bg-green-600 rounded-lg p-1.5 px-4 gap-2">
                    <span className="inline-flex w-2 h-2 rounded-full bg-background">
                      <span className="inline-flex w-2 h-2 rounded-full bg-background animate-ping" />
                    </span>
                    <h2 className="text-xs text-text">Available right now</h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>

          <div className="md:min-w-0 md:flex-1">
            <div
              className="flex items-center font-semibold text-sm w-fit p-2 px-4 
                rounded-lg shadow-inner text-white gap-2 bg-layout-raised mb-3"
            >
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-400">
                <span className="w-1/2 h-1/2 rounded-full bg-background animate-ping" />
              </span>
              <span>V1.0 is live now</span>
            </div>
            <article className="space-y-2">
              <motion.div
                viewport={{ once: true }}
                initial={{ opacity: 0, x: "-50px" }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: {
                    ease: "easeIn",
                    duration: 0.5,
                  },
                }}
                className="capitalize"
              >
                <h1 className="text-2xl leading-[1.1]">
                  The care you deserve
                  <br />
                  <span className="text-xl inline-flex gap-2">
                    Just a click away
                    <motion.span
                      viewport={{ once: true }}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        scale: [1, 0.75, 0.5, 0.75, 1],
                        transition: { delay: 0.59 },
                      }}
                      className="text-xl"
                    >
                      🮰
                    </motion.span>
                  </span>
                </h1>
              </motion.div>

              <p className="first-letter:capitalize font-bold leading-tight">
                Verified specialists across Kashmir. <br />
                Book, consult, and take charge of your health without leaving
                the comfort of your home.
              </p>
            </article>

            <div className="flex gap-4 mt-4">
              <Link to="/view/idx/doctors">
                <Button endIcon={<ArrowRight />}>Find a doctor</Button>
              </Link>
              <Link to="/auth/register" state={{ role: "doctor" }}>
                <Button color="brand" endIcon={<ArrowRight />}>
                  Join as a doctor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </section>

      <section className="max-w-7xl mx-auto space-y-4">
        <article className="text-center space-y-0.5">
          <h2 className="text-xl leading-tight">Our specializations</h2>
          <p className="leading-tight">
            Consult verified doctors across all major specialties
          </p>
        </article>

        <article className="flex flex-col gap-2">
          <Marquee />
          <Divider />
        </article>
      </section>

      {/* Features */}

      <section id="features">
        <div className="max-w-7xl mx-auto space-y-10 md:space-y-16">
          <h1 className="text-xl text-center leading-tight">
            This Time, Feel the Difference
          </h1>

          <ul className="flex flex-col gap-16 md:gap-20">
            {features.map(function (feature, i) {
              return (
                <motion.article
                  key={feature.header + i}
                  initial={
                    i % 2 === 0
                      ? {
                          x: "-70px",
                          filter: "blur(1px)",
                          opacity: 0,
                        }
                      : {
                          x: "70px",
                          opacity: 0,
                          filter: "blur(1px)",
                        }
                  }
                  whileInView={{ x: 0, opacity: 1, filter: "blur(0)" }}
                  transition={{
                    x: { duration: 0.6, ease: "easeInOut" },
                    filter: { delay: 0.33 },
                  }}
                  viewport={{ once: true }}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-6 content-between 
                    md:gap-14`}
                >
                  <div
                    className={`space-y-1 flex-1 min-w-0 
                        ${i % 2 === 0 ? "md:order-1" : "md:order-3"}
                      `}
                  >
                    <h2 className="text-md leading-tight">
                      {feature["sub-heading"]}
                    </h2>

                    <p className="leading-tight">{feature.text}</p>
                  </div>

                  {/* Feature Mockup */}

                  {feature.mockup ? <feature.mockup /> : null}
                </motion.article>
              );
            })}
          </ul>
        </div>
      </section>
    </section>
  );
}
