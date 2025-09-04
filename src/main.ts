import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import registerGlobalComponents from "./plugins/global-components";
import setAuthorizationToken from "./plugins/set-authorization-token";
import { router } from "./router/index";
import i18n from "./plugins/i18n";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

setAuthorizationToken();
registerGlobalComponents(app);

app.mount("#app");
