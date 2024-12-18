import { ContractPeriodRate, RoomTypeRate, MealPlanRates, SeasonType } from '../../models/types';
import { contracts } from './contracts.mock';
import { seasons } from './seasons.mock';
import { rooms } from './rooms.mock';

const generatedContractRates: { [contractId: number]: ContractPeriodRate[] } = {};

const mealPlanIdMap: { [key: string]: string } = {
    "RO": "default-ro",
    "BB": "default-bb",
    "HB": "default-hb",
    "FB": "default-fb",
    "AI": "default-ai",
    "BB+": "riveria-bb-plus",
    "HB+": "riveria-hb-plus",
    "AI+": "maldives-ai-plus",
    "UAI": "maldives-uai"
};

contracts.forEach(contract => {
    const season = seasons[contract.hotelId].find(s => s.id === contract.seasonId);

    if (season && season.periods) {
        generatedContractRates[contract.id] = season.periods.map(period => {
            const roomRates: RoomTypeRate[] = contract.selectedRoomTypes.map(roomTypeId => {
                const room = rooms.find(room => room.id === roomTypeId);
                const rateType = room && (room.category === "VILLA" || room.category === "OVERWATER_VILLA" || room.category === "POOL_VILLA" || room.category === "EXECUTIVE_SUITE") ? 'per_villa' : 'per_pax';
                
                let baseRate = 0;
                if (room) {
                    baseRate = (room.category === 'STANDARD' ? 200 :
                        room.category === 'SUPERIOR' ? 300 :
                        room.category === 'DELUXE' ? 400 :
                        room.category === 'FAMILY_ROOM' ? 500 :
                        room.category === 'PENTHOUSE' ? 1000 :
                        room.category === 'VILLA' ? 700 :
                        room.category === 'OVERWATER_VILLA' ? 900 :
                        room.category === 'POOL_VILLA' ? 800 :
                        room.category === 'EXECUTIVE_SUITE' ? 1200 : 100) * (period?.type === 'peak' ? 1.2 : period?.type === 'low' ? 0.8 : 1);
                }


                const personTypeRates = rateType === 'per_pax' && room ? {
                    adult: {
                        rates: {
                            1: baseRate * 1,
                            2: baseRate * 0.9,
                            3: baseRate * 0.8,
                            4: baseRate * 0.7,
                        }
                    },
                    child: {
                        rates: {
                            1: baseRate * 0.5,
                            2: baseRate * 0.4,
                        }
                    },
                    infant: {
                        rates: {
                            1: 0
                        }
                    }
                } : undefined;

                const villaRate = rateType === 'per_villa' ? baseRate : undefined;

                const mealPlanRates: MealPlanRates = {};

                contract.selectedMealPlans.forEach(mealPlan => {
                    const mealPlanId = mealPlanIdMap[mealPlan];
                    let mealRate = 0;
                    switch (mealPlanId) {
                        case 'default-ro':
                            mealRate = 0;
                            break;
                        case 'default-bb':
                            mealRate = baseRate * 0.1;
                            break;
                        case 'default-hb':
                            mealRate = baseRate * 0.2;
                            break;
                        case 'default-fb':
                            mealRate = baseRate * 0.3;
                            break;
                        case 'default-ai':
                            mealRate = baseRate * 0.4;
                            break;
                        case 'riveria-bb-plus':
                            mealRate = baseRate * 0.15;
                            break;
                        case 'riveria-hb-plus':
                            mealRate = baseRate * 0.25;
                            break;
                        case 'maldives-ai-plus':
                            mealRate = baseRate * 0.45;
                            break;
                         case 'maldives-uai':
                            mealRate = baseRate * 0.55;
                            break;
                        default:
                            mealRate = 0;
                            break;
                    }
                    mealPlanRates[mealPlanId] = {
                        adult: mealRate,
                        child: mealRate * 0.5,
                        infant: 0
                    };
                });


                return { roomTypeId, rateType, personTypeRates, villaRate, mealPlanRates };
            });
            return { periodId: period.id, roomRates };
        });
    } else {
        console.error(`No season or periods found for contract ${contract.id} and seasonId ${contract.seasonId}. Please check the consistency between contract.mock.ts and season.mock.ts`);
    }
});

export const contractRates = generatedContractRates;
