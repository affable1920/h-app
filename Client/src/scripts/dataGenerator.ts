import { v4 } from "uuid";
import Chance from "chance";
import { DateTime } from "luxon";

import type {
  DoctorSummary,
  Clinic,
  Fee,
  Slot as TimeSlot,
  Schedule,
} from "../types/doctorAPI.ts";
import * as constants from "../utils/constants.ts";

const chance = new Chance();

class DataGenerator {
  private generateClinics(single: true): Clinic;
  private generateClinics(single: false): Clinic[];

  private generateClinics(single: boolean): Clinic | Clinic[] {
    const clinics = Array.from(
      { length: chance.natural({ min: 1, max: single ? 1 : 3 }) },
      () => ({
        id: v4(),
        name: chance.pickone(constants.HOSPITALS),
        address: chance.address(),
        contact: chance.phone(),
        whatsapp: chance.phone(),
        facilities: [],
        location: {
          lat: chance.latitude(),
          lng: chance.longitude(),
        },
        parking_available: chance.bool({ likelihood: 50 }),
      })
    );

    return single ? clinics[0] : clinics;
  }

  private generateFees(): Fee {
    const min = constants.CONSULTATION_FEE_RANGE.MIN;
    const max = constants.CONSULTATION_FEE_RANGE.MAX;

    return {
      in_person: chance.natural({ min, max }),
      online: chance.natural({
        min: min - 100,
        max: max - 100,
      }),
    };
  }

  private generateSchedules(
    baseDuration: constants.ConsultationDuration = 30
  ): Schedule[] {
    let weekdayCached: number;

    function generateWeekday(): number {
      const wkdays: number[] = Array.from({ length: 7 });
      let wkday = chance.pickone(wkdays);

      if (wkday === weekdayCached)
        wkday = chance.pickone(wkdays.filter((d) => d !== wkday));

      weekdayCached = wkday;
      return wkday;
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

  private generateEssentials(): Partial<DoctorSummary> {
    return {
      id: v4(),
      name: chance.name(),
      email: chance.email(),
      credentials: chance.pickone(constants.Credentials),
      primary_specialization: chance.pickone(constants.SPECIALIZATIONS),
    };
  }

  private generateSecondaries(): Partial<DoctorSummary> {
    const fee = this.generateFees();
    const currDate = DateTime.local();
    const baseConsultTime = chance.pickone(constants.CONSULTATION_DURATION);

    return {
      fee,
      currently_available: chance.bool(),
      secondary_specializations: chance.pickset(
        constants.SPECIALIZATIONS,
        chance.natural({ max: 3 })
      ),
      consults_online: chance.bool(),
      reviews: chance.natural({ max: 420 }),
      verified: chance.bool({ likelihood: 70 }),
      experience: chance.natural({ min: 1, max: 35 }),
      rating: chance.floating({ min: 1.5, max: 5.0 }),
      next_available: chance.pickone([
        chance.date({
          string: true,
          year: 2025,
          month: chance.pickone([currDate.month, currDate.month + 1]),
        }),
        "unknown",
      ]) as string,
      last_updated: chance.pickone([
        chance.date({ string: true }) as string,
        "unknown",
      ]),
      base_consult_time: baseConsultTime,
      base_fee: fee.in_person as number,
      status: chance.pickone(constants.STATUSES),
      office: this.generateClinics(true) as Clinic,
      schedules: this.generateSchedules(baseConsultTime),
    };
  }

  generateDoctor(): DoctorSummary {
    return {
      ...this.generateEssentials(),
      ...this.generateSecondaries(),
    } as DoctorSummary;
  }

  static generateDoctors(count: number = 40) {
    return Array.from({ length: count }, () =>
      new DataGenerator().generateDoctor()
    );
  }
}

export default DataGenerator.generateDoctors;
