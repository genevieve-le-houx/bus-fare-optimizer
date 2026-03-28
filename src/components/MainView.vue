<script lang="ts">
import { defineComponent } from 'vue'

import moment from 'moment';
import type { Moment } from 'moment';

import axios from 'axios';
import type { AxiosResponse } from 'axios';

import { EnumFareType, findBestCombination, convertToString, convertToMoment } from '@/methods/methods.ts'
import type { EnumFareTypeStrings, BestCombination } from '@/methods/methods.ts'
import type { VDataTable } from 'vuetify/components';

type Headers = VDataTable['$props']['headers'];

function sortDate(a: DateNeededItem, b: DateNeededItem): number {
  if (a.date.isBefore(b.date)) {
    return -1;
  } else if (a.date.isAfter(b.date)) {
    return 1;
  } else {
    return 0;
  }
}

const dateNeededHeaders: Headers = [
  { title: 'Date', key: 'date', align: 'center', sortable: true, sortRaw: sortDate},
  { title: 'Number of rides needed', key: 'n', align: 'center', sortable: false},
  { title: 'Actions', key: 'actions', align: 'center', sortable: false},
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
      sortBy: [{ key: 'date', order: 'asc' as const}],

      dateToAdd: null as Moment | null,
      nToAdd: 1,

      count: 0,
      fares: {
        // [EnumFareType.single]: 3.25,
        // [EnumFareType.illimited_day]: 10.25,
        // [EnumFareType.illimited_week_end]: 18.25,
        // [EnumFareType.illimited_5_days]: 34,
        // [EnumFareType.illimited_month]: 74.63,
      } as Record<EnumFareTypeStrings, number>,
      firstDateMonth: moment("2026-04-01", 'YYYY-MM-DD'),
      bestCombination: {
        faresToBuy: [],
        totalCost: 0
      } as BestCombination
    }
  },
  computed: {
    formattedPrice(): string {
      return this.bestCombination.totalCost.toFixed(2) + " $"
    }
  },
  mounted() {
    // Compute fares from file
    const baseUrl = import.meta.env.BASE_URL
    axios.get(`${baseUrl}/config/fares.json`).then((response: AxiosResponse) => {
        const data = response.data
        console.log(data)
        this.readJsonConfig(data)
      }
    )
    
  },
  methods:{
    // TODO add something to upload a new fare list
    readJsonConfig(data: Record<EnumFareTypeStrings, number>) {
      for (const [key, value] of Object.entries(data)) {
        this.fares[EnumFareType[key as EnumFareTypeStrings]] = value
      }
    },

    onNewFareFile(data: File | File[]) {
      if (Array.isArray(data)) {
        alert("only import a single file")
      }

      // We are now sure data is only a single file
      const reader = new FileReader()
      reader.addEventListener("load", (e: ProgressEvent<FileReader>) => {
        if (e.target?.result !== null) {
          const data = JSON.parse(e.target?.result as string)
          console.log(data)
          this.readJsonConfig(data)
        }
        
      })

      reader.readAsText(data as File)
    },

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
  <v-row justify="center">
    <h1>{{ msg }}</h1>
  </v-row>

  <v-row>
    <v-file-input 
      label="Fare config"
      @update:model-value="onNewFareFile"
    />
  </v-row>
  
  <v-row>
    <v-date-input 
    v-model="firstDateMonth"
    label="First date of the month"
    input-format="yyyy-mm-dd"
  />
  </v-row>

  <v-row justify="center">
    <h2>Dates needed</h2>
  </v-row>
  
  <v-row>
    <v-data-table
        v-model:sort-by="sortBy"
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
          control-variant="stacked"
          inset
          v-model="item.n"
        />
      </template>

      <template #item.actions="{ item }">
        <v-btn 
          prepend-icon="mdi-trash-can"
          @click="deleteDateNeeded(item)"
        />
      </template>
    </v-data-table>
  </v-row>
  

  

  <v-row>
    <v-spacer />
    <v-col cols="3">
      <v-date-input 
      v-model="dateToAdd"
      input-format="yyyy-mm-dd"
    />
    </v-col>
    
    <v-col cols="3">
      <v-number-input
      control-variant="stacked"
      inset
      v-model="nToAdd"
    />
    </v-col>

    <v-col cols="3" class="justify-start text-left">
      <v-btn 
      @click="addDateNeeded"
      text="Add"
    />
    </v-col>
    <v-spacer />
  </v-row>

  <v-row justify="center">
    <v-btn 
      type="button" 
      @click="computeBest"
      text="Compute best fare to buy"
    />
  </v-row>

  <v-row justify="center">
    <h2>Best fare to buy</h2>
  </v-row>
  
    <v-row justify="center">
      Total price: {{ formattedPrice }}
    </v-row>

    <v-row 
      v-for="fareToBuy of bestCombination.faresToBuy" 
      :key="convertDateToString(fareToBuy.date)"
      justify="center"
    >
        {{ convertDateToString(fareToBuy.date) }}: {{ fareToBuy.fareType }} x{{ fareToBuy.qty }} 
    </v-row>
  

</template>

<style scoped>

</style>
