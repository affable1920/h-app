import { Step1_Identity } from "./Step1_Identity";
import { Step2_Credentials } from "./Step2_Credentials";
import { Step3_Craft } from "./Step3_Craft";
import { Step4_Auth } from "./Step4_Auth";

export const STEPS = [
  {
    tag: "STEP 01",
    title: "Let's start with you",
    subtitle: "The basics — who you are, and how the world sees you.",
    Component: Step1_Identity,
  },
  {
    tag: "STEP 02",
    title: "Your credentials",
    subtitle: "Tell us about the qualifications that define your expertise.",
    Component: Step2_Credentials,
  },
  {
    tag: "STEP 03",
    title: "Your craft",
    subtitle: "What do you specialise in, and how long have you been doing it?",
    Component: Step3_Craft,
  },
  {
    tag: "STEP 04",
    title: "Login Details",
    subtitle: "Access to you account.",
    Component: Step4_Auth,
  },
];
