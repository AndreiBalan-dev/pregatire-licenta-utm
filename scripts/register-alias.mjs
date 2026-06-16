// Registers the "@/" alias resolve hook for `node --import`. See alias-loader.mjs.
import { register } from "node:module";

register("./alias-loader.mjs", import.meta.url);
