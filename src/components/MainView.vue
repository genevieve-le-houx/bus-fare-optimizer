<script lang="ts">
import { defineComponent } from 'vue'

import moment from 'moment';
import type { Moment } from 'moment';

import { EnumFareType, findBestCombination, convertToString } from '@/methods/methods.ts'
import type { BestCombination } from '@/methods/methods.ts'

const dateNeededHeaders = [
  { title: 'Date', key: 'date' },
  { title: 'Number of rides needed', key: 'n' },
  { title: 'Actions', key: 'actions' },
]

type DateNeededItem = {
  date: string,
  n: number
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
        { date: "2026-04-01", n: 2 },
        { date: "2026-04-02", n: 2 },
        { date: "2026-04-06", n: 2 },
        { date: "2026-04-07", n: 4 },
        { date: "2026-04-08", n: 2 },
        { date: "2026-04-20", n: 4 },
        { date: "2026-04-21", n: 2 },
        { date: "2026-04-22", n: 2 },
        { date: "2026-04-23", n: 2 },
        { date: "2026-04-24", n: 2 },
        { date: "2026-04-27", n: 4 },
        { date: "2026-04-28", n: 2 },
        { date: "2026-04-29", n: 2 },
        { date: "2026-04-30", n: 2 },
      ] as Array<DateNeededItem>,
      itemsPerPage: -1,

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
    convertDateToString(date: Moment): string {
      return convertToString(date)
    },
    updatedItem(newValue: string, item: DateNeededItem) {
        const n = parseInt(newValue);
        if (isNaN(n)) {
          return;
        }

        item.n = n;
    },
    deleteDateNeeded(item: DateNeededItem) {
        // TODO
        this.itemsDateNeeded = this.itemsDateNeeded.filter(i => i.date !== item.date);
    },
    computeBest() {
      const dateNeeded: Record<string, number> = this.itemsDateNeeded.reduce((acc, item) => {
        acc[item.date] = item.n;
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

  <h2>Dates needed</h2>

  <v-data-table
    :headers="dateNeededHeaders"
    :items="itemsDateNeeded"
    v-model:items-per-page="itemsPerPage"
  >
    <template #item.date="{ item }">
      <v-label 
        :text="item.date"
        @click="console.log(item.date)"
      />
    </template>

    <template #item.n="{ item }">
      <v-text-field 
        :model-value="item.n.toString()"
        @update:model-value="updatedItem($event, item)"
      />
    </template>

    <template #item.actions="{ item }">
      <v-btn 
        @click="deleteDateNeeded(item)"
        text="Delete"
      />
    </template>
  </v-data-table>

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
        {{ convertDateToString(fareToBuy.date) }}: {{ fareToBuy.fareType }} 
        <!-- TODO should display in 0.00$ style -->
    </p>
  </div>
  

</template>

<style scoped>

</style>
