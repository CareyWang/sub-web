import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "SubConverter",
    component: () => import("../views/Subconverter.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: "/subweb/",
  routes
});

export default router;
