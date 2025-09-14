import Chance from "chance";
import { v4 } from "uuid";
import { type Doc } from "../types/doc.ts";
import * as constants from "../types/constants.ts";

const chance = new Chance();

function createDoctor(): Doc {
  const feeAmt = () => ({
    inPerson: chance.natural({ min: 50, max: 500 }),
    online: chance.natural({ min: 50, max: 500 }),
  });

  return {
    id: v4(),
    name: chance.name(),
    primarySpecialization:
      constants.SPECIALIZATIONS[
        chance.natural({ max: constants.SPECIALIZATIONS.length - 1 })
      ],
    credentials:
      constants.CREDENTIALS[
        chance.natural({ max: constants.CREDENTIALS.length - 1 })
      ],
    currentlyAvailable: chance.bool(),
    secondarySpecializations: Array.from(
      { length: chance.natural({ min: 0, max: 3 }) },
      () =>
        constants.SPECIALIZATIONS[
          chance.natural({ max: constants.SPECIALIZATIONS.length - 1 })
        ]
    ),
    clinics: Array.from({ length: chance.natural({ min: 1, max: 3 }) }, () => ({
      name: constants.HOSPITALS[
        chance.natural({ max: constants.HOSPITALS.length - 1 })
      ],
      fee: feeAmt(),
      contact: chance.phone(),
      address: chance.address(),
      dayTime: Array.from(
        { length: chance.natural({ min: 1, max: 5 }) },
        () =>
          constants.DAYS_OF_WEEK[
            chance.natural({ max: constants.DAYS_OF_WEEK.length - 1 })
          ]
      ),
      whatsApp: chance.phone(),
      location: {
        lat: chance.latitude(),
        lng: chance.longitude(),
      },
    })),
    experience: chance.natural({ min: 2, max: 35 }),
    verified: chance.bool(),
    onlineConsult: chance.bool(),
    bookingEnabled: chance.bool(),
    fee: feeAmt(),
    rating: chance.floating({ min: 3.5, max: 5.0, fixed: 1 }),
    reviews: chance.natural({ min: 1, max: 1000 }),
    nextAvailable: null,
    lastUpdated: Date.now(),
    status: constants.STATUSES[chance.natural({ max: 3 })],
    avgConsultTime: chance.natural({ min: 15, max: 60 }),
    queuedPatients: chance.natural({ min: 0, max: 20 }),
  };
}

export const generateDoctorData = () =>
  Array.from({ length: 50 }, () => createDoctor());
