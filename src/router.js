import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

import Statistics from '@/components/Statistics'
import Calendar from '@/components/Calendar'
import FileUpload from '@/components/FileUpload'

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
        path: '/file-upload',
        name: 'FileUpload',
        component: FileUpload
      },
      {
        path: '*',
        name: 'Statistics',
        component: Statistics
      },
    ]
});

router.beforeEach((to, from, next) => {
  if (!store.getters.fileData && to.name !== 'FileUpload') {
    next('/file-upload')
  } else {
    next()
  }
})