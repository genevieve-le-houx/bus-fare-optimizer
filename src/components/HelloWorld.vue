<script lang="ts">
import { defineComponent } from 'vue'

import moment from 'moment';
import type { Moment } from 'moment';

import { EnumFareType, findBestCombination } from '@/methods/methods';
import type { FareToBuy, BestCombination } from '@/methods/methods';



export default defineComponent({
  props: {
    msg: { type: String, required: true },
  },
  data() {
    return {
      count: 0,
      fares: {
        [EnumFareType.single]: 3.25,
        [EnumFareType.illimited_day]: 10.25,
        [EnumFareType.illimited_week_end]: 18.25,
        [EnumFareType.illimited_5_days]: 34,
        [EnumFareType.illimited_month]: 99.50,
      },
      dateNeeded1: {
        "2026-04-01": 2,
        "2026-04-02": 2,
        "2026-04-03": 2,
      },
      dateNeeded2: {
        "2026-04-01": 2,
        "2026-04-02": 2,
        "2026-04-06": 2,
        "2026-04-07": 4,
        "2026-04-08": 2,
        "2026-04-20": 4,
        "2026-04-21": 2,
        "2026-04-22": 2,
        "2026-04-23": 2,
        "2026-04-24": 2,
        "2026-04-27": 4,
        "2026-04-28": 2,
        "2026-04-29": 2,
        "2026-04-30": 2,
      },
      dateNeeded3: {
        "2026-04-01": 2,
        "2026-04-02": 2,
        "2026-04-04": 5,
        "2026-04-05": 5,
        "2026-04-06": 2,
        "2026-04-07": 4,
        "2026-04-08": 2,
        "2026-04-20": 4,
        "2026-04-21": 2
      },
      firstDateMonth: moment("2026-04-01", 'YYYY-MM-DD'),
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
    computeBest() {
      const bestCombination1 = findBestCombination(this.fares, this.dateNeeded1, this.firstDateMonth);
      const bestCombination2 = findBestCombination(this.fares, this.dateNeeded2, this.firstDateMonth);
      const bestCombination3 = findBestCombination(this.fares, this.dateNeeded3, this.firstDateMonth);

      console.log("Best combination 1:")
      console.log(bestCombination1)
      console.log("Best combination 2:")
      console.log(bestCombination2)
      console.log("Best combination 3:")
      console.log(bestCombination3)
    }
  }
  
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <v-btn 
      type="button" 
      @click="computeBest"
      text="Compute best fare to buy"
    />
  </div>

</template>

<style scoped>

</style>
