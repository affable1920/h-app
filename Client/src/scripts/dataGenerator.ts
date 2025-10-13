import Chance from "chance";
import { v4 } from "uuid";
import {
  type Doctor,
  type DoctorEssentials,
  type DoctorSecondaryInfo,
} from "../types/Doctor.ts";
import * as constants from "../utilities/constants.ts";
import type { Clinic, Fee, TimeSlot, Schedule } from "../types/DoctorInfo.ts";
import { DateTime } from "luxon";

const chance = new Chance();

class DataGenerator {
  private generateClinics(single: boolean = false): Clinic | Clinic[] {
    const clinics = Array.from(
      { length: chance.natural({ min: 1, max: single ? 1 : 3 }) },
      () => ({
        id: v4(),
        name: chance.pickone(constants.HOSPITALS),
        address: chance.address(),
        contact: chance.phone(),
        whatsApp: chance.phone(),
        location: {
          lat: chance.latitude(),
          lng: chance.longitude(),
        },
        parkingAvailable: chance.bool({ likelihood: 50 }),
      })
    );

    if (single) return clinics[0];
    return clinics;
  }

  private generateFees(): Fee {
    const min = constants.CONSULTATION_FEE_RANGE.MIN;
    const max = constants.CONSULTATION_FEE_RANGE.MAX;

    return {
      inPerson: chance.natural({ min, max }),
      online: chance.natural({
        min: min - 100,
        max: max - 100,
      }),
    };
  }

  private generateSchedules(
    baseDuration: constants.ConsultationDuration = 30
  ): Schedule[] {
    let weekdayCached: constants.Weekday = "Saturday";

    function generateWeekday(): constants.Weekday {
      let wkday = chance.pickone(constants.DAYS_OF_WEEK).toLowerCase();
      if (wkday === weekdayCached)
        wkday = chance
          .pickone(constants.DAYS_OF_WEEK.filter((d) => d !== wkday))
          .toLowerCase();

      weekdayCached = wkday as constants.Weekday;
      return wkday as constants.Weekday;
    }

    const startSlice = constants.TIME_SLOTS.slice(
      0,
      constants.TIME_SLOTS.length - 2
    );

    const start = chance.pickone(startSlice);
    const end = chance.pickone(constants.TIME_SLOTS.slice(startSlice.length));

    return Array.from({ length: 2 }, () => ({
      start,
      end,
      weekday: generateWeekday(),
      slots: this.generateTimeSlots(baseDuration),
      clinic: this.generateClinics(true) as Clinic,
      totalHoursAvailable: chance.natural({ min: 1, max: 4 }),
    }));
  }

  private generateTimeSlots(
    baseDuration: constants.ConsultationDuration = 30
  ): TimeSlot[] {
    const maxSlots = 6;
    const slots = chance.pickset(
      constants.TIME_SLOTS,
      chance.natural({ max: maxSlots })
    );

    return slots.map((slotTime) => ({
      begin: slotTime,
      duration: baseDuration,
      mode: chance.pickone(["inPerson", "online"]),
      booked: chance.bool({ likelihood: Math.ceil(Math.random() * 100) }),
    }));
  }

  private generateEssentials(): DoctorEssentials {
    return {
      id: v4(),
      name: chance.name(),
      email: chance.email(),
      credentials: chance.pickone(constants.Credentials),
      primarySpecialization: chance.pickone(constants.SPECIALIZATIONS),
    };
  }

  private generateSecondaries(): DoctorSecondaryInfo {
    const fee = this.generateFees();
    const currDate = DateTime.local();
    const baseConsultTime = chance.pickone(constants.CONSULTATION_DURATION);

    return {
      fee,
      currentlyAvailable: chance.bool(),
      secondarySpecializations: chance.pickset(
        constants.SPECIALIZATIONS,
        chance.natural({ max: 3 })
      ),
      consultsOnline: chance.bool(),
      reviews: chance.natural({ max: 420 }),
      verified: chance.bool({ likelihood: 70 }),
      experience: chance.natural({ min: 1, max: 35 }),
      rating: chance.floating({ min: 1.5, max: 5.0 }),
      nextAvailable: chance.pickone([
        chance.date({
          string: true,
          year: 2025,
          month: chance.pickone([currDate.month, currDate.month + 1]),
        }),
        "unknown",
      ]) as string,
      lastUpdated: chance.pickone([
        chance.date({ string: true }) as string,
        "unknown",
      ]),
      baseConsultTime,
      baseFee: fee.inPerson as number,
      status: chance.pickone(constants.STATUSES),
      office: this.generateClinics(true) as Clinic,
      schedules: this.generateSchedules(baseConsultTime),
    };
  }

  generateDoctor(): Doctor {
    return {
      ...this.generateEssentials(),
      ...this.generateSecondaries(),
    };
  }

  static generateDoctors(count: number = 40) {
    return Array.from({ length: count }, () =>
      new DataGenerator().generateDoctor()
    );
  }
}

export default DataGenerator.generateDoctors;
