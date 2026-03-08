import moment from 'moment';
import type { Moment } from 'moment';


const enum EnumFareType {
  single = "single",
  illimited_day = "illimited_day",
  illimited_week_end = "illimited_week_end",
  illimited_5_days = "illimited_5_days",
  illimited_month = "illimited_month"
}

type FareToBuy = {
  date: Moment;
  fareType: EnumFareType;
}

type BestCombination = {
  faresToBuy: Array<FareToBuy>;
  totalCost: number;
}

function convertToMoment(dateStr: string): Moment {
  return moment(dateStr, 'YYYY-MM-DD');
}

// function copyNestedList(list: Array<Array<FareToBuy>>): Array<Array<FareToBuy>> {
//   const listCopy = list.map(fares => 
//     fares.map(fare => ({ 
//       date: fare.date.clone(), // Moment has a .clone() method
//       fareType: fare.fareType 
//     }))
//   )
//   return listCopy;
// }

function copyList(list: Array<FareToBuy>): Array<FareToBuy> {
  return list.map(fare => ({ 
    date: fare.date.clone(), // Moment has a .clone() method
    fareType: fare.fareType 
  }));
}

function branch3Options(fares: Record<EnumFareType, number>, date: Moment, n: number): Array<Array<FareToBuy>> {
  const listPossibilities: Array<Array<FareToBuy>> = []

  // 3 options: 5 days, illimited vs single, if saturday get illimited weekend
  listPossibilities.push([{ date, fareType: EnumFareType.illimited_5_days }])

  if (n * fares[EnumFareType.single] > fares[EnumFareType.illimited_day]) {
    listPossibilities.push([{ date, fareType: EnumFareType.illimited_day }])
  } else {
    const listDates: Array<FareToBuy> = [];
    for (let i = 0; i < n; i++) {
      listDates.push({ date, fareType: EnumFareType.single })
    }
    listPossibilities.push(listDates);
  }

  if (date.day() === 6) { // saturday
    listPossibilities.push([{ date, fareType: EnumFareType.illimited_week_end }])
  }

  return listPossibilities
}

function branchOut3NewPossibilities(
    fares: Record<EnumFareType, number>, possibilityToAdd: Array<Array<FareToBuy>>, 
    possibility: Array<FareToBuy>, date: Moment, n: number
) {
    const listNewPossibilities = branch3Options(fares, date, n)
    const possibilityCopy = copyList(possibility)

    for (const [j, newPossibility] of listNewPossibilities.entries()) {
      if (j === 0) {
        possibility.push(...newPossibility)
      } else {
        possibilityCopy.push(...newPossibility)
        possibilityToAdd.push(possibilityCopy)
      }
    }
}

function findBestCombination(fares: Record<EnumFareType, number>, dateNeeded: Record<string, number>, firstDayMonth: Moment): BestCombination {
  const listPossibilities: Array<Array<FareToBuy>> = []

  for (const [i, [dateStr, n]] of Object.entries(dateNeeded).entries()) {
    const date = convertToMoment(dateStr);
    if (i === 0) {
      const listNewPossibilities = branch3Options(fares, date, n);

      listPossibilities.push(...listNewPossibilities);

    } else {
      // const listPossibilitiesCopy = copyNestedList(listPossibilities);
      const possiblityToAdd: Array<Array<FareToBuy>> = []

      for (const possibility of listPossibilities) {
        const lastOption = possibility[possibility.length - 1];
        
        if (lastOption!.fareType === EnumFareType.illimited_5_days) {
          if (date.diff(lastOption!.date, 'days') < 5) {
            continue
          } else {
            branchOut3NewPossibilities(fares, possiblityToAdd, possibility, date, n)
          }
        } else if (lastOption!.fareType === EnumFareType.illimited_week_end) {
          if (date.diff(lastOption!.date, 'days') === 1) {
            continue
          } else {
            branchOut3NewPossibilities(fares, possiblityToAdd, possibility, date, n)
          }
        } else {
          branchOut3NewPossibilities(fares, possiblityToAdd, possibility, date, n)
        }
      }
      listPossibilities.push(...possiblityToAdd)
    }
  }
  console.log(listPossibilities)

  // Find the best possibilities
  const priceForPossibility = listPossibilities.map(possibility => {
    const price = possibility.reduce((acc, fareToBuy) => acc + fares[fareToBuy.fareType], 0)
    return price
    }
  )

  let priceSmaller = Math.min(...priceForPossibility)
  const indexSmaller = priceForPossibility.indexOf(priceSmaller)
  const fareSmaller = listPossibilities[indexSmaller]!

  // Compare with month
  let fareToBuy: Array<FareToBuy> = []
  if (priceSmaller > fares[EnumFareType.illimited_month]) {
    fareToBuy = [{ date: firstDayMonth, fareType: EnumFareType.illimited_month }]
    priceSmaller = fares[EnumFareType.illimited_month]
  } else {
    fareToBuy = fareSmaller
  }


  const bestCombination: BestCombination = {
    faresToBuy: fareToBuy,
    totalCost: priceSmaller
  }

  return bestCombination
}

export { EnumFareType, findBestCombination }
export type { FareToBuy, BestCombination }