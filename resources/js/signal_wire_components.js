
// let layout_pages = './components/layout_pages/';
// let partials     = './partials/';
let Components   = './components/'
let ResourceComponents   = './components/Resources/'

// ==================== COMPONENTS ============================
Vue.component("example-component", () => import(Components+"ExampleComponent"));
Vue.component("calling-component", () => import(Components+"CallingComponent"));


// ==================== RESOURCE COMPONENTS ============================
Vue.component('create-resource-component', () => import(ResourceComponents+"CreateResourceComponent"));
