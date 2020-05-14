import Vue from 'vue'
import Router from 'vue-router'

import Statistics from '@/components/Statistics'
import Calendar from '@/components/Calendar'

Vue.use(Router)

export const router = new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        name: 'Statistics',
        component: Statistics
      },
      {
        path: '/calendar',
        name: 'Calendar',
        component: Calendar
      },
      {
        path: '*',
        name: 'Statistics',
        component: Statistics
      }
    ]
});