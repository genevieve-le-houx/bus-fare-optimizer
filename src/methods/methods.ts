import moment from 'moment';
import type { Moment } from 'moment';


enum EnumFareType {
  single = "single",
  illimited_day = "illimited_day",
  illimited_week_end = "illimited_week_end",
  illimited_5_days = "illimited_5_days",
  illimited_month = "illimited_month"
}

type EnumFareTypeStrings = keyof typeof EnumFareType;

type FareToBuy = {
  date: Moment;
  fareType: EnumFareType;
  qty: number;
}
// TODO maybe add number to buy to not have big list of fares to buy when we have a lot of single fares to buy on the same day

type BestCombination = {
  faresToBuy: Array<FareToBuy>;
  totalCost: number;
}

function convertToMoment(dateStr: string): Moment {
  return moment(dateStr, 'YYYY-MM-DD');
}

function convertToString(moment: Moment): string {
  return moment.format('YYYY-MM-DD');
}

function copyNestedList(list: Array<Array<FareToBuy>>): Array<Array<FareToBuy>> {
  const listCopy = list.map(fares => 
    fares.map(fare => ({ 
      date: fare.date.clone(), // Moment has a .clone() method
      fareType: fare.fareType,
      qty: fare.qty
    }))
  )
  return listCopy;
}

function copyList(list: Array<FareToBuy>): Array<FareToBuy> {
  return list.map(fare => ({ 
    date: fare.date.clone(), // Moment has a .clone() method
    fareType: fare.fareType,
    qty: fare.qty
  }));
}

function branch3Options(fares: Record<EnumFareType, number>, date: Moment, n: number): Array<FareToBuy> {
  const listPossibilities: Array<FareToBuy> = []

  // 3 options: 5 days, illimited vs single, if saturday get illimited weekend
  listPossibilities.push({ 
      date: date,
      fareType: EnumFareType.illimited_5_days ,
      qty: 1
  })

  if (n * fares[EnumFareType.single] > fares[EnumFareType.illimited_day]) {
    listPossibilities.push({ 
      date: date,
      fareType: EnumFareType.illimited_day ,
      qty: 1
    })
  } else {
    listPossibilities.push({
      date: date,
      fareType: EnumFareType.single,
      qty: n
    });
  }

  if (date.day() === 6) { // saturday
    listPossibilities.push({
      date: date,
      fareType: EnumFareType.illimited_week_end,
      qty: 1
    })
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
        possibility.push(newPossibility)
      } else {
        possibilityCopy.push(newPossibility)
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

      listPossibilities.push(...(listNewPossibilities.map(possibility => [possibility])));

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
    const price = possibility.reduce((acc, fareToBuy) => acc + fares[fareToBuy.fareType]*fareToBuy.qty, 0)
    return price
    }
  )

  let priceSmaller = Math.min(...priceForPossibility)
  const indexSmaller = priceForPossibility.indexOf(priceSmaller)
  const fareSmaller = listPossibilities[indexSmaller]!

  // Compare with month
  let fareToBuy: Array<FareToBuy> = []
  if (priceSmaller > fares[EnumFareType.illimited_month]) {
    fareToBuy = [{ 
      date: firstDayMonth, 
      fareType: EnumFareType.illimited_month,
      qty: 1
    }]
    priceSmaller = fares[EnumFareType.illimited_month]
  } else {
    fareToBuy = fareSmaller
  }


  const bestCombination: BestCombination = {
    faresToBuy: fareToBuy,
    totalCost: priceSmaller
  }

  // Order by date
  bestCombination.faresToBuy.sort((a, b) => a.date.diff(b.date))

  return bestCombination
}

function formatDollars(price: number): string {
  return price.toFixed(2) + " $"
}

export { EnumFareType, findBestCombination, convertToString, convertToMoment, formatDollars }
export type { EnumFareTypeStrings, FareToBuy, BestCombination }