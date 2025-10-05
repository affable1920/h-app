import Chance from "chance";
import { v4 } from "uuid";
import {
  type Doctor,
  type DoctorEssentials,
  type DoctorSecondaryInfo,
} from "../types/Doctor.ts";
import * as constants from "../utilities/constants.ts";
import type {
  Clinic,
  Fee,
  TimeSlot,
  Schedule,
  DayInfo,
} from "../types/DoctorInfo.ts";

const chance = new Chance();

class DataGenerator {
  private generateClinics(single: boolean = false): Clinic | Clinic[] {
    const clinics = Array.from(
      { length: chance.natural({ max: single ? 1 : 3 }) },
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
      })
    );

    if (single) return clinics[0];
    return clinics;
  }

  private generateFees(): Fee {
    return {
      inPerson: chance.natural({
        min: constants.CONSULTATION_FEE_RANGE.MIN,
        max: constants.CONSULTATION_FEE_RANGE.MAX,
      }),
      online: chance.natural({
        min: constants.CONSULTATION_FEE_RANGE.MIN,
        max: constants.CONSULTATION_FEE_RANGE.MAX,
      }),
    };
  }

  private generateSchedules(): Schedule {
    const wkday = chance.pickone(constants.DAYS_OF_WEEK);
    const startSlice = constants.TIME_SLOTS.slice(
      0,
      constants.TIME_SLOTS.length - 2
    );

    const start = chance.pickone(startSlice);
    const end = chance.pickone(constants.TIME_SLOTS.slice(startSlice.length));

    const dayInfo: DayInfo = {
      start,
      end,
      weekday: wkday,
      clinic: this.generateClinics(true) as Clinic,
      totalHoursAvailable: chance.natural({ max: 4 }),
    };

    return Array.from({ length: chance.natural({ max: 4 }) }, () => ({
      ...dayInfo,
      slots: this.generateTimeSlots(dayInfo),
    }));
  }

  private generateTimeSlots(
    dayInfo: DayInfo,
    baseDuration: constants.ConsultationDuration = 30
  ): TimeSlot[] {
    const maxSlots = ((dayInfo.totalHoursAvailable || 4) * 60) / baseDuration;
    const slots = chance.pickset(
      constants.TIME_SLOTS,
      chance.natural({ max: maxSlots })
    );

    return slots.map((slotTime) => ({
      start: slotTime,
      duration: baseDuration,
      mode: chance.pickone(["inPerson", "online"]),
      booked: chance.bool({ likelihood: Math.random() }),
    }));
  }

  private generateEssentials(): DoctorEssentials {
    return {
      id: v4(),
      name: chance.name(),
      email: chance.email(),
      credentials: chance.pickone(constants.CREDENTIALS),
      primarySpecialization: chance.pickone(constants.SPECIALIZATIONS),
    };
  }

  private generateSecondaries(): DoctorSecondaryInfo {
    return {
      currentlyAvailable: chance.bool(),
      secondarySpecializations: chance.pickset(
        constants.SPECIALIZATIONS,
        chance.natural({ max: 3 })
      ),
      clinics: this.generateClinics() as Clinic[],
      experience: chance.natural({ min: 2, max: 35 }),
      verified: chance.bool(),
      consultsOnline: chance.bool(),
      fee: this.generateFees(),
      rating: chance.floating({ min: 3.5, max: 5.0, fixed: 1 }),
      reviews: chance.natural({ min: 1, max: 1000 }),
      nextAvailable: null,
      lastUpdated: Date.now(),
      status: chance.pickone(constants.STATUSES),
      schedule: this.generateSchedules(),
      waitingTime: undefined,
      office: this.generateClinics(true) as Clinic,
      queuedPatients: chance.natural({ min: 0, max: 20 }),
      baseConsultTime: chance.pickone(constants.CONSULTATION_DURATION),
      baseFee: chance.natural({ max: constants.CONSULTATION_FEE_RANGE.MAX }),
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
