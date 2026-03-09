<script lang="ts">
import { defineComponent } from 'vue'

import moment from 'moment';
import type { Moment } from 'moment';

import { EnumFareType, findBestCombination, convertToString, convertToMoment } from '@/methods/methods.ts'
import type { BestCombination } from '@/methods/methods.ts'

const dateNeededHeaders = [
  { title: 'Date', key: 'date' },
  { title: 'Number of rides needed', key: 'n' },
  { title: 'Actions', key: 'actions' },
]

type DateNeededItem = {
  date: Moment,
  n: number
}

function checkDateAlreadyThere(date: Moment, items: Array<DateNeededItem>): boolean {
  return items.some(item => item.date.isSame(date, 'day'));
}

export default defineComponent({
  name: 'MainView',
  props: {
    msg: { type: String, required: true },
  },
  data() {
    return {
      dateNeededHeaders,
      itemsDateNeeded: [
        { date: convertToMoment("2026-04-01"), n: 2 },
        { date: convertToMoment("2026-04-02"), n: 2 },
        { date: convertToMoment("2026-04-06"), n: 2 },
        { date: convertToMoment("2026-04-07"), n: 4 },
        { date: convertToMoment("2026-04-08"), n: 2 },
        { date: convertToMoment("2026-04-20"), n: 4 },
        { date: convertToMoment("2026-04-21"), n: 2 },
        { date: convertToMoment("2026-04-22"), n: 2 },
        { date: convertToMoment("2026-04-23"), n: 2 },
        { date: convertToMoment("2026-04-24"), n: 2 },
        { date: convertToMoment("2026-04-27"), n: 4 },
        { date: convertToMoment("2026-04-28"), n: 2 },
        { date: convertToMoment("2026-04-29"), n: 2 },
        { date: convertToMoment("2026-04-30"), n: 2 },
      ] as Array<DateNeededItem>,
      itemsPerPage: -1,

      dateToAdd: null as Moment | null,
      nToAdd: 1,

      count: 0,
      fares: {
        [EnumFareType.single]: 3.25,
        [EnumFareType.illimited_day]: 10.25,
        [EnumFareType.illimited_week_end]: 18.25,
        [EnumFareType.illimited_5_days]: 34,
        [EnumFareType.illimited_month]: 99.50,
      },
      //   "2026-04-01": 2,
      //   "2026-04-02": 2,
      //   "2026-04-03": 2,
      // },
      // dateNeeded2: {
      //   "2026-04-01": 2,
      //   "2026-04-02": 2,
      //   "2026-04-06": 2,
      //   "2026-04-07": 4,
      //   "2026-04-08": 2,
      //   "2026-04-20": 4,
      //   "2026-04-21": 2,
      //   "2026-04-22": 2,
      //   "2026-04-23": 2,
      //   "2026-04-24": 2,
      //   "2026-04-27": 4,
      //   "2026-04-28": 2,
      //   "2026-04-29": 2,
      //   "2026-04-30": 2,
      // },
      // dateNeeded3: {
      //   "2026-04-01": 2,
      //   "2026-04-02": 2,
      //   "2026-04-04": 5,
      //   "2026-04-05": 5,
      //   "2026-04-06": 2,
      //   "2026-04-07": 4,
      //   "2026-04-08": 2,
      //   "2026-04-20": 4,
      //   "2026-04-21": 2
      // },
      firstDateMonth: moment("2026-04-01", 'YYYY-MM-DD'),
      bestCombination: {
        faresToBuy: [],
        totalCost: 0
      } as BestCombination
    }
  },
  computed: {
    textCount(): string {
      return `Count is: ${this.count}`;
    }
  },
  mounted() {
    
  },
  methods:{
    // TODO when adding date, reorders them
    convertStringToDate(dateString: string): Moment {
      return convertToMoment(dateString);
    },
    convertDateToString(date: Moment): string {
      return convertToString(date)
    },
    updatedDateItem(newValue: Moment, item: DateNeededItem) {
        if (checkDateAlreadyThere(newValue, this.itemsDateNeeded)) {
          return;
        }
        item.date = newValue;
    },
    updatedNItem(newValue: number, item: DateNeededItem) {
        item.n = newValue;
    },
    deleteDateNeeded(item: DateNeededItem) {
        this.itemsDateNeeded = this.itemsDateNeeded.filter(i => i.date !== item.date);
    },
    addDateNeeded() {
        if (this.dateToAdd && this.nToAdd > 0 && this.dateToAdd.month() === this.firstDateMonth.month()) {
            if (checkDateAlreadyThere(this.dateToAdd, this.itemsDateNeeded)) {
                return;
            }
            this.itemsDateNeeded.push({ date: this.dateToAdd, n: this.nToAdd });
        }
    },
    computeBest() {
      const dateNeeded: Record<string, number> = this.itemsDateNeeded.reduce((acc, item) => {
        if (item.date.month() === this.firstDateMonth.month()) {
          acc[convertToString(item.date)] = item.n;
        }
        return acc;
      }, {} as Record<string, number>);


      const bestCombination = findBestCombination(this.fares, dateNeeded, this.firstDateMonth);

      this.bestCombination = bestCombination;
    }
  },
  
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <v-date-input 
    v-model="firstDateMonth"
    label="First date of the month"
    input-format="yyyy-mm-dd"
  />

  <h2>Dates needed</h2>

  <v-data-table
    :headers="dateNeededHeaders"
    :items="itemsDateNeeded"
    v-model:items-per-page="itemsPerPage"
  >
    <template #item.date="{ item }">
      <v-date-input
        :model-value="item.date"
        @update:model-value="updatedDateItem($event, item)"
        input-format="yyyy-mm-dd"
      />

    </template>

    <template #item.n="{ item }">
      <v-number-input
        v-model="item.n"
      />
    </template>

    <template #item.actions="{ item }">
      <v-btn 
        @click="deleteDateNeeded(item)"
        text="Delete"
      />
    </template>
  </v-data-table>

  <v-row>
    <v-date-input 
      v-model="dateToAdd"
      input-format="yyyy-mm-dd"
    />

    <v-number-input 
      v-model="nToAdd"
    />

    <v-btn 
      @click="addDateNeeded"
      text="Add"
    />
  </v-row>

  <div class="card">
    <v-btn 
      type="button" 
      @click="computeBest"
      text="Compute best fare to buy"
    />
  </div>

  <h2>Best fare to buy</h2>

  <div v-if="bestCombination">
    <p>Total price: {{ bestCombination.totalCost }}</p>

    <p v-for="fareToBuy of bestCombination.faresToBuy" :key="convertDateToString(fareToBuy.date)">
        {{ convertDateToString(fareToBuy.date) }}: {{ fareToBuy.fareType }} x{{ fareToBuy.qty }} 
        <!-- TODO should display in 0.00$ style -->
    </p>
  </div>
  

</template>

<style scoped>

</style>
